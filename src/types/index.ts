export interface Addon {
  id: string;
  title: string;
  description: string;
  category: AddonCategory;
  images: string[];
  downloadLinks: DownloadLink[];
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  version?: string;
  views: number;
  downloads: number;
  featured?: boolean;
}

export interface DownloadLink {
  name: string;
  url: string;
  platform?: string;
}

export type AddonCategory = 
  | 'weapons'
  | 'mobs'
  | 'maps'
  | 'textures'
  | 'tools'
  | 'blocks'
  | 'items'
  | 'vehicles'
  | 'furniture'
  | 'other';

export const CATEGORY_LABELS: Record<AddonCategory, string> = {
  weapons: 'Armas',
  mobs: 'Mobs',
  maps: 'Mapas',
  textures: 'Texturas',
  tools: 'Ferramentas',
  blocks: 'Blocos',
  items: 'Itens',
  vehicles: 'Veículos',
  furniture: 'Móveis',
  other: 'Outros',
};

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  socialMedia?: {
    twitter?: string;
    youtube?: string;
    discord?: string;
  };
  createdAt: string;
}