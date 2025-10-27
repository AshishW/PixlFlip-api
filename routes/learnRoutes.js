//routes/learnRoutes
// Implement watch advertisment to earn 5 more credits like feature.

const express = require('express');
const {GoogleGenAI} = require("@google/genai");
const router = express.Router();
const {protect} = require("../middleware/authMiddleware");
const User = require("../models/userModel") //user required to update credits

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateExplaination(prompt) {
	  const response = await ai.models.generateContent({
	  	    model: "gemini-2.5-flash",
	  	    contents: prompt, //a string with the prompt we pass
	  	    config: {
	  	    	      thinkingConfig: {
	  	    	      	 thinkingBudget: 0, // Disables thinking
	  	    	    },
	  	    	  }
	  });
	  return response.text
}


//@desc Make API call to Gemini
//@route /api/learn/vocabulary
//@access Private

router.post('/vocabulary', protect, async (req, res, next) => {
    if(req.user.credits <= 0){
    	return res.status(403).json({message: "You have run out of credits. Please upgrade your plan"}) //403 forbidden
    }

    const word = req.body.word // word from the req to be explained by ai

    if(!word){
    	return res.status(400).json({message: 'Please provide a word.'})
    }
    const prompt = `You are an expert English teacher. Explain the word "${word}" for an intermediate english learner. Includethe following sections:
    1. A simple definition.
    2. Three clear example sentences.
    3. Two common synonyms
    `

	try {
		// generate response with helper function 
		const responseGeneration = await generateExplaination(prompt);

		//updating the user:
		const updatedUser = await User.findByIdAndUpdate(
			req.user._id,
			{ $inc: {credits: -1}},
			{new:true}	// return modified document i.e. the user
		)

		res.status(200).json({
			explaination: responseGeneration,
			credits: updatedUser.credits //send new credit count 
		})
		
	}catch(error){
		console.error("Error calling API and updating user", error)
		res.status(500).json({message:'Failed to get explaination from AI service'})
	}
})

module.exports = router;

