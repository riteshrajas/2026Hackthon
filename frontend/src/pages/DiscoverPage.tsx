import { useMemo, useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { getCounties, getPosts } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

export const DiscoverPage = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCounty, setSelectedCounty] = useState('');
  const [counties, setCounties] = useState<string[]>([]);
  const [countiesLoading, setCountiesLoading] = useState(true);

  const normalizedPosts = useMemo(() => {
    return posts.map((post) => {
      const createdAtValue = post.timestamp || post.createdAt || post.created_at;
      const createdAt = createdAtValue ? new Date(createdAtValue) : null;
      return {
        id: post.post_id || post.id,
        name: post.user?.name || post.user_name || 'Eco Member',
        profilePicture:
          post.user?.profile_picture || post.user_profile_picture || post.profile_picture || '',
        content: post.text || post.content || '',
        imageUrl: post.image_url || post.imageUrl || '',
        createdAtLabel:
          createdAt && !Number.isNaN(createdAt.valueOf())
            ? createdAt.toLocaleString()
            : 'Just now',
      };
    });
  }, [posts]);

  useEffect(() => {
    let isMounted = true;
    const fetchDiscoverPosts = async () => {
      setLoading(true);
      try {
        const data = await getPosts(selectedCounty || undefined);
        if (isMounted) {
          setPosts(data);
        }
      } catch (error) {
        console.error('Failed to fetch posts', error);
        toast.error('Failed to load discover feed');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDiscoverPosts();
    return () => {
      isMounted = false;
    };
  }, [selectedCounty]);

  useEffect(() => {
    let isMounted = true;
    const fetchCounties = async () => {
      try {
        const data = await getCounties();
        if (isMounted) {
          setCounties(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to fetch counties', error);
        toast.error('Failed to load counties');
      } finally {
        if (isMounted) {
          setCountiesLoading(false);
        }
      }
    };

    fetchCounties();
    return () => {
      isMounted = false;
    };
  }, []);

  const emptyStateMessage = selectedCounty
    ? `No posts yet in ${selectedCounty}. Be the first to share an Eco-Win!`
    : 'No posts yet. Be the first to share an Eco-Win!';

  return (
    <MainLayout>
      <Toaster position="bottom-center" />
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-on-surface">Discover Eco-Wins</h1>
          <div className="flex items-center gap-3">
            <label
              htmlFor="county-select"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant"
            >
              County
            </label>
            <select
              id="county-select"
              value={selectedCounty}
              onChange={(event) => setSelectedCounty(event.target.value)}
              disabled={countiesLoading && counties.length === 0}
              className="bg-surface-container-low rounded-full px-4 py-2 text-sm text-on-surface min-w-[180px]"
            >
              <option value="">All counties</option>
              {countiesLoading ? (
                <option value="" disabled>
                  Loading counties...
                </option>
              ) : counties.length === 0 ? (
                <option value="" disabled>
                  No counties found
                </option>
              ) : (
                counties.map((county) => (
                  <option key={county} value={county}>
                    {county}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-on-surface-variant">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">{emptyStateMessage}</div>
        ) : (
          normalizedPosts.map((post) => (
            <article key={post.id} className="bg-surface-container-lowest rounded-lg overflow-hidden group">
              <div className="p-8 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    alt={`${post.name} avatar`}
                    className="w-12 h-12 rounded-full object-cover"
                    src={
                      post.profilePicture ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(post.name)}&background=6effc1&color=006948`
                    }
                  />
                  <div>
                    <h4 className="font-headline font-bold text-on-surface">{post.name}</h4>
                    <span className="text-xs text-on-surface-variant">{post.createdAtLabel}</span>
                  </div>
                </div>
                <span className="bg-secondary-container text-on-secondary-fixed text-[0.75rem] font-bold uppercase tracking-wider px-3 py-1 rounded-sm">ECO-WIN</span>
              </div>
              <div className="px-8 pb-6">
                <p className="text-on-surface text-lg leading-relaxed">{post.content}</p>
              </div>
              {post.imageUrl && (
                <div className="px-8 mb-6">
                  <img alt="Post attachment" className="w-full h-96 object-cover rounded-md" src={post.imageUrl} />
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </MainLayout>
  );
};
