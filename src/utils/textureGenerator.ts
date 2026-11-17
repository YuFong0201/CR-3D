import * as THREE from 'three';
import { MYSTERY_COLOR } from '../constants/rods';

const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * 動態生成問號「？」盲盒材質貼圖（支援快取防記憶體洩漏）
 */
export function getMysteryTexture(size = 256): THREE.CanvasTexture {
  const cacheKey = `mystery-${size}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. 深岩灰背景
    ctx.fillStyle = MYSTERY_COLOR;
    ctx.fillRect(0, 0, size, size);

    // 2. 邊框裝飾
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = size * 0.04;
    ctx.strokeRect(size * 0.05, size * 0.05, size * 0.9, size * 0.9);

    // 3. 中央金色/亮白色問號
    ctx.fillStyle = '#F8FAFC';
    ctx.font = `bold ${Math.round(size * 0.55)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', size / 2, size / 2 + size * 0.03);

    // 4. 微妙的問號光暈
    ctx.shadowColor = 'rgba(250, 204, 21, 0.4)';
    ctx.shadowBlur = 8;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;

  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * 清除所有快取貼圖（組件卸載或場景重置時可使用）
 */
export function clearTextureCache(): void {
  textureCache.forEach((texture) => texture.dispose());
  textureCache.clear();
}
