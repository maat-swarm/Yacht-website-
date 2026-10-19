/**
 * In-browser image processing utility for Gallery Manager
 * - Resizes longest side to 1920px
 * - Creates 600px thumbnail
 * - Converts to WebP (quality 0.82) with JPEG fallback
 * - Strips EXIF metadata by re-encoding on Canvas
 * - Validates file types and max raw size (25MB)
 */

export interface ProcessedImageResult {
  fullBlob: Blob;
  thumbBlob: Blob;
  width: number;
  height: number;
  format: 'webp' | 'jpeg';
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: `${file.name} is not an image file.` };
  }

  const maxRawBytes = 25 * 1024 * 1024; // 25 MB
  if (file.size > maxRawBytes) {
    return { valid: false, error: `${file.name} exceeds the 25 MB limit.` };
  }

  return { valid: true };
}

export async function processImageInBrowser(file: File): Promise<ProcessedImageResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const origWidth = img.naturalWidth || img.width;
          const origHeight = img.naturalHeight || img.height;

          // 1. Calculate Full-Size dimensions (max 1920px on longest side)
          const maxFull = 1920;
          let targetFullWidth = origWidth;
          let targetFullHeight = origHeight;

          if (origWidth > maxFull || origHeight > maxFull) {
            if (origWidth > origHeight) {
              targetFullWidth = maxFull;
              targetFullHeight = Math.round((origHeight * maxFull) / origWidth);
            } else {
              targetFullHeight = maxFull;
              targetFullWidth = Math.round((origWidth * maxFull) / origHeight);
            }
          }

          // Render Full Image to Canvas
          const fullCanvas = document.createElement('canvas');
          fullCanvas.width = targetFullWidth;
          fullCanvas.height = targetFullHeight;
          const fullCtx = fullCanvas.getContext('2d');
          if (!fullCtx) throw new Error('Could not get 2D canvas context');
          fullCtx.drawImage(img, 0, 0, targetFullWidth, targetFullHeight);

          // 2. Calculate Thumbnail dimensions (max 600px on longest side)
          const maxThumb = 600;
          let targetThumbWidth = origWidth;
          let targetThumbHeight = origHeight;

          if (origWidth > maxThumb || origHeight > maxThumb) {
            if (origWidth > origHeight) {
              targetThumbWidth = maxThumb;
              targetThumbHeight = Math.round((origHeight * maxThumb) / origWidth);
            } else {
              targetThumbHeight = maxThumb;
              targetThumbWidth = Math.round((origWidth * maxThumb) / origHeight);
            }
          }

          // Render Thumbnail to Canvas
          const thumbCanvas = document.createElement('canvas');
          thumbCanvas.width = targetThumbWidth;
          thumbCanvas.height = targetThumbHeight;
          const thumbCtx = thumbCanvas.getContext('2d');
          if (!thumbCtx) throw new Error('Could not get 2D canvas context');
          thumbCtx.drawImage(img, 0, 0, targetThumbWidth, targetThumbHeight);

          // 3. Export as WebP quality 0.82 with JPEG fallback
          let format: 'webp' | 'jpeg' = 'webp';

          const getBlob = (canvas: HTMLCanvasElement, mime: string, q: number): Promise<Blob> => {
            return new Promise((res) => {
              canvas.toBlob((b) => {
                if (b) res(b);
                else {
                  format = 'jpeg';
                  canvas.toBlob((fallbackBlob) => res(fallbackBlob!), 'image/jpeg', q);
                }
              }, mime, q);
            });
          };

          const fullBlob = await getBlob(fullCanvas, 'image/webp', 0.82);
          const thumbBlob = await getBlob(thumbCanvas, 'image/webp', 0.82);

          resolve({
            fullBlob,
            thumbBlob,
            width: targetFullWidth,
            height: targetFullHeight,
            format,
          });
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image for processing'));
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
