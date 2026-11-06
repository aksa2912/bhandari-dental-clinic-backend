const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
require('./config/db'); // Initialize database connection

const express = require("express");
const cors = require('cors'); // Import cors
const cookieParser = require('cookie-parser'); // <-- ADDED
const treatmentRoutes = require("./routes/treatmentRoutes");
const appointmentRoutes = require('./routes/appointmentRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const authRoutes = require('./routes/authRoutes'); // <-- ADDED
const { requireAdmin } = require('./middleware/authMiddleware'); // <-- ADDED
const app = express(); /*creates the Express application. Every route and middleware attaches to this object.*/
const blockRoutes = require('./routes/blockRoutes');

// CORS must be registered before your routes so it runs first
app.use(cors({
  origin: 'http://localhost:3000', // Explicitly allow the Next.js frontend
  credentials: true // Allow cookies to be sent and received
}));
app.use(cookieParser()); // <-- ADDED
app.use(
  express.json(),
); /*registers a middleware for every request. use = registration, not invocation. 
Express calls express.json()'s returned function per-request.
 If this distinction is fuzzy, re-read it — you'll be registering many middlewares over the next week*/

app.get("/health", (req, res) => {
  /*registers a handler for GET requests at /health only.
     Any other method (POST /health, etc.) will 404 unless we explicitly add it. 
     This is worth knowing — /health is intentionally GET-only.*/
  res.status(200).json({
    status: "ok",
    time: new Date().toISOString(),
  });
});
app.use('/api/auth', authRoutes); // <-- ADDED
app.use("/api/treatments", treatmentRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/blocked-dates', blockRoutes);

module.exports = app; /*exports the app for server.js to require.*/