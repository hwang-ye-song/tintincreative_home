/**
 * 카카오톡 링크 미리보기용 OG 이미지 생성 스크립트
 * 
 * 사용 방법:
 * 1. node scripts/generate-og-image.js 실행
 * 2. 또는 브라우저에서 public/og-image-generator.html 열기
 */

const fs = require('fs');
const path = require('path');

// Canvas를 사용하려면 node-canvas 패키지가 필요합니다
// npm install canvas

console.log('OG 이미지 생성 스크립트');
console.log('이 스크립트는 node-canvas 패키지가 필요합니다.');
console.log('대신 브라우저에서 public/og-image-generator.html을 열어서 이미지를 생성하세요.');

