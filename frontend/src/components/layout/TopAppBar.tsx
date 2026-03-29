import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const TopAppBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  return (
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
      <div className="flex items-center bg-surface-container-low px-4 py-2 rounded-full w-full sm:w-64">
        <span className="material-symbols-outlined text-outline">search</span>
        <input
          aria-label="Search eco-wins"
          className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none"
          placeholder="Search eco-wins..."
          type="text"
        />
      </div>
      <div className="relative flex items-center justify-end gap-3" ref={menuRef}>
        <button
          className="flex items-center gap-1 rounded-full ring-2 ring-primary-container transition-transform duration-200 active:scale-95"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          type="button"
        >
          <img
            alt="User profile avatar"
            className="w-10 h-10 rounded-full object-cover"
            src={user?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6effc1&color=006948`}
          />
          <span
            className={`material-symbols-outlined text-[18px] text-on-surface-variant transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            expand_more
          </span>
        </button>
        {isMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-52 rounded-lg bg-surface-container-lowest shadow-lg ring-1 ring-black/5">
            <div className="px-4 py-3 border-b border-surface-container-highest">
              <p className="text-sm font-bold text-on-surface">{user?.name || 'Eco Member'}</p>
              <p className="text-xs text-on-surface-variant">Manage your account</p>
            </div>
            <button
              className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
              onClick={() => {
                setIsMenuOpen(false);
                handleSettings();
              }}
              type="button"
            >
              Settings
            </button>
            <button
              className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
              onClick={() => {
                setIsMenuOpen(false);
                handleLogout();
              }}
              type="button"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
