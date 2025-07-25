import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  User, 
  Calendar, 
  Eye, 
  Download, 
  MapPin, 
  Link as LinkIcon,
  Twitter,
  Youtube,
  MessageCircle
} from 'lucide-react';
import { Addon, CATEGORY_LABELS } from '../types';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [userAddons, setUserAddons] = useState<Addon[]>([]);
  const [stats, setStats] = useState({
    totalAddons: 0,
    totalViews: 0,
    totalDownloads: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await apiService.getUser(userId);
        setProfile(response.user);
        setUserAddons(response.addons);
        setStats(response.stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar perfil');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">
            {error || 'Usuário não encontrado'}
          </p>
          <Link
            to="/"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Voltar para home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar do Perfil */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 sticky top-24">
              {/* Avatar e Info Básica */}
              <div className="text-center mb-6">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.username}
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-white/20"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
                <h1 className="text-2xl font-bold text-white mb-2">{profile.username}</h1>
                <div className="flex items-center justify-center text-sm text-gray-400 mb-4">
                  <Calendar className="w-4 h-4 mr-1" />
                  Membro desde {formatDate(profile.createdAt)}
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-white mb-2">Sobre</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {/* Estatísticas */}
              <div className="grid grid-cols-1 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <p className="text-lg font-bold text-white">{stats.totalAddons}</p>
                  <p className="text-xs text-gray-400">Addons Criados</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <p className="text-lg font-bold text-white">{formatNumber(stats.totalViews)}</p>
                  <p className="text-xs text-gray-400">Total de Views</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <p className="text-lg font-bold text-white">{formatNumber(stats.totalDownloads)}</p>
                  <p className="text-xs text-gray-400">Total Downloads</p>
                </div>
              </div>

              {/* Redes Sociais */}
              {profile.socialMedia && Object.keys(profile.socialMedia).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Redes Sociais</h3>
                  <div className="space-y-2">
                    {profile.socialMedia.twitter && (
                      <a
                        href={`https://twitter.com/${profile.socialMedia.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                      >
                        <Twitter className="w-4 h-4" />
                        <span className="text-sm">@{profile.socialMedia.twitter}</span>
                      </a>
                    )}
                    {profile.socialMedia.youtube && (
                      <a
                        href={`https://youtube.com/c/${profile.socialMedia.youtube}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <Youtube className="w-4 h-4" />
                        <span className="text-sm">{profile.socialMedia.youtube}</span>
                      </a>
                    )}
                    {profile.socialMedia.discord && (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">{profile.socialMedia.discord}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Addons de {profile.username}
              </h2>
              <p className="text-gray-400">
                {stats.totalAddons} addon{stats.totalAddons !== 1 ? 's' : ''} encontrado{stats.totalAddons !== 1 ? 's' : ''}
              </p>
            </div>

            {userAddons.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-12 text-center">
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Nenhum addon ainda</h3>
                <p className="text-gray-400">Este usuário ainda não publicou nenhum addon.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userAddons.map((addon) => (
                  <Link
                    key={addon.id}
                    to={`/addon/${addon.id}`}
                    className="group bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={addon.images[0]}
                        alt={addon.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {addon.featured && (
                        <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          DESTAQUE
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
                          {CATEGORY_LABELS[addon.category]}
                        </span>
                        <span className="text-xs text-gray-400">v{addon.version}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                        {addon.title}
                      </h3>
                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                        {addon.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {formatNumber(addon.views)}
                          </div>
                          <div className="flex items-center">
                            <Download className="w-3 h-3 mr-1" />
                            {formatNumber(addon.downloads)}
                          </div>
                        </div>
                        <span>{new Date(addon.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;