import express from 'express';
import ContactInfo from '../vipmodels/VipHome.js';

const router = express.Router();

// ================== ROUTES ==================

// GET - Fetch latest home content
router.get('/', async (req, res) => {
  try {
    const info = await ContactInfo.findOne().sort({ createdAt: -1 });

    if (info) {
      res.json(info);
    } else {
      res.json({});
    }
  } catch (err) {
    console.error('❌ Error fetching home content:', err);
    res.status(500).json({ error: 'Failed to fetch home content' });
  }
});

// POST - Create new home content
router.post('/', async (req, res) => {
  const { topic, line,welcometopic,welcomepara1,welcomepara2 ,servicetopic1,servicepara1,servicetopic2,servicepara2,servicetopic3,servicepara3,servicetopic4,servicepara4} = req.body;

  if (!topic || !line|| !welcometopic|| !welcomepara1|| !welcomepara2|| ! servicetopic1|| !servicepara1|| !servicetopic2|| !servicepara2|| !servicetopic3|| !servicepara3|| !servicetopic4|| !servicepara4) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newInfo = new ContactInfo({topic, line,welcometopic,welcomepara1,welcomepara2,servicetopic1,servicepara1,servicetopic2,servicepara2,servicetopic3,servicepara3,servicetopic4,servicepara4 });
    const savedInfo = await newInfo.save();

    res.status(201).json({
      message: '✅ Home Content created successfully',
      infoId: savedInfo._id
    });
  } catch (err) {
    console.error('❌ Error creating home content:', err);
    res.status(500).json({ error: 'Failed to create home content' });
  }
});

// PUT - Update existing home content
router.put('/:id', async (req, res) => {
  const { topic, line,welcometopic,welcomepara1,welcomepara2 ,servicetopic1,servicepara1,servicetopic2,servicepara2,servicetopic3,servicepara3,servicetopic4,servicepara4} = req.body;

  if (!topic || !line|| !welcometopic|| !welcomepara1|| !welcomepara2 || ! servicetopic1|| !servicepara1|| !servicetopic2|| !servicepara2|| !servicetopic3|| !servicepara3|| !servicetopic4|| !servicepara4) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const updated = await ContactInfo.findByIdAndUpdate(
      req.params.id,
      { topic, line,welcometopic,welcomepara1,welcomepara2 ,servicetopic1,servicepara1,servicetopic2,servicepara2,servicetopic3,servicepara3,servicetopic4,servicepara4},
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Home Content not found' });
    }

    res.json({ message: '✅ Home Content updated successfully' });
  } catch (err) {
    console.error('❌ Error updating Home Content:', err);
    res.status(500).json({ error: 'Failed to update Home Content' });
  }
});

export default router;