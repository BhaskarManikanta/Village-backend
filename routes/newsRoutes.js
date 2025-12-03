import express from 'express';
import { createNews, getNews, deleteNews, updateNews } from '../controllers/newsController.js';
import { protect } from '../middleware/authMiddleware.js';
import admin from '../middleware/adminMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getNews)
  .post(protect, admin, upload.single('photo'), createNews);

router.route('/:id')
  .put(protect, admin, upload.single('photo'), updateNews)  // UPDATE route
  .delete(protect, admin, deleteNews);

export default router;
