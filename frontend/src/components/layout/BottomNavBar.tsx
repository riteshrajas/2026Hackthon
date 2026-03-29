export const BottomNavBar = () => {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 lg:hidden bg-[#f4f7f5]/80 dark:bg-emerald-950/80 backdrop-blur-lg rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,105,72,0.05)]">
      <a className="flex flex-col items-center justify-center bg-[#6effc1] text-[#006041] rounded-[1.5rem] px-6 py-2 scale-110 duration-300 ease-out" href="#">
        <span className="material-symbols-outlined">home</span>
        <span className="text-[10px] font-body font-bold uppercase tracking-wider mt-1">Home</span>
      </a>
      <a className="flex flex-col items-center justify-center text-[#2b2f2e] dark:text-[#dfe4e1] px-4 py-2 hover:bg-[#eef2ef] dark:hover:bg-emerald-900 transition-colors" href="#">
        <span className="material-symbols-outlined">search</span>
        <span className="text-[10px] font-body font-bold uppercase tracking-wider mt-1">Search</span>
      </a>
      <a className="flex flex-col items-center justify-center text-[#2b2f2e] dark:text-[#dfe4e1] px-4 py-2 hover:bg-[#eef2ef] dark:hover:bg-emerald-900 transition-colors" href="#">
        <span className="material-symbols-outlined">eco</span>
        <span className="text-[10px] font-body font-bold uppercase tracking-wider mt-1">Activity</span>
      </a>
      <a className="flex flex-col items-center justify-center text-[#2b2f2e] dark:text-[#dfe4e1] px-4 py-2 hover:bg-[#eef2ef] dark:hover:bg-emerald-900 transition-colors" href="#">
        <span className="material-symbols-outlined">person</span>
        <span className="text-[10px] font-body font-bold uppercase tracking-wider mt-1">Profile</span>
      </a>
    </nav>
  );
};
