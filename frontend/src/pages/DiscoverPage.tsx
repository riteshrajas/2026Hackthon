import { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { getPosts } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

export const DiscoverPage = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiscoverPosts = async () => {
      try {
        const data = await getPosts();
        setPosts(data);
      } catch (error) {
        console.error('Failed to fetch posts', error);
        toast.error('Failed to load discover feed');
      } finally {
        setLoading(false);
      }
    };
    fetchDiscoverPosts();
  }, []);

  return (
    <MainLayout>
      <Toaster position="bottom-center" />
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        <h1 className="text-3xl font-bold text-on-surface">Discover Eco-Wins</h1>

        {loading ? (
          <div className="text-center py-12 text-on-surface-variant">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">No posts yet. Be the first to share an Eco-Win!</div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="bg-surface-container-lowest rounded-lg overflow-hidden group">
              <div className="p-8 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img alt={`${post.user?.name} avatar`} className="w-12 h-12 rounded-full object-cover" src={post.user?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user?.name || 'User')}&background=6effc1&color=006948`}/>
                  <div>
                    <h4 className="font-headline font-bold text-on-surface">{post.user?.name}</h4>
                    <span className="text-xs text-on-surface-variant">
                      {new Date(post.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <span className="bg-secondary-container text-on-secondary-fixed text-[0.75rem] font-bold uppercase tracking-wider px-3 py-1 rounded-sm">ECO-WIN</span>
              </div>
              <div className="px-8 pb-6">
                <p className="text-on-surface text-lg leading-relaxed">{post.text}</p>
              </div>
              {post.image_url && (
                <div className="px-8 mb-6">
                  <img alt="Post attachment" className="w-full h-96 object-cover rounded-md" src={post.image_url}/>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </MainLayout>
  );
};
