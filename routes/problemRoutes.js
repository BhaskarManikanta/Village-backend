import express from 'express';
import { 
  createProblem, 
  getProblems, 
  updateProblemStatus, 
  updateProblem, 
  deleteProblem,
  getMyProblems  // Import new function
} from '../controllers/problemController.js';
import { protect } from '../middleware/authMiddleware.js';
import admin from '../middleware/adminMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import Problem from '../models/problemModel.js';

const router = express.Router();

// Problem CRUD routes
router.route('/')
  .get(protect, getProblems)
  .post(protect, upload.single('photo'), createProblem);

// Get user's own problems
router.get('/my-problems', protect, getMyProblems);

// Admin status update route
router.route('/:id/status')
  .put(protect, admin, updateProblemStatus);

// User update and delete routes
router.route('/:id')
  .put(protect, upload.single('photo'), updateProblem)
  .delete(protect, deleteProblem);

router.post('/:id/like', protect, async (req, res) => {
  const problem = await Problem.findById(req.params.id);
  if (!problem) return res.status(404).json({ message: 'Not found' });

  const userId = req.user._id;
  const index = problem.likes.indexOf(userId);

  if (index === -1) {
    problem.likes.push(userId); // like
  } else {
    problem.likes.splice(index, 1); // unlike
  }
  await problem.save();
  res.json({ likes: problem.likes.length });
});

export default router;
