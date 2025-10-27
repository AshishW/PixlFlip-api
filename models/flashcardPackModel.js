const mongoose = require('mongoose');

//single flashcard schema

const cardSchema = new mongoose.Schema({
	question: {type: String, required: true},
	answer: {type: String, required: true}
});

//card pack schema

const flashcardPackSchema = new mongoose.Schema({
	// link the pack to user with user's ObjectId
	user: {
		type: mongoose.Schema.Types.ObjectId,
		required: true, 
		ref: 'User',
	},
	title: {
		type: String,
		required: true, 
	},
	//embedding arry of cards directly in pack
	cards: [cardSchema],
}, 
{
	timestamps: true //adds createdAt and updatedAt
});

const FlashcardPack = mongoose.models.FlashcardPack || mongoose.model('FlashcardPack', flashcardPackSchema);

module.exports = FlashcardPack
