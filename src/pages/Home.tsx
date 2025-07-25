import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Flame, Eye, Download, Calendar, Filter, Grid, List } from 'lucide-react';
import { Addon, AddonCategory, CATEGORY_LABELS } from '../types';
import { apiService } from '../services/api';

const Home: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [addons, setAddons] = useState<Addon[]>([]);
  const [filteredAddons, setFilteredAddons] = useState<Addon[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<AddonCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'downloads'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchAddons = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await apiService.getAddons({
          search: searchQuery || undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          sortBy,
        });
        
        setAddons(response.addons);
        setFilteredAddons(response.addons);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar addons');
        setAddons([]);
        setFilteredAddons([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddons();
  }, [searchQuery, selectedCategory, sortBy]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const featuredAddons = addons.filter(addon => addon.featured);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando addons...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">Erro ao carregar addons</p>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
            Minecraft Bedrock
            <br />
            AddonsHub
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Descubra, baixe e compartilhe os melhores addons para Minecraft Bedrock Edition. 
            Uma comunidade de criadores apaixonados.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Comece a Criar
          </Link>
        </div>
      </section>

      {/* Featured Addons */}
      {featuredAddons.length > 0 && (
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center mb-8">
              <Flame className="w-6 h-6 text-orange-500 mr-2" />
              <h2 className="text-3xl font-bold text-white">Em Destaque</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAddons.slice(0, 3).map((addon) => (
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
                    <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      DESTAQUE
                    </div>
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
                      <span>{formatDate(addon.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 sticky top-24">
                <div className="flex items-center justify-between mb-4 lg:hidden">
                  <h3 className="text-lg font-semibold text-white">Filtros</h3>
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="text-white hover:text-blue-400 transition-colors"
                  >
                    <Filter className="w-5 h-5" />
                  </button>
                </div>
                
                <div className={`space-y-6 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
                  {/* Category Filter */}
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3">Categoria</h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value="all"
                          checked={selectedCategory === 'all'}
                          onChange={(e) => setSelectedCategory(e.target.value as AddonCategory | 'all')}
                          className="w-4 h-4 text-blue-500 bg-transparent border-white/30 focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="ml-2 text-gray-300 text-sm">Todas</span>
                      </label>
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <label key={key} className="flex items-center">
                          <input
                            type="radio"
                            name="category"
                            value={key}
                            checked={selectedCategory === key}
                            onChange={(e) => setSelectedCategory(e.target.value as AddonCategory)}
                            className="w-4 h-4 text-blue-500 bg-transparent border-white/30 focus:ring-blue-500 focus:ring-2"
                          />
                          <span className="ml-2 text-gray-300 text-sm">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sort Filter */}
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3">Ordenar por</h4>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular' | 'downloads')}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="newest">Mais Recentes</option>
                      <option value="popular">Mais Populares</option>
                      <option value="downloads">Mais Baixados</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Addons List */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-bold text-white">
                    {searchQuery ? `Resultados para "${searchQuery}"` : 'Todos os Addons'}
                  </h2>
                  <span className="text-gray-400 text-sm">
                    ({filteredAddons.length} encontrados)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {filteredAddons.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg mb-4">Nenhum addon encontrado</p>
                  <p className="text-gray-500">
                    {searchQuery || selectedCategory !== 'all' 
                      ? 'Tente ajustar os filtros ou fazer uma nova busca'
                      : 'Seja o primeiro a publicar um addon!'
                    }
                  </p>
                </div>
              ) : (
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {filteredAddons.map((addon) => (
                    <Link
                      key={addon.id}
                      to={`/addon/${addon.id}`}
                      className={`group bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 ${
                        viewMode === 'list' ? 'flex' : ''
                      }`}
                    >
                      <div className={`relative overflow-hidden ${
                        viewMode === 'list' ? 'w-48 h-32 flex-shrink-0' : 'h-48'
                      }`}>
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
                      <div className="p-6 flex-1">
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
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(addon.createdAt)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;