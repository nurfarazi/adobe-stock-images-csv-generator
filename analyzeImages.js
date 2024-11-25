const fs = require('fs').promises;
const fetch = require('node-fetch');

const analyzeImage = async (filePath) => {
    try {
        const imageData = await fs.readFile(filePath);
        const base64Image = imageData.toString('base64');

        // First check if the model is available
        try {
            const modelsResponse = await fetch('http://localhost:11434/api/tags');
            const modelsData = await modelsResponse.json();
            // console.log('Available models:', modelsData);
        } catch (error) {
            console.error('Error checking models:', error.message);
            throw new Error('Cannot connect to Ollama API');
        }

        // Make the API call to analyze image
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama3.2-vision:11b',
                prompt: 'provide keywords (max 40) and category in the format "Keywords: word1, word2, word3; Category: categoryName" , do not say anyhting else',
                images: [base64Image],
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API response:', data.response);
        
        // Extract keywords and category from the response
        const analysis = parseResponse(data.response); // Ensure correct data is passed
        // console.log(`Analysis for ${filePath}:`, analysis);

        return {
            keywords: analysis.keywords,
            category: analysis.category
        };
    } catch (error) {
        console.error(`Error analyzing image (${filePath}):`, error.message);
        return {
            keywords: [],
            category: 'Uncategorized'
        };
    }
};

// Helper function to parse the model's response
const parseResponse = (responseText) => { // Rename parameter to indicate it's a string
    try {
        // Parse the response text to extract keywords and category
        const text = responseText || '';
        
        // Extract keywords (assuming model returns them in a structured way)
        const keywordsMatch = text.match(/keywords:(.+?)(?=category:|$)/i);
        const keywords = keywordsMatch 
            ? keywordsMatch[1].trim().split(',').map(k => k.trim())
            : [];

        // Extract category
        const categoryMatch = text.match(/category:(.+?)(?=$)/i);
        const category = categoryMatch 
            ? categoryMatch[1].trim() 
            : 'Uncategorized';

        return { keywords, category };
    } catch (error) {
        console.error('Error parsing response:', error);
        return { keywords: [], category: 'Uncategorized' };
    }
};

module.exports = analyzeImage;