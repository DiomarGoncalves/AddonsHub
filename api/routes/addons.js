import express from 'express';
import Joi from 'joi';
import prisma from '../config/database.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Validation schemas
const createAddonSchema = Joi.object({
  title: Joi.string().max(100).required(),
  description: Joi.string().allow(''),
  category: Joi.string().valid(
    'weapons', 'mobs', 'maps', 'textures', 'tools', 
    'blocks', 'items', 'vehicles', 'furniture', 'other'
  ).required(),
  version: Joi.string().default('1.0.0'),
  images: Joi.array().items(
    Joi.string().custom((value, helpers) => {
      // Permite URLs ou base64 data:image
      if (
        value.startsWith('http://') ||
        value.startsWith('https://') ||
        value.startsWith('data:image/')
      ) {
        return value;
      }
      return helpers.error('any.invalid');
    }, 'Image URL or base64')
  ).min(1).required(),
  downloadLinks: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      url: Joi.string().uri().required(),
      platform: Joi.string().optional()
    })
  ).min(1).required()
});

const updateAddonSchema = Joi.object({
  title: Joi.string().max(100),
  description: Joi.string().allow(''),
  category: Joi.string().valid(
    'weapons', 'mobs', 'maps', 'textures', 'tools', 
    'blocks', 'items', 'vehicles', 'furniture', 'other'
  ),
  version: Joi.string(),
  images: Joi.array().items(
    Joi.string().custom((value, helpers) => {
      if (
        value.startsWith('http://') ||
        value.startsWith('https://') ||
        value.startsWith('data:image/')
      ) {
        return value;
      }
      return helpers.error('any.invalid');
    }, 'Image URL or base64')
  ).min(1),
  downloadLinks: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      url: Joi.string().uri().required(),
      platform: Joi.string().optional()
    })
  ).min(1)
});

// Get all addons with filters
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { 
      search, 
      category, 
      sortBy = 'newest', 
      page = 1, 
      limit = 20,
      featured 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where clause
    const where = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    if (featured === 'true') {
      where.featured = true;
    }

    // Build orderBy clause
    let orderBy = {};
    switch (sortBy) {
      case 'popular':
        orderBy = { views: 'desc' };
        break;
      case 'downloads':
        orderBy = { downloads: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [addons, total] = await Promise.all([
      prisma.addon.findMany({
        where,
        orderBy,
        skip,
        take: parseInt(limit),
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true
            }
          }
        }
      }),
      prisma.addon.count({ where })
    ]);

    // Transform data to match frontend format
    const transformedAddons = addons.map(addon => ({
      id: addon.id,
      title: addon.title,
      description: addon.description,
      category: addon.category,
      version: addon.version,
      images: addon.images,
      downloadLinks: addon.downloadLinks,
      views: addon.views,
      downloads: addon.downloads,
      featured: addon.featured,
      createdAt: addon.createdAt.toISOString(),
      updatedAt: addon.updatedAt.toISOString(),
      author: {
        id: addon.user.id,
        username: addon.user.username,
        avatar: addon.user.avatarUrl
      }
    }));

    res.json({
      addons: transformedAddons,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get addon by ID
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const addon = await prisma.addon.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true
          }
        }
      }
    });

    if (!addon) {
      return res.status(404).json({ error: 'Addon not found' });
    }

    // Transform data to match frontend format
    const transformedAddon = {
      id: addon.id,
      title: addon.title,
      description: addon.description,
      category: addon.category,
      version: addon.version,
      images: addon.images,
      downloadLinks: addon.downloadLinks,
      views: addon.views,
      downloads: addon.downloads,
      featured: addon.featured,
      createdAt: addon.createdAt.toISOString(),
      updatedAt: addon.updatedAt.toISOString(),
      author: {
        id: addon.user.id,
        username: addon.user.username,
        avatar: addon.user.avatarUrl
      }
    };

    res.json(transformedAddon);
  } catch (error) {
    next(error);
  }
});

// Create addon
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { error, value } = createAddonSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const addon = await prisma.addon.create({
      data: {
        ...value,
        userId: req.user.id,
        coverImage: value.images[0] // First image as cover
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true
          }
        }
      }
    });

    // Transform data to match frontend format
    const transformedAddon = {
      id: addon.id,
      title: addon.title,
      description: addon.description,
      category: addon.category,
      version: addon.version,
      images: addon.images,
      downloadLinks: addon.downloadLinks,
      views: addon.views,
      downloads: addon.downloads,
      featured: addon.featured,
      createdAt: addon.createdAt.toISOString(),
      updatedAt: addon.updatedAt.toISOString(),
      author: {
        id: addon.user.id,
        username: addon.user.username,
        avatar: addon.user.avatarUrl
      }
    };

    res.status(201).json({
      message: 'Addon created successfully',
      addon: transformedAddon
    });
  } catch (error) {
    next(error);
  }
});

// Update addon
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = updateAddonSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if addon exists and user is the author
    const existingAddon = await prisma.addon.findUnique({
      where: { id }
    });

    if (!existingAddon) {
      return res.status(404).json({ error: 'Addon not found' });
    }

    if (existingAddon.userId !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own addons' });
    }

    const updateData = { ...value };
    if (value.images) {
      updateData.coverImage = value.images[0];
    }

    const addon = await prisma.addon.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true
          }
        }
      }
    });

    // Transform data to match frontend format
    const transformedAddon = {
      id: addon.id,
      title: addon.title,
      description: addon.description,
      category: addon.category,
      version: addon.version,
      images: addon.images,
      downloadLinks: addon.downloadLinks,
      views: addon.views,
      downloads: addon.downloads,
      featured: addon.featured,
      createdAt: addon.createdAt.toISOString(),
      updatedAt: addon.updatedAt.toISOString(),
      author: {
        id: addon.user.id,
        username: addon.user.username,
        avatar: addon.user.avatarUrl
      }
    };

    res.json({
      message: 'Addon updated successfully',
      addon: transformedAddon
    });
  } catch (error) {
    next(error);
  }
});

// Delete addon
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if addon exists and user is the author
    const existingAddon = await prisma.addon.findUnique({
      where: { id }
    });

    if (!existingAddon) {
      return res.status(404).json({ error: 'Addon not found' });
    }

    if (existingAddon.userId !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own addons' });
    }

    await prisma.addon.delete({
      where: { id }
    });

    res.json({ message: 'Addon deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Increment views
router.patch('/:id/views', async (req, res, next) => {
  try {
    const { id } = req.params;

    const addon = await prisma.addon.update({
      where: { id },
      data: {
        views: {
          increment: 1
        }
      }
    });

    res.json({ views: addon.views });
  } catch (error) {
    next(error);
  }
});

// Increment downloads
router.patch('/:id/downloads', async (req, res, next) => {
  try {
    const { id } = req.params;

    const addon = await prisma.addon.update({
      where: { id },
      data: {
        downloads: {
          increment: 1
        }
      }
    });

    res.json({ downloads: addon.downloads });
  } catch (error) {
    next(error);
  }
});

export default router;