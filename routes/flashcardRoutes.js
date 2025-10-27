const express = require('express');
const {GoogleGenAI, Type} = require("@google/genai");
const router = express.Router();
const {protect} = require("../middleware/authMiddleware");
const User = require("../models/userModel");
const FlashcardPack = require("../models/flashcardPackModel");

const ai  = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY});

async function generateFlashcardJson(prompt, schema){
	const response = await ai.models.generateContent({
		model: "gemini-2.5-flash",
		contents: prompt,
		config: {
			responseMimeType: "application/json",
			responseSchema: schema,
		}
	})

	return response.text;
}

//@desc generate a  new flashcard pa ck
//@route POST /api/flashcards/generate
//@access private

router.post('/generate', protect, async (req, res) => {
	const {topic, cardCount} = req.body;
	const count = parseInt(cardCount, 10) //base set to 10

	if (!topic || !count || count <= 0){
		return res.status(400).json({message: 'Please provide valid topic and card count.'})
	}		

	const creditCost = 1; //1 credit per flashcard pack

	//check if user has enough credits
	if(req.user.credits < creditCost){
		return res.status(400).json({message: `You need minimum ${creditCost} credits to generate a pack, you have ${req.user.credits} credits.` })
	}

	// JSON schema for gemini structured output:
	const flashcardSchema = {
		type: Type.ARRAY,
		items: {
			type: Type.OBJECT,
			properties: {
				question: {type: Type.STRING},
				answer: {type: Type.STRING},
			},
			propertyOrdering: ["question", "answer"],
		}
	}

	// prompt
	const prompt = `You are a helpful study assistant. Generate ${count} flashcards on the topic of "${topic}".`;

	try {
		const jsonString = await generateFlashcardJson(prompt, flashcardSchema);

		let flashcards;
		try {
			flashcards = JSON.parse(jsonString);
		}catch (parseError){
			console.error('Failed to aprse JSON from Gemini:', jsonString);
			return res.status(500).json({message: 'AI returned an invalid format. please try again.'})
		}

		//deduct credits from the user
		const updatedUser = await User.findByIdAndUpdate(
			req.user._id,
			{ $inc: {credits: -creditCost}},
			{new: true} //returns updated user
		);

		//send generated cards (not saved yet) and new credit count
		res.status(200).json({
			flashcards: flashcards,
			credits: updatedUser.credits,
		}) 
	}catch (error){
		console.error('error calling gemini API:', error);
		res.status(500).json({message: 'failed to generate cards from the AI service'})
	}
});



//CRUD Routes for flash card pack save,get, update, delete

//@desc save a generated flash card pack
//@route POST /api/flashcards/save
//@access Private

router.post('/save', protect, async (req, res) => {
	const {title, cards} = req.body;

	if(!title || !cards){
		return res.status(400).json({message: 'A valid title and non-empty cards array is required.'})
	}	

	try {
		const newPack = await FlashcardPack.create({
			user: req.user._id,
			title: title, 
			cards: cards,
		});
		res.status(201).json(newPack);
	} catch(error){
		console.error("Error saving flashcard pack: ", error);
		res.status(500).json({message: 'Failed to save flashcard pack.'});
	}
});

//@desc Get all the user's flashcard packs
//@route GET /api/flashcards/
//@access Private

router.get('/', protect, async (req, res)=> {
	try {
		// find packs belonging to user
		const packs = await FlashcardPack.find({user: req.user._id}).sort({createdAt: -1})
		res.status(200).json(packs);
	} catch (error){
		res.status(500).json({message: 'Failed to retrieve flashcard packs,'})
	}
});

//@desc Update a specific flashcard pack
//@route PUT /api/flashcards/:id
//@access Private

router.put('/:id', protect, async (req, res) => {
	const {title, cards} = req.body;

	if (!title || !cards || !Array.isArray(cards) || cards.length === 0){
		return res.status(400).json({message: 'A valid title and non-empty cards array are required.'})
	}	

	try {
		const pack = await FlashcardPack.findById(req.params.id);

		if(!pack){
			return res.status(404).json({message: 'Flashcard pack not found.'})
		}

		//security check: ensuring the user owns the pack
		if (pack.user.toString() !== req.user._id.toString()){
			return res.status(401).json({message: 'Not authorized to update this pack.'})
		}

		pack.title = title;
		pack.cards = cards;

		const updatedPack = await pack.save();
		res.status(200).json(updatedPack);
	} catch (error){
		res.status(500).json({message: 'Failed to update flashcard pack.'})
	}
});

//@desc Delete a specific flashcard pack
//@route DELETE /api/flashcards/:id
//@route Private
router.delete('/:id', protect, async (req, res)=> {
	const pack = await FlashcardPack.findById(req.params.id);

	if (!pack){
		return res.status(404).json({message: 'Flashcard pack not found'})
	}	

	//security check: ensuring user owns this pack:
	if (pack.user.toString() !== req.user._id.toString()){
		return res.status(401).json({message: 'Not Authorized to delete this pack.'})
	}
	try{
		await pack.deleteOne(); //Use deleteOne() on the document
		res.status(200).json({message: 'Flashcard pack deleted successfully'})		
	} catch (error){
		res.status(500).json({message: 'failed to delete flashcard pack.'})
	}
});


module.exports = router;
