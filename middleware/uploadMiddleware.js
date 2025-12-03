import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage(); // store in memory before Cloudinary upload

const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);
  if (extname && mimetype) cb(null, true);
  else cb('Images only (JPEG, JPG, PNG allowed)');
};

const upload = multer({ storage, fileFilter });

export default upload;
