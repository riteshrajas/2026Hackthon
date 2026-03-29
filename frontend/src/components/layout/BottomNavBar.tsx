import { Link, useLocation } from 'react-router-dom';

export const BottomNavBar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 lg:hidden bg-[#f4f7f5]/80 dark:bg-emerald-950/80 backdrop-blur-lg rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,105,72,0.05)]">
      <Link className={`flex flex-col items-center justify-center ${isActive('/feed') ? 'bg-[#6effc1] text-[#006041] scale-110' : 'text-[#2b2f2e] dark:text-[#dfe4e1]'} rounded-[1.5rem] px-6 py-2 duration-300 ease-out`} to="/feed">
        <span className="material-symbols-outlined">home</span>
        <span className="text-[10px] font-body font-bold uppercase tracking-wider mt-1">Home</span>
      </Link>
      <Link className={`flex flex-col items-center justify-center ${isActive('/discover') ? 'text-primary' : 'text-[#2b2f2e] dark:text-[#dfe4e1]'} px-4 py-2 hover:bg-[#eef2ef] dark:hover:bg-emerald-900 transition-colors`} to="/discover">
        <span className="material-symbols-outlined">explore</span>
        <span className="text-[10px] font-body font-bold uppercase tracking-wider mt-1">Discover</span>
      </Link>
      <Link className={`flex flex-col items-center justify-center ${isActive('/events') ? 'text-primary' : 'text-[#2b2f2e] dark:text-[#dfe4e1]'} px-4 py-2 hover:bg-[#eef2ef] dark:hover:bg-emerald-900 transition-colors`} to="/events">
        <span className="material-symbols-outlined">event</span>
        <span className="text-[10px] font-body font-bold uppercase tracking-wider mt-1">Events</span>
      </Link>
      <Link className={`flex flex-col items-center justify-center ${isActive('/actions') ? 'text-primary' : 'text-[#2b2f2e] dark:text-[#dfe4e1]'} px-4 py-2 hover:bg-[#eef2ef] dark:hover:bg-emerald-900 transition-colors`} to="/actions">
        <span className="material-symbols-outlined">bolt</span>
        <span className="text-[10px] font-body font-bold uppercase tracking-wider mt-1">Actions</span>
      </Link>
    </nav>
  );
};
