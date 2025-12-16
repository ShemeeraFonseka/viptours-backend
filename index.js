import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DB connection
import '../db.js';

// Routes
import packagesRoutes from '../routes/packages.js';
import bookingStepsRoutes from '../routes/bookingSteps.js';
import bookingsRoutes from '../routes/bookings.js';
import servicesRoutes from '../routes/services.js';
import guidesRoutes from '../routes/guides.js';
import aboutRoutes from '../routes/about.js';
import contactInfoRoutes from '../routes/contactInfo.js';
import usersRoutes from '../routes/users.js';
import authRoutes from '../routes/auth.js';
import dashboardRoutes from '../routes/dashboard.js';

import travelaAboutRoutes from '../travelaroutes/travelaAbout.js';
import travelaServiceRoutes from '../travelaroutes/travelaService.js';
import travelaPackageRoutes from '../travelaroutes/travelaPackage.js';
import travelaGuideRoutes from '../travelaroutes/travelaGuide.js';
import travelabookingsRoutes from '../travelaroutes/travelaBooking.js';
import travelausersRoutes from '../travelaroutes/travelaUser.js';
import travelacontactInfoRoutes from '../travelaroutes/travelaContactInfo.js';
import traveladashboardRoutes from '../travelaroutes/travelaDashboard.js';
import travelaauthRoutes from '../travelaroutes/travelaAuth.js';

import vipAboutRoutes from '../viproutes/vipAbout.js';
import vipcontactInfoRoutes from '../viproutes/vipContactInfo.js';
import viphomeRoutes from '../viproutes/vipHome.js';
import vipGalleryRoutes from '../viproutes/vipGallery.js';
import vipTestimonialRoutes from '../viproutes/vipTestimonial.js';
import vipPackageRoutes from '../viproutes/vipPackage.js';
import vipbookingsRoutes from '../viproutes/vipBooking.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads (⚠️ ephemeral on Vercel)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

// Root
app.get('/', (req, res) => {
  res.json({
    message: 'Serverless API is running',
    endpoints: {
      api: '/api/*',
      travelaapi: '/travelaapi/*',
      vipapi: '/vipapi/*'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

export default app;
