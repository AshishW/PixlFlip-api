const express = require('express');
const router = express.Router();
const User = require('../models/UserModel')

// @desc Register a new user
// @route POST /api/users/register
// @access public

router.post('/register', async (req, res, next) => {
	const {name, email, password} = req.body;

	try {
		const userExists = await User.findOne({email});

		if(userExists){
			return res.status(400).json({message: 'User already exists'});			
		}

		const user = await User.create({name, email, password}) //hashing of password automatically happens due to pre-save hook in userModel

		if (user){
			res.status(200).json({
				_id: user._id,
				name: user.name,
				email: user.email, 
				credits: user.credits,
				message: "user registered successfully"
			});
		}else {
			res.status(400).json({message: 'Invalid user data'});
		}
		
	} catch(error){
	// Pass the error to the global error handler
	    next(error);
		//res.status(500).json({message: 'Server Error'})
	}
});



//Login route:

const generateToken = require('../utils/generateToken');
// @desc Auth user & get token
// @route POST /api/users/login
// @access public
router.post('/login', async (req, res, next)=>{
	const {email, password} = req.body;
    
	try {
		const user = await User.findOne({email});

		if(user && (await user.matchPassword(password))){
			res.json({
				_id: user.id,
				name: user.name,
				email: user.email,
				credits: user.credits,
				token: generateToken(user._id)
			});
		}else {
			res.status(401).json({message:'Invalid email or password'}); //401 Unauthorized
		}
	} catch (error){
		next(error);
		//res.status(500).json({message: 'Server Error'});
	}
});


//protected routes
const {protect} = require('../middleware/authMiddleware');

//@desc Get user profile
//@route /api/users/profile
//@access Private
router.get('/profile', protect, async(req, res)=>{
	//Because of our 'protect' middleware, the user data is now in req.user

	const user = await User.findById(req.user._id);

	if (user){
		res.json({
			_id: user._id,
			name: user.name,
			email: user.email,
			credits: user.credits,
		});
	} else{
		res.status(404).json({message:'User not found'});
	}
});

//@desc Update user profile
//@route /api/users/profile
//@access Private

router.put('/profile', protect, async(req, res)=>{
 try{
	const user = await User.findById(req.user._id);
    
		if(user){
	    	user.name = req.body.name
	    	user.email = req.body.email
	    	if (req.body.password){
	    		user.password = req.body.password;
	    	}

			const updatedUser = await user.save();

			res.json({
				_id: updatedUser._id,
				name: updatedUser.name,
				email: updatedUser.email,
				credits: updatedUser.credits,
				token: generateToken(updatedUser._id)
			})
		
		} else{
			res.status(404).json({message: 'User not found while updating'})
		}
	}catch(error) {
		next(error);	
	}
});


//@desc Delete user profile
//@route /api/users/profile
//@access Private

router.delete('/profile', protect, async (req, res, next)=>{
 try {
		const user = await User.getById(req.user._id);

		if(user){
			await user.deleteOne();
			res.json({message: 'User deleted successfully'});
		} else {
			res.status(404).json({message: 'User not found for deletion'})
		}
     } catch(error){
     //	res.status(500).json({message: 'Server Error'})
     	next(error);
     }
});

module.exports = router;

