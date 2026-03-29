import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const SideNavBar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleShareClick = () => {
    toast('Navigate to Feed to share an Eco-Win!', { icon: '🌱' });
  };
  
  return (
    <aside className="h-screen w-64 fixed left-0 top-0 hidden lg:flex flex-col bg-[#f4f7f5] dark:bg-emerald-950 no-border flat pt-24 px-4 z-40 border-r border-[#d9e5df] dark:border-emerald-900/40">
      <div className="mb-8 px-4">
        <h3 className="text-xl font-extrabold text-[#006948] dark:text-[#6effc1]">Eco-Pulse</h3>
        <p className="text-xs font-semibold text-on-surface-variant opacity-70">
          {user?.neighborhood_tag || 'Global Guardian'}
        </p>
      </div>
      <nav className="flex flex-col gap-2 py-8">
        <Link to="/feed" className={`${isActive('/feed') ? 'bg-[#6effc1] text-[#006041]' : 'text-[#2b2f2e] dark:text-[#dfe4e1] hover:bg-[#dfe4e1] dark:hover:bg-emerald-800'} rounded-full mx-2 px-4 py-3 font-bold flex items-center gap-3 transition-transform active:translate-x-1 duration-150`}>
          <span className="material-symbols-outlined">nest_eco_leaf</span> Feed
        </Link>
        <Link to="/actions" className={`${isActive('/actions') ? 'bg-[#6effc1] text-[#006041]' : 'text-[#2b2f2e] dark:text-[#dfe4e1] hover:bg-[#dfe4e1] dark:hover:bg-emerald-800'} rounded-full mx-2 px-4 py-3 font-bold flex items-center gap-3 transition-transform active:translate-x-1 duration-150`}>
          <span className="material-symbols-outlined">bolt</span> Actions
        </Link>
        <Link to="/discover" className={`${isActive('/discover') ? 'bg-[#6effc1] text-[#006041]' : 'text-[#2b2f2e] dark:text-[#dfe4e1] hover:bg-[#dfe4e1] dark:hover:bg-emerald-800'} rounded-full mx-2 px-4 py-3 flex items-center gap-3 transition-all`}>
          <span className="material-symbols-outlined">explore</span> Discover
        </Link>
        <Link to="/impact" className={`${isActive('/impact') ? 'bg-[#6effc1] text-[#006041]' : 'text-[#2b2f2e] dark:text-[#dfe4e1] hover:bg-[#dfe4e1] dark:hover:bg-emerald-800'} rounded-full mx-2 px-4 py-3 flex items-center gap-3 transition-all`}>
          <span className="material-symbols-outlined">bar_chart</span> Impact
        </Link>
        <Link to="/community" className={`${isActive('/community') ? 'bg-[#6effc1] text-[#006041]' : 'text-[#2b2f2e] dark:text-[#dfe4e1] hover:bg-[#dfe4e1] dark:hover:bg-emerald-800'} rounded-full mx-2 px-4 py-3 flex items-center gap-3 transition-all`}>
          <span className="material-symbols-outlined">group</span> Community
        </Link>
        <Link to="/settings" className={`${isActive('/settings') ? 'bg-[#6effc1] text-[#006041]' : 'text-[#2b2f2e] dark:text-[#dfe4e1] hover:bg-[#dfe4e1] dark:hover:bg-emerald-800'} rounded-full mx-2 px-4 py-3 flex items-center gap-3 transition-all`}>
          <span className="material-symbols-outlined">settings</span> Settings
        </Link>
      </nav>
      <div className="mt-auto mb-10 px-2">
        <button onClick={handleShareClick} className="w-full bg-[#006948] text-[#ffffff] dark:bg-[#6effc1] dark:text-[#004b32] py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-transform active:scale-95 cursor-pointer">
          <span className="material-symbols-outlined">add_circle</span> Share your Eco-Win
        </button>
      </div>
    </aside>
  );
};
