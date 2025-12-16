import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import VipGallery from '../vipmodels/VipGallery.js';

const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/gallery/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'gallery-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// GET - Fetch all gallery items
router.get('/', async (req, res) => {
  try {
    const items = await VipGallery.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error('❌ Error fetching gallery items:', err);
    res.status(500).json({ error: 'Failed to fetch gallery items' });
  }
});

// POST - Create new gallery item
router.post('/', upload.single('image'), async (req, res) => {
  const { name } = req.body;

  if (!name || !req.file) {
    return res.status(400).json({ error: 'Name and image are required' });
  }

  try {
    const newItem = new VipGallery({
      name,
      image: req.file.path
    });

    const savedItem = await newItem.save();

    res.status(201).json({
      message: '✅ Gallery item created successfully',
      item: savedItem
    });
  } catch (err) {
    console.error('❌ Error creating gallery item:', err);
    res.status(500).json({ error: 'Failed to create gallery item' });
  }
});

// PUT - Update gallery item
router.put('/:id', upload.single('image'), async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const existingItem = await VipGallery.findById(req.params.id);
    if (!existingItem) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    // Update fields
    existingItem.name = name;

    // If new image is uploaded, delete old one and update
    if (req.file) {
      if (fs.existsSync(existingItem.image)) {
        fs.unlinkSync(existingItem.image);
      }
      existingItem.image = req.file.path;
    }

    const updated = await existingItem.save();

    res.json({ 
      message: '✅ Gallery item updated successfully',
      item: updated
    });
  } catch (err) {
    console.error('❌ Error updating gallery item:', err);
    res.status(500).json({ error: 'Failed to update gallery item' });
  }
});

// DELETE - Delete gallery item
router.delete('/:id', async (req, res) => {
  try {
    const item = await VipGallery.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    // Delete image file
    if (fs.existsSync(item.image)) {
      fs.unlinkSync(item.image);
    }

    await VipGallery.findByIdAndDelete(req.params.id);

    res.json({ message: '✅ Gallery item deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting gallery item:', err);
    res.status(500).json({ error: 'Failed to delete gallery item' });
  }
});

export default router;