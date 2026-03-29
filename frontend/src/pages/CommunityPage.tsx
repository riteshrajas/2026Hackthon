import { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { getLeaderboard } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CommunityPage = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    if (user?.neighborhood_tag) {
      getLeaderboard('neighborhood', user.neighborhood_tag)
        .then(data => setLeaderboard(data.rankings || []))
        .catch(console.error);
    }
  }, [user]);

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        <h1 className="text-3xl font-bold text-on-surface">Community Leaderboard</h1>
        <p className="text-on-surface-variant">Top performers in {user?.neighborhood_tag || 'your neighborhood'}</p>

        <div className="bg-surface-container-lowest rounded-lg overflow-hidden">
          {leaderboard.length > 0 ? (
            <div className="divide-y divide-surface-container-low">
              {leaderboard.map((u) => (
                <div key={u.user_id} className="p-4 flex items-center justify-between hover:bg-surface-container-low/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg w-8 text-center text-primary">{u.rank}</span>
                    <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface flex items-center gap-2">
                        {u.name}
                        {u.is_top_performer && (
                          <span className="material-symbols-outlined text-sm text-amber-500" title="Top 10%">star</span>
                        )}
                      </h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-primary">{u.points}</span>
                    <span className="text-xs text-on-surface-variant ml-1">pts</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-on-surface-variant">Loading leaderboard...</div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
 