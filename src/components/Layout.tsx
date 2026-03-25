import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { auth } from '../firebase';
import { LogOut, User, Shield, Radio, Video, Home } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <nav className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter text-white">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
                LiveStream Hub
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link to="/" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-2">
                  <Home className="w-4 h-4" /> Inicio
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Admin
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <Link to="/profile" className="flex items-center gap-2 group">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-white group-hover:text-red-500 transition-colors">{profile?.displayName}</p>
                      <p className="text-xs text-zinc-500 capitalize">{profile?.role}</p>
                    </div>
                    {profile?.photoURL ? (
                      <img src={profile.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-zinc-700" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                        <User className="w-4 h-4 text-zinc-400" />
                      </div>
                    )}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="text-sm font-medium px-4 py-2 text-zinc-400 hover:text-white transition-colors">
                    Acceso
                  </Link>
                  <Link to="/register" className="text-sm font-medium px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-lg shadow-red-900/20">
                    Registro
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="border-t border-zinc-800 py-12 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-zinc-500 text-sm">© 2026 LiveStream Hub. Transmite tu pasión.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
