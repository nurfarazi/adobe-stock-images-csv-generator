const fs = require("fs-extra");
const path = require("path");
const { createObjectCsvWriter } = require("csv-writer");
const sharp = require("sharp");
const analyzeImage = require("./analyzeImages");

const folderPath = "./images"; // Change this to your folder path
const maxLines = 5000;
const maxFileSize = 5 * 1024 * 1024; // 5MB

const csvWriter = createObjectCsvWriter({
  path: "output.csv",
  header: [
    { id: "fileName", title: "Filename" },
    { id: "title", title: "Title" },
    { id: "keyword", title: "Keywords" },
    { id: "category", title: "Category" },
    { id : "releases", title: "Releases" },
  ],
});

async function processImages() {
  try {
     // Check if the folder exists
     const folderExists = await fs.access(folderPath).then(() => true).catch(() => false);
     if (!folderExists) {
       console.error(`Folder not found: ${folderPath}`);
       return;
     }

    const files = await fs.readdir(folderPath);
    const imageFiles = files.filter((file) =>
      /\.(jpg|jpeg|png|gif)$/i.test(file)
    );
    const records = [];

    for (const file of imageFiles) {
      const filePath = path.join(folderPath, file);

      // Resize down to 10% of original size
      const image = await fs.readFile(filePath);
      const metadata = await sharp(image).metadata();
      const newWidth = Math.round(metadata.width * 0.5);

      if (newWidth > 0) {
        const resizedImage = await sharp(image).resize({ width: newWidth }).toBuffer();
        await fs.writeFile(filePath, resizedImage);
      } else {
        console.warn(`Skipping resize for ${file} due to invalid width.`);
      }

      const analysis = await analyzeImage(filePath); // Replace with your image analysis function
      records.push({
        fileName: file,
        title: analysis.title || "",
        keyword: analysis.keywords.join(", ") || "", // Use metadata.keywords
        category: analysis.category || "",
        releases:  "",
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

processImages();
