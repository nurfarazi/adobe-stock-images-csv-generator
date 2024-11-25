const fs = require("fs-extra");
const path = require("path");
const { createObjectCsvWriter } = require("csv-writer");
const ollama = require("ollama");

const folderPath = "./images"; // Change this to your folder path
const maxLines = 5000;
const maxFileSize = 5 * 1024 * 1024; // 5MB

const csvWriter = createObjectCsvWriter({
  path: "output.csv",
  header: [
    { id: "fileName", title: "File Name" },
    { id: "keyword", title: "Keyword" },
    { id: "category", title: "Category" },
  ],
});

async function processImages() {
  try {
    const files = await fs.readdir(folderPath);
    const imageFiles = files.filter((file) =>
      /\.(jpg|jpeg|png|gif)$/i.test(file)
    );
    const records = [];

    for (const file of imageFiles) {
      const filePath = path.join(folderPath, file);
      const metadata = await analyzeImage(filePath); // Replace with your image analysis function
      records.push({
        fileName: file,
        keyword: metadata.keywords.join(", ") || "", // Use metadata.keywords
        category: metadata.category || "",
      });

      if (records.length >= maxLines) break;
    }

    await csvWriter.writeRecords(records);

    const stats = await fs.stat("output.csv");
    if (stats.size > maxFileSize) {
      console.error("CSV file exceeds the maximum file size of 5MB.");
    } else {
      console.log("CSV file created successfully.");
    }
  } catch (error) {
    console.error("Error processing images:", error);
  }
}

const analyzeImage = async (filePath) => {
  try {
    // Read the image file
    const imageData = fs.readFileSync(filePath);

    // Convert image data to base64
    const base64Image = imageData.toString("base64");

    // Prepare the message payload
    const messages = [
      {
        role: "user",
        content: "Analyze this image.",
        images: [base64Image],
      },
    ];
    // log available models
    console.log(ollama.models);
    // Call the Llama 3.2 Vision model
    const response = await ollama.chat({
      model: "llama3.2-vision",
      messages: messages,
    });

    // Process the response to extract keywords and category
    const { keywords, category } = parseResponse(response);

    return {
      keywords: keywords || [], // Ensure keywords is returned
      category: category || "Uncategorized",
    };
  } catch (error) {
    console.error(`Error analyzing image (${filePath}):`, error.message);
    return {
      keywords: [], // Ensure keywords is returned
      category: "Uncategorized",
    };
  }
};

// Helper function to parse the model's response
const parseResponse = (response) => {
  // Implement parsing logic based on the response structure
  // This is a placeholder and should be customized
  const keywords = response.data.keywords || [];
  const category = response.data.category || "Uncategorized";
  return { keywords, category };
};

processImages();
