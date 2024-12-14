
module.exports = {
  startingImageProcessing: "Starting image processing...",
  folderNotFound: "Folder not found",
  resizedImagesFolderEnsured: "Resized images folder ensured",
  filesReadFromFolder: "Files read from folder",
  filesFound: "files found",
  imageFilesFiltered: "Image files filtered",
  imageFilesFound: "image files found",
  processingFile: "Processing file",
  resizedImageWritten: "Resized image written",
  skippingResize: "Skipping resize for",
  invalidWidth: "due to invalid width.",
  imageAnalyzed: "Image analyzed",
  processed: "Processed",
  in: "in",
  writingRecordsToCsv: "Writing records to CSV...",
  csvFileWritten: "CSV file written.",
  csvFileExceedsMaxSize: "CSV file exceeds the maximum file size of 5MB.",
  csvFileCreatedSuccessfully: "CSV file created successfully.",
  errorProcessingImages: "Error processing images",
  totalExecutionTime: "Total execution time",
  prompt: `Please analyze the image and provide as much detail as possible, 
  including the camera angle, focus, and any other relevant information. very detailed description of the image. minimul 200 words, no text style.
  `,
  promptForDolphin: `
Please provide the output strictly in the following format:

##Title: [Provide a description of the image between 140 and 180 characters, making it concise yet descriptive, SEO friendly and engaging.],  
##Keywords: [Provide a comma-separated list of 45 SEO-friendly keywords. Include not only literal descriptors of the image but also keywords reflecting its potential use, marketing value, and abstract representation], 

-Only include the structured information within this exact format.
-Do not add any text, explanations, or notes outside of this format.
-Use the details provided below to construct the response.

Image Details:
`
};