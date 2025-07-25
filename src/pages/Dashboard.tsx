import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Eye, 
  Download, 
  Edit3, 
  Trash2, 
  Calendar,
  BarChart3,
  TrendingUp,
  Users,
  Package
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Addon, CATEGORY_LABELS } from '../types';
import { apiService } from '../services/api';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userAddons, setUserAddons] = useState<Addon[]>([]);
  const [stats, setStats] = useState({
    totalAddons: 0,
    totalViews: 0,
    totalDownloads: 0,
    thisMonthViews: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await apiService.getUser(user.id);
        setUserAddons(response.addons);
        setStats({
          ...response.stats,
          thisMonthViews: Math.floor(response.stats.totalViews * 0.3), // Simulação
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate]);

  const handleDeleteAddon = async (addonId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este addon?')) {
      return;
    }

    try {
      await apiService.deleteAddon(addonId);
      setUserAddons(prev => prev.filter(addon => addon.id !== addonId));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalAddons: prev.totalAddons - 1
      }));
    } catch (error) {
      alert('Erro ao excluir addon. Tente novamente.');
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando painel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">Erro ao carregar painel</p>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Meu Painel</h1>
              <p className="text-gray-300">
                Bem-vindo de volta, <span className="text-blue-400">{user.username}</span>!
              </p>
            </div>
            <Link
              to="/upload"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Addon
            </Link>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Package className="w-6 h-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total de Addons</p>
                <p className="text-2xl font-bold text-white">{stats.totalAddons}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Eye className="w-6 h-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total de Views</p>
                <p className="text-2xl font-bold text-white">{formatNumber(stats.totalViews)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Download className="w-6 h-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Downloads</p>
                <p className="text-2xl font-bold text-white">{formatNumber(stats.totalDownloads)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Views Este Mês</p>
                <p className="text-2xl font-bold text-white">{formatNumber(stats.thisMonthViews)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Addons */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Meus Addons</h2>
          </div>

          {userAddons.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Nenhum addon ainda</h3>
              <p className="text-gray-400 mb-6">
                Que tal criar seu primeiro addon e compartilhar com a comunidade?
              </p>
              <Link
                to="/upload"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Criar Primeiro Addon
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {userAddons.map((addon) => (
                <div key={addon.id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-start space-x-4">
                    <img
                      src={addon.images[0]}
                      alt={addon.title}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link
                            to={`/addon/${addon.id}`}
                            className="text-lg font-semibold text-white hover:text-blue-400 transition-colors"
                          >
                            {addon.title}
                          </Link>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                              {CATEGORY_LABELS[addon.category]}
                            </span>
                            <span>v{addon.version}</span>
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(addon.createdAt)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => navigate(`/addon/${addon.id}/edit`)}
                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
                            title="Editar"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddon(addon.id)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 text-sm mt-2 line-clamp-2">
                        {addon.description}
                      </p>
                      
                      <div className="flex items-center space-x-6 mt-3 text-sm text-gray-400">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {formatNumber(addon.views)} views
                        </div>
                        <div className="flex items-center">
                          <Download className="w-4 h-4 mr-1" />
                          {formatNumber(addon.downloads)} downloads
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;