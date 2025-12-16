import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();  
import path from "path";
import { fileURLToPath } from 'url';

// Use a try-catch to handle both ESM and CommonJS environments
let __dirname;
try {
  const __filename = fileURLToPath(import.meta.url);
  __dirname = path.dirname(__filename);
} catch {
  __dirname = process.cwd();
}

// Import MongoDB connection function
import connectDB from './db.js';

// Import routes
import packagesRoutes from './routes/packages.js';
import bookingStepsRoutes from './routes/bookingSteps.js';
import bookingsRoutes from './routes/bookings.js';
import servicesRoutes from './routes/services.js';
import guidesRoutes from './routes/guides.js';
import aboutRoutes from './routes/about.js';
import contactInfoRoutes from './routes/contactInfo.js';
import usersRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';

import travelaAboutRoutes from './travelaroutes/travelaAbout.js';
import travelaServiceRoutes from './travelaroutes/travelaService.js';
import travelaPackageRoutes from './travelaroutes/travelaPackage.js';
import travelaGuideRoutes from './travelaroutes/travelaGuide.js';
import travelabookingsRoutes from './travelaroutes/travelaBooking.js';
import travelausersRoutes from './travelaroutes/travelaUser.js';
import travelacontactInfoRoutes from './travelaroutes/travelaContactInfo.js';
import traveladashboardRoutes from './travelaroutes/travelaDashboard.js';
import travelaauthRoutes from './travelaroutes/travelaAuth.js';

import vipAboutRoutes from './viproutes/vipAbout.js';
import vipcontactInfoRoutes from './viproutes/vipContactInfo.js';
import viphomeRoutes from './viproutes/vipHome.js';
import vipGalleryRoutes from './viproutes/vipGallery.js';
import vipTestimonialRoutes from './viproutes/vipTestimonial.js';
import vipPackageRoutes from './viproutes/vipPackage.js';
import vipbookingsRoutes from './viproutes/vipBooking.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database connection middleware - connect before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Routes
app.use('/api/packages', packagesRoutes);
app.use('/api/bookingSteps', bookingStepsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/guides', guidesRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/contact-info', contactInfoRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use('/travelaapi/about', travelaAboutRoutes);
app.use('/travelaapi/services', travelaServiceRoutes);
app.use('/travelaapi/packages', travelaPackageRoutes);
app.use('/travelaapi/guides', travelaGuideRoutes);
app.use('/travelaapi/bookings', travelabookingsRoutes);
app.use('/travelaapi/users', travelausersRoutes);
app.use('/travelaapi/contact-info', travelacontactInfoRoutes);
app.use('/travelaapi/dashboard', traveladashboardRoutes);
app.use('/travelaapi/auth', travelaauthRoutes);

app.use('/vipapi/about', vipAboutRoutes);
app.use('/vipapi/contact-info', vipcontactInfoRoutes);
app.use('/vipapi/home', viphomeRoutes);
app.use('/vipapi/gallery', vipGalleryRoutes);
app.use('/vipapi/testimonials', vipTestimonialRoutes);
app.use('/vipapi/packages', vipPackageRoutes);
app.use('/vipapi/bookings', vipbookingsRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Start server (only in development)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, async () => {
    await connectDB();
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// Export for Vercel
export default app;