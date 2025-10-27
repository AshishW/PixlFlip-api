const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
	let token;

	if ( req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
		try{
			//get token from header (it's in format 'Bearer TOKEN')	
			token = req.headers.authorization.split(' ')[1]

			//verify token
			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			//Get user from the token's ID and attach to req obj
			//.select('-password') → includes all fields except password
			req.user = await User.findById(decoded.id).select('-password');

			next(); //move on to next piece of middleware or route handler
		} catch (error){
			console.error(error);
			res.status(401).json({messaage: 'Not Authorized, token failed'});
		}
	}

	if (!token){
		res.status(401).json({message: 'Not authorized, no token'});
	}
};

module.exports = {protect};


