const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const {
  createBlog,
  getAllPublishedBlogs,
  getSinglePublishedBlog,
  publishBlog,
  updateBlog,
  deleteBlog,
} = require('../controllers/blogController');

router.post('/', authenticate, createBlog);
router.put('/:id/publish', authenticate, publishBlog);
router.get('/', getAllPublishedBlogs);
router.get('/:id', getSinglePublishedBlog);
router.put('/:id', authenticate, updateBlog);
router.delete('/:id', authenticate, deleteBlog);

module.exports = router;