import { useCallback, useEffect, useRef, useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import toast, { Toaster } from 'react-hot-toast';
import { createComment, createPost, deleteComment, getComments, getPosts, toggleCommentLike } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const FeedPage = () => {
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [openPostId, setOpenPostId] = useState<string | null>(null);
  const [commentsByPostId, setCommentsByPostId] = useState<Record<string, any[]>>({});
  const [commentInputByPostId, setCommentInputByPostId] = useState<Record<string, string>>({});
  const [loadingPostId, setLoadingPostId] = useState<string | null>(null);
  const [submittingPostId, setSubmittingPostId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [likedPostIds, setLikedPostIds] = useState<Record<string, boolean>>({});
  const { user } = useAuth();
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const lastRefreshAtRef = useRef(0);
  const isRefreshingRef = useRef(false);

  const getPostId = (post: any) => post.id || post.post_id;
  const getPostName = (post: any) => post.user?.name || post.user_name || 'Eco Member';
  const getPostAvatar = (post: any) => post.user?.profile_picture || post.user_profile_picture;
  const getPostText = (post: any) => post.text || post.content || '';
  const getPostDate = (post: any) => post.created_at || post.timestamp;
  const getPostCommentsCount = (post: any) => post.comments_count || post.commentsCount || 0;
  const getPostLikes = (post: any) => post.likes || 0;
  const getCommentId = (comment: any) => comment.comment_id || comment.id;
  const getCommentName = (comment: any) => comment.user_name || comment.user?.name || 'Eco Member';
  const getCommentAvatar = (comment: any) => comment.user_profile_picture || comment.user?.profile_picture;
  const getCommentDate = (comment: any) => comment.timestamp || comment.created_at;
  const getCommentLikes = (comment: any) => comment.likes || 0;
  const isCommentLiked = (comment: any) => Boolean(comment.liked_by?.includes(user?.id));

  const fetchPosts = useCallback(async () => {
    try {
      const data = await getPosts();
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch posts', error);
      toast.error('Failed to load feed');
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) return;

      const now = Date.now();
      if (isRefreshingRef.current || now - lastRefreshAtRef.current < 4000) {
        return;
      }

      isRefreshingRef.current = true;
      setIsRefreshing(true);
      fetchPosts()
        .finally(() => {
          lastRefreshAtRef.current = Date.now();
          isRefreshingRef.current = false;
          setIsRefreshing(false);
        });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchPosts]);

  const handleShare = async () => {
    if (!postText.trim()) return;
    try {
      const newPost = await createPost(postText, imagePreview || undefined);
      // Construct a post object similar to what getFeed returns
      const postWithUser = {
        ...newPost,
        user: {
          name: user?.name,
          profile_picture: user?.profile_picture
        }
      };
      setPosts([postWithUser, ...posts]);
      toast.success('Your Eco-Win has been shared!', { id: 'share' });
      setPostText('');
      setImagePreview(null);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to create post', error);
      toast.error('Failed to share post');
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      toast.error('Image is too large (max 4MB)');
      return;
    }

    setImageLoading(true);
    compressImage(file)
      .then((dataUrl) => {
        setImagePreview(dataUrl);
      })
      .catch(() => {
        toast.error('Failed to process image');
      })
      .finally(() => {
        setImageLoading(false);
      });
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageLoading(false);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read image'));
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const maxDimension = 1200;
          const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
          const width = Math.round(img.width * scale);
          const height = Math.round(img.height * scale);

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas unsupported'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const openComments = async (post: any) => {
    const postId = getPostId(post);
    if (!postId) return;

    if (openPostId === postId) {
      setOpenPostId(null);
      return;
    }

    setOpenPostId(postId);

    if (commentsByPostId[postId]) {
      return;
    }

    setLoadingPostId(postId);
    try {
      const data = await getComments(postId);
      setCommentsByPostId((prev) => ({ ...prev, [postId]: data }));
    } catch (error) {
      console.error('Failed to fetch comments', error);
      toast.error('Failed to load comments');
    } finally {
      setLoadingPostId(null);
    }
  };

  const handleAddComment = async (postId: string) => {
    const content = commentInputByPostId[postId]?.trim();
    if (!content) return;
    setSubmittingPostId(postId);
    try {
      const newComment = await createComment(postId, content);
      setCommentsByPostId((prev) => ({
        ...prev,
        [postId]: [newComment, ...(prev[postId] || [])]
      }));
      setCommentInputByPostId((prev) => ({ ...prev, [postId]: '' }));
      setPosts((prev) => prev.map((post) => (
        getPostId(post) === postId
          ? { ...post, comments_count: getPostCommentsCount(post) + 1 }
          : post
      )));
    } catch (error) {
      console.error('Failed to add comment', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmittingPostId(null);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      await deleteComment(postId, commentId);
      setCommentsByPostId((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter((comment) => getCommentId(comment) !== commentId)
      }));
      setPosts((prev) => prev.map((post) => (
        getPostId(post) === postId
          ? { ...post, comments_count: Math.max(0, getPostCommentsCount(post) - 1) }
          : post
      )));
    } catch (error) {
      console.error('Failed to delete comment', error);
      toast.error('Failed to delete comment');
    }
  };

  const handleToggleCommentLike = async (postId: string, commentId: string) => {
    try {
      const updated = await toggleCommentLike(postId, commentId);
      setCommentsByPostId((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).map((comment) => (
          getCommentId(comment) === commentId ? updated : comment
        ))
      }));
    } catch (error) {
      console.error('Failed to update comment like', error);
      toast.error('Failed to update like');
    }
  };

  const handleTogglePostLike = (post: any) => {
    const postId = getPostId(post);
    if (!postId) return;

    const nextLiked = !likedPostIds[postId];
    setLikedPostIds((prev) => ({ ...prev, [postId]: nextLiked }));
    setPosts((current) => current.map((item) => (
      getPostId(item) === postId
        ? { ...item, likes: Math.max(0, getPostLikes(item) + (nextLiked ? 1 : -1)) }
        : item
    )));
  };

  return (
    <MainLayout>
      <Toaster position="bottom-center" />
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Feed Column */}
        <section className="xl:col-span-8 flex flex-col gap-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
            <span className={`h-2 w-2 rounded-full ${isRefreshing ? 'bg-primary animate-pulse' : 'bg-surface-container-high'}`} />
            {isRefreshing ? 'Refreshing feed' : 'Pull to refresh'}
          </div>
          {/* Share Input Box */}
          <div className="bg-surface-container-lowest rounded-lg p-6 flex items-center gap-4 transition-all duration-300">
            <img alt="User profile" className="w-12 h-12 rounded-full object-cover" src={user?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6effc1&color=006948`}/>
            <div className="flex-1 bg-surface-container-low rounded-full px-6 py-3 flex items-center justify-between cursor-text hover:bg-surface-container transition-colors focus-within:ring-2 ring-primary">
              <input 
                type="text" 
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleShare()}
                className="bg-transparent border-none outline-none flex-1 text-on-surface text-sm" 
                placeholder="Share your Eco-Win! Press Enter to post..." 
              />
              <button onClick={handleShare} className="material-symbols-outlined text-primary hover:text-primary-dim cursor-pointer ml-2">send</button>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="material-symbols-outlined text-primary hover:text-primary-dim cursor-pointer ml-2"
              >
                photo_camera
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>
          {imagePreview && (
            <div className="bg-surface-container-lowest rounded-lg p-4 flex items-start gap-4">
              <div className="relative">
                <img alt="Selected upload" className={`w-24 h-24 rounded-md object-cover ${imageLoading ? 'opacity-50' : ''}`} src={imagePreview} />
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-on-surface">{imageLoading ? 'Optimizing image...' : 'Image ready to post'}</p>
                <p className="text-xs text-on-surface-variant">This image will be attached to your next Eco-Win.</p>
              </div>
              <button
                type="button"
                onClick={clearImage}
                className="text-on-surface-variant hover:text-error transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          )}

          {/* Dynamic Feed Posts */}
          {posts.map((post) => (
            <article key={getPostId(post)} className="bg-surface-container-lowest rounded-lg overflow-hidden group">
              <div className="p-8 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img alt={`${getPostName(post)} avatar`} className="w-12 h-12 rounded-full object-cover" src={getPostAvatar(post) || `https://ui-avatars.com/api/?name=${encodeURIComponent(getPostName(post))}&background=6effc1&color=006948`}/>
                  <div>
                    <h4 className="font-headline font-bold text-on-surface">{getPostName(post)}</h4>
                    <span className="text-xs text-on-surface-variant">
                      {getPostDate(post) ? new Date(getPostDate(post)).toLocaleString() : 'Just now'}
                    </span>
                  </div>
                </div>
                <span className="bg-secondary-container text-on-secondary-fixed text-[0.75rem] font-bold uppercase tracking-wider px-3 py-1 rounded-sm">ECO-WIN</span>
              </div>
              <div className="px-8 pb-6">
                <p className="text-on-surface text-lg leading-relaxed">{getPostText(post)}</p>
              </div>
              {post.image_url && (
                <div className="px-8 mb-6">
                  <img alt="Post attachment" className="w-full h-96 object-cover rounded-md" src={post.image_url}/>
                </div>
              )}
              <div className="px-8 py-6 flex items-center justify-between border-t border-surface-container-low/30">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => handleTogglePostLike(post)}
                    className={`px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 cursor-pointer ${likedPostIds[getPostId(post)] ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-low text-on-surface'}`}
                  >
                    <span
                      className="material-symbols-outlined"
                      data-weight={likedPostIds[getPostId(post)] ? 'fill' : 'regular'}
                      style={{ fontVariationSettings: likedPostIds[getPostId(post)] ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      favorite
                    </span>
                    {likedPostIds[getPostId(post)] ? `Loved (${getPostLikes(post)})` : `Love this! (${getPostLikes(post)})`}
                  </button>
                  <button onClick={() => openComments(post)} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                    <span className="material-symbols-outlined">chat_bubble</span>
                    <span className="font-bold">{getPostCommentsCount(post)} Comments</span>
                  </button>
                </div>
                <button onClick={() => toast.success('Link copied to clipboard!')} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                  <span className="material-symbols-outlined">share</span>
                </button>
              </div>
              {openPostId === getPostId(post) && (
                <div className="border-t border-surface-container-low/30 px-8 py-6 space-y-4">
                  {loadingPostId === getPostId(post) ? (
                    <p className="text-sm text-on-surface-variant">Loading comments...</p>
                  ) : (commentsByPostId[getPostId(post)] || []).length === 0 ? (
                    <p className="text-sm text-on-surface-variant">Be the first to comment.</p>
                  ) : (
                    <div className="space-y-4">
                      {(commentsByPostId[getPostId(post)] || []).map((comment) => (
                        <div key={getCommentId(comment)} className="flex gap-3">
                          <img
                            alt={`${getCommentName(comment)} avatar`}
                            className="w-10 h-10 rounded-full object-cover"
                            src={getCommentAvatar(comment) || `https://ui-avatars.com/api/?name=${encodeURIComponent(getCommentName(comment))}&background=6effc1&color=006948`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-bold text-on-surface">{getCommentName(comment)}</p>
                                <p className="text-xs text-on-surface-variant">
                                  {getCommentDate(comment) ? new Date(getCommentDate(comment)).toLocaleString() : 'Just now'}
                                </p>
                              </div>
                              {comment.user_id === user?.id && (
                                <button
                                  onClick={() => handleDeleteComment(getPostId(post), getCommentId(comment))}
                                  className="text-xs text-on-surface-variant hover:text-error transition-colors"
                                  type="button"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                            <p className="text-sm text-on-surface mt-2">{comment.content}</p>
                            <button
                              onClick={() => handleToggleCommentLike(getPostId(post), getCommentId(comment))}
                              className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold transition-colors ${isCommentLiked(comment) ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[16px]" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                              {getCommentLikes(comment)}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <img
                      alt="Your avatar"
                      className="w-9 h-9 rounded-full object-cover"
                      src={user?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6effc1&color=006948`}
                    />
                    <div className="flex-1 flex items-center bg-surface-container-low rounded-full px-4 py-2">
                      <input
                        type="text"
                        value={commentInputByPostId[getPostId(post)] || ''}
                        onChange={(e) => setCommentInputByPostId((prev) => ({
                          ...prev,
                          [getPostId(post)]: e.target.value
                        }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(getPostId(post))}
                        placeholder="Write a comment..."
                        className="bg-transparent border-none outline-none flex-1 text-sm text-on-surface"
                      />
                    </div>
                    <button
                      onClick={() => handleAddComment(getPostId(post))}
                      disabled={submittingPostId === getPostId(post)}
                      className="material-symbols-outlined text-primary hover:text-primary-dim transition-colors disabled:opacity-50"
                      type="button"
                    >
                      send
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </section>

        {/* Sidebar Column */}
        <aside className="xl:col-span-4 flex flex-col gap-8">
          {/* Pending Requests */}
          <section className="bg-surface-container-low rounded-lg p-6">
            <h3 className="font-headline font-bold text-lg mb-6 flex items-center justify-between">
              Pending Requests
              <span className="bg-primary-container text-on-primary-container text-xs px-2 py-0.5 rounded-full">2</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img alt="Mira Sun avatar" className="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuuGF_27D7Vd4_1OSReRtt2NHrlslSZy2UVedZD75naf0i92UqTDFJUttRYrqKSnMFU8pwofnqOQIDuNj6JoqBZdgc2jVSAmgQzdgThQtSos0d96RxeiRbmKNPihSrB8DA-DHOT6ko3tR6jC0TefT7XIjKcIIfCKRwnI81DGULDE9m7O0qmBvr3JRLi45vRNSGEAXDjqSsVAnRyWnLN6tiZ5eTGBFyTMp7yDLpwrYtC5BmKhke1i9YmRHkJGlsPAd3Bq53QugvXtUn"/>
                  <span className="font-bold text-sm">Mira Sun</span>
                </div>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-sm">check</span>
                  </button>
                  <button className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img alt="Leo Green avatar" className="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlAhGjd-pi5JUDp6mJWztTaTnSVVCwdRL7zcdf4G772WyOks4IkFOL5pF7wEU7CoVol_np_4PBgMxeRrildl_DrLEntePGJse-Rfz5OZMmUzkFT3jNaEMYh36eoCJmpITLIPeu2chkQft4gL7jP7gOHlsQ0E1BTaA6ag_SKZPNi9FAKabd6CdjDAgxqe1MDY3SMTayM1U-SR5yEOD0gJNn1gE8LeO49ohR9mIzhZEcP2d4xnIxwUJTmRPbmnLWorM_Txw6cw1v7eUy"/>
                  <span className="font-bold text-sm">Leo Green</span>
                </div>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-sm">check</span>
                  </button>
                  <button className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Active Ninjas */}
          <section className="bg-surface-container-low rounded-lg p-6">
            <h3 className="font-headline font-bold text-lg mb-6">Active Ninjas</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img alt="Sara Seedling avatar" className="w-11 h-11 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoCaJMwibyxb6gyb6YqJuS9ceNvuCNyCEL7DD0ZzFTyw-5nD63UKQa_0N1kyfQSfn9JtJh75mJr3c68c-5SvpyuwdNtnEr9f5vGIcewlsKz6pUJNm5i87vlgcbOXTN7FeGTG4tflxVPUGm-xdw6Y8gHHes3A1kyHkjED5oqttkD467PIkWBJ_pMGr2V3WRUIqj6atlm2zrn3HS8Ia-0sfmkm404gOMy1RvSVqEO4dHe5sfMpTh6vhbN_i5KLSZ5YRMiby_TAmKiWRx"/>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary-container border-2 border-surface-container-low rounded-full"></div>
                </div>
                <div>
                  <h5 className="font-bold text-sm">Sara Seedling</h5>
                  <p className="text-xs text-on-surface-variant mt-1 italic">"Planting 50 new oaks today!"</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img alt="Ben Bike-alot avatar" className="w-11 h-11 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPM76WKKy8fPZ62dlKE_E1Xdnk5tugMlEvYQ1pWqZvucfOsnddGUusSGRdqBINqzgXDGutOIsta90uRoCQ7FtAiuS7iI-ywkJudFUi5bjBghmGLqK6UZKjooQ7XcbPAoCRlNGvRBcpkt21JHi-QkPCWA2UQkQZgB61wC8lyU3evGY2Y-cM07LqWCpKoJ50BTC2bAyiwwDaCXBRRhycRHzlwn-XPQXYWF40-cjs9RculfUFm4yd7Ny_fFYxc8jL70eWOE-WGlPVGMtx"/>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary-container border-2 border-surface-container-low rounded-full"></div>
                </div>
                <div>
                  <h5 className="font-bold text-sm">Ben Bike-alot</h5>
                  <p className="text-xs text-on-surface-variant mt-1 italic">"100 miles commute this week 🚲"</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img alt="Amy Aqua avatar" className="w-11 h-11 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQUlNYJPQxEaahWlK74yLGPTV3lFSpFlEzTGdVFPQMPBhSlVVVN8mp701qdVzq-uzajstNevw7YTabLsuC-_-J6NUo9zji44OrLmjluX_GV1xprWFFaiCE2aZ1suHNB8zYUCK8Q9Dywg0CrEmeb9PjfnUEiG5caOz5X0w8ygpR-bKnmov-ovXAw_VvDcxjCD1OusuFRfQuRUgJZjnLEmWls8XqTwC5lyiQXKlR1OjNtdoPsTQ4Mz8iC66Br3G2qsi8GLCHPckxjWZs"/>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary-container border-2 border-surface-container-low rounded-full"></div>
                </div>
                <div>
                  <h5 className="font-bold text-sm">Amy Aqua</h5>
                  <p className="text-xs text-on-surface-variant mt-1 italic">"Installed a gray-water system!"</p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer Links */}
          <div className="px-6 py-4 flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant opacity-50">
            <a className="hover:text-primary transition-colors" href="#">Privacy</a>
            <a className="hover:text-primary transition-colors" href="#">Terms</a>
            <a className="hover:text-primary transition-colors" href="#">Eco-Guidelines</a>
            <a className="hover:text-primary transition-colors" href="#">Contact</a>
            <span>© 2024 Eco-Ninjas</span>
          </div>
        </aside>
      </div>
    </MainLayout>
  );
};
