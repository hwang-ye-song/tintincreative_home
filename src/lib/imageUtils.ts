/**
 * 이미지 최적화 유틸리티 함수들
 */

import imageCompression from "browser-image-compression";
import { devLog } from "./utils";

/**
 * Supabase Storage 이미지 URL 최적화
 * @param url - 원본 이미지 URL
 * @param width - 최적화할 너비 (기본값: 800)
 * @param quality - 이미지 품질 (1-100, 기본값: 80)
 * @returns 최적화된 이미지 URL
 */
export const getOptimizedImageUrl = (
  url?: string | null,
  width: number = 800,
  quality: number = 80
): string | null => {
  if (!url) return null;
  
  // Supabase Storage URL인 경우 최적화 파라미터 추가
  if (url.includes("supabase.co/storage")) {
    // 이미 쿼리 파라미터가 있는지 확인
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}width=${width}&quality=${quality}`;
  }
  
  return url;
};

/**
 * 아바타 이미지 URL 최적화 (작은 크기)
 * @param url - 원본 아바타 URL
 * @returns 최적화된 아바타 URL
 */
export const getOptimizedAvatarUrl = (url?: string | null): string | null => {
  return getOptimizedImageUrl(url, 128, 80);
};

/**
 * 썸네일 이미지 URL 최적화 (중간 크기)
 * @param url - 원본 이미지 URL
 * @returns 최적화된 썸네일 URL
 */
export const getOptimizedThumbnailUrl = (url?: string | null): string | null => {
  return getOptimizedImageUrl(url, 400, 75);
};

/**
 * 큰 이미지 URL 최적화 (상세 페이지용)
 * @param url - 원본 이미지 URL
 * @returns 최적화된 큰 이미지 URL
 */
export const getOptimizedLargeImageUrl = (url?: string | null): string | null => {
  return getOptimizedImageUrl(url, 1200, 85);
};

/**
 * 이미지 로딩 전략 결정
 * @param index - 이미지 인덱스 (0부터 시작)
 * @param threshold - 즉시 로드할 이미지 개수 (기본값: 3)
 * @returns "eager" 또는 "lazy"
 */
export const getImageLoadingStrategy = (index: number, threshold: number = 3): "eager" | "lazy" => {
  return index < threshold ? "eager" : "lazy";
};

/**
 * 이미지 디코딩 전략 결정
 * @param isAboveFold - 화면 상단에 보이는지 여부
 * @returns "async" 또는 "sync"
 */
export const getImageDecodingStrategy = (isAboveFold: boolean): "async" | "sync" => {
  return isAboveFold ? "sync" : "async";
};

/**
 * 이미지를 압축하고 WebP 형식으로 변환
 * @param file - 원본 이미지 파일
 * @param maxSizeMB - 최대 파일 크기 (MB, 기본값: 1)
 * @param maxWidthOrHeight - 최대 너비 또는 높이 (기본값: 1920)
 * @returns 압축 및 변환된 WebP 파일
 */
export const compressAndConvertImage = async (
  file: File,
  maxSizeMB: number = 1,
  maxWidthOrHeight: number = 1920
): Promise<File> => {
  try {
    // 먼저 이미지 압축
    const options = {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker: true,
      fileType: file.type,
    };

    const compressedFile = await imageCompression(file, options);

    // WebP로 변환
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context를 가져올 수 없습니다."));
            return;
          }
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("이미지 변환에 실패했습니다."));
                return;
              }
              const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
                type: "image/webp",
                lastModified: Date.now(),
              });
              resolve(webpFile);
            },
            "image/webp",
            0.8
          );
        };
        img.onerror = () => reject(new Error("이미지 로드에 실패했습니다."));
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };
      reader.onerror = () => reject(new Error("파일 읽기에 실패했습니다."));
      reader.readAsDataURL(compressedFile);
    });
  } catch (error) {
    // 이미지 압축 에러는 호출하는 쪽에서 처리하므로 여기서는 로그만
    devLog.error("Image compression error:", error);
    throw error;
  }
};

/**
 * 파일 크기를 읽기 쉬운 형식으로 포맷팅
 * @param bytes - 파일 크기 (바이트)
 * @returns 포맷팅된 파일 크기 문자열 (예: "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
