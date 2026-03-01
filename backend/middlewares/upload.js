const multer = require('multer');

// Use memory storage — files are kept in memory as Buffer
// Suitable for uploading directly to Cloudinary without saving to disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, png, webp, etc.)'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
});

module.exports = upload;
