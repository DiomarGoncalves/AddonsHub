import express from 'express';
import Joi from 'joi';
import prisma from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation schema
const updateProfileSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(20),
  avatarUrl: Joi.string().uri().allow(''),
  bio: Joi.string().max(500).allow('')
});

// Get user profile
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            addons: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's addons
    const addons = await prisma.addon.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
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

    // Calculate stats
    const totalViews = addons.reduce((sum, addon) => sum + addon.views, 0);
    const totalDownloads = addons.reduce((sum, addon) => sum + addon.downloads, 0);

    // Transform addons data
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
      user: {
        id: user.id,
        username: user.username,
        avatar: user.avatarUrl,
        bio: user.bio,
        createdAt: user.createdAt.toISOString()
      },
      addons: transformedAddons,
      stats: {
        totalAddons: user._count.addons,
        totalViews,
        totalDownloads
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get user's addons
router.get('/:id/addons', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [addons, total] = await Promise.all([
      prisma.addon.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
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
      prisma.addon.count({ where: { userId: id } })
    ]);

    // Transform data
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

// Update user profile
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user is updating their own profile
    if (id !== req.user.id) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if username is already taken (if being updated)
    if (value.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: value.username,
          NOT: { id }
        }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: value,
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        bio: true,
        createdAt: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
});

export default router;