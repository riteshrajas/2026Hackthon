import { useCallback, useEffect, useRef, useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import toast, { Toaster } from 'react-hot-toast';
import {
  createComment,
  createPost,
  deleteComment,
  getComments,
  getPosts,
  toggleCommentLike,
  getAISuggestions,
  getPendingRequests,
  respondToRequest,
  getActiveNinjas,
  getEvents,
  signupEvent
} from '../services/api';
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
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [activeNinjas, setActiveNinjas] = useState<any[]>([]);
  const [eventPosts, setEventPosts] = useState<any[]>([]);
  const [communityLoading, setCommunityLoading] = useState(true);
  const [aiAdvisory, setAiAdvisory] = useState('');
  const [aiAdvisoryLoading, setAiAdvisoryLoading] = useState(false);
  const [aiAdvisoryError, setAiAdvisoryError] = useState('');
  const [weatherSnapshot, setWeatherSnapshot] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'prompt' | 'granted' | 'denied'>('idle');
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
    if (!user) return;
    setCommunityLoading(true);
    Promise.all([
      getPendingRequests(),
      getActiveNinjas('county', user.neighborhood_tag || undefined, 4),
      getEvents('county', user.neighborhood_tag || undefined, 3)
    ])
      .then(([requests, ninjas, upcoming]) => {
        setPendingRequests(requests || []);
        setActiveNinjas(ninjas || []);
        setEventPosts(upcoming || []);
      })
      .catch((error) => {
        console.error('Failed to load community widgets', error);
      })
      .finally(() => setCommunityLoading(false));
  }, [user]);

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

  const handleRespondRequest = async (requestId: string, status: 'accepted' | 'declined') => {
    try {
      await respondToRequest(requestId, status);
      setPendingRequests((prev) => prev.filter((request) => request.request_id !== requestId));
    } catch (error) {
      console.error('Failed to respond to request', error);
      toast.error('Failed to update request');
    }
  };

  const handleEventSignup = async (eventId: string) => {
    try {
      await signupEvent(eventId);
      setEventPosts((prev) => prev.map((event) => (
        event.event_id === eventId
          ? { ...event, is_signed_up: true, signup_count: event.signup_count + 1 }
          : event
      )));
      toast.success('Signed up for event!');
    } catch (error) {
      console.error('Failed to sign up', error);
      toast.error('Event signup failed');
    }
  };

  const buildMapLinks = (location: string) => {
    const query = encodeURIComponent(location);
    return {
      google: `https://www.google.com/maps/search/?api=1&query=${query}`,
      apple: `https://maps.apple.com/?q=${query}`
    };
  };

  const getWeatherLabel = (code: number) => {
    if (code === 0) return 'Clear skies';
    if (code === 1 || code === 2) return 'Mostly sunny';
    if (code === 3) return 'Overcast';
    if (code >= 45 && code <= 48) return 'Foggy';
    if (code >= 51 && code <= 67) return 'Rain showers';
    if (code >= 71 && code <= 77) return 'Snowy';
    if (code >= 80 && code <= 82) return 'Heavy rain';
    if (code >= 95) return 'Thunderstorms';
    return 'Mixed conditions';
  };

  const buildWeatherAdvice = (snapshot: any) => {
    if (!snapshot) return '';
    const { temperature, precipitation, wind } = snapshot;
    if (precipitation >= 3) {
      return 'Rain is active — lean into indoor actions like energy checks or educational modules.';
    }
    if (wind >= 10) {
      return 'Windy out — good day for indoor cleanups or quick eco-learning.';
    }
    if (temperature >= 30) {
      return 'Hot day — hydrate and pick low-intensity outdoor tasks.';
    }
    if (temperature <= 5) {
      return 'Chilly outside — consider indoor actions to keep momentum.';
    }
    return 'Looks mild — great time for outdoor eco actions or community cleanups.';
  };

  const fetchWeatherForCoords = async (lat: number, lon: number, label?: string) => {
    const forecastResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,weathercode,wind_speed_10m`
    );
    if (!forecastResponse.ok) {
      throw new Error('Failed to fetch weather');
    }
    const forecastData = await forecastResponse.json();
    const current = forecastData?.current || {};
    setWeatherSnapshot({
      name: label || 'Your area',
      temperature: current.temperature_2m,
      precipitation: current.precipitation,
      wind: current.wind_speed_10m,
      code: current.weathercode
    });
  };

  const requestLocation = (auto = false) => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported in this browser.');
      return;
    }

    setGeoLoading(!auto);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCoords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        setCoords(nextCoords);
        setGeoStatus('granted');
        setGeoLoading(false);
        setGeoError('');
      },
      () => {
        setGeoStatus('denied');
        if (!auto) {
          setGeoError('Location permission denied.');
        }
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleUseLocation = () => {
    setGeoStatus('prompt');
    requestLocation();
  };

  useEffect(() => {
    if (!user?.id) return;

    setAiAdvisoryLoading(true);
    setAiAdvisoryError('');
    getAISuggestions(user.id)
      .then((data) => setAiAdvisory(data?.text || data?.message || ''))
      .catch((error) => {
        console.error('Failed to load AI advisory', error);
        setAiAdvisoryError('AI advisory is unavailable right now.');
      })
      .finally(() => setAiAdvisoryLoading(false));
  }, [user?.id]);

  useEffect(() => {
    if (!navigator.geolocation || !('permissions' in navigator)) return;

    let permissionStatus: PermissionStatus | null = null;
    navigator.permissions
      .query({ name: 'geolocation' as PermissionName })
      .then((status) => {
        permissionStatus = status;
        const nextState = status.state === 'granted'
          ? 'granted'
          : status.state === 'denied'
            ? 'denied'
            : 'idle';
        setGeoStatus(nextState);
        if (status.state === 'granted' && !coords) {
          requestLocation(true);
        }
        status.onchange = () => {
          const updated = status.state === 'granted'
            ? 'granted'
            : status.state === 'denied'
              ? 'denied'
              : 'idle';
          setGeoStatus(updated);
          if (status.state === 'granted') {
            setGeoError('');
            requestLocation(true);
          }
        };
      })
      .catch(() => {
        // Permissions API not available; rely on manual prompt.
      });

    return () => {
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
    };
  }, [coords]);

  useEffect(() => {
    if (!user?.neighborhood_tag && !coords) return;

    const fetchWeather = async () => {
      try {
        setWeatherLoading(true);
        setWeatherError('');

        if (coords) {
          await fetchWeatherForCoords(coords.lat, coords.lon, 'Your area');
          return;
        }

        const locationQuery = encodeURIComponent(
          [user?.neighborhood_tag, user?.country].filter(Boolean).join(', ')
        );
        const geoResponse = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${locationQuery}&count=1&language=en&format=json`
        );
        if (!geoResponse.ok) {
          throw new Error('Failed to resolve location');
        }
        const geoData = await geoResponse.json();
        const result = geoData?.results?.[0];
        if (!result) {
          throw new Error('Location not found');
        }

        await fetchWeatherForCoords(result.latitude, result.longitude, result.name);
      } catch (error: any) {
        setWeatherError(error?.message || 'Weather unavailable');
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
  }, [user?.neighborhood_tag, user?.country, coords]);

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
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-low p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wider text-on-surface-variant">WEATHER ADVISORY</p>
                <h3 className="font-headline font-bold text-lg">Today in your neighborhood</h3>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary-container text-on-primary-container">Eco-AI</span>
            </div>
            {weatherLoading ? (
              <p className="text-sm text-on-surface-variant">Loading local weather...</p>
            ) : weatherError ? (
              <p className="text-sm text-on-surface-variant">{weatherError}</p>
            ) : weatherSnapshot ? (
              <div className="flex flex-wrap items-center gap-4 text-sm text-on-surface">
                <span className="font-semibold">{weatherSnapshot.name}</span>
                <span>{getWeatherLabel(weatherSnapshot.code)} · {Math.round(weatherSnapshot.temperature)}°C</span>
                <span>Rain {weatherSnapshot.precipitation}mm</span>
                <span>Wind {Math.round(weatherSnapshot.wind)} km/h</span>
              </div>
            ) : null}
            <p className="text-sm text-on-surface leading-relaxed">
              {buildWeatherAdvice(weatherSnapshot) || 'Log a small action today to keep the momentum going.'}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
              <button
                type="button"
                onClick={handleUseLocation}
                disabled={geoLoading || geoStatus === 'granted'}
                className="px-3 py-1 rounded-full bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors disabled:opacity-60"
              >
                {geoLoading ? 'Detecting location...' : geoStatus === 'granted' ? 'Location enabled' : 'Use my location'}
              </button>
              {geoStatus === 'denied' && geoError && <span>{geoError}</span>}
            </div>
            {aiAdvisoryLoading ? (
              <p className="text-xs text-on-surface-variant">Loading AI suggestion...</p>
            ) : aiAdvisoryError ? (
              <p className="text-xs text-on-surface-variant">{aiAdvisoryError}</p>
            ) : (
              <p className="text-xs text-on-surface-variant">AI says: {aiAdvisory || 'Keep your streak active with a quick eco-win.'}</p>
            )}
            <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Powered by Open-Meteo + Eco-Pulse AI</p>
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
          {eventPosts.length > 0 && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="font-headline font-bold text-lg">Community Events</h3>
                <span className="text-xs text-on-surface-variant">From your county</span>
              </div>
              {eventPosts.map((event) => {
                const location = event.location_address || event.location_name;
                const links = location ? buildMapLinks(location) : null;
                return (
                  <article key={event.event_id} className="bg-surface-container-lowest rounded-lg overflow-hidden group">
                    <div className="p-8 pb-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          alt={`${event.creator_name} avatar`}
                          className="w-12 h-12 rounded-full object-cover"
                          src={event.creator_profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(event.creator_name || 'Organizer')}&background=6effc1&color=006948`}
                        />
                        <div>
                          <h4 className="font-headline font-bold text-on-surface">{event.creator_name}</h4>
                          <span className="text-xs text-on-surface-variant">{new Date(event.start_time).toLocaleString()}</span>
                        </div>
                      </div>
                      <span className="bg-secondary-container text-on-secondary-fixed text-[0.75rem] font-bold uppercase tracking-wider px-3 py-1 rounded-sm">EVENT</span>
                    </div>
                    <div className="px-8 pb-6">
                      <h5 className="text-lg font-bold text-on-surface">{event.title}</h5>
                      <p className="text-on-surface text-sm leading-relaxed mt-2">{event.description}</p>
                      {location && (
                        <p className="text-xs text-on-surface-variant mt-2">
                          {location}
                          {links && (
                            <span className="ml-2">
                              <a className="text-primary font-semibold" href={links.google} target="_blank" rel="noreferrer">Google Maps</a>
                              <span className="mx-2 text-on-surface-variant">|</span>
                              <a className="text-primary font-semibold" href={links.apple} target="_blank" rel="noreferrer">Apple Maps</a>
                            </span>
                          )}
                        </p>
                      )}
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleEventSignup(event.event_id)}
                          disabled={event.is_signed_up || event.is_full}
                          className="text-xs font-bold px-4 py-2 rounded-full bg-primary text-on-primary disabled:opacity-50"
                        >
                          {event.is_full ? 'Full' : event.is_signed_up ? 'Joined' : 'Join'}
                        </button>
                        <span className="text-xs text-on-surface-variant">{event.signup_count}{event.capacity ? ` / ${event.capacity} spots` : ' going'}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
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
          <section className="bg-surface-container-low rounded-lg p-6">
            <h3 className="font-headline font-bold text-lg mb-4">Neighborhood summary</h3>
            <div className="flex items-center justify-between text-sm text-on-surface">
              <span>Active ninjas</span>
              <span className="font-bold">{activeNinjas.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-on-surface mt-3">
              <span>Upcoming events</span>
              <span className="font-bold">{eventPosts.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-on-surface mt-3">
              <span>Pending requests</span>
              <span className="font-bold">{pendingRequests.length}</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-4">
              Pulse check for {user?.neighborhood_tag || 'your area'}. Keep momentum by logging one action today.
            </p>
          </section>
          {/* Pending Requests */}
          <section className="bg-surface-container-low rounded-lg p-6">
            <h3 className="font-headline font-bold text-lg mb-6 flex items-center justify-between">
              Pending Requests
              <span className="bg-primary-container text-on-primary-container text-xs px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
            </h3>
            {communityLoading ? (
              <div className="text-sm text-on-surface-variant">Loading requests...</div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-sm text-on-surface-variant">No pending requests.</div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.request_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        alt={`${request.from_user_name} avatar`}
                        className="w-10 h-10 rounded-full object-cover"
                        src={request.from_user_profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.from_user_name)}&background=6effc1&color=006948`}
                      />
                      <span className="font-bold text-sm">{request.from_user_name}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center hover:scale-110 transition-transform"
                        onClick={() => handleRespondRequest(request.request_id, 'accepted')}
                      >
                        <span className="material-symbols-outlined text-sm">check</span>
                      </button>
                      <button
                        className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center hover:scale-110 transition-transform"
                        onClick={() => handleRespondRequest(request.request_id, 'declined')}
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Active Ninjas */}
          <section className="bg-surface-container-low rounded-lg p-6">
            <h3 className="font-headline font-bold text-lg mb-6">Active Ninjas</h3>
            {communityLoading ? (
              <div className="text-sm text-on-surface-variant">Loading active ninjas...</div>
            ) : activeNinjas.length === 0 ? (
              <div className="text-sm text-on-surface-variant">No recent activity yet.</div>
            ) : (
              <div className="space-y-6">
                {activeNinjas.map((ninja) => (
                  <div key={ninja.user_id} className="flex items-start gap-4">
                    <div className="relative">
                      <img
                        alt={`${ninja.name} avatar`}
                        className="w-11 h-11 rounded-full object-cover"
                        src={ninja.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(ninja.name)}&background=6effc1&color=006948`}
                      />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary-container border-2 border-surface-container-low rounded-full"></div>
                    </div>
                    <div>
                      <h5 className="font-bold text-sm">{ninja.name}</h5>
                      <p className="text-xs text-on-surface-variant mt-1 italic">{ninja.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>


          {/* Footer Links */}
          <div className="px-6 py-4 flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant opacity-50">
            <a className="hover:text-primary transition-colors" href="#">Privacy</a>
            <a className="hover:text-primary transition-colors" href="#">Terms</a>
            <a className="hover:text-primary transition-colors" href="#">Eco-Guidelines</a>
            <a className="hover:text-primary transition-colors" href="#">Contact</a>
            <span>© 2026 Eco-Pulse</span>
          </div>
        </aside>
      </div>
    </MainLayout>
  );
};
