import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Eye, 
  Download, 
  Calendar, 
  User, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight,
  Share2,
  Heart,
  Flag
} from 'lucide-react';
import { Addon, CATEGORY_LABELS } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

const AddonDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [addon, setAddon] = useState<Addon | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAddon = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await apiService.getAddon(id);
        setAddon(response);
        
        // Increment views
        await apiService.incrementViews(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar addon');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddon();
  }, [id]);

  const handleDownload = async (link: { name: string; url: string }) => {
    if (addon && id) {
      try {
        await apiService.incrementDownloads(id);
        // Update local state
        setAddon(prev => prev ? { ...prev, downloads: prev.downloads + 1 } : null);
      } catch (error) {
        console.error('Error incrementing downloads:', error);
      }
    }
    window.open(link.url, '_blank');
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: addon?.title,
          text: addon?.description,
          url: url,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback para copiar para clipboard
      navigator.clipboard.writeText(url);
      alert('Link copiado para a área de transferência!');
    }
  };

  const nextImage = () => {
    if (addon && addon.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % addon.images.length);
    }
  };

  const prevImage = () => {
    if (addon && addon.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + addon.images.length) % addon.images.length);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando addon...</p>
        </div>
      </div>
    );
  }

  if (error || !addon) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">
            {error || 'Addon não encontrado'}
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
        {/* Header com navegação */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar para home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Galeria de Imagens */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
              <div className="relative">
                <img
                  src={addon.images[currentImageIndex]}
                  alt={`${addon.title} - Imagem ${currentImageIndex + 1}`}
                  className="w-full h-80 md:h-96 object-cover"
                />
                
                {addon.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {addon.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              {addon.images.length > 1 && (
                <div className="p-4 border-t border-white/10">
                  <div className="flex space-x-2 overflow-x-auto">
                    {addon.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                          index === currentImageIndex
                            ? 'border-blue-500'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Miniatura ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Descrição */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Sobre este addon</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {addon.description}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informações do Addon */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">{addon.title}</h1>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                  <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full font-semibold">
                    {CATEGORY_LABELS[addon.category]}
                  </span>
                  <span>v{addon.version}</span>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Eye className="w-4 h-4 text-gray-400 mr-1" />
                  </div>
                  <p className="text-lg font-semibold text-white">{formatNumber(addon.views)}</p>
                  <p className="text-xs text-gray-400">Visualizações</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Download className="w-4 h-4 text-gray-400 mr-1" />
                  </div>
                  <p className="text-lg font-semibold text-white">{formatNumber(addon.downloads)}</p>
                  <p className="text-xs text-gray-400">Downloads</p>
                </div>
              </div>

              {/* Links de Download */}
              <div className="space-y-3 mb-6">
                <h3 className="text-sm font-semibold text-white">Downloads Disponíveis</h3>
                {addon.downloadLinks.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => handleDownload(link)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105"
                  >
                    <span className="font-semibold">{link.name}</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                ))}
              </div>

              {/* Ações */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`flex items-center justify-center px-4 py-2 rounded-lg transition-all ${
                    isLiked
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm">Curtir</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center px-4 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 hover:text-white transition-all"
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  <span className="text-sm">Compartilhar</span>
                </button>
              </div>
            </div>

            {/* Informações do Autor */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Sobre o criador</h3>
              <div className="flex items-center space-x-3 mb-4">
                {addon.author.avatar ? (
                  <img
                    src={addon.author.avatar}
                    alt={addon.author.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <Link
                    to={`/profile/${addon.author.id}`}
                    className="font-semibold text-white hover:text-blue-400 transition-colors"
                  >
                    {addon.author.username}
                  </Link>
                  <div className="flex items-center text-xs text-gray-400">
                    <Calendar className="w-3 h-3 mr-1" />
                    Publicado em {formatDate(addon.createdAt)}
                  </div>
                </div>
              </div>
              <Link
                to={`/profile/${addon.author.id}`}
                className="w-full block text-center px-4 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 hover:text-white transition-all"
              >
                Ver perfil
              </Link>
            </div>

            {/* Reportar */}
            {user && user.id !== addon.author.id && (
              <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
                <button className="flex items-center justify-center w-full px-4 py-2 text-gray-400 hover:text-red-400 transition-colors text-sm">
                  <Flag className="w-4 h-4 mr-1" />
                  Reportar conteúdo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddonDetails;