import imageCompression from "browser-image-compression";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (원본 파일 크기 제한)
const MAX_COMPRESSED_SIZE = 1 * 1024 * 1024; // 1MB (압축 후 목표 크기)
const MAX_IMAGE_DIMENSION = 800; // 최대 너비/높이 800px

/**
 * 이미지를 WebP 형식으로 변환
 */
const convertToWebP = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // 800px 제한 적용
        if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
          if (width > height) {
            height = (height / width) * MAX_IMAGE_DIMENSION;
            width = MAX_IMAGE_DIMENSION;
          } else {
            width = (width / height) * MAX_IMAGE_DIMENSION;
            height = MAX_IMAGE_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context를 가져올 수 없습니다.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('WebP 변환에 실패했습니다.'));
              return;
            }
            const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(webpFile);
          },
          'image/webp',
          0.85 // WebP 품질
        );
      };
      img.onerror = () => reject(new Error('이미지 로드에 실패했습니다.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('파일 읽기에 실패했습니다.'));
    reader.readAsDataURL(file);
  });
};

/**
 * 이미지를 압축하고 WebP로 변환
 */
export const compressAndConvertImage = async (file: File): Promise<File> => {
  // 1. 원본 파일 크기 체크 (10MB 제한)
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('이미지는 10MB 이하여야 합니다.');
  }

  try {
    // 2. browser-image-compression으로 압축
    const compressionOptions = {
      maxSizeMB: MAX_COMPRESSED_SIZE / (1024 * 1024), // 1MB
      maxWidthOrHeight: MAX_IMAGE_DIMENSION, // 800px
      useWebWorker: true,
      fileType: file.type,
    };

    let compressedFile = await imageCompression(file, compressionOptions);

    // 3. WebP로 변환
    const webpFile = await convertToWebP(compressedFile);

    // 4. 최종 파일 크기 확인
    if (webpFile.size > MAX_COMPRESSED_SIZE) {
      const canvas = document.createElement('canvas');
      const img = new Image();
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          const scale = Math.sqrt(MAX_COMPRESSED_SIZE / webpFile.size);
          width = Math.floor(width * scale);
          height = Math.floor(height * scale);

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context를 가져올 수 없습니다.'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(webpFile);
                return;
              }
              const finalFile = new File([blob], webpFile.name, {
                type: 'image/webp',
                lastModified: Date.now(),
              });
              resolve(finalFile);
            },
            'image/webp',
            0.75
          );
        };
        img.onerror = () => resolve(webpFile);
        img.src = URL.createObjectURL(webpFile);
      });
    }

    return webpFile;
  } catch (error) {
    console.error('이미지 압축 오류:', error);
    throw error;
  }
};

/**
 * 이미지 파일 크기를 읽기 쉬운 형식으로 변환
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

