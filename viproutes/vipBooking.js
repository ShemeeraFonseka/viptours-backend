import express from 'express';
import Booking from '../vipmodels/VipBooking.js';

const router = express.Router();

// ================== ROUTES ==================

// GET - Fetch all bookings
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        console.error('❌ Error fetching bookings:', err);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// GET - Fetch bookings by status (MOVED BEFORE /:id to avoid conflicts)
router.get('/status/:status', async (req, res) => {
    try {
        const { status } = req.params;
        const validStatuses = ['pending', 'confirmed', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const bookings = await Booking.find({ status }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        console.error('❌ Error fetching bookings by status:', err);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// GET - Fetch single booking by ID
router.get('/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json(booking);
    } catch (err) {
        console.error('❌ Error fetching booking:', err);
        res.status(500).json({ error: 'Failed to fetch booking' });
    }
});

// POST - Create new booking
router.post('/', async (req, res) => {
    try {
        const { name, phone, email, address, checkin, checkout, destination, adults, children, request } = req.body;

        if (!name || !phone || !email || !checkin || !checkout || !destination || !adults) {
            return res.status(400).json({
                error: 'Name, phone, email, checkin, checkout, destination, and adults are required'
            });
        }

        const booking = new Booking({
            name,
            phone,
            email,
            address,
            checkin,
            checkout,
            destination,
            adults,
            children: children || 0,
            request: request || '',
            status: 'pending'
        });

        const savedBooking = await booking.save();
        res.status(201).json({
            message: '✅ Booking created successfully',
            bookingID: savedBooking._id,
            status: savedBooking.status,
            data: savedBooking
        });
    } catch (err) {
        console.error('❌ Error creating booking:', err);
        res.status(500).json({ error: 'Failed to create booking', details: err.message });
    }
});

// PUT - Update booking details
router.put('/:id', async (req, res) => {
    try {
        const { name, phone, email, address, checkin, checkout, destination, adults, children, request, status } = req.body;

        if (!name || !phone || !email || !checkin || !checkout || !destination || !adults) {
            return res.status(400).json({
                error: 'Name, phone, email, checkin, checkout, destination, and adults are required'
            });
        }

        const validStatuses = ['pending', 'confirmed', 'cancelled'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const updated = await Booking.findByIdAndUpdate(
            req.params.id,
            {
                name,
                phone,
                email,
                address,
                checkin,
                checkout,
                destination,
                adults,
                children: children || 0,
                request: request || '',
                ...(status && { status })
            },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.json({ message: '✅ Booking updated successfully', data: updated });
    } catch (err) {
        console.error('❌ Error updating booking:', err);
        res.status(500).json({ error: 'Failed to update booking', details: err.message });
    }
});

// PATCH - Update booking status only
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        const validStatuses = ['pending', 'confirmed', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be: pending, confirmed, or cancelled' });
        }

        const updated = await Booking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.json({
            message: `✅ Booking status updated to ${status} successfully`,
            data: updated
        });
    } catch (err) {
        console.error('❌ Error updating booking status:', err);
        res.status(500).json({ error: 'Failed to update booking status' });
    }
});

// DELETE - Delete booking
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Booking.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.json({ message: '✅ Booking deleted successfully', data: deleted });
    } catch (err) {
        console.error('❌ Error deleting booking:', err);
        res.status(500).json({ error: 'Failed to delete booking' });
    }
});

export default router;