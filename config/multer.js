const multer = require('multer');
const path = require('path');

const { storage } = require('./cloudinary');

// File filter to allow only certain file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and WEBP are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;
