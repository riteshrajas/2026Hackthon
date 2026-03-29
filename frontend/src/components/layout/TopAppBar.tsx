import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export const TopAppBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-[#f4f7f5]/70 dark:bg-emerald-950/70 backdrop-blur-xl docked full-width top-0 sticky z-50 no-border tonal-shift-bg flat no shadows">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/feed" className="text-2xl font-black text-[#006948] dark:text-[#6effc1] tracking-tight">Eco-Pulse</Link>
          <nav className="hidden md:flex gap-6">
            <Link className="font-headline font-bold text-lg text-[#006948] dark:text-[#6effc1] border-b-2 border-[#006948]" to="/feed">Feed</Link>
            <Link className="font-headline font-bold text-lg text-[#2b2f2e] dark:text-[#eef2ef] hover:bg-[#eef2ef] dark:hover:bg-emerald-900/50 transition-colors px-2 rounded-md" to="/discover">Discover</Link>
            <Link className="font-headline font-bold text-lg text-[#2b2f2e] dark:text-[#eef2ef] hover:bg-[#eef2ef] dark:hover:bg-emerald-900/50 transition-colors px-2 rounded-md" to="/impact">Impact</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center bg-surface-container-low px-4 py-2 rounded-full">
            <span className="material-symbols-outlined text-outline">search</span>
            <input className="bg-transparent border-none focus:ring-0 text-sm w-48 outline-none" placeholder="Search eco-wins..." type="text"/>
          </div>
          <button className="text-[#006948] scale-95 active:scale-90 transition-transform duration-200" onClick={handleLogout} title="Logout">
            <span className="material-symbols-outlined">logout</span>
          </button>
          <button className="text-[#006948] scale-95 active:scale-90 transition-transform duration-200">
            <span className="material-symbols-outlined" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
          </button>
          <img 
            alt="User profile avatar" 
            className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-container" 
            src={user?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6effc1&color=006948`}
          />
        </div>
      </div>
    </header>
  );
};
