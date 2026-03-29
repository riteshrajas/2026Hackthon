import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import {
    logAction,
    getActionHistory,
    getDailyChallenge,
    expandDailyChallenge,
    completeDailyChallenge,
    getAISuggestions
} from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

export const ActionsPage = () => {
  const { user } = useAuth();
    const [dailyChallenge, setDailyChallenge] = useState<any | null>(null);
    const [dailyExpanded, setDailyExpanded] = useState<any | null>(null);
    const [isExpanding, setIsExpanding] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [aiSuggestion, setAiSuggestion] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');

    const dailyPointsLabel = useMemo(() => {
        if (!dailyChallenge?.points_range) return '';
        return `${dailyChallenge.points_range.min}-${dailyChallenge.points_range.max}`;
    }, [dailyChallenge]);

    const handleAction = async (actionType: string, actionName: string) => {
    if (!user) {
      toast.error('You must be logged in to do this.');
      return;
    }
    
    try {
      toast.loading(`Logging ${actionName}...`, { id: 'action-log' });
            const result = await logAction(user.id, actionType, actionName);
            toast.success(`Action "${actionName}" logged! Earned ${result.points} PTS & saved ${result.co2}kg CO2!`, { id: 'action-log', duration: 4000 });
            const updated = await getActionHistory(10);
            setHistory(updated);
    } catch (error) {
      toast.error('Failed to log action', { id: 'action-log' });
      console.error(error);
    }
  };

    const handleDailyExpand = async () => {
        if (!dailyChallenge) return;
        setIsExpanding(true);
        try {
            const expanded = await expandDailyChallenge(dailyChallenge.id);
            setDailyExpanded(expanded);
            toast.success(`Gemini boosted +${expanded.bonus_points} pts!`);
        } catch (error) {
            console.error(error);
            toast.error('Gemini boost failed. Try again.');
        } finally {
            setIsExpanding(false);
        }
    };

    const handleDailyComplete = async () => {
        if (!dailyChallenge) return;
        setIsCompleting(true);
        try {
            const result = await completeDailyChallenge(dailyChallenge.id, Boolean(dailyExpanded));
            toast.success(`Daily challenge logged! Earned ${result.points} PTS.`, { duration: 4000 });
            const updated = await getActionHistory(10);
            setHistory(updated);
        } catch (error) {
            console.error(error);
            toast.error('Failed to complete daily challenge');
        } finally {
            setIsCompleting(false);
        }
    };

    useEffect(() => {
        getDailyChallenge()
            .then((challenge) => {
                setDailyChallenge(challenge);
                setDailyExpanded(null);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    useEffect(() => {
        setHistoryLoading(true);
        getActionHistory(10)
            .then((data) => setHistory(data))
            .catch((error) => {
                console.error(error);
            })
            .finally(() => setHistoryLoading(false));
    }, []);

    useEffect(() => {
        if (!user?.id) return;
        setAiLoading(true);
        setAiError('');
        getAISuggestions(user.id)
            .then((data) => setAiSuggestion(data?.text || data?.message || ''))
            .catch((error) => {
                console.error(error);
                setAiError('Unable to load AI guidance right now.');
            })
            .finally(() => setAiLoading(false));
    }, [user?.id]);

    return (
        <MainLayout>
            <Toaster position="bottom-center" />

            <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Hero Section */}
                <section className="bg-primary rounded-[2rem] p-10 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <p className="text-xs font-semibold tracking-wider text-green-100 mb-3">DAILY CHALLENGE</p>
                        <h1 className="text-5xl font-bold mb-4 leading-tight">
                            {dailyChallenge?.title || 'Master your Eco-Impact today!'}
                        </h1>
                        <p className="text-green-50 mb-8 max-w-md text-lg">
                            {dailyChallenge?.description || 'Complete daily missions to level up your Green Ninja and unlock exclusive environmental rewards.'}
                        </p>
                        <button
                            className="bg-[#a7f3d0] text-primary font-bold px-6 py-3 rounded-full hover:bg-white transition-colors flex items-center gap-2"
                            onClick={handleDailyComplete}
                            disabled={!dailyChallenge || isCompleting}
                        >
                            {isCompleting ? 'Logging...' : 'Start Mission'}
                            <span>🚀</span>
                        </button>
          </div>
          {/* Decorative Icon */}
          <div className="absolute right-10 bottom-0 opacity-20">
            <svg width="240" height="240" viewBox="0 0 24 24" fill="currentColor">
               <path d="M12 2L3 7v10l9 5 9-5V7L12 2zm0 2.8l6.5 3.6-6.5 3.6-6.5-3.6L12 4.8zm-7.5 5.8l6.5 3.6v7.3l-6.5-3.6v-7.3zm8.5 10.9v-7.3l6.5-3.6v7.3l-6.5 3.6z"/>
            </svg>
          </div>
        </section>

        <section className="bg-surface-container-lowest border border-surface-container-low rounded-3xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold tracking-wider text-on-surface-variant">AI PANEL</p>
                    <h2 className="text-2xl font-bold text-on-surface">Next best action</h2>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary-container text-on-primary-container">Eco-AI</span>
            </div>
            {aiLoading ? (
                <p className="text-sm text-on-surface-variant">Loading personalized suggestion...</p>
            ) : aiError ? (
                <p className="text-sm text-on-surface-variant">{aiError}</p>
            ) : (
                <p className="text-sm text-on-surface leading-relaxed">
                    {aiSuggestion || 'Complete a quick action today to keep your streak active.'}
                </p>
            )}
        </section>

        {/* Action Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Main Action */}
                        <div className="bg-[#6effc1] rounded-3xl p-8 col-span-1 md:col-span-2 relative overflow-hidden flex flex-col justify-between h-72">
                <div>
                   <p className="text-xs font-bold tracking-wider text-primary mb-3 uppercase flex items-center gap-2">
                        <span className="bg-white p-1 rounded-full text-primary"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></span>
                        Daily Challenge
                    </p>
                                        <h2 className="text-3xl font-bold text-primary mb-2">{dailyChallenge?.title || 'Loading...'}</h2>
                                        <p className="text-primary/80 max-w-sm text-sm">{dailyChallenge?.description || 'Gathering today\'s mission.'}</p>
                                        {dailyExpanded?.expanded_description && (
                                            <p className="text-primary/80 max-w-sm text-xs mt-3">{dailyExpanded.expanded_description}</p>
                                        )}
                </div>
                
                <div className="flex items-end justify-between z-10">
                                        <div className="text-primary font-bold text-4xl">
                                            +{dailyPointsLabel || '...'} <span className="text-sm">PTS</span>
                                            {dailyExpanded?.bonus_points && (
                                                <span className="block text-xs font-semibold text-primary/70">Gemini +{dailyExpanded.bonus_points} pts</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={handleDailyExpand}
                                                disabled={!dailyChallenge || isExpanding || Boolean(dailyExpanded)}
                                                className="bg-white text-primary font-semibold px-4 py-2 rounded-full hover:bg-primary/10 transition-colors"
                                            >
                                                {dailyExpanded ? 'Gemini Boosted' : isExpanding ? 'Boosting...' : 'Ask Gemini'}
                                            </button>
                                            <button
                                                onClick={handleDailyComplete}
                                                disabled={!dailyChallenge || isCompleting}
                                                className="bg-primary text-white font-medium px-6 py-2.5 rounded-full hover:bg-primary-dim transition-colors cursor-pointer relative z-20"
                                            >
                                                {isCompleting ? 'Logging...' : 'Start Action'}
                                            </button>
                                        </div>
                </div>

                <div className="absolute right-6 top-6 opacity-30 text-primary pointer-events-none">
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/></svg>
                </div>
            </div>

            {/* Sub Action 1 */}
            <div className="bg-[#fef3c7] rounded-3xl p-8 flex flex-col justify-between h-72">
                <div>
                    <div className="bg-white p-2 rounded-full text-yellow-600 w-8 h-8 flex items-center justify-center mb-4">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">Power Down</h3>
                    <p className="text-gray-600 text-sm">Switch off all non-essential electronics for 1 hour.</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="font-bold text-2xl text-gray-900">40-50 <span className="text-sm text-gray-500">pts</span></span>
                    <button onClick={() => handleAction('GRID', 'Power Down')} className="bg-yellow-700 text-white w-8 h-8 rounded-full flex items-center justify-center ml-auto hover:bg-yellow-800 transition cursor-pointer">+</button>
                </div>
            </div>

            {/* Sub Action 2 */}
            <div className="bg-[#dbeafe] rounded-3xl p-6 flex flex-col justify-between">
                <div>
                   <div className="bg-white p-2 rounded-full text-blue-600 w-8 h-8 flex items-center justify-center mb-3">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3z"/></svg>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1">Scroll & Learn</h3>
                    <p className="text-gray-600 text-xs">Read a 2-minute scroll on sustainable textiles.</p>
                </div>
                <div className="flex items-center justify-between mt-6">
                    <span className="font-bold text-gray-900 text-sm">+25 PTS</span>
                    <button onClick={() => handleAction('EDUCATIONAL', 'Scroll & Learn')} className="bg-slate-700 text-white text-xs px-4 py-1.5 rounded-full hover:bg-slate-800 cursor-pointer">Begin</button>
                </div>
            </div>

            {/* Sub Action 3 */}
            <div className="bg-[#e0e7ff] rounded-3xl p-6 flex flex-col justify-between">
                <div>
                   <div className="bg-white p-2 rounded-full text-indigo-600 w-8 h-8 flex items-center justify-center mb-3">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M21 16.5C21 16.88 20.79 17.21 20.47 17.38L12.57 21.82C12.41 21.94 12.21 22 12 22C11.79 22 11.59 21.94 11.43 21.82L3.53 17.38C3.21 17.21 3 16.88 3 16.5V7.5C3 7.12 3.21 6.79 3.53 6.62L11.43 2.18C11.59 2.06 11.79 2 12 2C12.21 2 12.41 2.06 12.57 2.18L20.47 6.62C20.79 6.79 21 7.12 21 7.5V16.5Z"/></svg>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1">Sort Waste</h3>
                    <p className="text-gray-600 text-xs">Sort through the waste in your house.</p>
                </div>
               <div className="flex items-center justify-between mt-6">
                    <span className="font-bold text-gray-900 text-sm">+25 PTS</span>
                    <button onClick={() => handleAction('VERIFIED', 'Sort Waste')} className="bg-slate-700 text-white text-xs px-4 py-1.5 rounded-full hover:bg-slate-800 cursor-pointer">Begin</button>
                </div>
            </div>

            {/* Sub Action 4 */}
            <div className="bg-[#bae6fd] rounded-3xl p-6 flex flex-col justify-between">
                <div>
                   <div className="bg-white p-2 rounded-full text-sky-600 w-8 h-8 flex items-center justify-center mb-3">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1">Reduce Water</h3>
                    <p className="text-gray-600 text-xs">Reduce your water usage by 50 percent.</p>
                </div>
                 <div className="flex items-center justify-between mt-6">
                    <span className="font-bold text-gray-900 text-sm">+25 PTS</span>
                    <button onClick={() => handleAction('VERIFIED', 'Reduce Water')} className="bg-slate-700 text-white text-xs px-4 py-1.5 rounded-full hover:bg-slate-800 cursor-pointer">Begin</button>
                </div>
            </div>
        </section>

        {/* Task History */}
                <section className="pt-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    Task History
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                </h2>
                                <span className="text-primary font-bold text-sm">Latest</span>
            </div>

                        {historyLoading ? (
                            <div className="text-sm text-gray-500">Loading history...</div>
                        ) : history.length === 0 ? (
                            <div className="text-sm text-gray-500">No actions logged yet.</div>
                        ) : (
                            <div className="space-y-3">
                                {history.map((entry) => (
                                    <div key={entry._id || entry.timestamp} className="bg-white rounded-2xl p-4 flex items-center shadow-sm">
                                        <div className="bg-green-100 p-2 rounded-full text-green-600 mr-4">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900">{entry.action_label || entry.action_type}</h4>
                                            <p className="text-xs text-gray-500">
                                                {entry.co2_saved}kg CO2 saved • {new Date(entry.createdAt || entry.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">+{entry.points_awarded} XP</div>
                                    </div>
                                ))}
                            </div>
                        )}
        </section>
            </main>

            {/* Floating Action Button */}
            <button className="fixed bottom-8 right-8 bg-primary text-white p-4 rounded-full shadow-xl hover:bg-primary-dim transition-transform hover:scale-105">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            </button>
        </MainLayout>
  );
};