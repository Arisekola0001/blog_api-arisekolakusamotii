const Blog = require('../models/Blog');
const User = require('../models/User');

const calculateReadingTime = (text) => {
  const wordsPerMinute = 200;
  const words = text.split(' ').length;
  return Math.ceil(words / wordsPerMinute);
};

exports.createBlog = async (req, res) => {
  try {
    const { title, description, tags, body } = req.body;
    const reading_time = calculateReadingTime(body);
    const blog = await Blog.create({
      title,
      description,
      tags,
      body,
      author: req.user.id,
      reading_time,
      state: 'draft',
    });
    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.publishBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, author: req.user.id });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    blog.state = 'published';
    await blog.save();
    res.status(200).json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllPublishedBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, state, author, title, tags, sort_by } = req.query;
    const filter = { state: 'published' };

    if (author) filter.author = new RegExp(author, 'i');
    if (title) filter.title = new RegExp(title, 'i');
    if (tags) filter.tags = { $in: tags.split(',') };

    const sortOptions = {};
    if (sort_by) {
      const fields = sort_by.split(',');
      fields.forEach((field) => (sortOptions[field] = -1));
    }

    const blogs = await Blog.find(filter)
      .populate('author', 'first_name last_name email')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({ blogs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSinglePublishedBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, state: 'published' }).populate('author');
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    blog.read_count += 1;
    await blog.save();

    res.status(200).json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, author: req.user.id });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    const { title, description, tags, body } = req.body;
    if (title) blog.title = title;
    if (description) blog.description = description;
    if (tags) blog.tags = tags;
    if (body) {
      blog.body = body;
      blog.reading_time = calculateReadingTime(body);
    }

    await blog.save();
    res.status(200).json(blog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findOneAndDelete({ _id: req.params.id, author: req.user.id });
    if (!blog) return res.status(404).json({ message: 'Blog not found or not authorized' });

    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};