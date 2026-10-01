// Shrinks a photo in the browser before upload (phone screenshots/camera shots are often 3–8 MB).
// Returns a JPEG File no wider/taller than maxSide; falls back to the original if decoding fails.
export async function compressImage(file, { maxSide = 1600, quality = 0.8 } = {}) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale  = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width  = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

// Cloudinary serves the file as a download when fl_attachment is in the URL
export function downloadUrl(url) {
  return url.includes('res.cloudinary.com/') ? url.replace('/upload/', '/upload/fl_attachment/') : url;
}
