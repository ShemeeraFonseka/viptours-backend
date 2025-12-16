import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Vipvippackage from '../vipmodels/VipPackage.js';

const router = express.Router();

// Configure multer for multiple image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/vippackages/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'vippackage-' + uniqueSuffix + path.extname(file.originalname));
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

// GET - Fetch all vippackages
router.get('/', async (req, res) => {
  try {
    const vippackages = await Vipvippackage.find().sort({ displayOrder: 1, createdAt: -1 });
    res.json(vippackages);
  } catch (err) {
    console.error('❌ Error fetching vippackages:', err);
    res.status(500).json({ error: 'Failed to fetch vippackages' });
  }
});

// GET - Fetch only active vippackages (for public display)
router.get('/active', async (req, res) => {
  try {
    const vippackages = await Vipvippackage.find({ isActive: true }).sort({ displayOrder: 1, createdAt: -1 });
    res.json(vippackages);
  } catch (err) {
    console.error('❌ Error fetching active vippackages:', err);
    res.status(500).json({ error: 'Failed to fetch active vippackages' });
  }
});

// GET - Fetch single vippackage by packageId (for detail page)
router.get('/:packageId', async (req, res) => {
  try {
    const vippackage = await Vipvippackage.findOne({ packageId: req.params.packageId, isActive: true });
    
    if (!vippackage) {
      return res.status(404).json({ error: 'vippackage not found' });
    }

    res.json(vippackage);
  } catch (err) {
    console.error('❌ Error fetching vippackage:', err);
    res.status(500).json({ error: 'Failed to fetch vippackage' });
  }
});

// POST - Create new vippackage
router.post('/', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'sectionImages', maxCount: 10 }
]), async (req, res) => {
  const { packageId, title, description, price, detailedTitle, detailedIntro, sections, proTip, isActive, displayOrder } = req.body;

  if (!packageId || !title || !description || !price || !req.files['image']) {
    return res.status(400).json({ error: 'vippackage ID, title, description, and image are required' });
  }

  try {
    // Check if packageId already exists
    const existingvippackage = await Vipvippackage.findOne({ packageId });
    if (existingvippackage) {
      // Delete uploaded files
      if (req.files['image']) fs.unlinkSync(req.files['image'][0].path);
      if (req.files['sectionImages']) {
        req.files['sectionImages'].forEach(file => fs.unlinkSync(file.path));
      }
      return res.status(400).json({ error: 'vippackage ID already exists' });
    }

    // Parse sections
    let parsedSections = [];
    if (sections) {
      parsedSections = typeof sections === 'string' ? JSON.parse(sections) : sections;
      
      // Add section images if uploaded
      if (req.files['sectionImages']) {
        req.files['sectionImages'].forEach((file, index) => {
          if (parsedSections[index]) {
            parsedSections[index].sectionImage = file.path;
          }
        });
      }
    }

    const newvippackage = new Vipvippackage({
      packageId,
      title,
      description,
      price,
      image: req.files['image'][0].path,
      detailedTitle,
      detailedIntro,
      sections: parsedSections,
      proTip,
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: displayOrder || 0
    });

    const savedvippackage = await newvippackage.save();

    res.status(201).json({
      message: '✅ vippackage created successfully',
      vippackage: savedvippackage
    });
  } catch (err) {
    console.error('❌ Error creating vippackage:', err);
    res.status(500).json({ error: 'Failed to create vippackage' });
  }
});

// PUT - Update vippackage
router.put('/:id', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'sectionImages', maxCount: 10 }
]), async (req, res) => {
  const { packageId, title, description, price, detailedTitle, detailedIntro, sections, proTip, isActive, displayOrder } = req.body;

  if (!packageId || !title || !description || !price) {
    return res.status(400).json({ error: 'vippackage ID, title, and description are required' });
  }

  try {
    const existingvippackage = await Vipvippackage.findById(req.params.id);
    if (!existingvippackage) {
      return res.status(404).json({ error: 'vippackage not found' });
    }

    // Check if packageId is being changed and if new one already exists
    if (packageId !== existingvippackage.packageId) {
      const duplicatevippackage = await Vipvippackage.findOne({ packageId });
      if (duplicatevippackage) {
        return res.status(400).json({ error: 'vippackage ID already exists' });
      }
    }

    // Update basic fields
    existingvippackage.packageId = packageId;
    existingvippackage.title = title;
    existingvippackage.description = description;
    existingvippackage.price = price;
    existingvippackage.detailedTitle = detailedTitle || existingvippackage.detailedTitle;
    existingvippackage.detailedIntro = detailedIntro || existingvippackage.detailedIntro;
    existingvippackage.proTip = proTip || existingvippackage.proTip;
    existingvippackage.isActive = isActive !== undefined ? isActive : existingvippackage.isActive;
    existingvippackage.displayOrder = displayOrder !== undefined ? displayOrder : existingvippackage.displayOrder;

    // Update main image if uploaded
    if (req.files && req.files['image']) {
      if (fs.existsSync(existingvippackage.image)) {
        fs.unlinkSync(existingvippackage.image);
      }
      existingvippackage.image = req.files['image'][0].path;
    }

    // Update sections
    if (sections) {
      let parsedSections = typeof sections === 'string' ? JSON.parse(sections) : sections;
      
      // Delete old section images if they exist
      if (existingvippackage.sections) {
        existingvippackage.sections.forEach(section => {
          if (section.sectionImage && fs.existsSync(section.sectionImage)) {
            fs.unlinkSync(section.sectionImage);
          }
        });
      }
      
      // Add new section images if uploaded
      if (req.files && req.files['sectionImages']) {
        req.files['sectionImages'].forEach((file, index) => {
          if (parsedSections[index]) {
            parsedSections[index].sectionImage = file.path;
          }
        });
      }
      
      existingvippackage.sections = parsedSections;
    }

    const updated = await existingvippackage.save();

    res.json({ 
      message: '✅ vippackage updated successfully',
      vippackage: updated
    });
  } catch (err) {
    console.error('❌ Error updating vippackage:', err);
    res.status(500).json({ error: 'Failed to update vippackage' });
  }
});

// DELETE - Delete vippackage
router.delete('/:id', async (req, res) => {
  try {
    const vippackage = await Vipvippackage.findById(req.params.id);
    
    if (!vippackage) {
      return res.status(404).json({ error: 'vippackage not found' });
    }

    // Delete main image
    if (fs.existsSync(vippackage.image)) {
      fs.unlinkSync(vippackage.image);
    }

    // Delete section images
    if (vippackage.sections) {
      vippackage.sections.forEach(section => {
        if (section.sectionImage && fs.existsSync(section.sectionImage)) {
          fs.unlinkSync(section.sectionImage);
        }
      });
    }

    await Vipvippackage.findByIdAndDelete(req.params.id);

    res.json({ message: '✅ vippackage deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting vippackage:', err);
    res.status(500).json({ error: 'Failed to delete vippackage' });
  }
});

// PATCH - Toggle active status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const vippackage = await Vipvippackage.findById(req.params.id);
    
    if (!vippackage) {
      return res.status(404).json({ error: 'vippackage not found' });
    }

    vippackage.isActive = !vippackage.isActive;
    await vippackage.save();

    res.json({ 
      message: `✅ vippackage ${vippackage.isActive ? 'activated' : 'deactivated'} successfully`,
      vippackage
    });
  } catch (err) {
    console.error('❌ Error toggling vippackage status:', err);
    res.status(500).json({ error: 'Failed to toggle vippackage status' });
  }
});

// PATCH - Update display order
router.patch('/:id/order', async (req, res) => {
  const { displayOrder } = req.body;

  if (displayOrder === undefined) {
    return res.status(400).json({ error: 'Display order is required' });
  }

  try {
    const vippackage = await Vipvippackage.findById(req.params.id);
    
    if (!vippackage) {
      return res.status(404).json({ error: 'vippackage not found' });
    }

    vippackage.displayOrder = displayOrder;
    await vippackage.save();

    res.json({ 
      message: '✅ Display order updated successfully',
      vippackage
    });
  } catch (err) {
    console.error('❌ Error updating display order:', err);
    res.status(500).json({ error: 'Failed to update display order' });
  }
});

export default router;