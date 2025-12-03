import Problem from '../models/problemModel.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'village_problems' },
      (error, result) => {
        if (result) resolve(result.secure_url);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Create a new problem
export const createProblem = async (req, res) => {
  try {
    let photoUrl = null;
    if (req.file) {
      photoUrl = await uploadToCloudinary(req.file.buffer);
    }

    const problem = await Problem.create({
      title: req.body.title,
      description: req.body.description,
      photoUrl,
      submittedBy: req.user._id
    });

    res.status(201).json(problem);
  } catch (error) {
    res.status(500).json({ message: 'Error creating problem', error: error.message });
  }
};

// Get all problems
export const getProblems = async (req, res) => {
  const sortByLikes = req.query.sort === 'likes';
  const problems = await Problem.find().sort(sortByLikes ? { likes: -1 } : { createdAt: -1 });
  res.json(problems);
}


// Update problem status
export const updateProblemStatus = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (problem) {
      problem.status = req.body.status;
      await problem.save();
      res.json(problem);
    } else {
      res.status(404).json({ message: 'Problem not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating problem', error: error.message });
  }
};

// Update problem (by owner only)
export const updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Check if user is the owner
    if (problem.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this problem' });
    }

    // Update fields
    problem.title = req.body.title || problem.title;
    problem.description = req.body.description || problem.description;

    // Update photo if new one is uploaded
    if (req.file) {
      const photoUrl = await uploadToCloudinary(req.file.buffer);
      problem.photoUrl = photoUrl;
    }

    const updatedProblem = await problem.save();
    res.json(updatedProblem);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Error updating problem', error: error.message });
  }
};

// Delete problem (by owner only)
export const deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Check if user is the owner
    if (problem.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this problem' });
    }

    await Problem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Problem deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Error deleting problem', error: error.message });
  }
};


// @desc    Get problems of logged-in user
// @route   GET /api/problems/my-problems
// @access  Private (User)
export const getMyProblems = async (req, res) => {
  try {
    const problems = await Problem.find({ submittedBy: req.user._id })
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your problems' });
  }
};
