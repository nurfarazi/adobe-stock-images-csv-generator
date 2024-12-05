
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
  prompt: `
    Provide the output in the following exact format:
"
##Title: [Description of the image in max 200 characters or but not less than 140 character], 
##Keywords: [Comma-separated list of 45-50 SEO friendly keywords], 
##Category: [Single category name]"

Do not include any other information or text outside this structure.
    `,
};