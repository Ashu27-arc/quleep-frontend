import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, User, LogOut, ChevronDown, Menu, X, PlusCircle, LayoutDashboard } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-neutral-950/80 border-b border-neutral-900 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 text-neutral-100 font-black tracking-wider text-lg select-none">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-neutral-950 shadow-lg shadow-emerald-950/40">
                <Box className="w-5 h-5 animate-pulse" />
              </div>
              <span className="bg-gradient-to-r from-neutral-100 to-neutral-300 bg-clip-text text-transparent">3D OBJECT STUDIO</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex ml-10 space-x-1">
              <Link
                to="/"
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive('/')
                    ? 'bg-neutral-900 text-emerald-400'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/upload"
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive('/upload')
                    ? 'bg-neutral-900 text-emerald-400'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Upload Model</span>
              </Link>
            </div>
          </div>

          {/* User Settings Desktop actions */}
          <div className="hidden md:flex items-center">
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-neutral-900 hover:border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-neutral-300 hover:text-neutral-100 font-semibold text-sm transition-all duration-200 cursor-pointer shadow-sm select-none"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-black uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span>{user.name}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-250 ${dropdownOpen ? 'rotate-185' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-56 rounded-xl border border-neutral-850 bg-neutral-900 shadow-2xl p-1.5 animate-slide-up">
                    <div className="px-3.5 py-3 border-b border-neutral-800/80">
                      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Account Session</p>
                      <p className="text-sm font-bold text-neutral-200 truncate mt-1">{user.name}</p>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">{user.email}</p>
                    </div>

                    <div className="p-1 space-y-0.5">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10 transition-colors font-semibold cursor-pointer"
                      >
                        <LogOut className="w-4.5 h-4.5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hamburger Mobile Menu toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-900 bg-neutral-950 p-4 space-y-3 animate-fade-in">
          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
                isActive('/') ? 'bg-neutral-900 text-emerald-400' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
              }`}
            >
              <LayoutDashboard className="w-4.5 h-4.5" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/upload"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
                isActive('/upload') ? 'bg-neutral-900 text-emerald-400' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
              }`}
            >
              <PlusCircle className="w-4.5 h-4.5" />
              <span>Upload Model</span>
            </Link>
          </div>

          {user && (
            <div className="pt-4 border-t border-neutral-900">
              <div className="flex items-center gap-3 px-4 pb-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-black">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-200">{user.name}</p>
                  <p className="text-xs text-neutral-500">{user.email}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 transition font-semibold cursor-pointer"
              >
                <LogOut className="w-4.5 h-4.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
