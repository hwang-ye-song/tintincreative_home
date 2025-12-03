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
