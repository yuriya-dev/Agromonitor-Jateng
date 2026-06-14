"use client";

import Link from 'next/link';
import { useState } from 'react';
import { User, LogOut, ChevronDown, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';

export default function Header() {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      <header className="bg-background border-b-2 border-border-color sticky top-0 z-50">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold tracking-tight uppercase flex items-center">
              <span className="w-4 h-4 bg-foreground inline-block mr-2"></span>
              AGROMONITOR<span className="text-accent-grey ml-2">JATENG</span>
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            {user ? (
              // Logged-in user menu
              <div className="relative">
                <button
                  id="user-menu-btn"
                  onClick={() => setShowUserMenu(v => !v)}
                  className="hover:bg-surface p-2 border border-transparent hover:border-border-color transition-colors flex items-center gap-2 font-mono text-xs font-bold uppercase"
                >
                  <div className="w-7 h-7 bg-foreground text-background flex items-center justify-center font-bold text-xs rounded-none">
                    {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[120px] truncate">{user.name || user.email}</span>
                  <ChevronDown size={14} />
                </button>

                {showUserMenu && (
                  <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 top-full mt-1 w-52 bg-white border-2 border-border-color shadow-brutal z-20 font-mono text-xs">
                      <div className="p-3 border-b border-border-color bg-surface">
                        <div className="font-bold uppercase truncate">{user.name || 'Pengguna'}</div>
                        <div className="text-accent-grey text-[10px] truncate mt-0.5">{user.email}</div>
                        <div className="mt-1 inline-block px-1.5 py-0.5 border text-[9px] uppercase font-bold border-border-color">{user.role}</div>
                      </div>
                      <Link
                        href="/profile"
                        id="nav-profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2.5 hover:bg-surface uppercase font-bold transition-colors"
                      >
                        <User size={14} /> Profil & Preferensi
                      </Link>
                      <button
                        id="nav-logout"
                        onClick={() => { logout(); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-red-50 hover:text-accent-red uppercase font-bold transition-colors border-t border-border-color text-left"
                      >
                        <LogOut size={14} /> Keluar
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              // Guest: show Login button
              <button
                id="btn-login-header"
                onClick={() => setShowAuthModal(true)}
                className="hover:bg-surface p-2 border border-border-color hover:border-foreground transition-colors flex items-center gap-1.5 font-mono text-xs font-bold uppercase"
              >
                <LogIn size={16} />
                <span className="hidden sm:inline">Masuk</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  );
}
