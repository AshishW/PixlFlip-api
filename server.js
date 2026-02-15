require('dotenv').config();
console.log('MONGO_URI loaded:', process.env.MONGO_URI ? 'Yes' : 'No');

const cors = require('cors');

const connectDB = require('./config/db');
connectDB();

const express = require('express');
const app = express();

// middleware allowing json in req body
app.use(express.json());
//middleware allowing cors
app.use(cors());

//for rate limit: 100 req per 15 min
const rateLimit = require('express-rate-limit');
app.set("trust proxy", 1); // for prod env
const limiter = rateLimit({
	windowsMs: 15 * 60 * 1000, //15 min
	max: 100, // limit each ip to 100 requrests per windowMs
	standardHeaders: true,
	legacyHeaders: false,
	message: 'Too many requests from this IP, please try again after 15 minutes'
})

app.use('/api', limiter) //limiter applies to all routes that start with /api

const userRoutes = require('./routes/userRoutes');
const geminiRoutes = require('./routes/learnRoutes');
const flashcardRoutes = require('./routes/flashcardRoutes')

app.use('/api/users', userRoutes)
app.use('/api/learn', geminiRoutes)
app.use('/api/flashcards', flashcardRoutes)


//test route
app.get('/', (req, res) => {
	res.status(200).json({ message: "welcome to the api" });
});

// GLOBAL ERROR HANDLER (Safety Net)
// This MUST be the last middleware.
app.use((err, req, res, next) => {
	console.error(' AN UNCAUGHT ERROR OCCURRED ');
	console.error(err.stack); // This prints the detailed error of where it happened
	res.status(500).json({ message: 'An unexpected error occurred on the server.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`server is running on port ${PORT}`);
});
