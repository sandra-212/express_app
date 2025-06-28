const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const logger = require('./utils/logger');

dotenv.config();

const app = express();


app.use(morgan('dev'));
// Middleware
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public'))); 

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


 app.use('/api/auth', require('./routes/auth'));
 app.use('/api/profiles', require('./routes/profiles'));
 app.use('/api/projects', require('./routes/projects'));


app.get('/', (req, res) => {
  res.send('Welcome!');
});

app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});


app.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`);
  res.status(500).json({ message: 'Server Error' });
});
// Start server
app.listen(3000, () => {
  console.log(`Server running on port 3000`);
});