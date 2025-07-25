import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Upload, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MC</span>
            </div>
            <span className="font-bold text-xl hidden sm:block">AddonsHub</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar addons..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/upload"
                  className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload</span>
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>{user.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-4 py-2 text-white hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105"
                >
                  Cadastrar
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <nav className="flex flex-col space-y-2">
              {user ? (
                <>
                  <Link
                    to="/upload"
                    className="flex items-center space-x-2 px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Addon</span>
                  </Link>
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>Meu Painel</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-3 text-white hover:bg-red-500/20 rounded-lg transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Cadastrar
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;