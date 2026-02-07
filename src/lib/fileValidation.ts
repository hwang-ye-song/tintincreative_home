// 파일 검증 유틸리티

// 허용된 이미지 MIME 타입
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
] as const;

// 허용된 이미지 확장자
export const ALLOWED_IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.svg'
] as const;

// 허용된 첨부 파일 MIME 타입
export const ALLOWED_ATTACHMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'application/zip',
  'application/x-zip-compressed',
  ...ALLOWED_IMAGE_TYPES
] as const;

// 허용된 첨부 파일 확장자
export const ALLOWED_ATTACHMENT_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.txt',
  '.csv',
  '.zip',
  ...ALLOWED_IMAGE_EXTENSIONS
] as const;

// 파일 크기 제한 (바이트)
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * 이미지 파일 검증
 */
export function validateImageFile(file: File): FileValidationResult {
  // 파일 크기 검증
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      isValid: false,
      error: `이미지 파일은 ${MAX_IMAGE_SIZE / 1024 / 1024}MB 이하여야 합니다.`
    };
  }

  // 파일 타입 검증
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
    return {
      isValid: false,
      error: '지원하지 않는 이미지 형식입니다. JPG, PNG, GIF, WebP, SVG 파일만 업로드 가능합니다.'
    };
  }

  // 파일 확장자 검증
  const fileName = file.name.toLowerCase();
  const extension = '.' + fileName.split('.').pop();
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(extension as typeof ALLOWED_IMAGE_EXTENSIONS[number])) {
    return {
      isValid: false,
      error: '지원하지 않는 파일 확장자입니다. JPG, PNG, GIF, WebP, SVG 파일만 업로드 가능합니다.'
    };
  }

  return { isValid: true };
}

/**
 * 첨부 파일 검증
 */
export function validateAttachmentFile(file: File): FileValidationResult {
  // 파일 크기 검증
  if (file.size > MAX_ATTACHMENT_SIZE) {
    return {
      isValid: false,
      error: `첨부 파일은 ${MAX_ATTACHMENT_SIZE / 1024 / 1024}MB 이하여야 합니다.`
    };
  }

  // 파일 타입 검증
  if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type as typeof ALLOWED_ATTACHMENT_TYPES[number])) {
    return {
      isValid: false,
      error: '지원하지 않는 파일 형식입니다. PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, ZIP 또는 이미지 파일만 업로드 가능합니다.'
    };
  }

  // 파일 확장자 검증
  const fileName = file.name.toLowerCase();
  const extension = '.' + fileName.split('.').pop();
  if (!ALLOWED_ATTACHMENT_EXTENSIONS.includes(extension as typeof ALLOWED_ATTACHMENT_EXTENSIONS[number])) {
    return {
      isValid: false,
      error: '지원하지 않는 파일 확장자입니다. PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, ZIP 또는 이미지 파일만 업로드 가능합니다.'
    };
  }

  return { isValid: true };
}

/**
 * 파일명에서 위험한 문자 제거
 */
export function sanitizeFileName(fileName: string): string {
  // 위험한 문자 제거
  return fileName
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_')
    .trim();
}

