/**
 * Compresses an image file to be under 1MB.
 * If the file is already under 1MB, returns its data URL directly.
 * Otherwise, uses a canvas to compress the image down iteratively.
 */
export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // 1MB is 1,048,576 bytes.
    const ONE_MB = 1024 * 1024;

    // If file is already under 1MB, read it as Data URL and return
    if (file.size < ONE_MB) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to read file as Data URL"));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
      return;
    }

    // Otherwise, we compress using HTML5 Canvas
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          // If we can't get canvas context, resolve with original
          resolve(img.src);
          return;
        }

        let width = img.width;
        let height = img.height;

        // Limit maximum dimension to 1920px to prevent huge canvas allocations
        const MAX_DIM = 1920;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // We want the final size to be under 1MB.
        // Base64 encoding size is roughly (character length) * 0.75.
        // So we want the base64 string length to be less than (1,048,576 / 0.75) = ~1,398,101 characters.
        // Let's aim for a target base64 size of 1.3M characters (~975KB) to be safe.
        const TARGET_BASE64_LENGTH = 1300000;

        let quality = 0.85;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);

        // If the file is still too big, let's step down quality first
        while (dataUrl.length > TARGET_BASE64_LENGTH && quality > 0.1) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        // If quality alone is not enough, step down the resolution
        if (dataUrl.length > TARGET_BASE64_LENGTH) {
          let scale = 0.8;
          while (dataUrl.length > TARGET_BASE64_LENGTH && scale > 0.1) {
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = Math.round(canvas.width * scale);
            tempCanvas.height = Math.round(canvas.height * scale);
            const tempCtx = tempCanvas.getContext("2d");
            if (tempCtx) {
              tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
              dataUrl = tempCanvas.toDataURL("image/jpeg", 0.5); // use 0.5 quality at lower res
            }
            scale -= 0.15;
          }
        }

        resolve(dataUrl);
      };
      img.onerror = () => {
        reject(new Error("Failed to load image for compression"));
      };
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
