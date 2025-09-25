const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const { storage } = require('../cloudinaryConfig');
const upload = multer({ storage });
const fetch = require('node-fetch');
const cloudinary = require('cloudinary').v2;
const stripe = require('stripe')('sk_test_51Rj1dnBOoulucdCvbGDz4brJYHztkuL80jGSKcnQNT46g9P58pbxY36Lg3yWyMDb6Gwgv5Rr3NDfjvB2HyaDlJP7006wnXEtp1');
const nodemailer = require('nodemailer');

// Load environment variables
require('dotenv').config();

// Server configuration
const PORT = process.env.PORT || 5001;

// DNS Configuration - Only set if needed for troubleshooting
// const dns = require('dns');
// try {
//   dns.setDefaultResultOrder('ipv4first');
//   console.log('✅ DNS configured to prioritize IPv4 connections');
// } catch (error) {
//   console.log('⚠️ DNS configuration failed (Node.js version compatibility):', error.message);
// }



// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'aryanarshad5413@gmail.com',
    pass: 'gvyqmapsqsrrtwjm',
  },
});

// Function to send booking confirmation email
const sendBookingConfirmationEmail = async (userEmail, userName, carDetails, serviceDetails, bookingDate, bookingTime, totalAmount) => {
  try {
    const mailOptions = {
      from: 'aryanarshad5413@gmail.com',
      to: userEmail,
      subject: 'Booking Confirmation - Reliable Mechanics',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmation - Reliable Mechanics</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; 
              padding: 0; 
              background-color: #111111; 
              color: #ffffff; 
              line-height: 1.6; 
            }
            .container { 
              max-width: 650px; 
              margin: 0 auto; 
              background-color: #181818; 
              border-radius: 20px; 
              overflow: hidden; 
              box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6); 
            }
            .header { 
              background: linear-gradient(135deg, #ffd700, #ffed4e); 
              padding: 50px 40px; 
              text-align: center; 
              position: relative; 
            }
            .logo-container {
              margin-bottom: 30px;
            }
            .logo { 
              width: 120px; 
              height: 120px; 
              background: linear-gradient(135deg, #ffd700, #ffed4e); 
              border-radius: 50%; 
              display: inline-block; 
              position: relative; 
              border: 4px solid #000000;
              box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
              text-align: center;
              line-height: 120px;
              font-size: 48px;
              font-weight: 900;
              color: #000000;
              font-family: 'Arial Black', sans-serif;
            }
            .header h1 { 
              color: #000000; 
              margin: 0; 
              font-size: 36px; 
              font-weight: 900; 
              text-transform: uppercase; 
              letter-spacing: 3px; 
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 
            }
            .header p { 
              color: #000000; 
              margin: 20px 0 0 0; 
              font-size: 20px; 
              font-weight: 700; 
              opacity: 0.9; 
              letter-spacing: 1px;
            }
            .content { 
              padding: 50px 40px; 
              background-color: #181818; 
            }
            .confirmation-title { 
              text-align: center; 
              margin-bottom: 50px; 
              position: relative; 
            }
            .confirmation-title h2 { 
              color: #ffd700; 
              font-size: 32px; 
              font-weight: 800; 
              margin: 0; 
              text-transform: uppercase; 
              letter-spacing: 2px; 
            }
            .confirmation-title p {
              color: #cccccc;
              font-size: 18px;
              margin: 15px 0 0 0;
              font-weight: 500;
            }
            .confirmation-title::after { 
              content: ""; 
              position: absolute; 
              bottom: -20px; 
              left: 50%; 
              transform: translateX(-50%); 
              width: 100px; 
              height: 5px; 
              background: linear-gradient(135deg, #ffd700, #ffed4e); 
              border-radius: 3px; 
            }
            .section { 
              background-color: #232323; 
              border-radius: 16px; 
              padding: 30px; 
              margin-bottom: 30px; 
              border: 2px solid #333333; 
              box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4); 
              transition: all 0.3s ease;
            }
            .section:hover {
              border-color: #ffd700;
              transform: translateY(-2px);
              box-shadow: 0 8px 30px rgba(255, 215, 0, 0.2);
            }
            .section h3 { 
              color: #ffd700; 
              margin: 0 0 25px 0; 
              font-size: 24px; 
              font-weight: 800; 
              text-transform: uppercase; 
              letter-spacing: 1.5px; 
            }
            .section-icon { 
              display: none; 
            }
            .detail-row { 
              display: flex; 
              margin-bottom: 18px; 
              align-items: center; 
              padding: 15px 0; 
              border-bottom: 1px solid #333333; 
            }
            .detail-row:last-child { 
              border-bottom: none; 
              margin-bottom: 0; 
            }
            .detail-label { 
              font-weight: 800; 
              color: #ffd700; 
              min-width: 160px; 
              font-size: 16px; 
              text-transform: uppercase; 
              letter-spacing: 1px; 
            }
            .detail-value { 
              color: #ffffff; 
              font-size: 16px; 
              font-weight: 600; 
            }
            .total-amount { 
              background: linear-gradient(135deg, #ffd700, #ffed4e); 
              color: #000000; 
              padding: 20px 30px; 
              border-radius: 16px; 
              font-weight: 900; 
              font-size: 24px; 
              text-align: center; 
              margin-top: 25px; 
              box-shadow: 0 6px 25px rgba(255, 215, 0, 0.4); 
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .footer { 
              background-color: #000000; 
              color: #ffffff; 
              text-align: center; 
              padding: 40px; 
              border-top: 4px solid #ffd700; 
            }
            .footer p { 
              margin: 0 0 15px 0; 
              font-size: 18px; 
              font-weight: 600; 
            }
            .footer .highlight { 
              color: #ffd700; 
              font-weight: 800; 
            }
            .contact-info {
              background-color: #232323;
              border-radius: 12px;
              padding: 20px;
              margin-top: 20px;
              border: 1px solid #333333;
            }
            .contact-info p {
              margin: 8px 0;
              color: #cccccc;
              font-size: 16px;
            }
            .contact-info .email {
              color: #ffd700;
              font-weight: 700;
              text-decoration: none;
            }
            @media (max-width: 700px) { 
              .container { margin: 15px; border-radius: 16px; }
              .content { padding: 40px 25px; }
              .header { padding: 40px 25px; }
              .detail-row { flex-direction: column; align-items: flex-start; gap: 10px; }
              .detail-label { min-width: auto; margin-bottom: 8px; }
              .logo { width: 100px; height: 100px; }
              .logo::before { font-size: 40px; }
              .header h1 { font-size: 28px; }
              .confirmation-title h2 { font-size: 26px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo-container">
                <div class="logo">J²</div>
              </div>
              <h1>RELIABLE MECHANICS</h1>
              <p>HONEST & RELIABLE</p>
              <p>DRIVEN BY INTEGRITY, POWERED BY COMPASSION</p>
            </div>
            <div class="content">
              <div class="confirmation-title">
                <h2>Booking Confirmation</h2>
                <p>This is the confirmation of your booking</p>
              </div>
              
              <div class="section">
                <h3>Customer Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">${userEmail}</span>
                </div>
              </div>
              
              <div class="section">
                <h3>Vehicle Information</h3>
                <div class="detail-row">
                  <span class="detail-label">Make:</span>
                  <span class="detail-value">${carDetails.make || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Model:</span>
                  <span class="detail-value">${carDetails.model || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Year:</span>
                  <span class="detail-value">${carDetails.year || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Registration:</span>
                  <span class="detail-value">${carDetails.registration || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Color:</span>
                  <span class="detail-value">${carDetails.color || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Mileage:</span>
                  <span class="detail-value">${carDetails.mileage || 'N/A'} miles</span>
                </div>
              </div>
              
              <div class="section">
                <h3>Service Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Service:</span>
                  <span class="detail-value">${serviceDetails.label || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Description:</span>
                  <span class="detail-value">${serviceDetails.description || 'N/A'}</span>
                </div>
              </div>
              
              <div class="section">
                <h3>Booking Information</h3>
                <div class="detail-row">
                  <span class="detail-label">Date:</span>
                  <span class="detail-value">${bookingDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Time:</span>
                  <span class="detail-value">${bookingTime}</span>
                </div>
                <div class="total-amount">
                  Total Amount: £${totalAmount}
                </div>
              </div>
            </div>
            <div class="footer">
              <p>Thank you for choosing <span class="highlight">Reliable Mechanics</span></p>
              <p>For any questions or changes to your booking, please contact us</p>
              <div class="contact-info">
                <p><strong>Email:</strong> <a href="mailto:aryanarshad5413@gmail.com" class="email">aryanarshad5413@gmail.com</a></p>
                <p><strong>Service:</strong> Professional automotive care you can trust</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Booking confirmation email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending booking confirmation email:', error);
    return false;
  }
};

const app = express();

// CORS configuration for production deployment
app.use(cors({
  origin: [
    'https://workshopfrontend-one.vercel.app',
    'http://localhost:3000' // Keep localhost for development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ]
}));

// CORS will handle preflight requests automatically

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Workshop Backend is running!',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Health check passed',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// MongoDB Connection String
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://ali:ali@cluster0.xkuanbt.mongodb.net/?retryWrites=true&w=majority"

console.log('🔌 Attempting to connect to MongoDB...');
console.log('🔌 Connection string:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials in logs

// Orphaned code removed

// Simple MongoDB connection function
async function connectToMongoDB() {
  try {
    console.log('🔌 Attempting to connect to MongoDB...');
    console.log('🔌 Connection string:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials in logs
    
    // Simple connection options
    const options = {
      serverSelectionTimeoutMS: 15000,  // 15 seconds
      socketTimeoutMS: 45000,
      maxPoolSize: 5,
      retryWrites: true,
      w: 'majority'
    };
    
    console.log('🔌 Connection options:', options);
    
    await mongoose.connect(MONGODB_URI, options);
    
    console.log('✅ Connected to MongoDB successfully!');
    console.log('✅ Connection state:', mongoose.connection.readyState);
    console.log('✅ Database name:', mongoose.connection.name);
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('✅ Available collections:', collections.map(c => c.name));
    
    // Now that MongoDB is connected, create indexes and seed data
    try {
      console.log('🔧 Setting up database indexes and seeding data...');
      
      // Create custom indexes for duplicate prevention
      await createIndexes();
      console.log('✅ Custom indexes created');
      
      // Create Carbooking indexes
      await Carbooking.createIndexes();
      console.log('✅ Carbooking indexes created');
      
      // Create basic indexes
      try {
        await Carbooking.collection.createIndex({ 'customer.email': 1 });
        console.log('✅ Customer email index created');
      } catch (indexError) {
        console.log('ℹ️ Customer email index already exists');
      }
      
      // Create UserService indexes
      await UserService.createIndexes();
      console.log('✅ UserService indexes created');
      
      // Create basic indexes
      try {
        await UserService.collection.createIndex({ userEmail: 1 });
        console.log('✅ UserService email index created');
      } catch (indexError) {
        console.log('ℹ️ UserService email index already exists');
      }
      
      // Seed services and parts
      await seedServices();
      await seedParts();
      
      console.log('✅ Database setup completed successfully!');
      
      // Clean up any existing duplicate images
      await cleanupDuplicateImages();
      
    } catch (setupError) {
      console.error('❌ Database setup failed:', setupError.message);
    }
    
    // Start server after successful connection and setup
    if (process.env.NODE_ENV !== 'production') {
      // Only start listening in development (not on Vercel)
      app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log(`🌐 Server URL: http://localhost:${PORT}`);
      });
    } else {
      console.log(`🚀 Server is ready for Vercel deployment`);
    }
    
    return true;
    
  } catch (err) {
    console.error('❌ MongoDB connection failed!');
    console.error('❌ Error type:', err.name);
    console.error('❌ Error message:', err.message);
    console.error('❌ Error code:', err.code);
    
    // Provide specific troubleshooting advice
    if (err.name === 'MongoServerSelectionError') {
      console.log('\n🔒 SERVER SELECTION ERROR - Possible causes:');
      console.log('1. Network connectivity issues');
      console.log('2. MongoDB Atlas is down');
      console.log('3. IP whitelist restrictions');
      console.log('4. Invalid connection string');
    } else if (err.name === 'MongoParseError') {
      console.log('\n🔒 PARSE ERROR - Possible causes:');
      console.log('1. Invalid connection string format');
      console.log('2. Special characters in password');
      console.log('3. Missing required parameters');
    } else if (err.name === 'MongoNetworkError') {
      console.log('\n🔒 NETWORK ERROR - Possible causes:');
      console.log('1. Firewall blocking connection');
      console.log('2. DNS resolution issues');
      console.log('3. Network timeout');
    }
    
    console.log('\n💡 Troubleshooting steps:');
    console.log('1. Check your internet connection');
    console.log('2. Verify MongoDB Atlas is accessible');
    console.log('3. Check if your IP is whitelisted in MongoDB Atlas');
    console.log('4. Try using a different DNS server (Google DNS: 8.8.8.8)');
    console.log('5. Check if your firewall is blocking the connection');
    console.log('6. Try connecting from a different network');
    
    // Start server anyway for development (without database)
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT} (NO DATABASE)`);
      console.log(`⚠️  Note: Database features will not work!`);
    });
    
    return false;
  }
}

// Test connection function removed - not needed

// Connect to MongoDB
connectToMongoDB();

// User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' }
});
const User = mongoose.model('User', userSchema);

// Password Reset Token schema
const passwordResetTokenSchema = new mongoose.Schema({
  email: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, default: Date.now, expires: 3600 } // Expires in 1 hour
});
const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);

// Simplified ServiceImage schema - direct association with services
const serviceImageSchema = new mongoose.Schema({
  serviceId: { type: String, required: true }, // Direct service ID
  userId: { type: String, required: true }, // Customer email for proper association
  imageUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: String, default: 'admin' }
});

// Simple index to prevent duplicate images for the same service
serviceImageSchema.index({ serviceId: 1, imageUrl: 1 }, { unique: true });
// Index for efficient user-based queries
serviceImageSchema.index({ userId: 1, serviceId: 1 });

const ServiceImage = mongoose.model('ServiceImage', serviceImageSchema);

// Function to clean up duplicate images
async function cleanupDuplicateImages() {
  try {
    console.log("🧹 Starting duplicate image cleanup...");
    
    // Find all images
    const allImages = await ServiceImage.find({});
    console.log(`📸 Total images in database: ${allImages.length}`);
    
    // Group images by URL to find duplicates
    const imageUrlGroups = {};
    allImages.forEach(img => {
      if (!imageUrlGroups[img.imageUrl]) {
        imageUrlGroups[img.imageUrl] = [];
      }
      imageUrlGroups[img.imageUrl].push(img);
    });
    
    // Find URLs that appear in multiple services
    const duplicates = Object.entries(imageUrlGroups).filter(([url, images]) => images.length > 1);
    
    if (duplicates.length === 0) {
      console.log("✅ No duplicate images found across services");
      return;
    }
    
    console.log(`⚠️ Found ${duplicates.length} duplicate image URLs across services`);
    
    // For each duplicate, keep only the first occurrence and remove others
    let removedCount = 0;
    for (const [url, images] of duplicates) {
      console.log(`🔍 Processing duplicate URL: ${url}`);
      console.log(`   Found in ${images.length} services:`, images.map(img => img.serviceId));
      
      // Keep the first image, remove the rest
      const imagesToRemove = images.slice(1);
      for (const imgToRemove of imagesToRemove) {
        await ServiceImage.findByIdAndDelete(imgToRemove._id);
        removedCount++;
        console.log(`   ❌ Removed duplicate from service: ${imgToRemove.serviceId}`);
      }
    }
    
    console.log(`✅ Cleanup completed. Removed ${removedCount} duplicate images`);
    
  } catch (error) {
    console.error("❌ Error during duplicate cleanup:", error);
  }
}

// Function to clean up incorrectly associated images
async function cleanupIncorrectlyAssociatedImages() {
  try {
    console.log("🧹 Starting cleanup of incorrectly associated images...");
    
    // Find all images
    const allImages = await ServiceImage.find({});
    console.log(`📸 Total images in database: ${allImages.length}`);
    
    let cleanedCount = 0;
    
    for (const img of allImages) {
      // Check if the serviceId exists in Carbooking
      const carbooking = await Carbooking.findById(img.serviceId);
      
      if (!carbooking) {
        console.log(`❌ Image ${img._id} has invalid serviceId: ${img.serviceId}`);
        // Remove images with invalid serviceId
        await ServiceImage.findByIdAndDelete(img._id);
        cleanedCount++;
        continue;
      }
      
      // Check if the userId matches the customer email in the booking
      if (img.userId && carbooking.customer?.email && img.userId !== carbooking.customer.email) {
        console.log(`❌ Image ${img._id} has mismatched userId: ${img.userId} vs ${carbooking.customer.email}`);
        // Update the userId to match the customer email
        await ServiceImage.findByIdAndUpdate(img._id, { userId: carbooking.customer.email });
        cleanedCount++;
        console.log(`✅ Fixed userId for image ${img._id}`);
      }
    }
    
    console.log(`✅ Cleanup completed. Fixed ${cleanedCount} incorrectly associated images`);
    
  } catch (error) {
    console.error("❌ Error during association cleanup:", error);
  }
}

// Service schema
const serviceSchema = new mongoose.Schema({
  label: { type: String, required: true },
  sub: { type: String, required: true }, // e.g., "2h - services"
  price: { type: Number, default: 0 },
  category: { type: String }, // e.g., 'Maintenance', 'Repairs', 'Diagnostics', 'Inspection'
  description: { type: String }, // optional long description for home page
  labourHours: { type: Number, default: 0 }, // labour hours for the service
  labourCost: { type: Number, default: 0 }, // labour cost per hour
  standardDiscount: { type: Number, default: 0 },
  premiumDiscount: { type: Number, default: 0 }
});
const Service = mongoose.model('Service', serviceSchema);

// --- PARTS SCHEMA ---
const partSchema = new mongoose.Schema({
  partNumber: String,
  name: String,
  supplier: String,
  cost: Number,
  profit: Number,
  price: Number,
  qty: Number,
  booked: String, // or Date if you want
});
const Part = mongoose.model('Part', partSchema);

// Booking schema
const bookingSchema = new mongoose.Schema({
  car: {
    make: String,
    model: String,
    year: String,
    registration: String,
    color: String,
    mileage: Number,
  },
  customer: {
    name: String,
    email: String,
    phone: String,
    postcode: String,
    address: String,
  },
  service: {
    label: String,
    sub: String,
    description: String,
    price: Number,
  },
  services: [
    {
      label: String,
      sub: String,
      description: String,
      price: Number,
      labourHours: Number,
      labourCost: Number,
    }
  ],
  parts: [
    {
      partNumber: String,
      name: String,
      supplier: String,
      cost: String,
      profit: String,
      price: String,
      qty: Number,
    }
  ],
  labourHours: Number,
  labourCost: Number,
  partsCost: Number,
  subtotal: Number,
  vat: Number,
  total: Number,
  date: { type: Date, default: Date.now },
  time: String, // Ensure time is included
  category: String, // <-- Added category field
  status: { type: String, default: 'pending' }, // pending, confirmed, in-progress, completed, cancelled
  paymentStatus: { type: String, default: 'pending' }, // pending, paid, failed, refunded
  stripeSessionId: String, // Store Stripe session ID
  totalAmount: Number, // Total amount for the booking
  createdAt: { type: Date, default: Date.now }, // Ensure createdAt is always set
});
const Carbooking = mongoose.model('Carbooking', bookingSchema);

// Index creation will be handled after MongoDB connection is established
// Add unique index on stripeSessionId to prevent duplicates
async function createIndexes() {
  try {
    // DROP THE PROBLEMATIC unique_user_datetime INDEX
    try {
      await Carbooking.collection.dropIndex('unique_user_datetime');
      console.log('✅ Dropped problematic unique_user_datetime index');
    } catch (dropError) {
      console.log('ℹ️ unique_user_datetime index not found or already dropped');
    }
    
    // Create unique index on stripeSessionId for Carbooking
    await Carbooking.collection.createIndex({ stripeSessionId: 1 }, { unique: true, sparse: true });
    console.log('✅ Created unique index on stripeSessionId for Carbooking');
    
    // Create unique index on stripeSessionId for UserService
    await UserService.collection.createIndex({ stripeSessionId: 1 }, { unique: true, sparse: true });
    console.log('✅ Created unique index on stripeSessionId for UserService');
    
    // DROP THE PROBLEMATIC unique_user_datetime_userservice INDEX
    try {
      await UserService.collection.dropIndex('unique_user_datetime_userservice');
      console.log('✅ Dropped problematic unique_user_datetime_userservice index');
    } catch (dropError) {
      console.log('ℹ️ unique_user_datetime_userservice index not found or already dropped');
    }
    
    // Create compound index for recent duplicate prevention
    await Carbooking.collection.createIndex({ 
      'customer.email': 1, 
      'car.registration': 1, 
      createdAt: 1 
    });
    console.log('✅ Created compound index for duplicate prevention');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  }
}

async function seedServices() {
  const count = await Service.countDocuments();
  if (count === 0) {
    await Service.insertMany([
      // Default dashboard items
      { label: 'Full Service', sub: '2h - services', price: 0, category: 'Maintenance' },
      { label: 'Interim Service', sub: '1.5h - services', price: 0, category: 'Maintenance' },
      { label: 'Four Tyres', sub: '1h - tyres', price: 0, category: 'Maintenance' },
      { label: 'Two Tyres', sub: '0.5h - tyres', price: 0, category: 'Maintenance' },
      { label: 'Brake Replacement', sub: '2h - mechanical', price: 0, category: 'Repairs' },
      { label: 'Spark Plugs', sub: '1h - mechanical', price: 0, category: 'Repairs' },
      { label: 'Diagnostics', sub: '1h - services', price: 0, category: 'Diagnostics' },
      { label: 'Oil Change', sub: '1h - services', price: 0, category: 'Maintenance' },
      // Home page items (with durations approximated for dashboard consistency)
      { label: 'Full Service', sub: '3.5h - services', price: 199, category: 'Maintenance', description: 'Comprehensive service including oil change, all fluid checks and top-ups, brake inspection, air filter replacement, and full vehicle health check with diagnostic scan.' },
      { label: 'Interim Service', sub: '1.5h - services', price: 99, category: 'Maintenance', description: 'Basic service including oil and filter change, fluid top-ups, and essential safety checks.' },
      { label: 'Diagnostics', sub: '1h - services', price: 60, category: 'Diagnostics', description: 'Full vehicle diagnostics scan to identify issues and error codes.' },
      { label: 'Brake Replacement', sub: '2.5h - mechanical', price: 150, category: 'Repairs', description: 'Replacement of brake pads and discs, including safety checks.' },
      { label: 'Tyre Replacement', sub: '1h - tyres', price: 45, category: 'Maintenance', description: 'Tyre removal and fitting, balancing, and safety inspection.' },
      { label: 'MOT Preparation', sub: '2h - services', price: 120, category: 'Inspection', description: 'Pre-MOT inspection and preparation to help your vehicle pass the MOT test.' },
      // Additional services to fill all categories
      { label: 'Engine Tune-up', sub: '2h - mechanical', price: 180, category: 'Maintenance', description: 'Complete engine tune-up including spark plugs, air filter, fuel filter, and ignition system check.' },
      { label: 'Clutch Replacement', sub: '4h - mechanical', price: 350, category: 'Repairs', description: 'Complete clutch replacement including clutch plate, pressure plate, and release bearing.' },
      { label: 'Suspension Repair', sub: '3h - mechanical', price: 280, category: 'Repairs', description: 'Suspension system repair including shock absorbers, springs, and bushings replacement.' },
      { label: 'Electrical Diagnostics', sub: '1.5h - services', price: 80, category: 'Diagnostics', description: 'Advanced electrical system diagnostics and fault finding.' },
      { label: 'Emission Testing', sub: '1h - services', price: 45, category: 'Diagnostics', description: 'Vehicle emission testing and compliance verification.' },
      { label: 'Pre-Purchase Inspection', sub: '2.5h - services', price: 150, category: 'Inspection', description: 'Comprehensive vehicle inspection before purchase, including mechanical and safety assessment.' },
      { label: 'Annual Safety Check', sub: '1.5h - services', price: 75, category: 'Inspection', description: 'Annual vehicle safety inspection and maintenance check.' }
    ]);
    console.log('Seeded default services');
  }
}

async function seedParts() {
  const count = await Part.countDocuments();
  if (count === 0) {
    await Part.insertMany([
      { partNumber: 'BRK001', name: 'Brake Pads Front', supplier: 'AutoParts Ltd', cost: 25.50, profit: 30, price: 33.15, qty: 10, booked: '10/08/2025' },
      { partNumber: 'BRK002', name: 'Brake Discs Front', supplier: 'AutoParts Ltd', cost: 45.00, profit: 25, price: 56.25, qty: 8, booked: '10/08/2025' },
      { partNumber: 'OIL001', name: 'Engine Oil 5W-30', supplier: 'OilCo', cost: 12.00, profit: 40, price: 16.80, qty: 20, booked: '10/08/2025' },
      { partNumber: 'FIL001', name: 'Oil Filter', supplier: 'FilterPro', cost: 8.50, profit: 35, price: 11.48, qty: 15, booked: '10/08/2025' },
      { partNumber: 'SPK001', name: 'Spark Plugs Set', supplier: 'IgnitionCo', cost: 18.00, profit: 45, price: 26.10, qty: 12, booked: '10/08/2025' },
      { partNumber: 'BAT001', name: 'Car Battery', supplier: 'PowerBatt', cost: 65.00, profit: 20, price: 78.00, qty: 5, booked: '10/2025' },
      { partNumber: 'TYR001', name: 'Tyre 205/55R16', supplier: 'TyreWorld', cost: 35.00, profit: 50, price: 52.50, qty: 25, booked: '10/08/2025' },
      { partNumber: 'SUS001', name: 'Shock Absorber', supplier: 'SuspensionPro', cost: 85.00, profit: 30, price: 110.50, qty: 6, booked: '10/08/2025' }
    ]);
    console.log('Seeded default parts');
  }
}

// Seeding will be handled after MongoDB connection is established

// --- PARTS API ENDPOINTS ---

// Add a new part
app.post('/api/parts', async (req, res) => {
  try {
    const part = new Part(req.body);
    await part.save();
    res.status(201).json(part);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all parts
app.get('/api/parts', async (req, res) => {
  const parts = await Part.find();
  res.json(parts);
});

// Delete a part
app.delete('/api/parts/:id', async (req, res) => {
  await Part.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Update a part
app.put('/api/parts/:id', async (req, res) => {
  try {
    const { partNumber, name, supplier, cost, profit, price, qty, booked } = req.body;
    const updated = await Part.findByIdAndUpdate(
      req.params.id,
      { partNumber, name, supplier, cost, profit, price, qty, booked },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Deduct parts quantity when used in bookings
app.post('/api/parts/deduct', async (req, res) => {
  try {
    const { parts } = req.body;
    const updates = [];
    
    for (const part of parts) {
      if (part.partNumber && part.qty) {
        const existingPart = await Part.findOne({ partNumber: part.partNumber });
        if (existingPart) {
          const newQty = Math.max(0, existingPart.qty - part.qty);
          await Part.findByIdAndUpdate(existingPart._id, { qty: newQty });
          updates.push({ partNumber: part.partNumber, oldQty: existingPart.qty, newQty });
        }
      }
    }
    
    res.json({ success: true, updates });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Deduct single part by part number
app.post('/api/parts/:partNumber/deduct', async (req, res) => {
  try {
    const { partNumber } = req.params;
    const { quantity = 1 } = req.body;
    
    const existingPart = await Part.findOne({ partNumber: partNumber });
    if (!existingPart) {
      return res.status(404).json({ error: 'Part not found' });
    }
    
    if (existingPart.qty < quantity) {
      return res.status(400).json({ 
        error: 'Insufficient stock', 
        available: existingPart.qty, 
        requested: quantity 
      });
    }
    
    const newQty = existingPart.qty - quantity;
    await Part.findByIdAndUpdate(existingPart._id, { qty: newQty });
    
    res.json({ 
      success: true, 
      partNumber,
      oldQty: existingPart.qty, 
      newQty,
      deducted: quantity
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get parts with low quantity warning (less than 5)
app.get('/api/parts/low-stock', async (req, res) => {
  try {
    const lowStockParts = await Part.find({ qty: { $lt: 5 } });
    res.json(lowStockParts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User Service Tracking API endpoints
app.post('/api/user-services', async (req, res) => {
  try {
    const userService = new UserService(req.body);
    await userService.save();
    res.status(201).json(userService);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/user-services', async (req, res) => {
  try {
    const { email, registration } = req.query;
    let query = {};
    
    if (email) {
      query.userEmail = { $regex: new RegExp(email, 'i') };
    }
    if (registration) {
      query['car.registration'] = { $regex: new RegExp(registration, 'i') };
    }
    
    const userServices = await UserService.find(query).sort({ createdAt: -1 });
    res.json(userServices);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user services', details: err.message });
  }
});

app.get('/api/user-services/:userEmail', async (req, res) => {
  try {
    const userEmail = req.params.userEmail;
    const userServices = await UserService.find({ 
      userEmail: { $regex: new RegExp(userEmail, 'i') } 
    }).sort({ createdAt: -1 });
    res.json(userServices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user services by user ID (for logged-in users)
app.get('/api/user-services/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // First, get the user by ID to get their email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('Looking for services for user:', user.email);
    
    // Get user services using the user's email as userId
    const userServices = await UserService.find({ userId: user.email }).sort({ createdAt: -1 });
    
    console.log('Found user services:', userServices.length);
    
    // Get service images for each service
    const servicesWithImages = await Promise.all(
      userServices.map(async (service) => {
        const serviceImages = await ServiceImage.find({ 
          userId: service.userId, 
          serviceId: service._id.toString() 
        });
        
        return {
          ...service.toObject(),
          images: serviceImages
        };
      })
    );
    
    res.json(servicesWithImages);
  } catch (err) {
    console.error('Error in /api/user-services/:userId:', err);
    res.status(500).json({ error: err.message });
  }
});

// Services CRUD
app.get('/api/services', async (req, res) => {
  try {
    const { email, registration } = req.query;

    // If filtering params are provided, return car bookings instead of services
    if ((email && String(email).trim() !== '') || (registration && String(registration).trim() !== '')) {
      const bookingQuery = {};
      if (email && String(email).trim() !== '') {
        bookingQuery['customer.email'] = { $regex: new RegExp(String(email), 'i') };
      }
      if (registration && String(registration).trim() !== '') {
        bookingQuery['car.registration'] = { $regex: new RegExp(String(registration), 'i') };
      }

      const bookings = await Carbooking.find(bookingQuery).sort({ createdAt: -1 });
      return res.json(bookings);
    }

    const services = await Service.find().sort({ label: 1 });
    console.log('🔧 Fetched services:', services.length, 'services found');
    console.log('🔧 Sample service data:', services.slice(0, 2).map(s => ({ 
      label: s.label, 
      labourHours: s.labourHours, 
      labourCost: s.labourCost 
    })));
    res.json(services);
  } catch (err) {
    console.error('❌ Error fetching services or bookings:', err);
    res.status(500).json({ error: 'Failed to fetch services/bookings', details: err.message });
  }
});

app.post('/api/services', async (req, res) => {
  try {
    console.log('🔧 Creating new service with data:', req.body);
    const { label, sub, price, category, description, labourHours, labourCost } = req.body;
    console.log('🔧 Extracted fields:', { label, sub, price, category, description, labourHours, labourCost });
    const service = new Service({ label, sub, price, category, description, labourHours, labourCost });
    console.log('🔧 Service object created:', service);
    await service.save();
    console.log('🔧 Service saved successfully with ID:', service._id);
    res.status(201).json(service);
  } catch (err) {
    console.error('❌ Error creating service:', err);
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/services/:id', async (req, res) => {
  try {
    console.log('🔧 Updating service with ID:', req.params.id, 'Data:', req.body);
    const { label, sub, price, category, description, labourHours, labourCost } = req.body;
    console.log('🔧 Extracted fields for update:', { label, sub, price, category, description, labourHours, labourCost });
    const updated = await Service.findByIdAndUpdate(
      req.params.id,
      { label, sub, price, category, description, labourHours, labourCost },
      { new: true }
    );
    console.log('🔧 Service updated successfully:', updated);
    res.json(updated);
  } catch (err) {
    console.error('❌ Error updating service:', err);
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Finance API endpoints
app.get('/api/finance/chart', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const data = [];
    const now = new Date();
    let startDate, endDate, groupFormat;

    // Calculate date range and grouping based on period
    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
        endDate = now;
        groupFormat = '%Y-%m-%d';
        break;
      case 'week':
        startDate = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000); // Last 12 weeks
        endDate = now;
        groupFormat = '%Y-W%U';
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 5, 0, 1); // Last 5 years
        endDate = now;
        groupFormat = '%Y';
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1); // Last 12 months
        endDate = now;
        groupFormat = '%Y-%m';
    }

    // Aggregate bookings data for revenue
    const revenueData = await Carbooking.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$date' } },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate booking expenses (parts + labour)
    const bookingExpenseData = await Carbooking.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$date' } },
          totalLabourCost: { $sum: '$labourCost' },
          totalPartsCost: { $sum: '$partsCost' },
          bookingExpenses: { $sum: { $add: ['$labourCost', '$partsCost'] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate business expenses (equipment, fuel, etc.)
    const businessExpenseData = await BusinessExpense.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$date' } },
          businessExpenses: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Combine revenue and expense data
    const chartData = revenueData.map(revItem => {
      const bookingExpItem = bookingExpenseData.find(exp => exp._id === revItem._id);
      const businessExpItem = businessExpenseData.find(exp => exp._id === revItem._id);
      
      const revenue = revItem.revenue || 0;
      const bookingExpenses = bookingExpItem ? bookingExpItem.bookingExpenses || 0 : 0;
      const businessExpenses = businessExpItem ? businessExpItem.businessExpenses || 0 : 0;
      const totalExpenses = bookingExpenses + businessExpenses;
      
      return {
        date: revItem._id,
        revenue,
        expenses: totalExpenses,
        profit: revenue - totalExpenses
      };
    });
    

    res.json({ success: true, data: chartData });
  } catch (error) {
    console.error('Finance chart API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/finance/summary', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const now = new Date();
    let startDate;

    // Calculate date range based on period
    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last day
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last week
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1); // This year
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1); // This month
    }

    // Calculate total revenue
    const revenueResult = await Carbooking.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: now },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' }
        }
      }
    ]);

    // Calculate booking expenses (parts + labour)
    const bookingExpenseResult = await Carbooking.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: now },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalLabourCost: { $sum: '$labourCost' },
          totalPartsCost: { $sum: '$partsCost' },
          bookingExpenses: { $sum: { $add: ['$labourCost', '$partsCost'] } }
        }
      }
    ]);

    // Calculate business expenses
    const businessExpenseResult = await BusinessExpense.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: null,
          businessExpenses: { $sum: '$amount' }
        }
      }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    const bookingExpenses = bookingExpenseResult.length > 0 ? bookingExpenseResult[0].bookingExpenses : 0;
    const businessExpenses = businessExpenseResult.length > 0 ? businessExpenseResult[0].businessExpenses : 0;
    const totalExpenses = bookingExpenses + businessExpenses;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin
      }
    });
  } catch (error) {
    console.error('Finance summary API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/finance/breakdown', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const now = new Date();
    let startDate;

    // Calculate date range based on period
    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get revenue breakdown by category
    const revenueBreakdown = await Carbooking.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: now },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: '$category',
          amount: { $sum: '$total' }
        }
      }
    ]);

    const totalRevenue = revenueBreakdown.reduce((sum, item) => sum + item.amount, 0);

    // Format revenue categories
    const revenueCategories = revenueBreakdown.map(item => ({
      name: item._id === 'tyres' ? 'Tyre Services' :
            item._id === 'mechanical' ? 'Mechanical Services' :
            item._id === 'service' ? 'General Services' :
            item._id || 'Other Services',
      amount: item.amount,
      percentage: totalRevenue > 0 ? (item.amount / totalRevenue) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);

    // Calculate real expense breakdown from bookings
    const expenseBreakdown = await Carbooking.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: now },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalLabourCost: { $sum: '$labourCost' },
          totalPartsCost: { $sum: '$partsCost' },
          totalExpenses: { $sum: { $add: ['$labourCost', '$partsCost'] } }
        }
      }
    ]);

    const expenseData = expenseBreakdown.length > 0 ? expenseBreakdown[0] : { totalLabourCost: 0, totalPartsCost: 0, totalExpenses: 0 };
    const totalExpenses = expenseData.totalExpenses || 0;

    // Get business expenses for the period
    const businessExpenses = await BusinessExpense.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: '$category',
          amount: { $sum: '$amount' }
        }
      }
    ]);

    // Combine booking expenses with business expenses
    let expenseCategories = [
      { 
        name: 'Parts & Components', 
        amount: expenseData.totalPartsCost || 0, 
        percentage: 0
      },
      { 
        name: 'Labour Costs', 
        amount: expenseData.totalLabourCost || 0, 
        percentage: 0
      }
    ];

    // Add business expense categories
    const businessExpenseMap = {
      'equipment': 'Equipment & Tools',
      'tools': 'Equipment & Tools',
      'fuel': 'Fuel & Transport',
      'transport': 'Fuel & Transport',
      'marketing': 'Marketing',
      'insurance': 'Insurance',
      'utilities': 'Utilities',
      'rent': 'Rent & Facilities',
      'maintenance': 'Equipment Maintenance',
      'supplies': 'Office & Supplies',
      'other': 'Other Expenses'
    };

    businessExpenses.forEach(expense => {
      const categoryName = businessExpenseMap[expense._id] || 'Other Expenses';
      const existingCategory = expenseCategories.find(cat => cat.name === categoryName);
      
      if (existingCategory) {
        existingCategory.amount += expense.amount;
      } else {
        expenseCategories.push({
          name: categoryName,
          amount: expense.amount,
          percentage: 0
        });
      }
    });

    // Calculate total and percentages
    const totalExpensesWithBusiness = expenseCategories.reduce((sum, cat) => sum + cat.amount, 0);
    expenseCategories = expenseCategories
      .map(cat => ({
        ...cat,
        percentage: totalExpensesWithBusiness > 0 ? (cat.amount / totalExpensesWithBusiness) * 100 : 0
      }))
      .filter(cat => cat.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    res.json({
      success: true,
      data: {
        revenue: revenueCategories,
        expenses: expenseCategories
      }
    });
  } catch (error) {
    console.error('Finance breakdown API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Business Expense Management API endpoints

// GET /api/business-expenses - Get all business expenses
app.get('/api/business-expenses', async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    let query = {};
    
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    const expenses = await BusinessExpense.find(query).sort({ date: -1, createdAt: -1 });
    res.json({ success: true, data: expenses });
  } catch (error) {
    console.error('Error fetching business expenses:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/business-expenses - Create new business expense
app.post('/api/business-expenses', async (req, res) => {
  try {
    const expense = new BusinessExpense(req.body);
    await expense.save();
    res.json({ success: true, data: expense });
  } catch (error) {
    console.error('Error creating business expense:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/business-expenses/:id - Update business expense
app.put('/api/business-expenses/:id', async (req, res) => {
  try {
    const expense = await BusinessExpense.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }
    res.json({ success: true, data: expense });
  } catch (error) {
    console.error('Error updating business expense:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/business-expenses/:id - Delete business expense
app.delete('/api/business-expenses/:id', async (req, res) => {
  try {
    const expense = await BusinessExpense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting business expense:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/business-expenses/categories - Get expense categories for dropdown
app.get('/api/business-expenses/categories', (req, res) => {
  const categories = [
    { value: 'equipment', label: 'Equipment & Tools' },
    { value: 'fuel', label: 'Fuel & Transport' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'rent', label: 'Rent & Facilities' },
    { value: 'maintenance', label: 'Equipment Maintenance' },
    { value: 'supplies', label: 'Office & Supplies' },
    { value: 'other', label: 'Other Expenses' }
  ];
  res.json({ success: true, data: categories });
});

// POST /api/bookings - Save a new booking
app.post('/api/bookings', async (req, res) => {
  try {
    console.log('📅 Creating booking with date:', req.body.date, 'type:', typeof req.body.date);
    console.log('🔧 Services data received:', {
      singleService: req.body.service,
      multipleServices: req.body.services,
      servicesCount: req.body.services ? req.body.services.length : 0
    });
    
    const booking = new Carbooking(req.body);
    await booking.save();
    console.log('📅 Booking saved with ID:', booking._id, 'stored date:', booking.date, 'type:', typeof booking.date);
    console.log('✅ Services saved:', {
      single: booking.service?.label,
      multiple: booking.services?.map(s => s.label) || []
    });
    
    // Also save to user services tracking if customer email exists
    if (req.body.customer && req.body.customer.email) {
      console.log('👤 Creating UserService for customer:', req.body.customer.email);
      console.log('⏰ Time field received:', req.body.time);
      console.log('📅 Date field received:', req.body.date);
      
      // Look up the service to get labour information if not provided
      let labourHours = req.body.labourHours;
      let labourCost = req.body.labourCost;
      
      if (!labourHours || !labourCost) {
        try {
          const serviceLabel = req.body.service?.label;
          if (serviceLabel) {
            const serviceDefinition = await Service.findOne({ label: serviceLabel });
            if (serviceDefinition) {
              console.log('🔧 Found service definition:', { 
                label: serviceDefinition.label, 
                labourHours: serviceDefinition.labourHours, 
                labourCost: serviceDefinition.labourCost 
              });
              labourHours = labourHours || serviceDefinition.labourHours || 0;
              labourCost = labourCost || serviceDefinition.labourCost || 0;
            }
          }
        } catch (serviceLookupError) {
          console.log('⚠️ Could not look up service definition:', serviceLookupError.message);
        }
      }
      
      const userServiceData = {
        userId: req.body.customer.email, // Using email as userId for simplicity
        userEmail: req.body.customer.email,
        userName: req.body.customer.name || 'Unknown',
        car: req.body.car,
        service: req.body.service,
        services: req.body.services, // Add multiple services support
        parts: req.body.parts,
        labourHours: labourHours,
        labourCost: labourCost,
        partsCost: req.body.partsCost,
        subtotal: req.body.subtotal,
        vat: req.body.vat,
        total: req.body.total,
        date: req.body.date,
        time: req.body.time,
        category: req.body.category,
      };
      
      console.log('📝 UserService data:', userServiceData);
      
      try {
        const userService = new UserService(userServiceData);
        await userService.save();
        console.log('✅ UserService created successfully with ID:', userService._id);
        
        // Send confirmation email to user if this is a user booking
        try {
          const formattedDate = req.body.date ? (typeof req.body.date === 'string' ? req.body.date.split('T')[0] : req.body.date.toISOString().split('T')[0]) : new Date().toISOString().split('T')[0];
          const emailSent = await sendBookingConfirmationEmail(
            req.body.customer.email,
            req.body.customer.name || 'Customer',
            req.body.car || {},
            req.body.service || { label: 'Service', description: 'Service booking' },
            formattedDate,
            req.body.time || '09:00',
            req.body.total || 0
          );
          
          if (emailSent) {
            console.log('📧 Confirmation email sent successfully to:', req.body.customer.email);
          } else {
            console.log('⚠️ Failed to send confirmation email to:', req.body.customer.email);
          }
        } catch (emailError) {
          console.error('❌ Error sending confirmation email:', emailError);
          // Don't fail the booking if email fails
        }
      } catch (userServiceError) {
        console.error('❌ Failed to create UserService:', userServiceError);
        // Don't fail the whole request if UserService creation fails
      }
    } else {
      console.log('⚠️ No customer email found, skipping UserService creation');
    }
    
    // Parts deduction is handled by the frontend after successful booking creation
    // No automatic deduction needed here
    
    res.status(201).json({ message: 'Booking saved!', _id: booking._id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save booking', details: err });
  }
});

// POST /api/create-payment-intent - Create Stripe payment intent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency, bookingId, customerEmail, serviceName } = req.body;
    
    if (!amount || !currency) {
      return res.status(400).json({ error: 'Amount and currency are required' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      metadata: {
        bookingId: bookingId,
        customerEmail: customerEmail,
        serviceName: serviceName
      },
      description: `Payment for ${serviceName} - ${customerEmail}`,
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Payment intent creation error:', err);
    res.status(500).json({ error: 'Failed to create payment intent', details: err.message });
  }
});

// GET /api/bookings - Get all bookings or filter by registration (case-insensitive)
app.get('/api/bookings', async (req, res) => {
  try {
    const { registration } = req.query;
    let query = {};
    if (registration) {
      query['car.registration'] = { $regex: new RegExp(`^${registration}$`, 'i') };
    }
    const bookings = await Carbooking.find(query).sort({ date: -1 });
    console.log('📅 GET /api/bookings - Found', bookings.length, 'bookings');
    bookings.forEach((b, i) => {
      console.log(`📅 Booking ${i}:`, {
        id: b._id,
        date: b.date,
        dateType: typeof b.date,
        time: b.time,
        category: b.category
      });
    });
    
    // Return in the expected format for AdminMessages component
    res.json({
      success: true,
      bookings: bookings
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings', details: err });
  }
});

// SIMPLIFIED: Get all services for a car number (admin search)
app.get('/api/bookings/:registration', async (req, res) => {
  try {
    const registration = req.params.registration;
    console.log('🔍 SIMPLIFIED: Getting services for car:', registration);
    
    const bookings = await Carbooking.find({
      'car.registration': { $regex: new RegExp(registration, 'i') }
    }).sort({ date: -1 });
    
    console.log('📋 Found services:', bookings.length);
    
    // Return simplified service data
    const services = bookings.map(booking => ({
      _id: booking._id,
      car: booking.car,
      customer: booking.customer,
      service: booking.service,
      date: booking.date,
      status: booking.status
    }));
    
    res.json(services);
    
  } catch (err) {
    console.error('❌ Error getting services:', err);
    res.status(500).json({ error: 'Failed to get services', details: err.message });
  }
});

// Signup route
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Prevent admin registration via signup
    if (email === 'j2mechanicslondon@gmail.com') {
      return res.status(403).json({ message: 'Cannot register as admin.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role: 'user' });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Admin hardcoded check
    if (email === 'j2mechanicslondon@gmail.com' && password === 'j2mechanicslondon') {
      console.log('🔍 Admin login attempt for:', email);
      
      // Check if admin exists in DB, if not, create
      let admin = await User.findOne({ email });
      console.log('🔍 Existing admin user:', admin ? { id: admin._id, name: admin.name, role: admin.role } : 'Not found');
      
      if (!admin) {
        console.log('🔍 Creating new admin user...');
        const hashedPassword = await bcrypt.hash(password, 10);
        admin = new User({ 
          name: 'Admin Staff', // Add the required name field
          email, 
          password: hashedPassword, 
          role: 'admin' 
        });
        await admin.save();
        console.log('✅ Admin user created successfully:', admin._id);
      } else {
        console.log('✅ Admin user already exists:', admin._id);
      }
      
      const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET || 'fallback_jwt_secret_for_development', { expiresIn: '1d' });
      console.log('✅ Admin login successful, token generated for user:', admin._id);
      return res.json({ token, role: 'admin' });
    }

    // Normal user login
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'fallback_jwt_secret_for_development', { expiresIn: '1d' });
    res.json({ token, role: user.role });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot password route
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ message: 'If this email is registered, you will receive password reset instructions.' });
    }

    // Generate unique token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Save token to database with expiration
    const resetTokenDoc = new PasswordResetToken({
      email: email,
      token: resetToken,
      expiresAt: new Date(Date.now() + 3600000) // 1 hour from now
    });
    await resetTokenDoc.save();

    // Create reset link
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
    
    // Send email with reset link
    const mailOptions = {
      from: 'aryanarshad5413@gmail.com',
      to: email,
      subject: 'Password Reset Request - Reliable Mechanics',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - Reliable Mechanics</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; 
              padding: 0; 
              background-color: #111111; 
              color: #ffffff; 
              line-height: 1.6; 
            }
            .container { 
              max-width: 650px; 
              margin: 0 auto; 
              background-color: #181818; 
              border-radius: 20px; 
              overflow: hidden; 
              box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6); 
            }
            .header { 
              background: linear-gradient(135deg, #ffd700, #ffed4e); 
              padding: 40px; 
              text-align: center; 
            }
            .header h1 { 
              color: #000000; 
              margin: 0; 
              font-size: 28px; 
              font-weight: 900; 
              text-transform: uppercase; 
            }
            .content { 
              padding: 40px; 
              background-color: #181818; 
            }
            .reset-box {
              background-color: #232323;
              border-radius: 12px;
              padding: 25px;
              margin: 20px 0;
              border-left: 4px solid #ffd700;
            }
            .reset-link {
              background: #ffd700;
              color: #000000;
              padding: 15px 25px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 700;
              display: inline-block;
              margin: 20px 0;
              text-transform: uppercase;
            }
            .warning {
              background-color: #1a1a1a;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              border: 1px solid #333;
            }
            .warning h3 {
              color: #ffd700;
              margin-bottom: 15px;
            }
            .footer { 
              background-color: #000000; 
              color: #ffffff; 
              text-align: center; 
              padding: 30px; 
              border-top: 4px solid #ffd700; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>PASSWORD RESET</h1>
            </div>
            <div class="content">
              <h2 style="color: #ffd700; text-align: center; margin-bottom: 30px;">
                Reset Your Password
              </h2>
              
              <div class="reset-box">
                <p style="color: #ffffff; font-size: 16px; margin-bottom: 20px;">
                  Hello ${user.name || 'there'},
                </p>
                <p style="color: #ffffff; font-size: 16px; margin-bottom: 20px;">
                  We received a request to reset your password for your Reliable Mechanics account.
                </p>
                <p style="color: #ffffff; font-size: 16px; margin-bottom: 20px;">
                  Click the button below to reset your password:
                </p>
                
                <div style="text-align: center;">
                  <a href="${resetLink}" class="reset-link">
                    Reset Password
                  </a>
                </div>
                
                <p style="color: #cccccc; font-size: 14px; margin-top: 20px;">
                  If the button doesn't work, copy and paste this link into your browser:
                </p>
                <p style="color: #ffd700; font-size: 14px; word-break: break-all;">
                  ${resetLink}
                </p>
              </div>
              
              <div class="warning">
                <h3>⚠️ Important Security Notice</h3>
                <p style="color: #cccccc; font-size: 14px; margin-bottom: 10px;">
                  • This link will expire in 1 hour for security reasons
                </p>
                <p style="color: #cccccc; font-size: 14px; margin-bottom: 10px;">
                  • If you didn't request this password reset, please ignore this email
                </p>
                <p style="color: #cccccc; font-size: 14px; margin-bottom: 10px;">
                  • Never share this link with anyone
                </p>
              </div>
            </div>
            <div class="footer">
              <p>Thank you for choosing <span style="color: #ffd700; font-weight: 800;">Reliable Mechanics</span></p>
              <p>For any questions, contact us at aryanarshad5413@gmail.com</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.json({ message: 'If this email is registered, you will receive password reset instructions.' });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
});

// Reset password route
app.post('/api/reset-password', async (req, res) => {
  const { token, password } = req.body;
  
  try {
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }

    // Find valid reset token
    const resetTokenDoc = await PasswordResetToken.findOne({ 
      token: token,
      expiresAt: { $gt: new Date() } // Token not expired
    });

    if (!resetTokenDoc) {
      return res.status(400).json({ message: 'Invalid or expired reset token. Please request a new password reset.' });
    }

    // Find user by email
    const user = await User.findOne({ email: resetTokenDoc.email });
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update user password
    user.password = hashedPassword;
    await user.save();

    // Remove used reset token
    await PasswordResetToken.findByIdAndDelete(resetTokenDoc._id);

    // Send confirmation email
    const mailOptions = {
      from: 'aryanarshad5413@gmail.com',
      to: user.email,
      subject: 'Password Successfully Reset - Reliable Mechanics',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Success - Reliable Mechanics</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; 
              padding: 0; 
              background-color: #111111; 
              color: #ffffff; 
              line-height: 1.6; 
            }
            .container { 
              max-width: 650px; 
              margin: 0 auto; 
              background-color: #181818; 
              border-radius: 20px; 
              overflow: hidden; 
              box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6); 
            }
            .header { 
              background: linear-gradient(135deg, #00ff00, #00cc00); 
              padding: 40px; 
              text-align: center; 
            }
            .header h1 { 
              color: #000000; 
              margin: 0; 
              font-size: 28px; 
              font-weight: 900; 
              text-transform: uppercase; 
            }
            .content { 
              padding: 40px; 
              background-color: #181818; 
            }
            .success-box {
              background-color: #232323;
              border-radius: 12px;
              padding: 25px;
              margin: 20px 0;
              border-left: 4px solid #00ff00;
            }
            .login-button {
              background: #ffd700;
              color: #000000;
              padding: 15px 25px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 700;
              display: inline-block;
              margin: 20px 0;
              text-transform: uppercase;
            }
            .footer { 
              background-color: #000000; 
              color: #ffffff; 
              text-align: center; 
              padding: 30px; 
              border-top: 4px solid #00ff00; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>PASSWORD RESET SUCCESS</h1>
            </div>
            <div class="content">
              <h2 style="color: #00ff00; text-align: center; margin-bottom: 30px;">
                Your Password Has Been Reset
              </h2>
              
              <div class="success-box">
                <p style="color: #ffffff; font-size: 16px; margin-bottom: 20px;">
                  Hello ${user.name || 'there'},
                </p>
                <p style="color: #ffffff; font-size: 16px; margin-bottom: 20px;">
                  Your password has been successfully reset. You can now log in to your account using your new password.
                </p>
                
                <div style="text-align: center;">
                  <a href="http://localhost:3000/login" class="login-button">
                    Login Now
                  </a>
                </div>
                
                <p style="color: #cccccc; font-size: 14px; margin-top: 20px;">
                  If you didn't reset your password, please contact us immediately at aryanarshad5413@gmail.com
                </p>
              </div>
            </div>
            <div class="footer">
              <p>Thank you for choosing <span style="color: #00ff00; font-weight: 800;">Reliable Mechanics</span></p>
              <p>For any questions, contact us at aryanarshad5413@gmail.com</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.json({ message: 'Password has been successfully reset. You can now log in with your new password.' });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
});

// Contact form submission endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  
  try {
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    // Send email to company
    const mailOptions = {
      from: 'aryanarshad5413@gmail.com',
      to: 'j2mechanicslondon@gmail.com', // Company email
      subject: `Contact Form: ${subject} - ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission - Reliable Mechanics</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; 
              padding: 0; 
              background-color: #111111; 
              color: #ffffff; 
              line-height: 1.6; 
            }
            .container { 
              max-width: 650px; 
              margin: 0 auto; 
              background-color: #181818; 
              border-radius: 20px; 
              overflow: hidden; 
              box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6); 
            }
            .header { 
              background: linear-gradient(135deg, #ffd700, #ffed4e); 
              padding: 40px; 
              text-align: center; 
            }
            .header h1 { 
              color: #000000; 
              margin: 0; 
              font-size: 28px; 
              font-weight: 900; 
              text-transform: uppercase; 
            }
            .content { 
              padding: 40px; 
              background-color: #181818; 
            }
            .contact-details {
              background-color: #232323;
              border-radius: 12px;
              padding: 25px;
              margin: 20px 0;
              border-left: 4px solid #ffd700;
            }
            .detail-row {
              display: flex;
              margin-bottom: 18px;
              align-items: center;
              padding: 15px 0;
              border-bottom: 1px solid #333333;
            }
            .detail-row:last-child {
              border-bottom: none;
              margin-bottom: 0;
            }
            .detail-label {
              font-weight: 800;
              color: #ffd700;
              min-width: 120px;
              font-size: 16px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .detail-value {
              color: #ffffff;
              font-size: 16px;
              font-weight: 600;
            }
            .message-box {
              background-color: #1a1a1a;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              border: 1px solid #333;
            }
            .message-text {
              color: #ffffff;
              font-size: 16px;
              line-height: 1.6;
              white-space: pre-wrap;
            }
            .action-buttons {
              text-align: center;
              margin-top: 30px;
            }
            .btn {
              display: inline-block;
              background: #ffd700;
              color: #000000;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 700;
              margin: 0 10px;
              text-transform: uppercase;
            }
            .footer { 
              background-color: #000000; 
              color: #ffffff; 
              text-align: center; 
              padding: 30px; 
              border-top: 4px solid #ffd700; 
            }
            .timestamp {
              background-color: #232323;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
              text-align: center;
              border: 1px solid #333;
            }
            .timestamp p {
              color: #cccccc;
              margin: 0;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>NEW CONTACT FORM</h1>
            </div>
            <div class="content">
              <h2 style="color: #ffd700; text-align: center; margin-bottom: 30px;">
                New Contact Form Submission
              </h2>
              
              <div class="contact-details">
                <div class="detail-row">
                  <span class="detail-label">Name:</span>
                  <span class="detail-value">${name}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">${email}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Subject:</span>
                  <span class="detail-value">${subject}</span>
                </div>
              </div>
              
              <div class="message-box">
                <h3 style="color: #ffd700; margin-bottom: 15px; font-size: 18px;">Message:</h3>
                <div class="message-text">${message}</div>
              </div>
              
              <div class="timestamp">
                <p><strong>Submitted:</strong> ${new Date().toLocaleString('en-GB', { 
                  timeZone: 'Europe/London',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
              
              <div class="action-buttons">
                <a href="mailto:${email}" class="btn">
                  Reply to ${name}
                </a>
                <a href="http://localhost:3000/dashboard" class="btn">
                  Go to Dashboard
                </a>
              </div>
            </div>
            <div class="footer">
              <p>Thank you for choosing <span style="color: #ffd700; font-weight: 800;">Reliable Mechanics</span></p>
              <p>This is an automated notification from your website contact form</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Also send confirmation email to the user
    const userConfirmationEmail = {
      from: 'aryanarshad5413@gmail.com',
      to: email,
      subject: 'Thank you for contacting Reliable Mechanics',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thank you for contacting us - Reliable Mechanics</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; 
              padding: 0; 
              background-color: #111111; 
              color: #ffffff; 
              line-height: 1.6; 
            }
            .container { 
              max-width: 650px; 
              margin: 0 auto; 
              background-color: #181818; 
              border-radius: 20px; 
              overflow: hidden; 
              box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6); 
            }
            .header { 
              background: linear-gradient(135deg, #ffd700, #ffed4e); 
              padding: 40px; 
              text-align: center; 
            }
            .header h1 { 
              color: #000000; 
              margin: 0; 
              font-size: 28px; 
              font-weight: 900; 
              text-transform: uppercase; 
            }
            .content { 
              padding: 40px; 
              background-color: #181818; 
            }
            .thank-you-box {
              background-color: #232323;
              border-radius: 12px;
              padding: 25px;
              margin: 20px 0;
              border-left: 4px solid #ffd700;
              text-align: center;
            }
            .thank-you-box h2 {
              color: #ffd700;
              margin-bottom: 20px;
              font-size: 24px;
            }
            .thank-you-box p {
              color: #ffffff;
              font-size: 16px;
              margin-bottom: 15px;
            }
            .contact-info {
              background-color: #1a1a1a;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              border: 1px solid #333;
            }
            .contact-info h3 {
              color: #ffd700;
              margin-bottom: 15px;
              font-size: 18px;
            }
            .contact-info p {
              color: #cccccc;
              margin: 8px 0;
              font-size: 14px;
            }
            .footer { 
              background-color: #000000; 
              color: #ffffff; 
              text-align: center; 
              padding: 30px; 
              border-top: 4px solid #ffd700; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>THANK YOU</h1>
            </div>
            <div class="content">
              <div class="thank-you-box">
                <h2>Thank you for contacting us!</h2>
                <p>Dear ${name},</p>
                <p>We have received your message and will get back to you as soon as possible.</p>
                <p>We typically respond within 24 hours during business days.</p>
              </div>
              
              <div class="contact-info">
                <h3>📋 Your Message Details:</h3>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong> ${message}</p>
                <p><strong>Submitted:</strong> ${new Date().toLocaleString('en-GB', { 
                  timeZone: 'Europe/London',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #cccccc; font-size: 14px;">
                  If you have any urgent inquiries, please call us directly or visit our location.
                </p>
              </div>
            </div>
            <div class="footer">
              <p>Thank you for choosing <span style="color: #ffd700; font-weight: 800;">Reliable Mechanics</span></p>
              <p>We look forward to serving you!</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Send both emails
    await transporter.sendMail(mailOptions);
    await transporter.sendMail(userConfirmationEmail);
    
    console.log('📧 Contact form email sent successfully from:', email);
    
    res.json({ 
      success: true,
      message: 'Thank you for your message! We will get back to you soon.' 
    });
  } catch (err) {
    console.error('Contact form error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Something went wrong. Please try again later.' 
    });
  }
});

// NEW SIMPLIFIED UPLOAD ENDPOINT
app.post('/upload-service-image', upload.array('images'), async (req, res) => {
  try {
    console.log("🔄 NEW SIMPLIFIED UPLOAD - Image upload request received");
    console.log("📋 Request body:", req.body);
    console.log("📁 Files:", req.files ? req.files.length : 'No files');
    
    const { serviceId } = req.body;
    
    if (!serviceId || !req.files) {
      console.log("❌ Missing required fields:", { serviceId, hasFiles: !!req.files });
      return res.status(400).json({ message: 'Missing serviceId or files.' });
    }
    
    // Simple validation: check if service exists
    const carbooking = await Carbooking.findById(serviceId);
    if (!carbooking) {
      console.log("❌ Service not found:", serviceId);
      return res.status(400).json({ message: 'Service not found.' });
    }
    
    console.log("✅ Service found:", {
      id: carbooking._id,
      car: carbooking.car.registration,
      service: carbooking.service.label,
      date: carbooking.date
    });
    
    // Upload images directly to this service
    const imageDocs = req.files.map(file => ({
      serviceId: serviceId,
      userId: carbooking.customer.email, // Include customer email for proper association
      imageUrl: file.url || file.path,
      uploadedAt: new Date(),
      uploadedBy: 'admin'
    }));
    
    // Validate that we have the required fields
    if (!carbooking.customer?.email) {
      console.log("❌ No customer email found in booking");
      return res.status(400).json({ message: 'Customer email not found in booking.' });
    }
    
    console.log("💾 Saving images for service:", serviceId);
    await ServiceImage.insertMany(imageDocs);
    
    console.log("✅ Images uploaded successfully for service:", serviceId);
    res.status(200).json({ 
      message: 'Images uploaded successfully!', 
      images: imageDocs,
      serviceId: serviceId
    });
    
  } catch (err) {
    console.error('❌ UPLOAD ERROR:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// SIMPLIFIED: Get images for a specific service
app.get('/api/service-images/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    console.log('🔍 SIMPLIFIED: Getting images for service:', serviceId);
    
    const images = await ServiceImage.find({ serviceId }).sort({ uploadedAt: -1 });
    console.log('📸 Found images:', images.length);
    
    res.json(images);
  } catch (err) {
    console.error('❌ Error getting service images:', err);
    res.status(500).json({ error: 'Failed to get service images', details: err.message });
  }
});

// Get user services with images by email
app.get('/api/user-services-with-images/:email', async (req, res) => {
  try {
    const { email } = req.params;
    console.log('🔍 Fetching services with images for email:', email);
    
    // Get user services
    const userServices = await UserService.find({ 
      userEmail: { $regex: new RegExp(email, 'i') } 
    }).sort({ createdAt: -1 });
    
    console.log('📦 Found user services:', userServices.length);
    
    // Get images for each service by looking up the corresponding Carbooking
    const servicesWithImages = await Promise.all(
      userServices.map(async (service) => {
        console.log('🔍 Processing service:', service._id, 'for car:', service.car?.registration);
        
        // Find the corresponding Carbooking by matching car registration and customer email
        // Use more flexible matching to ensure we find the right service
        console.log('🔍 Looking for Carbooking with:', {
          registration: service.car.registration,
          email: email,
          serviceLabel: service.service.label,
          serviceDate: service.date
        });
        
        const carbooking = await Carbooking.findOne({
          'car.registration': service.car.registration,
          'customer.email': email,
          // Remove strict date matching as it might cause issues with time zones
          // Remove strict service label matching as it might have slight variations
        });
        
        let images = [];
        if (carbooking) {
          // Get images using the Carbooking ID
          images = await ServiceImage.find({ 
            serviceId: carbooking._id.toString(),
            userId: email 
          }).sort({ uploadedAt: -1 });
        } else {
          
          // Try a more flexible search as fallback
          const flexibleCarbooking = await Carbooking.findOne({
            'car.registration': service.car.registration,
            'customer.email': email
          });
          
          if (flexibleCarbooking) {
            console.log('✅ Found flexible match:', flexibleCarbooking._id);
            // Get images using the flexible Carbooking ID
            images = await ServiceImage.find({ 
              serviceId: flexibleCarbooking._id.toString(),
              userId: email 
            }).sort({ uploadedAt: -1 });
            console.log('📸 Found images with flexible search:', images.length);
          } else {
            console.log('❌ No flexible match found either');
            // No fallback - only show images that are properly linked to this specific service
            // This prevents images from appearing on wrong services
            images = [];
            console.log('🔍 No images found for this service (no matching Carbooking)');
          }
        }
        
        return {
          ...service.toObject(),
          images: images
        };
      })
    );
    
    console.log('✅ Returning services with images:', servicesWithImages.length);
    res.json(servicesWithImages);
    
  } catch (err) {
    console.error('❌ Error in user-services-with-images:', err);
    res.status(500).json({ error: 'Failed to fetch user services with images', details: err.message });
  }
});

// Example protected route
app.get('/dashboard', (req, res) => {
  res.send('Dashboard - protected route');
});

// DVLA vehicle lookup proxy endpoint
app.post('/api/dvla-lookup', async (req, res) => {
  const { registrationNumber } = req.body;
  
  if (!registrationNumber) {
    return res.status(400).json({ error: 'Registration number is required' });
  }
  
  console.log('🔍 DVLA Lookup request for:', registrationNumber);
  
  try {
    const response = await fetch('https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.DVLA_API_KEY || 'GkkoAz3nZ21HAAz7qC8Cda4CrKLfVONB1yv1FAGJ', // Use environment variable or fallback
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ registrationNumber }),
    });
    
    console.log('🔍 DVLA API response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('🔍 DVLA API error:', response.status, errorData);
      
      if (response.status === 401) {
        return res.status(500).json({ 
          error: 'DVLA API authentication failed. Please check your API key.',
          note: 'You need to get a valid DVLA API key from https://developer.service.gov.uk/ and set it as DVLA_API_KEY environment variable.'
        });
      } else if (response.status === 404) {
        return res.status(404).json({ error: 'Vehicle not found with this registration number.' });
      } else {
        return res.status(500).json({ error: `DVLA API error: ${response.status}`, details: errorData });
      }
    }
    
    const data = await response.json();
    console.log('🔍 DVLA API success:', data);
    res.json(data);
    
  } catch (err) {
    console.error('🔍 DVLA Lookup error:', err);
    res.status(500).json({ error: 'Network error connecting to DVLA API', details: err.message });
  }
});

// User Service Tracking schema
const userServiceSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  car: {
    make: String,
    model: String,
    year: String,
    registration: String,
  },
  service: {
    label: String,
    sub: String,
    category: String,
    price: Number,
  },
  services: [
    {
      label: String,
      sub: String,
      category: String,
      price: Number,
      labourHours: Number,
      labourCost: Number,
    }
  ],
  parts: [
    {
      partNumber: String,
      name: String,
      supplier: String,
      cost: Number,
      profit: Number,
      price: Number,
      qty: Number,
    }
  ],
  labourHours: Number,
  labourCost: Number,
  partsCost: Number,
  subtotal: Number,
  vat: Number,
  total: Number,
  date: String,
  time: String,
  category: String,
  status: String,
  stripeSessionId: String, // Add session ID to prevent duplicates
  createdAt: { type: Date, default: Date.now }
}, { 
  strict: false // Allow additional fields to be added
});
const UserService = mongoose.model('UserService', userServiceSchema);

// Business Expense schema for non-booking expenses
const businessExpenseSchema = new mongoose.Schema({
  category: { 
    type: String, 
    required: true,
    enum: ['equipment', 'tools', 'fuel', 'transport', 'marketing', 'insurance', 'utilities', 'rent', 'maintenance', 'supplies', 'other']
  },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  paymentMethod: { type: String, enum: ['cash', 'card', 'bank_transfer', 'cheque'], default: 'card' },
  supplier: String,
  receiptUrl: String, // For uploading receipts
  notes: String,
  createdBy: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});

// Index for efficient querying
businessExpenseSchema.index({ date: 1, category: 1 });
businessExpenseSchema.index({ category: 1, createdAt: -1 });

const BusinessExpense = mongoose.model('BusinessExpense', businessExpenseSchema);

// Index creation will be handled after MongoDB connection is established

// Create admin user endpoint
app.post('/api/create-admin', async (req, res) => {
  try {
    console.log('🔍 Admin creation request received');
    const { email, password } = req.body;
    console.log('🔍 Request body:', { email, password: password ? '***' : 'missing' });
    
    // Only allow admin creation for specific credentials
    if (email !== 'j2mechanicslondon@gmail.com' || password !== 'j2mechanicslondon') {
      console.log('❌ Invalid credentials provided');
      return res.status(403).json({ error: 'Invalid admin credentials' });
    }
    
    console.log('🔍 Credentials validated, checking if admin exists...');
    
    // Check if admin already exists
    let admin = await User.findOne({ email, role: 'admin' });
    console.log('🔍 Admin lookup result:', admin ? `Found: ${admin._id}` : 'Not found');
    
    if (!admin) {
      console.log('🔍 Creating new admin user...');
      // Create new admin user
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('🔍 Password hashed successfully');
      
      admin = new User({ 
        name: 'Admin Staff',
        email, 
        password: hashedPassword, 
        role: 'admin' 
      });
      console.log('🔍 User model created, saving to database...');
      
      await admin.save();
      console.log('✅ Admin user created successfully:', admin._id);
    } else {
      console.log('✅ Admin user already exists:', admin._id);
    }
    
    console.log('🔍 Generating JWT token...');
    // Generate token
            const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET || 'fallback_jwt_secret_for_development', { expiresIn: '1d' });
    console.log('✅ JWT token generated');
    
    console.log('✅ Admin user ready, sending response');
    res.json({ 
      success: true,
      message: 'Admin user ready',
      token,
      role: 'admin'
    });
    
  } catch (err) {
    console.error('❌ Error creating admin user:', err);
    console.error('❌ Error stack:', err.stack);
    console.error('❌ Error name:', err.name);
    console.error('❌ Error message:', err.message);
    res.status(500).json({ error: 'Failed to create admin user', details: err.message });
  }
});

// Get current user info from JWT token
app.get('/api/current-user', async (req, res) => {
  try {
    console.log('🔍 Current user request received');
    const authHeader = req.headers.authorization;
    console.log('🔍 Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid auth header found');
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    console.log('🔍 Token extracted, length:', token.length);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_jwt_secret_for_development');
    console.log('🔍 Token decoded:', { id: decoded.id, role: decoded.role });
    
    const user = await User.findById(decoded.id).select('-password');
    console.log('🔍 User found:', user ? { id: user._id, name: user.name, email: user.email, role: user.role } : 'Not found');
    
    if (!user) {
      console.log('❌ User not found in database');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ Returning user data:', { id: user._id, name: user.name, email: user.email, role: user.role });
    res.json(user);
  } catch (err) {
    console.error('❌ Error in current-user endpoint:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Debug endpoint to see all users in database
app.get('/api/debug/users', async (req, res) => {
  try {
    const allUsers = await User.find({}).select('email name role');
    console.log('🔍 Debug: All users found:', allUsers.length);
    allUsers.forEach((user, i) => {
      console.log(`🔍 User ${i}:`, {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      });
    });
    
    res.json({ 
      success: true,
      userCount: allUsers.length,
      users: allUsers
    });
  } catch (err) {
    console.error('❌ Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Debug endpoint to see all UserService records
app.get('/api/debug/user-services', async (req, res) => {
  try {
    const allUserServices = await UserService.find({}).sort({ createdAt: -1 });
    const allUsers = await User.find({}).select('email name');
    
    console.log('🔍 Debug: All UserServices found:', allUserServices.length);
    allUserServices.forEach((us, i) => {
      console.log(`🔍 UserService ${i}:`, {
        id: us._id,
        userEmail: us.userEmail,
        total: us.total,
        subtotal: us.subtotal,
        vat: us.vat,
        servicePrice: us.service?.price,
        category: us.category,
        date: us.date
      });
    });
    
    res.json({
      totalUserServices: allUserServices.length,
      totalUsers: allUsers.length,
      userServices: allUserServices,
      users: allUsers
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stripe checkout endpoint
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { cartItems, customerEmail, customerName, carDetails } = req.body;
    
    console.log('🛒 Creating checkout session with data:');
    console.log('📧 Customer Email:', customerEmail);
    console.log('👤 Customer Name:', customerName);
    console.log('🚗 Car Details:', carDetails);
    console.log('📦 Cart Items:', cartItems.length, 'items');
    console.log('📦 Cart Items Details:', JSON.stringify(cartItems, null, 2));
    
    // Validate required fields
    if (!cartItems || cartItems.length === 0) {
      console.error('❌ Cart is empty');
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    if (!customerEmail) {
      console.error('❌ Customer email is required');
      return res.status(400).json({ error: 'Customer email is required' });
    }
    
    if (!customerName) {
      console.error('❌ Customer name is required');
      return res.status(400).json({ error: 'Customer name is required' });
    }
    
    // Validate cart items structure
    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i];
      if (!item.service || !item.service.price || !item.quantity) {
        console.error(`❌ Invalid cart item at index ${i}:`, item);
        return res.status(400).json({ 
          error: `Invalid cart item at index ${i}`,
          item: item
        });
      }
    }

    // Create line items for Stripe
    console.log('💰 Creating Stripe line items...');
    const lineItems = cartItems.map((item, index) => {
      const lineItem = {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: item.service.label || 'Service',
            description: item.service.sub || 'Service description',
          },
          unit_amount: Math.round(((item.service.price || 0) + (item.service.labourHours ? (item.service.labourHours * (item.service.labourCost || 10)) : 0)) * 100), // Convert to pence including labour
        },
        quantity: item.quantity || 1,
      };
      
      const basePrice = item.service.price || 0;
      const labourCost = item.service.labourHours ? (item.service.labourHours * (item.service.labourCost || 10)) : 0;
      const totalPrice = basePrice + labourCost;
      
      console.log(`💰 Line item ${index}:`, {
        name: lineItem.price_data.product_data.name,
        description: lineItem.price_data.product_data.description,
        basePrice: `£${basePrice}`,
        labourCost: `£${labourCost}`,
        totalPrice: `£${totalPrice}`,
        unit_amount: lineItem.price_data.unit_amount,
        quantity: lineItem.quantity
      });
      
      return lineItem;
    });
    
    console.log('💰 Final line items:', JSON.stringify(lineItems, null, 2));

    // Create Stripe checkout session
    console.log('🔗 Creating Stripe checkout session...');
    console.log('🔗 Session config:', {
      payment_method_types: ['card'],
      line_items_count: lineItems.length,
      mode: 'payment',
      success_url: `https://car-wash-client-seven.vercel.app/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://car-wash-client-seven.vercel.app/payment-cancelled`
    });
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `https://car-wash-client-seven.vercel.app/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://car-wash-client-seven.vercel.app/payment-cancelled`,
      metadata: {
        customerEmail,
        customerName,
        carRegistration: carDetails?.registration || '',
        carMake: carDetails?.make || '',
        carModel: carDetails?.model || '',
        carYear: carDetails?.year || '',
        preferredDate: carDetails?.preferredDate || '',
        preferredTime: carDetails?.preferredTime || '09:00',
        services: JSON.stringify(cartItems.map(item => ({
          serviceId: item.service._id,
          label: item.service.label,
          price: item.service.price,
          labourHours: item.service.labourHours || 0,
          labourCost: item.service.labourCost || 0,
          totalPrice: (item.service.price || 0) + (item.service.labourHours ? (item.service.labourHours * (item.service.labourCost || 10)) : 0),
          quantity: item.quantity
        })))
      }
    });
    
    console.log('✅ Stripe session created successfully:', session.id);
    console.log('🔗 Generated success URL:', `${req.headers.origin}/payment-success?session_id=${session.id}`);
    console.log('🔗 Origin header:', req.headers.origin);

    console.log('🔗 Stripe session metadata created:', {
      customerEmail,
      customerName,
      carRegistration: carDetails?.registration || '',
      carMake: carDetails?.make || '',
      carModel: carDetails?.model || '',
      carYear: carDetails?.year || '',
      preferredDate: carDetails?.preferredDate || '',
      preferredTime: carDetails?.preferredTime || '09:00'
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('❌ Stripe checkout error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message,
      type: error.type || 'unknown'
    });
  }
});

// Stripe webhook to handle successful payments
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret_here';

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    console.log('🎉 Stripe webhook received - checkout.session.completed');
    console.log('📧 Session metadata:', session.metadata);
    
    try {
      // Extract metadata
      const { customerEmail, customerName, carRegistration, carMake, carModel, carYear, preferredDate, preferredTime, services } = session.metadata;
      const servicesData = JSON.parse(services);
      
      console.log('🔍 Extracted data:', {
        customerEmail,
        customerName,
        carRegistration,
        carMake,
        carModel,
        carYear,
        preferredDate,
        preferredTime,
        servicesCount: servicesData.length
      });
      
      // Calculate total amount
      const totalAmount = servicesData.reduce((sum, service) => sum + (service.price * service.quantity), 0);
      
      console.log('💰 Total amount:', totalAmount);
      
      // Create new Carbooking record
      const newBooking = new Carbooking({
        customer: {
          name: customerName,
          email: customerEmail,
          phone: '', // Will be filled later
          address: '' // Will be filled later
        },
        car: {
          make: carMake,
          model: carModel,
          year: carYear,
          registration: carRegistration,
          color: '', // Will be filled later
          mileage: 0 // Will be filled later
        },
        service: {
          label: servicesData.map(s => s.label).join(', '),
          description: `Multiple services: ${servicesData.map(s => `${s.label} (x${s.quantity})`).join(', ')}`,
          price: totalAmount
        },
        date: preferredDate ? new Date(preferredDate) : new Date(),
        time: preferredTime || '09:00',
        status: 'pending',
        paymentStatus: 'paid',
        stripeSessionId: session.id,
        totalAmount: totalAmount
      });

      console.log('📝 Creating Carbooking with data:', {
        date: newBooking.date,
        time: newBooking.time,
        customerEmail: newBooking.customer.email,
        serviceLabel: newBooking.service.label
      });

      await newBooking.save();
      console.log('✅ Carbooking saved successfully with ID:', newBooking._id);
      
      // Create UserService record
      const newUserService = new UserService({
        userId: customerEmail,
        userEmail: customerEmail,
        userName: customerName,
        car: {
          make: carMake,
          model: carModel,
          year: carYear,
          registration: carRegistration
        },
        service: {
          label: servicesData.map(s => s.label).join(', '),
          sub: `Multiple services: ${servicesData.map(s => `${s.label} (x${s.quantity})`).join(', ')}`,
          category: 'service' // Default category for multiple services
        },
        date: preferredDate ? new Date(preferredDate) : new Date(),
        time: preferredTime || '09:00',
        category: 'service', // Default category for multiple services
        status: 'pending'
      });

      console.log('📝 Creating UserService with data:', {
        date: newUserService.date,
        time: newUserService.time,
        userEmail: newUserService.userEmail,
        category: newUserService.category
      });

      await newUserService.save();
      console.log('✅ UserService saved successfully with ID:', newUserService._id);
      
      console.log(`🎉 Complete: Booking and UserService created successfully for ${customerEmail}`);
    } catch (error) {
      console.error('❌ Error creating booking from webhook:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error stack:', error.stack);
    }
  }

  res.json({ received: true });
});

// Cleanup endpoint to remove duplicate session-based bookings
app.post('/api/cleanup-session-duplicates', async (req, res) => {
  try {
    console.log('🧹 Starting cleanup of session-based duplicates...');
    
    // Find all session-based bookings
    const allBookings = await Carbooking.find({
      'service.label': 'Service Booking',
      'service.description': 'Booking created from successful payment session'
    });
    
    console.log('📊 Found session-based bookings:', allBookings.length);
    
    // Group by customer email
    const grouped = {};
    allBookings.forEach(booking => {
      const email = booking.customer?.email;
      if (!grouped[email]) {
        grouped[email] = [];
      }
      grouped[email].push(booking);
    });
    
    // Remove duplicates, keep only the first one for each customer
    let duplicatesRemoved = 0;
    for (const [email, bookings] of Object.entries(grouped)) {
      if (bookings.length > 1) {
        console.log(`🔍 Found ${bookings.length} duplicates for ${email}`);
        
        // Keep the first one, remove the rest
        const toRemove = bookings.slice(1);
        for (const booking of toRemove) {
          await Carbooking.findByIdAndDelete(booking._id);
          duplicatesRemoved++;
          console.log(`🗑️ Removed duplicate booking: ${booking._id}`);
        }
      }
    }
    
    // Also clean up duplicate UserServices
    const allUserServices = await UserService.find({
      'service.label': 'Service Booking',
      'service.sub': 'Booking created from successful payment session'
    });
    
    console.log('📊 Found session-based UserServices:', allUserServices.length);
    
    const userServiceGrouped = {};
    allUserServices.forEach(service => {
      const email = service.userEmail;
      if (!userServiceGrouped[email]) {
        userServiceGrouped[email] = [];
      }
      userServiceGrouped[email].push(service);
    });
    
    for (const [email, services] of Object.entries(userServiceGrouped)) {
      if (services.length > 1) {
        console.log(`🔍 Found ${services.length} duplicate UserServices for ${email}`);
        
        const toRemove = services.slice(1);
        for (const service of toRemove) {
          await UserService.findByIdAndDelete(service._id);
          duplicatesRemoved++;
          console.log(`🗑️ Removed duplicate UserService: ${service._id}`);
        }
      }
    }
    
    console.log(`✅ Cleanup complete. Removed ${duplicatesRemoved} duplicate records.`);
    
    res.json({ 
      success: true, 
      duplicatesRemoved,
      message: `Removed ${duplicatesRemoved} duplicate session-based records`
    });
    
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    res.status(500).json({ error: 'Failed to cleanup duplicates', details: error.message });
  }
});

// Cleanup endpoint to remove duplicate bookings
app.post('/api/cleanup-duplicates', async (req, res) => {
  try {
    console.log('🧹 Starting duplicate cleanup...');
    
    // Find all bookings
    const allBookings = await Carbooking.find({});
    console.log('📊 Total bookings found:', allBookings.length);
    
    // Group by registration and service
    const grouped = {};
    allBookings.forEach(booking => {
      const key = `${booking.customer?.email}-${booking.car?.registration}-${booking.service?.label}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(booking);
    });
    
    // Find duplicates
    let duplicatesRemoved = 0;
    for (const [key, bookings] of Object.entries(grouped)) {
      if (bookings.length > 1) {
        console.log(`🔍 Found ${bookings.length} duplicates for key: ${key}`);
        
        // Keep the first one, remove the rest
        const toRemove = bookings.slice(1);
        for (const booking of toRemove) {
          await Carbooking.findByIdAndDelete(booking._id);
          duplicatesRemoved++;
          console.log(`🗑️ Removed duplicate booking: ${booking._id}`);
        }
      }
    }
    
    console.log(`✅ Cleanup complete. Removed ${duplicatesRemoved} duplicate bookings.`);
    
    res.json({ 
      success: true, 
      duplicatesRemoved,
      message: `Removed ${duplicatesRemoved} duplicate bookings`
    });
    
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    res.status(500).json({ error: 'Failed to cleanup duplicates', details: error.message });
  }
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({ 
    message: 'CORS is working!',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin || 'No origin header',
    userAgent: req.headers['user-agent'] || 'No user agent'
  });
});

// Simple health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    console.log('🏥 Health check endpoint called');
    
    // Check if models are defined
    console.log('🔍 Carbooking model:', typeof Carbooking);
    console.log('🔍 UserService model:', typeof UserService);
    
    // Check database connection
    const mongoose = require('mongoose');
    console.log('🔍 MongoDB connection state:', mongoose.connection.readyState);
    
    // Count existing records
    const bookingCount = await Carbooking.countDocuments();
    const userServiceCount = await UserService.countDocuments();
    
    console.log('📊 Database counts:', {
      bookings: bookingCount,
      userServices: userServiceCount
    });
    
    res.json({ 
      status: 'healthy',
      models: {
        carbooking: typeof Carbooking,
        userService: typeof UserService
      },
      database: {
        connection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        bookings: bookingCount,
        userServices: userServiceCount
      }
    });
    
  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message 
    });
  }
});

// Simple test endpoint to create a UserService with hardcoded values
app.post('/api/test-user-service', async (req, res) => {
  try {
    console.log('🧪 Creating test UserService with hardcoded values');
    
    // First, let's check if the UserService model is working
    console.log('🔍 UserService model:', typeof UserService);
    console.log('🔍 UserService schema fields:', Object.keys(UserService.schema.paths));
    
    const testUserService = new UserService({
      userId: 'test@example.com',
      userEmail: 'test@example.com',
      userName: 'Test User',
      car: {
        make: 'Toyota',
        model: 'Camry',
        year: '2020',
        registration: 'TEST123'
      },
      service: {
        label: 'Test Service',
        sub: 'Test service description',
        price: 150.00,
        category: 'service'
      },
      total: 150.00,
      subtotal: 150.00,
      vat: 30.00,
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      category: 'service',
      status: 'pending'
    });

    console.log('📝 Test UserService data:', {
      total: testUserService.total,
      subtotal: testUserService.subtotal,
      vat: testUserService.vat,
      servicePrice: testUserService.service?.price
    });

    await testUserService.save();
    console.log('✅ Test UserService created with ID:', testUserService._id);
    
    res.json({ 
      success: true, 
      userServiceId: testUserService._id,
      message: 'Test UserService created successfully',
      data: {
        total: testUserService.total,
        subtotal: testUserService.subtotal,
        vat: testUserService.vat,
        servicePrice: testUserService.service?.price
      }
    });
    
  } catch (error) {
    console.error('❌ Test UserService endpoint error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to create test UserService', details: error.message });
  }
});

// Test endpoint to create a booking with hardcoded values
app.post('/api/test-booking-hardcoded', async (req, res) => {
  try {
    console.log('🧪 Creating test booking with hardcoded values');
    
    const testBooking = new Carbooking({
      customer: {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '123456789',
        address: 'Test Address'
      },
      car: {
        make: 'Toyota',
        model: 'Camry',
        year: '2020',
        registration: 'TEST456',
        color: 'Red',
        mileage: 50000
      },
      service: {
        label: 'Oil Change',
        description: 'Test oil change service',
        price: 75.00
      },
      date: new Date(),
      time: '11:00',
      status: 'pending',
      paymentStatus: 'paid',
      totalAmount: 75.00,
      total: 75.00,
      category: 'service'
    });

    console.log('📝 Test booking data:', {
      total: testBooking.total,
      totalAmount: testBooking.totalAmount,
      servicePrice: testBooking.service?.price
    });

    await testBooking.save();
    console.log('✅ Test booking created with ID:', testBooking._id);
    
    // Also create a UserService
    const testUserService = new UserService({
      userId: 'test@example.com',
      userEmail: 'test@example.com',
      userName: 'Test Customer',
      car: {
        make: 'Toyota',
        model: 'Camry',
        year: '2020',
        registration: 'TEST456'
      },
      service: {
        label: 'Oil Change',
        sub: 'Test oil change service',
        price: 75.00,
        category: 'service'
      },
      total: 75.00,
      subtotal: 75.00,
      vat: 15.00,
      date: new Date().toISOString().split('T')[0],
      time: '11:00',
      category: 'service',
      status: 'pending'
    });

    await testUserService.save();
    console.log('✅ Test UserService created with ID:', testUserService._id);
    
    res.json({ 
      success: true, 
      bookingId: testBooking._id,
      userServiceId: testUserService._id,
      message: 'Test booking and UserService created successfully',
      data: {
        total: testBooking.total,
        totalAmount: testBooking.totalAmount,
        servicePrice: testBooking.service?.price
      }
    });
    
  } catch (error) {
    console.error('❌ Test booking endpoint error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to create test booking', details: error.message });
  }
});

// Session-based booking creation endpoint
app.post('/api/create-booking-from-session', async (req, res) => {
  try {
    const { sessionId, userEmail, userName, carDetails, serviceDetails } = req.body;
    
    console.log('🎯 Creating booking from session ID:', sessionId);
    console.log('👤 User:', { email: userEmail, name: userName });
    console.log('🚗 Car Details received:', carDetails);
    console.log('📦 Service Details received:', serviceDetails);
    
          // Check if we have multiple services
      const hasMultipleServices = serviceDetails?.services && Array.isArray(serviceDetails.services) && serviceDetails.services.length > 1;
      console.log('🛒 Multiple services detected:', hasMultipleServices);
      if (hasMultipleServices) {
        console.log('📋 All services in cart:', serviceDetails.services.map((s) => ({
          label: s.service.label,
          price: s.service.price,
          labourHours: s.service.labourHours,
          labourCost: s.service.labourCost,
          total: s.service.price + (s.service.labourHours ? (s.service.labourHours * (s.service.labourCost || 10)) : 0)
        })));
      }
    
    // Enhanced duplicate detection - check multiple criteria
    console.log('🔍 Checking for existing bookings...');
    
    // Check by session ID first (most specific)
    const existingBySession = await Carbooking.findOne({ 
      stripeSessionId: sessionId
    });
    
    if (existingBySession) {
      console.log('⚠️ Booking already exists for this session ID:', existingBySession._id);
      return res.json({ 
        success: true, 
        bookingId: existingBySession._id,
        message: 'Booking already exists for this session ID',
        isDuplicate: true
      });
    }
    
    // Check by customer email + service + recent time (within last 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const existingByEmail = await Carbooking.findOne({
      'customer.email': userEmail,
      createdAt: { $gte: tenMinutesAgo },
      'service.label': serviceDetails?.label || 'Service Booking'
    });
    
    if (existingByEmail) {
      console.log('⚠️ Recent booking found for this customer and service:', existingByEmail._id);
      return res.json({ 
        success: true, 
        bookingId: existingByEmail._id,
        message: 'Recent booking found for this customer and service',
        isDuplicate: true
      });
    }
    
    // Additional check: Look for any booking with this session ID in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const anyRecentSession = await Carbooking.findOne({
      stripeSessionId: sessionId,
      createdAt: { $gte: oneHourAgo }
    });
    
    if (anyRecentSession) {
      console.log('⚠️ Recent session-based booking found:', anyRecentSession._id);
      return res.json({ 
        success: true, 
        bookingId: anyRecentSession._id,
        message: 'Recent session-based booking found',
        isDuplicate: true
      });
    }
    
    console.log('✅ No duplicates found, proceeding with new booking creation');
    
    // Use actual car details if provided, otherwise fallback to defaults
    const actualCarDetails = carDetails || {
      make: 'Customer Vehicle',
      model: 'To be specified',
      year: '2024',
      registration: 'TEMP' + Date.now(),
      color: '',
      mileage: 0
    };
    
    // Use actual service details if provided, otherwise fallback to defaults
    const actualServiceDetails = serviceDetails || {
      label: 'Service Booking',
      description: 'Booking created from successful payment session',
      price: 100.00
    };
    
    // Parse the actual date if provided
    let actualDate = new Date();
    let actualTime = '09:00';
    
    if (carDetails?.preferredDate) {
      try {
        // Handle different date formats
        if (typeof carDetails.preferredDate === 'string') {
          if (carDetails.preferredDate.includes('/')) {
            // Format: DD/MM/YYYY
            const [day, month, year] = carDetails.preferredDate.split('/');
            actualDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          } else {
            // Format: YYYY-MM-DD
            actualDate = new Date(carDetails.preferredDate);
          }
        }
        console.log('📅 Parsed date:', carDetails.preferredDate, '→', actualDate);
      } catch (dateError) {
        console.error('❌ Date parsing error:', dateError);
        actualDate = new Date();
      }
    }
    
    if (carDetails?.preferredTime) {
      actualTime = carDetails.preferredTime;
    }
    
    // Calculate actual total from service details
    const actualTotal = actualServiceDetails.price || 100.00;
    
    console.log('💰 Using actual total:', actualTotal);
    console.log('📅 Using actual date:', actualDate);
    console.log('⏰ Using actual time:', actualTime);
    
    const basicBooking = new Carbooking({
      customer: {
        name: userName || 'Customer',
        email: userEmail || 'customer@example.com',
        phone: '',
        address: ''
      },
      car: actualCarDetails,
      service: actualServiceDetails,
      date: actualDate,
      time: actualTime,
      status: 'pending',
      paymentStatus: 'paid',
      totalAmount: actualTotal,
      total: actualTotal,
      category: 'service',
      stripeSessionId: sessionId,
      createdAt: new Date() // Explicitly set createdAt to prevent null
    });

    await basicBooking.save();
    console.log('✅ Basic booking created with ID:', basicBooking._id);
    
        // Check if UserService already exists for this session
    console.log('🔍 Checking for existing UserService...');
    let userServiceId = null; // Declare variable FIRST
    
    const existingUserService = await UserService.findOne({ 
      stripeSessionId: sessionId // Check by session ID first
    });
    
    if (existingUserService) {
      console.log('⚠️ UserService already exists for this session:', existingUserService._id);
      userServiceId = existingUserService._id;
    } else {
      // Fallback check by user email and service
      const existingByService = await UserService.findOne({ 
        userEmail: userEmail,
        'service.label': actualServiceDetails.label || 'Service Booking',
        'service.sub': actualServiceDetails.description || 'Booking created from successful payment session'
      });
      
      if (existingByService) {
        console.log('⚠️ UserService already exists for this user and service:', existingByService._id);
        userServiceId = existingByService._id;
      }
    }
    
    if (userServiceId) {
      console.log('⚠️ UserService already exists, skipping creation');
    } else {
      console.log('🆕 Creating new UserService...');
      console.log('📝 UserService data:', {
        userId: userEmail,
        userEmail: userEmail,
        userName: userName,
        car: actualCarDetails,
        service: {
          label: actualServiceDetails.label || 'Service Booking',
          sub: actualServiceDetails.description || 'Booking created from successful payment session',
          price: actualServiceDetails.price || 100.00,
          category: 'service'
        },
        total: actualTotal,
        subtotal: actualTotal * 0.8,
        vat: actualTotal * 0.2,
        date: actualDate.toISOString().split('T')[0],
        time: actualTime,
        category: 'service',
        status: 'pending'
      });
      
      // Create UserService
      const basicUserService = new UserService({
        userId: userEmail || 'customer@example.com',
        userEmail: userEmail || 'customer@example.com',
        userName: userName || 'Customer',
        car: actualCarDetails,
        service: {
          label: actualServiceDetails.label || 'Service Booking',
          sub: actualServiceDetails.description || 'Booking created from successful payment session',
          price: actualServiceDetails.price || 100.00,
          category: 'service'
        },
        total: actualTotal,
        subtotal: actualTotal * 0.8, // 80% of total
        vat: actualTotal * 0.2, // 20% VAT
        date: actualDate.toISOString().split('T')[0],
        time: actualTime,
        category: 'service',
        status: 'pending',
        stripeSessionId: sessionId, // Add session ID to prevent duplicates
        createdAt: new Date() // Explicitly set createdAt to prevent null
      });

      try {
        await basicUserService.save();
        console.log('✅ Basic UserService created with ID:', basicUserService._id);
        userServiceId = basicUserService._id;
      } catch (userServiceError) {
        console.error('❌ Failed to create UserService:', userServiceError);
        console.error('❌ UserService error details:', {
          message: userServiceError.message,
          code: userServiceError.code,
          stack: userServiceError.stack
        });
        // Don't fail the whole request if UserService creation fails
        userServiceId = null;
      }
    }
    
    // Final verification - check if UserService was actually created
    if (userServiceId) {
      const verifyUserService = await UserService.findById(userServiceId);
      if (verifyUserService) {
        console.log('✅ UserService verification successful:', {
          id: verifyUserService._id,
          userEmail: verifyUserService.userEmail,
          total: verifyUserService.total,
          date: verifyUserService.date
        });
      } else {
        console.error('❌ UserService verification failed - not found in database');
      }
    } else {
      console.error('❌ No UserService ID returned - UserService creation failed');
    }
    
    res.json({ 
      success: true, 
      bookingId: basicBooking._id,
      userServiceId: userServiceId,
      message: 'Basic booking created successfully from session',
      data: {
        total: basicBooking.total,
        totalAmount: basicBooking.totalAmount,
        servicePrice: basicBooking.service?.price,
        userServiceCreated: !!userServiceId
      }
    });
    
  } catch (error) {
    console.error('❌ Session-based booking error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to create session-based booking', details: error.message });
  }
});

// Simple test endpoint
app.get('/api/test-payment-success', (req, res) => {
  res.json({ 
    message: 'Test endpoint working',
    timestamp: new Date().toISOString(),
    sessionId: req.query.session_id || 'test-session'
  });
});

// Direct booking creation endpoint (bypasses PaymentSuccessPage)
app.post('/api/create-booking-direct', async (req, res) => {
  try {
    const { sessionId, userEmail, userName, carDetails, serviceDetails } = req.body;
    
    console.log('🚀 Direct booking creation called with session ID:', sessionId);
    console.log('👤 User:', { email: userEmail, name: userName });
    console.log('🚗 Car Details:', carDetails);
    console.log('📦 Service Details:', serviceDetails);
    
          // Check if we have multiple services
      const hasMultipleServices = serviceDetails?.services && Array.isArray(serviceDetails.services) && serviceDetails.services.length > 1;
      console.log('🛒 Multiple services detected:', hasMultipleServices);
      if (hasMultipleServices) {
        console.log('📋 All services in cart:', serviceDetails.services.map((s) => ({
          label: s.service.label,
          price: s.service.price,
          labourHours: s.service.labourHours,
          labourCost: s.service.labourCost,
          total: s.service.price + (s.service.labourHours ? (s.service.labourHours * (s.service.labourCost || 10)) : 0)
        })));
      }
    
    // ENHANCED DUPLICATE PREVENTION: Check for bookings in the last 10 seconds
    const tenSecondsAgo = new Date(Date.now() - 10000);
    const veryRecentBooking = await Carbooking.findOne({
      'customer.email': userEmail,
      'car.registration': carDetails?.registration,
      createdAt: { $gte: tenSecondsAgo }
    });
    
    if (veryRecentBooking) {
      console.log('🚫 Very recent booking found (within 10 seconds), preventing duplicate:', veryRecentBooking._id);
      return res.json({ 
        success: true, 
        bookingId: veryRecentBooking._id,
        message: 'Very recent booking found, preventing duplicate',
        isDuplicate: true
      });
    }
    
    // Check if booking already exists for this session (PRIMARY CHECK)
    const existingBooking = await Carbooking.findOne({ 
      stripeSessionId: sessionId
    });
    
    if (existingBooking) {
      console.log('⚠️ Booking already exists for this session:', existingBooking._id);
      return res.json({ 
        success: true, 
        bookingId: existingBooking._id,
        message: 'Booking already exists for this session',
        isDuplicate: true
      });
    }
    
    // Check for any recent session-based bookings to prevent rapid duplicates
    const recentSessionBooking = await Carbooking.findOne({
      stripeSessionId: { $exists: true, $ne: null },
      createdAt: { $gte: new Date(Date.now() - 10000) } // Last 10 seconds (reduced from 30)
    });
    
    if (recentSessionBooking && recentSessionBooking.stripeSessionId !== sessionId) {
      console.log('⚠️ Recent session-based booking found, waiting before creating new one');
      return res.json({ 
        success: false, 
        message: 'Please wait a moment before creating another booking',
        isDuplicate: true
      });
    }
    
    // NOTE: Users can now book multiple services - removed restrictive checks
    
    // Parse the date
    let actualDate = new Date();
    if (carDetails?.preferredDate) {
      try {
        if (typeof carDetails.preferredDate === 'string') {
          if (carDetails.preferredDate.includes('/')) {
            const [day, month, year] = carDetails.preferredDate.split('/');
            actualDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          } else {
            actualDate = new Date(carDetails.preferredDate);
          }
        }
      } catch (dateError) {
        console.error('❌ Date parsing error:', dateError);
        actualDate = new Date();
      }
    }
    
    const actualTime = carDetails?.preferredTime || '09:00';
    const actualTotal = serviceDetails?.price || 100.00;
    
    console.log('📅 Using date:', actualDate);
    console.log('⏰ Using time:', actualTime);
    console.log('💰 Using total:', actualTotal);
    
    // NOTE: Users can now book multiple services on the same date/time
    // The unique_user_datetime constraint has been removed
    
    // Create Carbooking
    const basicBooking = new Carbooking({
      customer: {
        name: userName || 'Customer',
        email: userEmail || 'customer@example.com',
        phone: '',
        address: ''
      },
      car: carDetails,
      service: serviceDetails,
      date: actualDate,
      time: actualTime,
      status: 'pending',
      paymentStatus: 'paid',
      totalAmount: actualTotal,
      total: actualTotal,
      category: 'service',
      stripeSessionId: sessionId,
      createdAt: new Date()
    });

    // Ensure createdAt is set
    if (!basicBooking.createdAt) {
      basicBooking.createdAt = new Date();
    }

    try {
      await basicBooking.save();
      console.log('✅ Direct booking created with ID:', basicBooking._id);
    } catch (saveError) {
      // Handle duplicate key error gracefully
      if (saveError.code === 11000) {
        console.log('⚠️ Duplicate key error when saving booking, checking for existing...');
        
        // Try to find the existing booking
        const existingBooking = await Carbooking.findOne({ 
          stripeSessionId: sessionId 
        });
        
        if (existingBooking) {
          console.log('✅ Found existing booking with same session ID:', existingBooking._id);
          return res.json({ 
            success: true, 
            bookingId: existingBooking._id,
            message: 'Booking already exists for this session',
            isDuplicate: true
          });
        }
        
        // If no existing booking found, this is a real error
        console.error('❌ Duplicate key error but no existing booking found:', saveError);
        
        // Check if it's any other duplicate constraint
        if (saveError.keyPattern) {
          console.log('🚫 Duplicate key constraint violation:', saveError.keyPattern);
          
          // Try to find the existing booking with same session ID
          const existingBooking = await Carbooking.findOne({ 
            stripeSessionId: sessionId 
          });
          
          if (existingBooking) {
            console.log('✅ Found existing booking with same session ID:', existingBooking._id);
            return res.json({ 
              success: true, 
              bookingId: existingBooking._id,
              message: 'Booking already exists for this session',
              isDuplicate: true
            });
          }
        }
        
        return res.status(500).json({ 
          error: 'Failed to create booking due to duplicate constraint', 
          details: saveError.message 
        });
      }
      
      // Re-throw non-duplicate errors
      throw saveError;
    }
    
    // Create UserService records for all services
    let userServiceIds = [];
    
    if (hasMultipleServices && serviceDetails.services) {
      // Create UserService for each service in the cart
      console.log('🔄 Creating UserService records for multiple services...');
      
      for (const cartItem of serviceDetails.services) {
        const serviceTotal = cartItem.service.price + (cartItem.service.labourHours ? (cartItem.service.labourHours * (cartItem.service.labourCost || 10)) : 0);
        
        const userService = new UserService({
          userId: userEmail || 'customer@example.com',
          userEmail: userEmail || 'customer@example.com',
          userName: userName || 'Customer',
          car: carDetails,
          service: {
            label: cartItem.service.label,
            sub: cartItem.service.sub || cartItem.service.description || 'Service',
            price: cartItem.service.price,
            category: 'service',
            labourHours: cartItem.service.labourHours || 0,
            labourCost: cartItem.service.labourCost || 0
          },
          total: serviceTotal,
          subtotal: serviceTotal * 0.8,
          vat: serviceTotal * 0.2,
          date: actualDate.toISOString().split('T')[0],
          time: actualTime,
          category: 'service',
          status: 'pending',
          stripeSessionId: `${sessionId}_${cartItem.service._id}`, // Make unique per service
          createdAt: new Date()
        });

        try {
          await userService.save();
          userServiceIds.push(userService._id);
          console.log(`✅ UserService created for ${cartItem.service.label} with ID:`, userService._id);
        } catch (saveError) {
          console.error(`❌ Error saving UserService for ${cartItem.service.label}:`, saveError);
          // Continue with other services
        }
      }
      
      console.log(`✅ Created ${userServiceIds.length} UserService records for multiple services`);
    } else {
      // Create single UserService for single service
      const basicUserService = new UserService({
        userId: userEmail || 'customer@example.com',
        userEmail: userEmail || 'customer@example.com',
        userName: userName || 'Customer',
        car: carDetails,
        service: {
          label: serviceDetails?.label || 'Service Booking',
          sub: serviceDetails?.description || 'Booking created directly',
          price: serviceDetails?.price || 100.00,
          category: 'service'
        },
        total: actualTotal,
        subtotal: actualTotal * 0.8,
        vat: actualTotal * 0.2,
        date: actualDate.toISOString().split('T')[0],
        time: actualTime,
        category: 'service',
        status: 'pending',
        stripeSessionId: sessionId,
        createdAt: new Date()
      });

      try {
        await basicUserService.save();
        userServiceIds.push(basicUserService._id);
        console.log('✅ Direct UserService created with ID:', basicUserService._id);
      } catch (saveError) {
        console.error('❌ Error saving UserService:', saveError);
        // Don't fail the request if UserService creation fails
      }
    }
    
    // Send confirmation email to user
    try {
      const formattedDate = actualDate.toISOString().split('T')[0];
      const emailSent = await sendBookingConfirmationEmail(
        userEmail,
        userName,
        carDetails,
        serviceDetails,
        formattedDate,
        actualTime,
        actualTotal
      );
      
      if (emailSent) {
        console.log('📧 Confirmation email sent successfully to:', userEmail);
      } else {
        console.log('⚠️ Failed to send confirmation email to:', userEmail);
      }
    } catch (emailError) {
      console.error('❌ Error sending confirmation email:', emailError);
      // Don't fail the booking if email fails
    }
    
    res.json({ 
      success: true, 
      bookingId: basicBooking._id,
      userServiceIds: userServiceIds,
      message: hasMultipleServices ? 'Multiple services booked successfully' : 'Direct booking created successfully',
      data: {
        total: basicBooking.total,
        totalAmount: basicBooking.totalAmount,
        servicePrice: basicBooking.service?.price,
        userServiceCreated: true
      }
    });
    
  } catch (error) {
    console.error('❌ Direct booking creation error:', error);
    res.status(500).json({ error: 'Failed to create direct booking', details: error.message });
  }
});

// Comprehensive cleanup endpoint to remove all duplicates
app.delete('/api/cleanup-all-duplicates', async (req, res) => {
  try {
    console.log('🧹 Starting recent duplicate cleanup...');
    
    // Find and remove duplicates from the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const recentBookings = await Carbooking.find({
      createdAt: { $gte: oneHourAgo }
    }).sort({ createdAt: -1 });
    
    console.log(`📊 Found ${recentBookings.length} recent bookings`);
    
    // Group by session ID and remove duplicates
    const sessionGroups = {};
    let removedCount = 0;
    
    recentBookings.forEach(booking => {
      if (booking.stripeSessionId) {
        if (!sessionGroups[booking.stripeSessionId]) {
          sessionGroups[booking.stripeSessionId] = [];
        }
        sessionGroups[booking.stripeSessionId].push(booking);
      }
    });
    
    // Remove duplicates, keeping only the first one
    for (const [sessionId, bookings] of Object.entries(sessionGroups)) {
      if (bookings.length > 1) {
        console.log(`🔍 Found ${bookings.length} duplicates for session: ${sessionId}`);
        
        // Keep the first one, remove the rest
        for (let i = 1; i < bookings.length; i++) {
          await Carbooking.findByIdAndDelete(bookings[i]._id);
          removedCount++;
          console.log(`🗑️ Removed duplicate booking: ${bookings[i]._id}`);
        }
      }
    }
    
    console.log(`✅ Cleanup complete. Removed ${removedCount} duplicate records.`);
    res.json({ 
      success: true, 
      removedCount, 
      message: `Removed ${removedCount} duplicate bookings` 
    });
    
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    res.status(500).json({ error: 'Cleanup failed', details: error.message });
  }
});

// Test endpoint to manually create a booking (for debugging)
app.post('/api/test-create-booking', async (req, res) => {
  try {
    const { customerEmail, customerName, carDetails, services } = req.body;
    
    console.log('🧪 Test endpoint - Creating booking manually');
    console.log('📧 Customer Email:', customerEmail);
    console.log('🚗 Car Details:', carDetails);
    console.log('📦 Services:', services);
    
    // Check if this exact booking already exists to prevent duplicates
    const existingBooking = await Carbooking.findOne({
      'customer.email': customerEmail,
      'car.registration': carDetails?.registration,
      'service.label': services?.map(s => s.label).join(', ')
    });
    
    if (existingBooking) {
      console.log('⚠️ Duplicate booking detected, returning existing one');
      return res.json({ 
        success: true, 
        bookingId: existingBooking._id, 
        message: 'Booking already exists, returning existing booking',
        isDuplicate: true
      });
    }
    
    // Create new Carbooking record
    const newBooking = new Carbooking({
      customer: {
        name: customerName,
        email: customerEmail,
        phone: '',
        address: ''
      },
      car: {
        make: carDetails?.make || '',
        model: carDetails?.model || '',
        year: carDetails?.year || '',
        registration: carDetails?.registration || '',
        color: carDetails?.color || '',
        mileage: carDetails?.mileage || 0
      },
      service: {
        label: services?.map(s => s.label).join(', ') || 'Test Service',
        description: 'Test booking created manually',
        price: services?.reduce((sum, s) => sum + (s.price * s.quantity), 0) || 0
      },
      date: carDetails?.preferredDate ? new Date(carDetails.preferredDate) : new Date(),
      time: carDetails?.preferredTime || '09:00',
      status: 'pending',
      paymentStatus: 'paid', // Mark as paid since payment was successful
      totalAmount: services?.reduce((sum, s) => sum + (s.price * s.quantity), 0) || 0,
      total: services?.reduce((sum, s) => sum + (s.price * s.quantity), 0) || 0, // Also set total for frontend compatibility
      category: 'service' // Add category for admin dashboard filtering
    });

    console.log('📅 Creating booking with date:', newBooking.date);
    console.log('📅 Date type:', typeof newBooking.date);
    console.log('📅 Date ISO string:', newBooking.date.toISOString());
    console.log('📅 Date YYYY-MM-DD:', newBooking.date.toISOString().split('T')[0]);
    
    // Log price calculations
    const calculatedTotal = services?.reduce((sum, s) => sum + (s.price * s.quantity), 0) || 0;
    console.log('💰 Price calculation:', {
      services: services?.map(s => ({ label: s.label, price: s.price, quantity: s.quantity, subtotal: s.price * s.quantity })),
      calculatedTotal: calculatedTotal
    });
    
    // Validate services data
    if (!services || services.length === 0) {
      console.error('❌ No services provided!');
      return res.status(400).json({ error: 'No services provided' });
    }
    
    if (calculatedTotal === 0) {
      console.error('❌ Calculated total is 0! Services data:', services);
      return res.status(400).json({ error: 'Calculated total is 0, check services data' });
    }

    await newBooking.save();
    console.log('✅ Test booking created with ID:', newBooking._id);
    
    // Create UserService record
    const newUserService = new UserService({
      userId: customerEmail,
      userEmail: customerEmail,
      userName: customerName,
      car: {
        make: carDetails?.make || '',
        model: carDetails?.model || '',
        year: carDetails?.year || '',
        registration: carDetails?.registration || ''
      },
      service: {
        label: services?.map(s => s.label).join(', ') || 'Test Service',
        sub: 'Test booking created manually',
        price: services?.reduce((sum, s) => sum + (s.price * s.quantity), 0) || 0,
        category: 'service'
      },
      total: services?.reduce((sum, s) => sum + (s.price * s.quantity), 0) || 0,
      subtotal: services?.reduce((sum, s) => sum + (s.price * s.quantity), 0) || 0,
      vat: (services?.reduce((sum, s) => sum + (s.price * s.quantity), 0) || 0) * 0.2,
      date: carDetails?.preferredDate ? new Date(carDetails.preferredDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      time: carDetails?.preferredTime || '09:00',
      category: 'service',
      status: 'pending'
    });

    console.log('📝 UserService data being saved:', {
      total: newUserService.total,
      subtotal: newUserService.subtotal,
      vat: newUserService.vat,
      servicePrice: newUserService.service?.price,
      category: newUserService.category,
      status: newUserService.status
    });

    await newUserService.save();
    console.log('✅ Test UserService created with ID:', newUserService._id);
    
    res.json({ 
      success: true, 
      bookingId: newBooking._id, 
      userServiceId: newUserService._id,
      message: 'Test booking created successfully'
    });
    
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to create test booking', details: error.message });
  }
});

// Cleanup endpoint to remove all temporary bookings (TEMP registrations)
app.post('/api/cleanup-temp-bookings', async (req, res) => {
  try {
    console.log('🧹 Starting cleanup of temporary bookings...');
    
    // Find all bookings with TEMP registration numbers
    const tempBookings = await Carbooking.find({
      'car.registration': { $regex: /^TEMP/ }
    });
    
    console.log('📊 Found temporary bookings:', tempBookings.length);
    
    // Remove all temporary bookings
    let removedCount = 0;
    for (const booking of tempBookings) {
      await Carbooking.findByIdAndDelete(booking._id);
      removedCount++;
      console.log(`🗑️ Removed temporary booking: ${booking._id} (${booking.car.registration})`);
    }
    
    // Also remove corresponding UserServices
    const tempUserServices = await UserService.find({
      'car.registration': { $regex: /^TEMP/ }
    });
    
    console.log('📊 Found temporary UserServices:', tempUserServices.length);
    
    for (const service of tempUserServices) {
      await UserService.findByIdAndDelete(service._id);
      removedCount++;
      console.log(`🗑️ Removed temporary UserService: ${service._id} (${service.car.registration})`);
    }
    
    console.log(`✅ Cleanup complete. Removed ${removedCount} temporary records.`);
    
    res.json({ 
      success: true, 
      removedCount,
      message: `Removed ${removedCount} temporary records`
    });
    
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    res.status(500).json({ error: 'Failed to cleanup temporary records', details: error.message });
  }
});

// Cleanup endpoint to remove duplicate bookings and UserServices
app.post('/api/cleanup-all-duplicates', async (req, res) => {
  try {
    console.log('🧹 Starting comprehensive duplicate cleanup...');
    
    // Find ALL bookings (not just recent ones)
    const allBookings = await Carbooking.find({}).sort({ createdAt: -1 });
    
    console.log('📊 Found total bookings:', allBookings.length);
    
    // Group by stripeSessionId first (most specific)
    const groupedBySession = {};
    allBookings.forEach(booking => {
      if (booking.stripeSessionId) {
        if (!groupedBySession[booking.stripeSessionId]) {
          groupedBySession[booking.stripeSessionId] = [];
        }
        groupedBySession[booking.stripeSessionId].push(booking);
      }
    });
    
    // Remove duplicates by session ID
    let duplicatesRemoved = 0;
    for (const [sessionId, bookings] of Object.entries(groupedBySession)) {
      if (bookings.length > 1) {
        console.log(`🔍 Found ${bookings.length} duplicates for session: ${sessionId}`);
        
        // Keep the first one, remove the rest
        const toRemove = bookings.slice(1);
        for (const booking of toRemove) {
          await Carbooking.findByIdAndDelete(booking._id);
          duplicatesRemoved++;
          console.log(`🗑️ Removed duplicate booking: ${booking._id} (session: ${sessionId})`);
        }
      }
    }
    
    // Group by customer email and service type (fallback)
    const groupedBookings = {};
    allBookings.forEach(booking => {
      const key = `${booking.customer?.email}-${booking.service?.label}`;
      if (!groupedBookings[key]) {
        groupedBookings[key] = [];
      }
      groupedBookings[key].push(booking);
    });
    
    // Remove duplicates, keep only the first one
    for (const [key, bookings] of Object.entries(groupedBookings)) {
      if (bookings.length > 1) {
        console.log(`🔍 Found ${bookings.length} duplicates for key: ${key}`);
        
        // Keep the first one, remove the rest
        const toRemove = bookings.slice(1);
        for (const booking of toRemove) {
          await Carbooking.findByIdAndDelete(booking._id);
          duplicatesRemoved++;
          console.log(`🗑️ Removed duplicate booking: ${booking._id}`);
        }
      }
    }
    
    // Also clean up duplicate UserServices
    const allUserServices = await UserService.find({}).sort({ createdAt: -1 });
    
    console.log('📊 Found total UserServices:', allUserServices.length);
    
    const groupedUserServices = {};
    allUserServices.forEach(service => {
      const key = `${service.userEmail}-${service.service?.label}`;
      if (!groupedUserServices[key]) {
        groupedUserServices[key] = [];
      }
      groupedUserServices[key].push(service);
    });
    
    for (const [key, services] of Object.entries(groupedUserServices)) {
      if (services.length > 1) {
        console.log(`🔍 Found ${services.length} duplicate UserServices for key: ${key}`);
        
        const toRemove = services.slice(1);
        for (const service of toRemove) {
          await UserService.findByIdAndDelete(service._id);
          duplicatesRemoved++;
          console.log(`🗑️ Removed duplicate UserService: ${service._id}`);
        }
      }
    }
    
    console.log(`✅ Comprehensive cleanup complete. Removed ${duplicatesRemoved} duplicate records.`);
    
    res.json({ 
      success: true, 
      duplicatesRemoved,
      message: `Removed ${duplicatesRemoved} duplicate records`
    });
    
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    res.status(500).json({ error: 'Failed to cleanup duplicates', details: error.message });
  }
});

// Debug endpoint to check all UserServices
app.get('/api/debug/user-services', async (req, res) => {
  try {
    console.log('🔍 Debug: Fetching all UserServices...');
    
    const allUserServices = await UserService.find({});
    console.log(`📊 Found ${allUserServices.length} UserServices`);
    
    const detailedServices = allUserServices.map(service => ({
      id: service._id,
      userEmail: service.userEmail,
      userName: service.userName,
      car: service.car,
      service: service.service,
      total: service.total,
      subtotal: service.subtotal,
      vat: service.vat,
      date: service.date,
      time: service.time,
      category: service.category,
      status: service.status
    }));
    
    console.log('📋 UserServices details:', JSON.stringify(detailedServices, null, 2));
    
    res.json({
      success: true,
      count: allUserServices.length,
      userServices: detailedServices
    });
    
  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    res.status(500).json({ error: 'Failed to fetch UserServices', details: error.message });
  }
});

// Debug endpoint to check specific user's services
app.get('/api/debug/user-services/:email', async (req, res) => {
  try {
    const { email } = req.params;
    console.log(`🔍 Debug: Fetching UserServices for ${email}...`);
    
    const userServices = await UserService.find({ userEmail: email });
    console.log(`📊 Found ${userServices.length} UserServices for ${email}`);
    
    const detailedServices = userServices.map(service => ({
      id: service._id,
      userEmail: service.userEmail,
      userName: service.userName,
      car: service.car,
      service: service.service,
      total: service.total,
      subtotal: service.subtotal,
      vat: service.vat,
      date: service.date,
      time: service.time,
      category: service.category,
      status: service.status
    }));
    
    console.log('📋 UserServices details:', JSON.stringify(detailedServices, null, 2));
    
    res.json({
      success: true,
      count: userServices.length,
      userServices: detailedServices
    });
    
  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    res.status(500).json({ error: 'Failed to fetch user services', details: error.message });
  }
});

// Message schema for booking communications
const messageSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Carbooking', required: true },
  senderId: { type: mongoose.Schema.Types.Mixed, required: true }, // Can be ObjectId for admin users or string for customers
  senderName: { type: String, required: true },
  senderEmail: { type: String, required: true },
  senderType: { type: String, enum: ['customer', 'admin'], required: true }, // Removed guest
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// Function to send message notification email
const sendMessageNotificationEmail = async (recipientEmail, recipientName, senderName, message, bookingId) => {
  try {
    const mailOptions = {
      from: 'aryanarshad5413@gmail.com',
      to: recipientEmail,
      subject: `New Message from ${senderName} - Reliable Mechanics`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Message - Reliable Mechanics</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; 
              padding: 0; 
              background-color: #111111; 
              color: #ffffff; 
              line-height: 1.6; 
            }
            .container { 
              max-width: 650px; 
              margin: 0 auto; 
              background-color: #181818; 
              border-radius: 20px; 
              overflow: hidden; 
              box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6); 
            }
            .header { 
              background: linear-gradient(135deg, #ffd700, #ffed4e); 
              padding: 40px; 
              text-align: center; 
            }
            .header h1 { 
              color: #000000; 
              margin: 0; 
              font-size: 28px; 
              font-weight: 900; 
              text-transform: uppercase; 
            }
            .content { 
              padding: 40px; 
              background-color: #181818; 
            }
            .message-box {
              background-color: #232323;
              border-radius: 12px;
              padding: 25px;
              margin: 20px 0;
              border-left: 4px solid #ffd700;
            }
            .sender-info {
              color: #ffd700;
              font-weight: 700;
              margin-bottom: 15px;
              font-size: 18px;
            }
            .message-text {
              color: #ffffff;
              font-size: 16px;
              line-height: 1.6;
            }
            .footer { 
              background-color: #000000; 
              color: #ffffff; 
              text-align: center; 
              padding: 30px; 
              border-top: 4px solid #ffd700; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>NEW MESSAGE</h1>
            </div>
            <div class="content">
              <h2 style="color: #ffd700; text-align: center; margin-bottom: 30px;">
                You have a new message from ${senderName}
              </h2>
              
              <div class="message-box">
                <div class="sender-info">From: ${senderName}</div>
                <div class="message-text">${message}</div>
              </div>
              
            
            </div>
            <div class="footer">
              <p>Thank you for choosing <strong>Reliable Mechanics</strong></p>
              <p>For any questions, please contact us at aryanarshad5413@gmail.com</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Message notification email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending message notification email:', error);
    return false;
  }
};

// API endpoint to get messages for a specific booking
app.get('/api/bookings/:bookingId/messages', async (req, res) => {
  try {
    const { bookingId } = req.params;
    console.log('🔍 Fetching messages for booking:', bookingId);
    
    // Verify booking exists
    const booking = await Carbooking.findById(bookingId);
    if (!booking) {
      console.log('❌ Booking not found:', bookingId);
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    console.log('✅ Booking found:', booking._id);
    
    // Get messages for this booking
    const messages = await Message.find({ bookingId })
      .sort({ createdAt: 1 });
    
    // If this is an admin request, mark all unread customer messages as read
    const userEmail = req.query.userEmail; // Get user email from query params
    console.log('🔍 Query parameters received:', req.query);
    console.log('🔍 userEmail from query:', userEmail);
    
    if (userEmail) {
      try {
        const adminUser = await User.findOne({ email: userEmail, role: 'admin' });
        console.log('🔍 Admin user lookup result:', adminUser ? 'Found' : 'Not found');
        
        if (adminUser) {
          // Mark all unread customer messages as read
          const updateResult = await Message.updateMany(
            { 
              bookingId, 
              senderType: 'customer',
              isRead: false 
            },
            { isRead: true }
          );
          console.log('✅ Marked customer messages as read for admin:', userEmail, 'Updated:', updateResult.modifiedCount, 'messages');
        }
      } catch (error) {
        console.log('⚠️ Could not mark messages as read:', error.message);
      }
    } else {
      console.log('⚠️ No userEmail provided in query parameters');
    }
    
    // Process messages to handle mixed senderId types
    const processedMessages = messages.map(msg => {
      const messageObj = msg.toObject();
      
      // If senderId is an ObjectId (admin user), populate user info
      if (mongoose.Types.ObjectId.isValid(msg.senderId)) {
        // This is an admin user, populate their info
        return messageObj;
      } else {
        // This is a customer message, use the stored senderName and senderEmail
        return messageObj;
      }
    });
    
    console.log('📨 Found messages:', messages.length);
    processedMessages.forEach((msg, index) => {
      console.log(`📨 Message ${index + 1}:`, {
        id: msg._id,
        sender: msg.senderName,
        type: msg.senderType,
        message: msg.message.substring(0, 50) + '...',
        createdAt: msg.createdAt
      });
    });
    
    res.json({
      success: true,
      messages: processedMessages,
      booking: {
        id: booking._id,
        customer: booking.customer,
        service: booking.service,
        date: booking.date,
        time: booking.time,
        status: booking.status
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// API endpoint to send a new message
app.post('/api/bookings/:bookingId/messages', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { message, senderName, senderEmail, senderType, senderId } = req.body;
    
    console.log('📥 Received message request:', {
      bookingId,
      message,
      senderName,
      senderEmail,
      senderType,
      senderId
    });
    
    // Verify booking exists
    const booking = await Carbooking.findById(bookingId);
    if (!booking) {
      console.log('❌ Booking not found:', bookingId);
      return res.status(404).json({ error: 'Booking not found' });
    }
    console.log('✅ Booking found:', booking._id);
    
    // Validate required fields
    if (!message || !senderName || !senderEmail || !senderType) {
      console.log('❌ Missing required fields:', { message: !!message, senderName: !!senderName, senderEmail: !!senderEmail, senderType: !!senderType });
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Find the sender user to get their ID
    let senderUserId = senderId;
    if (!senderUserId) {
      if (senderType === 'admin') {
        // Find admin user by email
        console.log('🔍 Looking for admin user with email:', senderEmail);
        let adminUser = await User.findOne({ email: senderEmail, role: 'admin' });
        
        if (!adminUser) {
          console.log('❌ Admin user not found for email:', senderEmail);
          console.log('🔍 Available admin users:');
          const allAdmins = await User.find({ role: 'admin' });
          allAdmins.forEach(admin => console.log('  -', admin.email, admin.name, admin._id));
          
          // Try to create admin user if it's the expected admin email
          if (senderEmail === 'j2mechanicslondon@gmail.com') {
            console.log('🔍 Attempting to create admin user...');
            try {
              const hashedPassword = await bcrypt.hash('j2mechanicslondon', 10);
              adminUser = new User({ 
                name: 'Admin Staff',
                email: senderEmail, 
                password: hashedPassword, 
                role: 'admin' 
              });
              await adminUser.save();
              console.log('✅ Admin user created successfully:', adminUser._id);
            } catch (createError) {
              console.error('❌ Failed to create admin user:', createError);
              return res.status(400).json({ error: 'Admin user not found and could not be created' });
            }
          } else {
            return res.status(400).json({ error: 'Admin user not found' });
          }
        }
        
        console.log('✅ Found/created admin user:', adminUser._id, adminUser.name);
        senderUserId = adminUser._id;
      } else {
        // For customers, we don't require a User account - they can send messages based on their booking
        console.log('🔍 Customer sending message from email:', senderEmail);
        
        // Check if this email matches the booking customer
        if (senderEmail !== booking.customer.email) {
          console.log('❌ Customer email does not match booking customer email');
          return res.status(400).json({ error: 'Customer email does not match booking customer email' });
        }
        
        // For customers without User accounts, we'll use a special ID format
        // This allows them to send messages without requiring a User account
        senderUserId = `customer_${bookingId}_${senderEmail}`;
        console.log('✅ Using customer identifier:', senderUserId);
      }
    }

    // Create new message
    console.log('📝 Creating new message with data:', {
      bookingId,
      senderId: senderUserId,
      senderName,
      senderEmail,
      senderType,
      messageLength: message.length
    });
    
    const newMessage = new Message({
      bookingId,
      senderId: senderUserId,
      senderName,
      senderEmail,
      senderType,
      message
    });
    
    console.log('💾 Saving message to database...');
    await newMessage.save();
    console.log('✅ Message saved successfully:', newMessage._id);
    
    // Send email notification to the other party
    let recipientEmail, recipientName;
    
    if (senderType === 'admin') {
      // Admin is sending, notify customer
      recipientEmail = booking.customer.email;
      recipientName = booking.customer.name;
    } else {
      // Customer is sending, notify admin
      recipientEmail = 'aryanarshad5413@gmail.com'; // Default admin email
      recipientName = 'Admin Staff';
    }
    
    // Send email notification
    await sendMessageNotificationEmail(recipientEmail, recipientName, senderName, message, bookingId);
    
    res.json({
      success: true,
      message: newMessage,
      notificationSent: true
    });
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// API endpoint to mark messages as read for a specific booking
app.put('/api/bookings/:bookingId/messages/read', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { userEmail } = req.body;
    
    console.log('📖 Marking messages as read for booking:', bookingId, 'by user:', userEmail);
    
    // Verify booking exists
    const booking = await Carbooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Verify user email matches booking customer email
    if (userEmail !== booking.customer.email) {
      return res.status(403).json({ error: 'Unauthorized to mark messages as read for this booking' });
    }
    
    // Find all messages for this booking
    const messages = await Message.find({ bookingId });
    console.log('🔍 Found', messages.length, 'messages for this booking');
    
    // Log message details for debugging
    messages.forEach((msg, index) => {
      console.log(`📝 Message ${index + 1}:`, {
        senderEmail: msg.senderEmail,
        userEmail: userEmail,
        isRead: msg.isRead,
        willBeMarked: msg.senderEmail !== userEmail
      });
    });
    
    // Mark all messages as read for this user
    const updateResult = await Message.updateMany(
      { 
        bookingId,
        senderEmail: { $ne: userEmail } // Only mark messages from others as read
      },
      { 
        $set: { 
          isRead: true
        }
      }
    );
    
    console.log('✅ Marked', updateResult.modifiedCount, 'messages as read');
    
    // Verify the update worked by checking a few messages
    const updatedMessages = await Message.find({ 
      bookingId,
      senderEmail: { $ne: userEmail }
    });
    
    console.log('🔍 Verification - Updated messages:');
    updatedMessages.forEach((msg, index) => {
      console.log(`📝 Message ${index + 1}:`, {
        senderEmail: msg.senderEmail,
        isRead: msg.isRead,
        message: msg.message.substring(0, 20) + '...'
      });
    });
    
    // Return the updated unread count for this booking
    const updatedUnreadCount = await Message.countDocuments({
      bookingId,
      senderEmail: { $ne: userEmail }, // Messages from others
      isRead: false
    });
    
    console.log('📊 Final unread count:', updatedUnreadCount);
    
    res.json({
      success: true,
      messagesMarkedAsRead: updateResult.modifiedCount,
      updatedUnreadCount: updatedUnreadCount
    });
    
  } catch (error) {
    console.error('❌ Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});





// API endpoint to get unread messages count for admin
app.get('/api/admin/unread-messages', async (req, res) => {
  try {
    const count = await Message.countDocuments({
      senderType: 'customer', // Admin wants to see customer messages
      isRead: false
    });
    
    res.json({
      success: true,
      count
    });
    
  } catch (error) {
    console.error('❌ Error fetching unread messages count:', error);
    res.status(500).json({ error: 'Failed to fetch unread messages count' });
  }
});

// Test endpoint to check message schema and unread counts
app.get('/api/test-messages/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    console.log('🧪 Testing messages for booking:', bookingId);
    
    // Get all messages for this booking
    const messages = await Message.find({ bookingId });
    console.log('🧪 Found', messages.length, 'messages');
    
    // Log each message's details
    messages.forEach((msg, index) => {
      console.log(`🧪 Message ${index + 1}:`, {
        id: msg._id,
        senderEmail: msg.senderEmail,
        senderType: msg.senderType,
        isRead: msg.isRead,
        message: msg.message.substring(0, 30) + '...',
        createdAt: msg.createdAt
      });
    });
    
    // Count unread messages
    const unreadCount = await Message.countDocuments({
      bookingId,
      isRead: false
    });
    
    console.log('🧪 Total unread count:', unreadCount);
    
    res.json({
      success: true,
      messageCount: messages.length,
      unreadCount: unreadCount,
      messages: messages.map(msg => ({
        id: msg._id,
        senderEmail: msg.senderEmail,
        senderType: msg.senderType,
        isRead: msg.isRead,
        message: msg.message.substring(0, 30) + '...'
      }))
    });
    
  } catch (error) {
    console.error('🧪 Test error:', error);
    res.status(500).json({ error: 'Test failed', details: error.message });
  }
});

// Test endpoint for email functionality
app.post('/api/test-email', async (req, res) => {
  try {
    const { userEmail, userName, carDetails, serviceDetails, bookingDate, bookingTime, totalAmount } = req.body;
    console.log('🧪 Testing email sending:', { userEmail, userName, carDetails, serviceDetails, bookingDate, bookingTime, totalAmount });
    
    const emailSent = await sendBookingConfirmationEmail(
      userEmail || 'test@example.com',
      userName || 'Test User',
      carDetails || { make: 'Test Car', model: 'Test Model', year: '2020', registration: 'TEST123' },
      serviceDetails || { label: 'Test Service', description: 'Test Description', price: 100 },
      bookingDate || '2025-08-25',
      bookingTime || '09:00',
      totalAmount || 100
    );
    
    if (emailSent) {
      console.log('✅ Test email sent successfully');
      res.json({ success: true, message: 'Test email sent successfully' });
    } else {
      console.log('❌ Test email failed to send');
      res.json({ success: false, message: 'Test email failed to send' });
    }
    
  } catch (error) {
    console.error('❌ Test email error:', error);
    res.status(500).json({ error: 'Test email failed', details: error.message });
  }
});

// Test endpoint to simulate email reply (for testing purposes)
app.post('/api/test-email-reply', async (req, res) => {
  try {
    const { bookingId, customerEmail, message, customerName } = req.body;
    console.log('🧪 Testing email reply:', { bookingId, customerEmail, message, customerName });
    
    // Call the actual email reply endpoint
    const response = await fetch(`http://localhost:5001/api/email-reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, customerEmail, message, customerName })
    });
    
    const result = await response.json();
    console.log('🧪 Test result:', result);
    
    res.json({
      success: true,
      testResult: result,
      message: 'Email reply test completed'
    });
    
  } catch (error) {
    console.error('❌ Test email reply error:', error);
    res.status(500).json({ error: 'Test failed', details: error.message });
  }
});

// API endpoint to handle email replies (webhook for email service)
app.post('/api/email-reply', async (req, res) => {
  try {
    const { bookingId, customerEmail, message, customerName } = req.body;
    console.log('📧 Processing email reply:', { bookingId, customerEmail, messageLength: message?.length, customerName });
    
    // Validate required fields
    if (!bookingId || !customerEmail || !message) {
      console.log('❌ Missing required fields:', { bookingId, customerEmail, message: !!message });
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Verify booking exists and customer email matches
    console.log('🔍 Looking for booking:', bookingId);
    const booking = await Carbooking.findById(bookingId);
    if (!booking) {
      console.log('❌ Booking not found:', bookingId);
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    console.log('✅ Booking found:', booking._id);
    console.log('📧 Customer email from booking:', booking.customer.email);
    console.log('📧 Customer email from request:', customerEmail);
    
    if (booking.customer.email !== customerEmail) {
      console.log('❌ Email mismatch:', { bookingEmail: booking.customer.email, requestEmail: customerEmail });
      return res.status(403).json({ error: 'Email does not match booking' });
    }
    
    // Use booking customer info instead of requiring a User account
    const customerNameToUse = customerName || booking.customer.name;
    const customerEmailToUse = customerEmail;
    
    console.log('✅ Using customer info from booking:', { name: customerNameToUse, email: customerEmailToUse });
    
    // Create new message from customer
    console.log('📝 Creating message from email reply...');
    const newMessage = new Message({
      bookingId,
      senderId: `customer_${bookingId}_${customerEmailToUse}`, // Use the same format as direct messages
      senderName: customerNameToUse,
      senderEmail: customerEmailToUse,
      senderType: 'customer',
      message
    });
    
    console.log('💾 Saving email reply message...');
    await newMessage.save();
    console.log('✅ Email reply message saved:', newMessage._id);
    
    // Send email notification to admin
    console.log('📧 Sending notification to admin...');
    await sendMessageNotificationEmail(
      'aryanarshad5413@gmail.com', 
      'Admin Staff', 
      customerNameToUse, 
      message, 
      bookingId
    );
    console.log('✅ Admin notification sent');
    
    res.json({
      success: true,
      message: newMessage,
      notificationSent: true
    });
    
  } catch (error) {
    console.error('❌ Error processing email reply:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to process email reply' });
  }
});

// API endpoint to get all bookings with unread message counts for a user
app.get('/api/user/:email/bookings-with-messages', async (req, res) => {
  try {
    const { email } = req.params;
    
    // Get all bookings for this user
    const bookings = await Carbooking.find({ 'customer.email': email });
    
    // Get message counts and last message for each booking
    const bookingsWithMessages = await Promise.all(
      bookings.map(async (booking) => {
        const unreadCount = await Message.countDocuments({
          bookingId: booking._id,
          senderEmail: { $ne: booking.customer.email }, // Messages from others (not from customer)
          isRead: false
        });
        
        const lastMessage = await Message.findOne({ bookingId: booking._id })
          .sort({ createdAt: -1 });
        
        return {
          ...booking.toObject(),
          unreadMessageCount: unreadCount,
          lastMessage: lastMessage ? {
            message: lastMessage.message,
            senderName: lastMessage.senderName,
            createdAt: lastMessage.createdAt
          } : null,
          lastMessageTime: lastMessage ? lastMessage.createdAt : booking.createdAt
        };
      })
    );
    
    // Sort bookings by most recent message activity (recent conversations first)
    const sortedBookings = bookingsWithMessages.sort((a, b) => {
      // First priority: bookings with messages vs without messages
      if (a.lastMessage && !b.lastMessage) return -1; // a has messages, b doesn't
      if (!a.lastMessage && b.lastMessage) return 1;  // b has messages, a doesn't
      
      // Second priority: if both have messages, sort by most recent message
      if (a.lastMessage && b.lastMessage) {
        return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
      }
      
      // Third priority: if neither has messages, sort by booking creation date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    // Log the sorting results for debugging
    console.log('📱 Client dashboard sorting results:');
    sortedBookings.forEach((booking, index) => {
      const hasMessages = booking.lastMessage ? '✅' : '❌';
      const lastMessageTime = booking.lastMessage ? 
        new Date(booking.lastMessage.createdAt).toLocaleString() : 'No messages';
      console.log(`${index + 1}. ${hasMessages} ${booking.service.label} - ${lastMessageTime}`);
    });
    
    res.json({
      success: true,
      bookings: sortedBookings
    });
    
  } catch (error) {
    console.error('❌ Error fetching bookings with messages:', error);
    res.status(500).json({ error: 'Failed to fetch bookings with messages' });
  }
});

// API endpoint to get recent conversations for admin (sorted by most recent activity)
app.get('/api/admin/recent-conversations', async (req, res) => {
  try {
    // Use a simpler approach: get all bookings and then filter those with messages
    console.log('🔍 Starting Recent Conversations fetch...');
    
    // First, get all bookings
    const allBookings = await Carbooking.find({});
    console.log(`🔍 Found ${allBookings.length} total bookings`);
    
    // Get all messages
    const allMessages = await Message.find({});
    console.log(`🔍 Found ${allMessages.length} total messages`);
    
    // Debug: Show some sample message data
    console.log('🔍 Sample messages:');
    allMessages.slice(0, 3).forEach((msg, i) => {
      console.log(`  Message ${i + 1}:`, {
        id: msg._id,
        bookingId: msg.bookingId,
        bookingIdType: typeof msg.bookingId,
        senderName: msg.senderName,
        senderType: msg.senderType
      });
    });
    
    // Debug: Show some sample booking data
    console.log('🔍 Sample bookings:');
    allBookings.slice(0, 3).forEach((booking, i) => {
      console.log(`  Booking ${i + 1}:`, {
        id: booking._id,
        idType: typeof booking._id,
        idString: booking._id.toString(),
        service: booking.service?.label
      });
    });
    
    // Create a map of booking IDs to their messages
    const bookingMessagesMap = new Map();
    allMessages.forEach(message => {
      // Convert both IDs to strings for comparison
      const messageBookingId = String(message.bookingId);
      if (!bookingMessagesMap.has(messageBookingId)) {
        bookingMessagesMap.set(messageBookingId, []);
      }
      bookingMessagesMap.get(messageBookingId).push(message);
    });
    
    console.log('🔍 Booking messages map created with keys:', Array.from(bookingMessagesMap.keys()));
    
    // Filter bookings that have messages and add message info
    const bookingsWithMessages = allBookings
      .filter(booking => {
        const bookingIdString = String(booking._id);
        const messages = bookingMessagesMap.get(bookingIdString);
        const hasMessages = messages && messages.length > 0;
        console.log(`🔍 Booking ${bookingIdString} has messages: ${hasMessages} (${messages?.length || 0} messages)`);
        return hasMessages;
      })
      .map(booking => {
        const messages = bookingMessagesMap.get(String(booking._id));
        const lastMessage = messages[messages.length - 1];
        const unreadCount = messages.filter(msg => 
          !msg.isRead && msg.senderType === 'customer'
        ).length;
        
        // Debug: Check what fields are available in the booking
        console.log(`🔍 Raw booking ${booking._id}:`, {
          hasCar: !!booking.car,
          carKeys: booking.car ? Object.keys(booking.car) : 'NO CAR',
          carReg: booking.car?.registration,
          service: booking.service?.label,
          allKeys: Object.keys(booking.toObject())
        });
        
        // Ensure we preserve ALL the original booking data including car
        const result = {
          ...booking.toObject(), // This preserves ALL fields including car
          lastMessage: {
            _id: lastMessage._id,
            message: lastMessage.message,
            senderName: lastMessage.senderName,
            createdAt: lastMessage.createdAt
          },
          messageCount: messages.length,
          unreadCount: unreadCount
        };
        
        console.log(`🔍 Processed booking ${booking._id}:`, {
          hasCar: !!result.car,
          carKeys: result.car ? Object.keys(result.car) : 'NO CAR',
          carReg: result.car?.registration,
          service: result.service?.label
        });
        
        return result;
      })
      .sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));
    
    console.log(`🔍 Found ${bookingsWithMessages.length} bookings with messages`);
    
    // Debug: Log the car data being returned
    console.log('🔍 Recent Conversations - Car data debug:');
    bookingsWithMessages.forEach((conversation, index) => {
      console.log(`🔍 Conversation ${index + 1}:`, {
        id: conversation._id,
        service: conversation.service?.label,
        car: conversation.car,
        carReg: conversation.car?.registration,
        hasCar: !!conversation.car,
        hasCarReg: !!conversation.car?.registration
      });
    });
    
    res.json({
      success: true,
      conversations: bookingsWithMessages
    });
  } catch (error) {
    console.error('Error fetching recent conversations:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch recent conversations' });
  }
});

// Test endpoint to check message functionality
app.get('/api/test-message-system', async (req, res) => {
  try {
    console.log('🧪 Testing message system...');
    
    // Check if we can connect to MongoDB
    const mongoStatus = mongoose.connection.readyState;
    console.log('🧪 MongoDB connection status:', mongoStatus);
    
    // Check if we have any users
    const userCount = await User.countDocuments();
    console.log('🧪 Total users in database:', userCount);
    
    // Check if we have any admin users
    const adminUsers = await User.find({ role: 'admin' });
    console.log('🧪 Admin users:', adminUsers.map(u => ({ id: u._id, email: u.email, name: u.name })));
    
    // Check if we have any bookings
    const bookingCount = await Carbooking.countDocuments();
    console.log('🧪 Total bookings in database:', bookingCount);
    
    // Check if we have any messages
    const messageCount = await Message.countDocuments();
    console.log('🧪 Total messages in database:', messageCount);
    
    // Check if we have any recent messages
    const recentMessages = await Message.find().sort({ createdAt: -1 }).limit(5);
    console.log('🧪 Recent messages:', recentMessages.map(m => ({
      id: m._id,
      bookingId: m.bookingId,
      senderName: m.senderName,
      senderEmail: m.senderEmail,
      senderType: m.senderType,
      message: m.message.substring(0, 50) + '...',
      createdAt: m.createdAt
    })));
    
    res.json({
      success: true,
      mongoStatus,
      userCount,
      adminUsers: adminUsers.map(u => ({ id: u._id, email: u.email, name: u.name })),
      bookingCount,
      messageCount,
      recentMessages: recentMessages.map(m => ({
        id: m._id,
        bookingId: m.bookingId,
        senderName: m.senderName,
        senderEmail: m.senderEmail,
        senderType: m.senderType,
        message: m.message.substring(0, 50) + '...',
        createdAt: m.createdAt
      }))
    });
  } catch (error) {
    console.error('❌ Error testing message system:', error);
    res.status(500).json({ error: 'Failed to test message system', details: error.message });
  }
});

// Save service images endpoint (for Vercel compatibility)
app.post('/api/save-service-images', async (req, res) => {
  try {
    console.log("💾 Saving service images to database");
    const { images } = req.body;
    
    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ message: 'Images array is required.' });
    }
    
    const imageDocs = images.map(img => ({
      userId: img.userId,
      serviceId: img.serviceId,
      imageUrl: img.imageUrl
    }));
    
    console.log("💾 Saving image documents:", imageDocs);
    await ServiceImage.insertMany(imageDocs);
    
    console.log("✅ Service images saved successfully");
    res.status(200).json({ message: 'Service images saved!', images: imageDocs });
    
  } catch (err) {
    console.error('❌ Save service images error:', err);
    res.status(500).json({ message: 'Failed to save service images', error: err.message });
  }
});

// Endpoint to fix image associations
app.post('/api/fix-image-associations', async (req, res) => {
  try {
    console.log('🔧 Starting image association fix...');
    
    const result = await cleanupIncorrectlyAssociatedImages();
    
    res.json({ 
      message: 'Image associations fixed successfully!',
      result: result
    });
    
  } catch (err) {
    console.error('❌ Fix image associations error:', err);
    res.status(500).json({ message: 'Failed to fix image associations', error: err.message });
  }
});

// Export for Vercel deployment
module.exports = app;

// Test endpoint to verify backend is working
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debug endpoint to list all service images
app.get('/api/debug/service-images', async (req, res) => {
  try {
    console.log('🔍 Debug: Listing all service images');
    
    const images = await ServiceImage.find({}).sort({ uploadedAt: -1 });
    
    // Group images by serviceId to show duplicates
    const imagesByService = {};
    images.forEach(img => {
      if (!imagesByService[img.serviceId]) {
        imagesByService[img.serviceId] = img.userId || 'NO_USER_ID';
      }
    });
    
    // Find potential duplicates (same imageUrl across different services)
    const imageUrlMap = {};
    images.forEach(img => {
      if (!imageUrlMap[img.imageUrl]) {
        imageUrlMap[img.imageUrl] = [];
      }
      imageUrlMap[img.imageUrl].push(img);
    });
    
    const duplicates = Object.entries(imageUrlMap).filter(([url, imgs]) => imgs.length > 1);
    
    // Get detailed information about each image's association
    const detailedImages = await Promise.all(images.map(async (img) => {
      const carbooking = await Carbooking.findById(img.serviceId);
      return {
        id: img._id,
        serviceId: img.serviceId,
        userId: img.userId,
        imageUrl: img.imageUrl,
        uploadedAt: img.uploadedAt,
        carbooking: carbooking ? {
          carRegistration: carbooking.car?.registration,
          customerEmail: carbooking.customer?.email,
          serviceLabel: carbooking.service?.label,
          date: carbooking.date
        } : null
      };
    }));
    
    res.json({
      totalImages: images.length,
      imagesByService: imagesByService,
      potentialDuplicates: duplicates.map(([url, imgs]) => ({
        imageUrl: url,
        services: imgs.map(img => ({
          id: img._id,
          serviceId: img.serviceId,
          userId: img.userId,
          uploadedAt: img.uploadedAt
        }))
      })),
      allImages: detailedImages
    });
    
  } catch (err) {
    console.error('❌ Debug endpoint error:', err);
    res.status(500).json({ error: 'Debug endpoint failed', details: err.message });
  }
});

// Get user services with images by email
app.get('/api/user-services-with-images/:email', async (req, res) => {
  try {
    const { email } = req.params;
    console.log('🔍 Fetching services with images for email:', email);
    
    // Get user services
    const userServices = await UserService.find({ 
      userEmail: { $regex: new RegExp(email, 'i') } 
    }).sort({ createdAt: -1 });
    
    console.log('📦 Found user services:', userServices.length);
    
    // Get images for each service by looking up the corresponding Carbooking
    const servicesWithImages = await Promise.all(
      userServices.map(async (service) => {
        console.log('🔍 Processing service:', service._id, 'for car:', service.car?.registration);
        
        // Find the corresponding Carbooking by matching car registration and customer email
        const carbooking = await Carbooking.findOne({
          'car.registration': service.car.registration,
          'customer.email': email,
          'service.label': service.service.label,
          date: service.date
        });
        
        let images = [];
        if (carbooking) {
          // Get images using the Carbooking ID
          images = await ServiceImage.find({ 
            serviceId: carbooking._id.toString(),
            userId: email 
          }).sort({ uploadedAt: -1 });
        } else {
          // Try alternative approach: look for images by service label and user
          images = await ServiceImage.find({ 
            userId: email 
          }).sort({ uploadedAt: -1 });
          console.log('🔍 Alternative search found images:', images.length);
        }
        
        return {
          ...service.toObject(),
          images: images
        };
      })
    );
    
    console.log('✅ Returning services with images:', servicesWithImages.length);
    res.json(servicesWithImages);
    
  } catch (err) {
    console.error('❌ Error in user-services-with-images:', err);
    res.status(500).json({ error: 'Failed to fetch user services with images', details: err.message });
  }
});

// Admin endpoint to search services with images
app.get('/api/admin/search-services-with-images', async (req, res) => {
  try {
    const { email, registration, serviceLabel, date } = req.query;
    console.log('🔍 Admin searching services with filters:', { email, registration, serviceLabel, date });
    
    // Build search query
    let searchQuery = {};
    
    if (email) {
      searchQuery['customer.email'] = { $regex: new RegExp(email, 'i') };
    }
    
    if (registration) {
      searchQuery['car.registration'] = { $regex: new RegExp(registration, 'i') };
    }
    
    if (serviceLabel) {
      searchQuery['service.label'] = { $regex: new RegExp(serviceLabel, 'i') };
    }
    
    if (date) {
      searchQuery.date = date;
    }
    
    console.log('🔍 Search query:', searchQuery);
    
    // Find Carbookings matching the search criteria
    const carbookings = await Carbooking.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(50); // Limit results
    
    console.log('📦 Found carbookings:', carbookings.length);
    
    // Get images for each carbooking
    const servicesWithImages = await Promise.all(
      carbookings.map(async (carbooking) => {
        const images = await ServiceImage.find({ 
          serviceId: carbooking._id.toString()
        }).sort({ uploadedAt: -1 });
        
        return {
          ...carbooking.toObject(),
          images: images,
          imageCount: images.length
        };
      })
    );
    
    console.log('✅ Returning services with images:', servicesWithImages.length);
    res.json({
      count: servicesWithImages.length,
      services: servicesWithImages
    });
    
  } catch (err) {
    console.error('❌ Admin search error:', err);
    res.status(500).json({ error: 'Admin search failed', details: err.message });
  }
});

// Test image upload endpoint
app.post('/api/test-image-upload', upload.single('image'), async (req, res) => {
  try {
    console.log('🧪 Test image upload received');
    console.log('📁 File:', req.file);
    console.log('📋 Body:', req.body);
    
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    res.json({ 
      message: 'Test upload successful',
      file: {
        filename: req.file.filename,
        path: req.file.path,
        url: req.file.url,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
    
  } catch (err) {
    console.error('❌ Test upload error:', err);
    res.status(500).json({ error: 'Test upload failed', details: err.message });
  }
});

// Manual cleanup endpoint for testing
app.post('/api/cleanup-duplicate-images', async (req, res) => {
  try {
    console.log('🧹 Manual cleanup endpoint called');
    await cleanupDuplicateImages();
    res.status(200).json({ message: 'Duplicate image cleanup completed successfully' });
  } catch (err) {
    console.error('❌ Cleanup failed:', err);
    res.status(500).json({ message: 'Cleanup failed', error: err.message });
  }
});

// Fix existing UserService documents with missing labour information
app.post('/api/fix-user-service-labour', async (req, res) => {
  try {
    console.log('🔧 Starting UserService labour information fix...');
    
    // Get all UserService documents
    const userServices = await UserService.find({});
    console.log('📋 Total UserServices found:', userServices.length);
    
    let updatedCount = 0;
    
    for (const userService of userServices) {
      if (!userService.labourHours || !userService.labourCost) {
        try {
          const serviceLabel = userService.service?.label;
          if (serviceLabel) {
            // Look up the service definition
            const serviceDefinition = await Service.findOne({ label: serviceLabel });
            if (serviceDefinition && (serviceDefinition.labourHours || serviceDefinition.labourCost)) {
              console.log('🔧 Updating UserService for service:', serviceLabel, {
                oldLabourHours: userService.labourHours,
                oldLabourCost: userService.labourCost,
                newLabourHours: serviceDefinition.labourHours,
                newLabourCost: serviceDefinition.labourCost
              });
              
              // Update the UserService
              await UserService.findByIdAndUpdate(userService._id, {
                labourHours: serviceDefinition.labourHours || 0,
                labourCost: serviceDefinition.labourCost || 0
              });
              
              updatedCount++;
            }
          }
        } catch (updateError) {
          console.log('⚠️ Could not update UserService:', userService._id, updateError.message);
        }
      }
    }
    
    console.log('✅ UserService labour fix completed. Updated:', updatedCount, 'documents');
    res.json({ message: 'Labour information fix completed', updatedCount });
  } catch (error) {
    console.error('❌ Error during UserService labour fix:', error);
    res.status(500).json({ error: 'Labour fix failed', details: error.message });
  }
});

// Debug endpoint to check image linking
app.get('/api/debug/image-linking/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    console.log('🔍 Debug: Checking image linking for service:', serviceId);
    
    // Check if service exists
    const carbooking = await Carbooking.findById(serviceId);
    if (!carbooking) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    // Check for images
    const images = await ServiceImage.find({ serviceId: serviceId.toString() });
    
    // Check for UserService
    const userService = await UserService.findOne({
      'car.registration': carbooking.car.registration,
      'customer.email': carbooking.customer.email,
      'service.label': carbooking.service.label,
      date: carbooking.date
    });
    
    res.json({
      serviceId: serviceId,
      carbooking: {
        id: carbooking._id,
        carRegistration: carbooking.car.registration,
        customerEmail: carbooking.customer.email,
        serviceLabel: carbooking.service.label,
        date: carbooking.date,
        status: carbooking.status
      },
      userService: userService ? {
        id: userService._id,
        carRegistration: userService.car.registration,
        userEmail: userService.userEmail,
        serviceLabel: userService.service.label,
        date: userService.date
      } : null,
      images: {
        count: images.length,
        images: images.map(img => ({
          id: img._id,
          serviceId: img.serviceId,
          userId: img.userId,
          uploadedAt: img.uploadedAt
        }))
      },
      linkingStatus: {
        hasCarbooking: !!carbooking,
        hasUserService: !!userService,
        hasImages: images.length > 0,
        imageServiceIdMatch: images.every(img => img.serviceId === serviceId.toString())
      }
    });
    
  } catch (err) {
    console.error('❌ Debug endpoint error:', err);
    res.status(500).json({ error: 'Debug endpoint failed', details: err.message });
  }
});

// Admin endpoint to get services for adding images (filtered and validated)
app.get('/api/admin/services-for-images', async (req, res) => {
  try {
    const { email, registration, serviceLabel, date, limit = 20 } = req.query;
    console.log('🔍 Admin getting services for images with filters:', { email, registration, serviceLabel, date, limit });
    
    // Build search query - more restrictive for image uploads
    let searchQuery = {};
    
    if (email) {
      searchQuery['customer.email'] = { $regex: new RegExp(email, 'i') };
    }
    
    if (registration) {
      searchQuery['car.registration'] = { $regex: new RegExp(registration, 'i') };
    }
    
    if (serviceLabel) {
      searchQuery['service.label'] = { $regex: new RegExp(serviceLabel, 'i') };
    }
    
    if (date) {
      searchQuery.date = date;
    }
    
    // Only show completed or in-progress services (not cancelled/failed)
    searchQuery.status = { $in: ['completed', 'in-progress', 'pending'] };
    
    console.log('🔍 Services for images query:', searchQuery);
    
    // Find Carbookings matching the search criteria
    const carbookings = await Carbooking.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('_id customer car service date time status totalAmount');
    
    console.log('📦 Found carbookings for images:', carbookings.length);
    
    // Get image count for each service
    const servicesWithImageCount = await Promise.all(
      carbookings.map(async (carbooking) => {
        const imageCount = await ServiceImage.countDocuments({ 
          serviceId: carbooking._id.toString()
        });
        
        return {
          _id: carbooking._id,
          customer: carbooking.customer,
          car: carbooking.car,
          service: carbooking.service,
          date: carbooking.date,
          time: carbooking.time,
          status: carbooking.status,
          totalAmount: carbooking.totalAmount,
          imageCount: imageCount,
          hasImages: imageCount > 0
        };
      })
    );
    
    console.log('✅ Returning services for images:', servicesWithImageCount.length);
    res.json({
      count: servicesWithImageCount.length,
      services: servicesWithImageCount
    });
    
  } catch (err) {
    console.error('❌ Admin services for images error:', err);
    res.status(500).json({ error: 'Failed to get services for images', details: err.message });
  }
});

// Admin endpoint to search services with images
app.get('/api/admin/search-services-with-images', async (req, res) => {
  try {
    const { email, registration, serviceLabel, date } = req.query;
    console.log('🔍 Admin searching services with filters:', { email, registration, serviceLabel, date });
    
    // Build search query
    let searchQuery = {};
    
    if (email) {
      searchQuery['customer.email'] = { $regex: new RegExp(email, 'i') };
    }
    
    if (registration) {
      searchQuery['car.registration'] = { $regex: new RegExp(registration, 'i') };
    }
    
    if (serviceLabel) {
      searchQuery['service.label'] = { $regex: new RegExp(serviceLabel, 'i') };
    }
    
    if (date) {
      searchQuery.date = date;
    }
    
    console.log('🔍 Search query:', searchQuery);
    
    // Find Carbookings matching the search criteria
    const carbookings = await Carbooking.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(50); // Limit results
    
    console.log('📦 Found carbookings:', carbookings.length);
    
    // Get images for each carbooking
    const servicesWithImages = await Promise.all(
      carbookings.map(async (carbooking) => {
        const images = await ServiceImage.find({ 
          serviceId: carbooking._id.toString()
        }).sort({ uploadedAt: -1 });
        
        return {
          ...carbooking.toObject(),
          images: images,
          imageCount: images.length
        };
      })
    );
    
    console.log('✅ Returning services with images:', servicesWithImages.length);
    res.json({
      count: servicesWithImages.length,
      services: servicesWithImages
    });
    
  } catch (err) {
    console.error('❌ Admin search error:', err);
    res.status(500).json({ error: 'Admin search failed', details: err.message });
  }
});

// Initialize MongoDB connection
connectToMongoDB().catch(console.error);

// Export for Vercel
module.exports = app;
// Maintenance Reminders API
app.get('/api/maintenance-reminders/:userEmail', async (req, res) => {
  try {
    const userEmail = req.params.userEmail;
    const userServices = await UserService.find({ 
      userEmail: { $regex: new RegExp(userEmail, 'i') } 
    }).sort({ createdAt: -1 });

    const reminders = generateMaintenanceReminders(userServices);
    res.json(reminders);
  } catch (err) {
    console.error('Error fetching maintenance reminders:', err);
    res.status(500).json({ error: 'Failed to fetch maintenance reminders', details: err.message });
  }
});

function generateMaintenanceReminders(services) {
  const reminders = [];
  const currentDate = new Date();
  
  // Define maintenance intervals (in days)
  const maintenanceIntervals = {
    'Oil Change': 90, // 3 months
    'Brake Check': 180, // 6 months
    'Tire Inspection': 90, // 3 months
    'Engine Service': 365, // 1 year
    'Transmission Service': 365, // 1 year
    'Coolant Flush': 365, // 1 year
    'Air Filter': 180, // 6 months
    'Spark Plugs': 365, // 1 year
    'Battery Check': 180, // 6 months
    'Suspension Check': 180, // 6 months
    'Brake Service': 180, // 6 months
    'Clutch Service': 365, // 1 year
    'Timing Belt': 730, // 2 years
    'Fuel Filter': 365, // 1 year
    'Power Steering': 365, // 1 year
    'AC Service': 365, // 1 year
  };

  // Group services by car registration
  const servicesByCar = services.reduce((acc, service) => {
    const reg = service.car?.registration || 'Unknown';
    if (!acc[reg]) acc[reg] = [];
    acc[reg].push(service);
    return acc;
  }, {});

  Object.entries(servicesByCar).forEach(([registration, carServices]) => {
    // Group by service type
    const servicesByType = carServices.reduce((acc, service) => {
      const serviceLabel = service.service?.label || service.services?.[0]?.label || 'Unknown Service';
      if (!acc[serviceLabel]) acc[serviceLabel] = [];
      acc[serviceLabel].push(service);
      return acc;
    }, {});

    Object.entries(servicesByType).forEach(([serviceType, serviceList]) => {
      // Get the most recent service of this type
      const lastService = serviceList.sort((a, b) => 
        new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()
      )[0];

      const lastServiceDate = new Date(lastService.date || lastService.createdAt);
      const interval = maintenanceIntervals[serviceType] || 180; // Default 6 months
      const nextDueDate = new Date(lastServiceDate.getTime() + (interval * 24 * 60 * 60 * 1000));
      const daysUntilDue = Math.ceil((nextDueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

      let priority = 'low';
      if (daysUntilDue <= 7) priority = 'high';
      else if (daysUntilDue <= 30) priority = 'medium';

      reminders.push({
        service: serviceType,
        lastServiceDate: lastServiceDate.toISOString().split('T')[0],
        nextDueDate: nextDueDate.toISOString().split('T')[0],
        daysUntilDue,
        priority,
        category: lastService.service?.category || lastService.services?.[0]?.category || 'Maintenance',
        carRegistration: registration,
        carDetails: {
          make: lastService.car?.make || 'Unknown',
          model: lastService.car?.model || 'Unknown',
          year: lastService.car?.year || 'Unknown'
        }
      });
    });
  });

  // Sort by priority and days until due
  reminders.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.daysUntilDue - b.daysUntilDue;
  });

  return reminders;
}

