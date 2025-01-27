const express = require('express');
const dotenv = require('dotenv');
const authorRoutes = require('./routes/authorRoute');
const genreRoutes = require('./routes/genreRoute');
const userRoutes = require('./routes/userRoute');
const fineRoutes = require('./routes/fineRoute');
const commentRoutes = require('./routes/commentRoute');
const bookRoutes = require('./routes/bookRoute');
const transactionRoutes = require('./routes/transactionRoute');
const imageRoutes = require('./routes/imageRoute');
const notificationRoutes = require('./routes/notificationRoute');
const bookGenreRoutes = require('./routes/bookGenreRoute');
// const userService = require('./services/userService');
const ejs = require("ejs");

dotenv.config();

const app = express();
// initialize the template engine
app.set('view engine', 'ejs');

// Body parsing middleware
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data (form data)
app.use(express.json()); // Parses JSON data

// Routes
app.use('/api/authors', authorRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/users', userRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/bookGenres', bookGenreRoutes);

// Root route
app.get('/', (req, res) => {
    res.render('homepage');
});

app.get('/hello', (req, res) => {
    res.render('homepage');
});


// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

// Start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
