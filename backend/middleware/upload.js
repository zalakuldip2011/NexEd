const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage for avatars
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename: userId-timestamp.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    // Use req.user.id if available, otherwise use 'user'
    const userId = req.user && req.user.id ? req.user.id : 'user';
    cb(null, `avatar-${userId}-${uniqueSuffix}${ext}`);
  }
});

// File filter to accept only images
const imageFileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  
  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return cb(new Error('File size cannot exceed 5MB!'), false);
  }
  
  cb(null, true);
};

// Avatar upload middleware
const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
}).single('avatar');

// Wrapper to handle multer errors
const handleAvatarUpload = (req, res, next) => {
  console.log('📤 Upload Middleware - Starting file upload...');
  console.log('   Content-Type:', req.headers['content-type']);
  console.log('   User authenticated:', !!req.user);
  console.log('   User ID:', req.user?.id);
  console.log('   Has file in body:', !!req.body);
  
  uploadAvatar(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      console.error('   ❌ Multer error:', err.code, err.message);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size cannot exceed 5MB'
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message
      });
    } else if (err) {
      // An unknown error occurred
      console.error('   ❌ Upload error:', err.message);
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    // Everything went fine
    console.log('   ✅ File uploaded successfully');
    console.log('   File:', req.file?.filename);
    console.log('   File size:', req.file?.size, 'bytes');
    console.log('   File mimetype:', req.file?.mimetype);
    next();
  });
};

module.exports = {
  uploadAvatar: handleAvatarUpload
};
