import React, { useEffect } from 'react';
import { FiX, FiHome, FiDroplet, FiHelpCircle, FiLogOut } from 'react-icons/fi';

const SideMenu = ({ open, onClose, onNavigate, onSignOut, children }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div aria-hidden={!open}>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 transition-opacity z-[200] ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />
      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation"
        className={`fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl border-r border-gray-200/60 dark:border-gray-800 transition-transform duration-300 z-[210] ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <img src="/bloodlogo.png" alt="Site logo" className="w-8 h-8 rounded-md" />
            <span className="text-lg font-bold">Workout Tracker</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus-ring"
          >
            <FiX />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          <button
            onClick={() => { onNavigate?.('home'); onClose?.(); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
          >
            <FiHome className="text-gray-600 dark:text-gray-300" />
            <span className="font-medium">Home</span>
          </button>
          <button
            onClick={() => { onNavigate?.('glucose'); onClose?.(); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-left"
          >
            <FiDroplet className="text-rose-600" />
            <span className="font-medium">Glucose Tracking</span>
          </button>
          <button
            onClick={() => { onNavigate?.('help'); onClose?.(); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
          >
            <FiHelpCircle className="text-gray-600 dark:text-gray-300" />
            <span className="font-medium">Help</span>
          </button>
        </nav>

        {children}

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => { onSignOut?.(); onClose?.(); }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <FiLogOut />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

export default SideMenu;
