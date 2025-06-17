const express = require('express');
const morgan = require('morgan');
const blogRoutes = require('./routes/blogRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();


app.use(express.json()); 
app.use(express.urlencoded({ extended: false })); 
app.use(morgan('dev'));


app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);


app.use('*', (req, res) => {
  res.status(404).json({ message: 'welcome to the blogwell API by Arisekola Kusamotu ' });
});

module.exports = app;