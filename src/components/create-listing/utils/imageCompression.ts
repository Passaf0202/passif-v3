
export const TARGET_FILE_SIZE = 200 * 1024; // 200KB
export const MAX_WIDTH = 800;
export const MAX_HEIGHT = 800;

export const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.7;
        const maxAttempts = 5;
        let attempts = 0;

        const compressWithQuality = (q: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Could not create blob'));
                return;
              }

              if (blob.size > TARGET_FILE_SIZE && attempts < maxAttempts) {
                attempts++;
                quality = Math.max(0.1, quality - 0.1);
                compressWithQuality(quality);
                return;
              }

              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            q
          );
        };

        compressWithQuality(quality);
      };
    };
    reader.onerror = (error) => reject(error);
  });
};

