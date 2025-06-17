const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');

const PORT = process.env.PORT || 8080;


const MONGO_URI = process.env.MONGO_URI;

const server = http.createServer(app);


mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log(' MongoDB connection successful');
  server.listen(PORT, () => {
    console.log(` Blog API live on http://localhost:${PORT}`);
  });
})
.catch((error) => {
  console.error('MongoDB connection failed:', error.message);
  process.exit(1); 
});