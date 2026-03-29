import { useMemo, useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { getLeaderboard } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CommunityPage = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [scope, setScope] = useState<'county' | 'country' | 'global'>('county');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const scopeConfig = useMemo(() => {
    return {
      county: {
        label: 'County',
        type: 'neighborhood',
        id: user?.neighborhood_tag
      },
      country: {
        label: 'Country',
        type: 'country',
        id: user?.country || 'United States'
      },
      global: {
        label: 'Global',
        type: 'global',
        id: 'all'
      }
    } as const;
  }, [user?.country, user?.neighborhood_tag]);

  const currentScope = scopeConfig[scope];
  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const userRank = leaderboard.find((u) => u.user_id === user?.id);
  const userPercentile = userRank && leaderboard.length > 0
    ? Math.ceil((userRank.rank / leaderboard.length) * 100)
    : null;

  useEffect(() => {
    if (!currentScope.id) return;
    setIsLoading(true);
    setError('');
    getLeaderboard(currentScope.type, currentScope.id)
      .then((data) => setLeaderboard(data.rankings || []))
      .catch((err) => {
        console.error(err);
        setError('Failed to load leaderboard');
      })
      .finally(() => setIsLoading(false));
  }, [currentScope.id, currentScope.type]);

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Leaderboard</p>
              <h1 className="text-4xl font-black text-on-surface">The Green Hall of Fame</h1>
              <p className="text-on-surface-variant mt-2">
                Top performers in {scope === 'county' ? (user?.neighborhood_tag || 'your county') : scope === 'country' ? (user?.country || 'your country') : 'the world'}.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-lowest rounded-full p-1 shadow-sm">
              {(['county', 'country', 'global'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setScope(option)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${scope === option ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:text-on-surface'}`}
                  type="button"
                >
                  {scopeConfig[option].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-lime-50 border border-surface-container-low p-8">
          <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute -left-10 -bottom-16 h-40 w-40 rounded-full bg-secondary-container/40 blur-2xl" />

          {isLoading ? (
            <div className="text-center text-on-surface-variant py-12">Loading leaderboard...</div>
          ) : error ? (
            <div className="text-center text-error py-12">{error}</div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center text-on-surface-variant py-12">No rankings yet.</div>
          ) : (
            <div className="grid grid-cols-3 gap-3 md:gap-6 pt-28 pb-4 items-end max-w-4xl mx-auto">
              {/* Rank 2 */}
              {topThree[1] ? (
                <div className="relative flex flex-col items-center justify-end h-[220px]">
                  <div className="absolute top-0 z-10 flex flex-col items-center">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-[6px] border-white ring-2 ring-blue-100 bg-[#eef4ff] flex items-center justify-center shadow-sm relative overflow-visible">
                      {topThree[1].avatar_url ? (
                        <img src={topThree[1].avatar_url} alt={topThree[1].name} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <span className="text-3xl font-bold text-blue-700">{topThree[1].name.charAt(0)}</span>
                      )}
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#3f5a72] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ring-[3px] ring-white shadow-sm z-20">2</div>
                    </div>
                  </div>
                  <div className="w-full bg-[#f4f7f6] h-[140px] rounded-t-[2.5rem] rounded-b-3xl pt-16 pb-6 px-2 flex flex-col items-center text-center shadow-sm">
                    <h3 className="font-bold text-sm md:text-lg text-slate-800 line-clamp-1 w-full px-2">{topThree[1].name}</h3>
                    <p className="text-xs md:text-sm text-slate-500 font-semibold mt-1">{topThree[1].points.toLocaleString()} Seeds</p>
                  </div>
                </div>
              ) : <div className="h-[220px]" />}

              {/* Rank 1 */}
              {topThree[0] ? (
                <div className="relative flex flex-col items-center justify-end h-[310px] z-20">
                  <div className="absolute top-0 flex flex-col items-center w-full z-20">
                    <div className="mb-3 bg-[#6b674b] text-white rounded-full w-9 h-9 flex items-center justify-center shadow-md relative z-30">
                      <span className="material-symbols-outlined text-[20px]">star</span>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#6b674b]"></div>
                    </div>
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-[6px] border-white ring-2 ring-[#a0e8c5] bg-[#e1f9ee] flex items-center justify-center shadow-md relative overflow-visible z-20">
                      {topThree[0].avatar_url ? (
                        <img src={topThree[0].avatar_url} alt={topThree[0].name} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <span className="text-4xl font-black text-[#056046]">{topThree[0].name.charAt(0)}</span>
                      )}
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#056046] text-white w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-base ring-[4px] ring-white shadow-md z-30">1</div>
                    </div>
                  </div>
                  <div className="w-full bg-[#dcf8eb] h-[210px] rounded-t-[3rem] rounded-b-3xl pt-28 pb-6 px-2 flex flex-col items-center text-center shadow-md z-10 mx-[-4px]">
                    <h3 className="font-black text-base md:text-2xl text-slate-800 line-clamp-1 w-full px-2">{topThree[0].name}</h3>
                    <p className="text-sm md:text-base text-[#056046] font-bold mt-1">{topThree[0].points.toLocaleString()} Seeds</p>
                    <div className="mt-4 flex gap-1.5 opacity-60">
                      <div className="w-8 md:w-10 h-1.5 md:h-2 bg-[#056046] rounded-full"></div>
                      <div className="w-3 md:w-4 h-1.5 md:h-2 bg-[#056046] rounded-full"></div>
                    </div>
                  </div>
                </div>
              ) : <div className="h-[280px]" />}

               {/* Rank 3 */}
               {topThree[2] ? (
                <div className="relative flex flex-col items-center justify-end h-[200px]">
                  <div className="absolute top-0 z-10 flex flex-col items-center">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-[6px] border-white ring-2 ring-[#e6e2cd] bg-[#fbf9f1] flex items-center justify-center shadow-sm relative overflow-visible">
                      {topThree[2].avatar_url ? (
                        <img src={topThree[2].avatar_url} alt={topThree[2].name} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <span className="text-3xl font-bold text-[#6b6343]">{topThree[2].name.charAt(0)}</span>
                      )}
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#6b6343] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ring-[3px] ring-white shadow-sm z-20">3</div>
                    </div>
                  </div>
                  <div className="w-full bg-[#f4f7f6] h-[120px] rounded-t-[2.5rem] rounded-b-3xl pt-14 pb-4 px-2 flex flex-col items-center text-center shadow-sm">
                    <h3 className="font-bold text-sm md:text-lg text-slate-800 line-clamp-1 w-full px-2">{topThree[2].name}</h3>
                    <p className="text-xs md:text-sm text-slate-500 font-semibold mt-1">{topThree[2].points.toLocaleString()} Seeds</p>
                  </div>
                </div>
              ) : <div className="h-[200px]" />}
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-surface-container-low bg-gradient-to-br from-amber-50 via-amber-100/40 to-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">Your Position</p>
            {userRank ? (
              <div className="mt-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-amber-200 text-amber-900 font-black flex items-center justify-center">
                    {userRank.rank}
                  </div>
                  <div>
                    <p className="text-lg font-black text-on-surface">{user?.name || 'You'}</p>
                    <p className="text-xs text-on-surface-variant">{userRank.points.toLocaleString()} Seeds • Top {userPercentile}%</p>
                  </div>
                </div>
                <div className="mt-5">
                  <p className="text-xs text-on-surface-variant">Gap to next rank</p>
                  <p className="text-sm font-bold text-on-surface">
                    {userRank.rank > 1 ? Math.max(0, leaderboard[userRank.rank - 2]?.points - userRank.points).toLocaleString() : 0} Seeds
                  </p>
                </div>
                <div className="mt-4 h-2 w-full rounded-full bg-amber-100">
                  <div
                    className="h-2 rounded-full bg-amber-500"
                    style={{ width: `${Math.min(100, Math.max(10, 100 - (userPercentile || 100)))}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="mt-6 text-sm text-on-surface-variant">Log an action to join the rankings.</p>
            )}
          </div>
          <div className="lg:col-span-2 rounded-2xl border border-surface-container-low bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white relative overflow-hidden">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Refer a Friend</p>
              <h3 className="text-2xl font-black mt-3">Grow the Green Circle</h3>
              <p className="text-sm text-emerald-100 mt-2 max-w-md">Invite eco‑minded friends and boost your rank with bonus points.</p>
              <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-white text-slate-900 px-5 py-2 text-sm font-bold">
                Get Invite Link
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-2xl border border-surface-container-low overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-on-surface-variant">Loading leaderboard...</div>
          ) : rest.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant">No additional ranks yet.</div>
          ) : (
            <div className="divide-y divide-surface-container-low">
              {rest.map((u) => (
                <div key={u.user_id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-surface-container-low/50 transition-colors">
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
                      <p className="text-xs text-on-surface-variant">{currentScope.label} rank</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-primary">{u.points.toLocaleString()}</span>
                    <span className="text-xs text-on-surface-variant ml-1">Seeds</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
};
 