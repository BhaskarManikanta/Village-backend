import News from '../models/newsModel.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'village_news' },
      (error, result) => {
        if (result) resolve(result.secure_url);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const createNews = async (req, res) => {
  try {
    let photoUrl = null;

    if (req.file) {
      photoUrl = await uploadToCloudinary(req.file.buffer);
    }

    const news = await News.create({
      title: req.body.title,
      content: req.body.content,
      photoUrl
    });

    res.status(201).json(news);
  } catch (error) {
    res.status(500).json({ message: 'Error creating news', error: error.message });
  }
};

export const getNews = async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching news' });
  }
};

export const deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    await News.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error); // Log error for debugging
    res.status(500).json({ message: 'Error deleting news', error: error.message });
  }
};

// Update news
export const updateNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    // Update title and content
    news.title = req.body.title || news.title;
    news.content = req.body.content || news.content;

    // Update photo if new one is uploaded
    if (req.file) {
      const photoUrl = await uploadToCloudinary(req.file.buffer);
      news.photoUrl = photoUrl;
    }

    const updatedNews = await news.save();
    res.json(updatedNews);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Error updating news', error: error.message });
  }
};
