import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, Plus, X, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AddonCategory, CATEGORY_LABELS, DownloadLink } from '../types';
import { apiService } from '../services/api';

const UploadAddon: React.FC = ({ editMode = false }: { editMode?: boolean }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [addonData, setAddonData] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other' as AddonCategory,
    version: '1.0.0',
    images: [''],
    downloadLinks: [{ name: '', url: '' }] as DownloadLink[],
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (editMode && id) {
      // Buscar dados do addon para edição
      // Exemplo: apiService.getAddon(id).then(setAddonData);
    }
  }, [editMode, id]);

  // Use addonData para preencher o formulário se editMode for true
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const handleImageFileChange = async (index: number, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        handleImageChange(index, reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ''],
    }));
  };

  const removeImage = (index: number) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, images: newImages }));
    }
  };

  const handleDownloadLinkChange = (index: number, field: keyof DownloadLink, value: string) => {
    const newLinks = [...formData.downloadLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setFormData(prev => ({ ...prev, downloadLinks: newLinks }));
  };

  const addDownloadLink = () => {
    setFormData(prev => ({
      ...prev,
      downloadLinks: [...prev.downloadLinks, { name: '', url: '' }],
    }));
  };

  const removeDownloadLink = (index: number) => {
    if (formData.downloadLinks.length > 1) {
      const newLinks = formData.downloadLinks.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, downloadLinks: newLinks }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validações
      const validImages = formData.images.filter(img => img.trim() !== '');
      const validDownloadLinks = formData.downloadLinks.filter(link => link.name.trim() !== '' && link.url.trim() !== '');

      if (validImages.length === 0) {
        alert('Adicione pelo menos uma imagem');
        return;
      }

      if (validDownloadLinks.length === 0) {
        alert('Adicione pelo menos um link de download');
        return;
      }

      // Create addon via API
      const addonData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        version: formData.version,
        images: validImages,
        downloadLinks: validDownloadLinks,
      };

      await apiService.createAddon(addonData);
      
      // Redirecionar para o painel
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Erro ao criar addon:', error);
      alert(error instanceof Error ? error.message : 'Erro ao criar addon. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{editMode ? 'Editar Addon' : 'Upload de Addon'}</h1>
            <p className="text-gray-300">{editMode ? 'Edite os detalhes do seu addon' : 'Compartilhe seu addon com a comunidade'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informações Básicas */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Informações Básicas</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                    Título do Addon *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Ex: Modern Weapons Pack"
                    required
                    maxLength={100}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                    Categoria *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key} className="bg-gray-800">
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="version" className="block text-sm font-medium text-gray-300 mb-2">
                    Versão
                  </label>
                  <input
                    type="text"
                    id="version"
                    name="version"
                    value={formData.version}
                    onChange={handleChange}
                    placeholder="Ex: 1.0.0"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    Descrição *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Descreva seu addon, suas funcionalidades e como usar..."
                    required
                    rows={6}
                    maxLength={2000}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-vertical"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {formData.description.length}/2000 caracteres
                  </p>
                </div>
              </div>
            </div>

            {/* Imagens */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Imagens</h2>
                <button
                  type="button"
                  onClick={addImage}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-3">
                    <div className="flex items-center space-x-3 w-full">
                      <ImageIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <input
                        type="url"
                        value={image.startsWith('http') ? image : ''}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        placeholder="https://exemplo.com/imagem.jpg"
                        className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      />
                      <span className="text-gray-400 text-xs">ou</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          const file = e.target.files?.[0] || null;
                          handleImageFileChange(index, file);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      />
                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {/* Preview da imagem */}
                    {image && (
                      <div className="mt-2 md:mt-0">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-24 h-16 object-cover rounded border border-white/20"
                          style={{ background: '#222' }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                * Adicione pelo menos uma imagem. Use URLs de imagens hospedadas online ou envie uma imagem do seu computador.
              </p>
            </div>

            {/* Links de Download */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Links de Download</h2>
                <button
                  type="button"
                  onClick={addDownloadLink}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {formData.downloadLinks.map((link, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                    <div className="flex items-center space-x-2">
                      <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <input
                        type="text"
                        value={link.name}
                        onChange={(e) => handleDownloadLinkChange(index, 'name', e.target.value)}
                        placeholder="Nome (ex: MediaFire)"
                        className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center space-x-2">
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => handleDownloadLinkChange(index, 'url', e.target.value)}
                        placeholder="https://exemplo.com/download"
                        className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      {formData.downloadLinks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDownloadLink(index)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                * Adicione pelo menos um link de download. Use serviços como MediaFire, Google Drive, MEGA, etc.
              </p>
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 text-gray-300 hover:text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? 'Publicando...' : 'Publicar Addon'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadAddon;