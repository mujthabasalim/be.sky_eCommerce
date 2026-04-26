const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: 'drpeweqrn',
  api_key: '635725122521577',
  api_secret: 'btilIG41HRm8guAtEDQUL22aTO0'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'be.sky/uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  },
});

module.exports = { cloudinary, storage };
