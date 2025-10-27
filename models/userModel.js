const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
	{
		name: {type: String, required: true}, 
		email: {type: String, required: true, unique: true},
		password: {type: String, required: true},
		credits: {type: Number, required: true, default: 10} // ai credits with default val 10
	},
	{timestamps: true}
);

//function will run before user document is saved everytime: 
userSchema.pre('save', async function(next){
	//hash passwrd only if it's modified or new
	if(!this.isModified('password')){
		next();
	}

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt); //hashing password
});

userSchema.methods.matchPassword = async function (enteredPassword){
	return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
module.exports = User;
