import { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { getUserStats } from '../services/api';

export const ImpactPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      getUserStats(user.id).then(setStats).catch(console.error);
    }
  }, [user]);

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        <h1 className="text-3xl font-bold text-on-surface">Your Impact</h1>

        {stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-lg flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-primary mb-2">star</span>
              <h2 className="text-xl font-bold">Current Points</h2>
              <p className="text-3xl font-black text-primary mt-2">{stats.current_points}</p>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-lg flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-primary mb-2">co2</span>
              <h2 className="text-xl font-bold">CO2 Saved</h2>
              <p className="text-3xl font-black text-primary mt-2">{stats.total_co2_saved} kg</p>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-lg flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-primary mb-2">local_fire_department</span>
              <h2 className="text-xl font-bold">Streak Multiplier</h2>
              <p className="text-3xl font-black text-primary mt-2">{stats.streak_multiplier}x</p>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-lg flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-primary mb-2">military_tech</span>
              <h2 className="text-xl font-bold">Badges</h2>
              <div className="flex gap-2 mt-2">
                {stats.badges && stats.badges.length > 0 ? (
                  stats.badges.map((b: string, i: number) => (
                    <span key={i} className="bg-primary-container text-on-primary-container text-xs px-2 py-1 rounded-full">{b}</span>
                  ))
                ) : (
                  <span className="text-on-surface-variant">No badges yet</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-on-surface-variant">Loading impact data...</div>
        )}
      </div>
    </MainLayout>
  );
};
