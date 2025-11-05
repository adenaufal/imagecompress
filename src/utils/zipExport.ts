import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface ImageToZip {
  blob: Blob;
  filename: string;
}

/**
 * Export multiple images as a ZIP file
 * @param images Array of images with blobs and filenames
 * @param zipFilename Name of the ZIP file (default: 'compressed-images.zip')
 * @returns Promise that resolves when ZIP is created and downloaded
 */
export const exportToZip = async (
  images: ImageToZip[],
  zipFilename: string = 'compressed-images.zip'
): Promise<void> => {
  if (images.length === 0) {
    throw new Error('No images to export');
  }

  const zip = new JSZip();

  // Add all images to the ZIP
  images.forEach((image, index) => {
    // Use the original filename or generate one if not provided
    const filename = image.filename || `image-${index + 1}.jpg`;
    zip.file(filename, image.blob);
  });

  // Generate the ZIP file
  const content = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 6, // Compression level (1-9, where 9 is max compression)
    },
  });

  // Trigger download
  saveAs(content, zipFilename);
};

/**
 * Get the file extension from a filename
 */
export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : 'jpg';
};

/**
 * Change file extension to match the compression format
 */
export const changeFileExtension = (
  filename: string,
  newExtension: string
): string => {
  const parts = filename.split('.');
  if (parts.length > 1) {
    parts[parts.length - 1] = newExtension;
    return parts.join('.');
  }
  return `${filename}.${newExtension}`;
};
