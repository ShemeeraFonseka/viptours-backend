// routes/about.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import About from '../vipmodels/VipAbout.js';

const router = express.Router();

// ================== MULTER CONFIGURATION ==================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/about';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'about-' + uniqueSuffix + path.extname(file.originalname));
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
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// ================== ROUTES ==================

// GET - Fetch about content (should only be one document)
router.get('/', async (req, res) => {
  try {
    const aboutData = await About.findOne().sort({ createdAt: -1 });
    if (!aboutData) {
      return res.status(404).json({ error: 'No content found' });
    }
    res.json(aboutData);
  } catch (err) {
    console.error('❌ Error fetching content:', err);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// POST - Create initial about content
router.post('/', upload.fields([
  { name: 'section1Image', maxCount: 1 },
  { name: 'section2Image', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      section1Heading,
      section1Para1,
      section1Para2,
      section2Para1,
      section2Para2,
      section2Para3
    } = req.body;

    // Validate required fields
    if (!section1Para1 || !section1Para2 || !section2Para1 || !section2Para2 || !section2Para3) {
      return res.status(400).json({ error: 'All paragraph fields are required' });
    }

    // Check if content already exists
    const existingContent = await About.findOne();
    if (existingContent) {
      return res.status(400).json({ 
        error: 'About content already exists. Use PUT to update.' 
      });
    }

    const section1Image = req.files?.section1Image?.[0]?.path || '/images/about.jpg';
    const section2Image = req.files?.section2Image?.[0]?.path || '/images/ab2.jpg';

    const newAbout = new About({
      section1: {
        heading: section1Heading || 'About VIP Tours',
        paragraph1: section1Para1,
        paragraph2: section1Para2,
        image: section1Image
      },
      section2: {
        paragraph1: section2Para1,
        paragraph2: section2Para2,
        paragraph3: section2Para3,
        image: section2Image
      }
    });

    const savedAbout = await newAbout.save();
    res.status(201).json({ 
      message: '✅ Content created successfully', 
      data: savedAbout 
    });
  } catch (err) {
    console.error('❌ Error creating content:', err);
    res.status(500).json({ error: 'Failed to create content', details: err.message });
  }
});

// PUT - Update about content
router.put('/:id', upload.fields([
  { name: 'section1Image', maxCount: 1 },
  { name: 'section2Image', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      section1Heading,
      section1Para1,
      section1Para2,
      section2Para1,
      section2Para2,
      section2Para3
    } = req.body;

    // Find existing document
    const existingAbout = await About.findById(req.params.id);
    if (!existingAbout) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Prepare update object
    const updateData = {
      section1: {
        heading: section1Heading || existingAbout.section1.heading,
        paragraph1: section1Para1 || existingAbout.section1.paragraph1,
        paragraph2: section1Para2 || existingAbout.section1.paragraph2,
        image: existingAbout.section1.image
      },
      section2: {
        paragraph1: section2Para1 || existingAbout.section2.paragraph1,
        paragraph2: section2Para2 || existingAbout.section2.paragraph2,
        paragraph3: section2Para3 || existingAbout.section2.paragraph3,
        image: existingAbout.section2.image
      }
    };

    // Handle new images
    if (req.files?.section1Image) {
      // Delete old image if it's not a default one
      if (existingAbout.section1.image && 
          existingAbout.section1.image.startsWith('uploads/')) {
        try {
          fs.unlinkSync(existingAbout.section1.image);
        } catch (err) {
          console.log('Could not delete old image:', err);
        }
      }
      updateData.section1.image = req.files.section1Image[0].path;
    }

    if (req.files?.section2Image) {
      if (existingAbout.section2.image && 
          existingAbout.section2.image.startsWith('uploads/')) {
        try {
          fs.unlinkSync(existingAbout.section2.image);
        } catch (err) {
          console.log('Could not delete old image:', err);
        }
      }
      updateData.section2.image = req.files.section2Image[0].path;
    }

    const updated = await About.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({ 
      message: '✅ Content updated successfully', 
      data: updated 
    });
  } catch (err) {
    console.error('❌ Error updating content:', err);
    res.status(500).json({ error: 'Failed to update content', details: err.message });
  }
});

// DELETE - Delete about content (optional)
router.delete('/:id', async (req, res) => {
  try {
    const aboutData = await About.findById(req.params.id);
    if (!aboutData) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Delete associated images
    [aboutData.section1.image, aboutData.section2.image].forEach(imagePath => {
      if (imagePath && imagePath.startsWith('uploads/')) {
        try {
          fs.unlinkSync(imagePath);
        } catch (err) {
          console.log('Could not delete image:', err);
        }
      }
    });

    await About.findByIdAndDelete(req.params.id);
    res.json({ message: '✅ Content deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting content:', err);
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

export default router;