const fs = require('fs-extra');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');

const folderPath = './images'; // Change this to your folder path
const maxLines = 5000;
const maxFileSize = 5 * 1024 * 1024; // 5MB

const csvWriter = createObjectCsvWriter({
  path: 'output.csv',
  header: [
    { id: 'fileName', title: 'File Name' },
    { id: 'keyword', title: 'Keyword' },
    { id: 'category', title: 'Category' }
  ]
});

async function processImages() {
  try {
    const files = await fs.readdir(folderPath);
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
    const records = [];

    for (const file of imageFiles) {
      const filePath = path.join(folderPath, file);
      const metadata = await analyzeImage(filePath); // Replace with your image analysis function
      records.push({
        fileName: file,
        keyword: metadata.keyword || '',
        category: metadata.category || ''
      });

      if (records.length >= maxLines) break;
    }

    await csvWriter.writeRecords(records);

    const stats = await fs.stat('output.csv');
    if (stats.size > maxFileSize) {
      console.error('CSV file exceeds the maximum file size of 5MB.');
    } else {
      console.log('CSV file created successfully.');
    }
  } catch (error) {
    console.error('Error processing images:', error);
  }
}

async function analyzeImage(filePath) {
  // Replace this with your actual image analysis logic
  // For demonstration, returning dummy data
  return {
    keyword: 'sample keyword',
    category: 'sample category'
  };
}

processImages();