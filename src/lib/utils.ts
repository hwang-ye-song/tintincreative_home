import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 개발 환경에서만 로그 출력
const isDev = import.meta.env.DEV;

export const devLog = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    // 에러는 항상 출력 (프로덕션에서도 중요)
    console.error(...args);
  },
};

// 부드러운 스크롤 애니메이션 함수
export function smoothScrollTo(targetY: number, duration: number = 800) {
  const startY = window.pageYOffset;
  const distance = targetY - startY;
  let startTime: number | null = null;

  // Easing function (ease-in-out-cubic)
  function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function animation(currentTime: number) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const ease = easeInOutCubic(progress);

    window.scrollTo(0, startY + distance * ease);

    if (progress < 1) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

// 유튜브 URL을 embed 형식으로 변환
export function convertYouTubeUrlToEmbed(url: string): string {
  if (!url || !url.trim()) return url;
  
  const trimmedUrl = url.trim();
  
  // 이미 embed 형식이면 그대로 반환
  if (trimmedUrl.includes('youtube.com/embed/')) {
    return trimmedUrl;
  }
  
  // youtube.com/watch?v= 형식
  const watchMatch = trimmedUrl.match(/youtube\.com\/watch\?v=([^&]+)/);
  if (watchMatch) {
    const videoId = watchMatch[1];
    // 추가 쿼리 파라미터 처리 (예: &t=30s)
    const timeMatch = trimmedUrl.match(/[&?]t=(\d+)s?/);
    const timeParam = timeMatch ? `?start=${timeMatch[1]}` : '';
    return `https://www.youtube.com/embed/${videoId}${timeParam}`;
  }
  
  // youtu.be/ 형식
  const shortMatch = trimmedUrl.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) {
    const videoId = shortMatch[1];
    // 추가 쿼리 파라미터 처리
    const timeMatch = trimmedUrl.match(/[?&]t=(\d+)s?/);
    const timeParam = timeMatch ? `?start=${timeMatch[1]}` : '';
    return `https://www.youtube.com/embed/${videoId}${timeParam}`;
  }
  
  // 변환할 수 없는 URL은 그대로 반환
  return trimmedUrl;
}

// YouTube URL에서 비디오 ID 추출
export function extractYouTubeVideoId(url: string): string | null {
  if (!url || !url.trim()) return null;
  
  const trimmedUrl = url.trim();
  
  // youtube.com/watch?v= 형식
  const watchMatch = trimmedUrl.match(/youtube\.com\/watch\?v=([^&]+)/);
  if (watchMatch) {
    return watchMatch[1];
  }
  
  // youtube.com/embed/ 형식
  const embedMatch = trimmedUrl.match(/youtube\.com\/embed\/([^?&]+)/);
  if (embedMatch) {
    return embedMatch[1];
  }
  
  // youtu.be/ 형식
  const shortMatch = trimmedUrl.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) {
    return shortMatch[1];
  }
  
  return null;
}

// YouTube 비디오 ID로 썸네일 URL 생성
export function getYouTubeThumbnailUrl(videoId: string, quality: 'maxresdefault' | 'hqdefault' | 'mqdefault' = 'hqdefault'): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

// HTML 본문에서 첫 번째 이미지 URL 추출
export function extractFirstImageFromHtml(html: string | null | undefined): string | null {
  if (!html) return null;
  
  // img 태그에서 src 속성 추출
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }
  
  return null;
}
