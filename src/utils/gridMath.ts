import { RodData, Orientation } from '../types/rod.types';
import { BOARD_MIN, BOARD_MAX } from '../constants/rods';

export function getRodSpans(length: number, orientation: Orientation) {
  return {
    spanX: orientation === 'X' ? length : 1,
    spanY: orientation === 'Y' ? length : 1,
    spanZ: orientation === 'Z' ? length : 1,
  };
}

/**
 * 動態邊界夾緊（Dynamic Clamping）：
 * 計算最大容許基準點時扣除方塊該軸向跨度，確保整根方塊完整留在底板內
 */
export function clampGridPosition(x: number, z: number, length: number, orientation: Orientation) {
  const { spanX, spanZ } = getRodSpans(length, orientation);
  return {
    x: Math.max(BOARD_MIN, Math.min(BOARD_MAX - spanX + 1, Math.round(x))),
    z: Math.max(BOARD_MIN, Math.min(BOARD_MAX - spanZ + 1, Math.round(z))),
  };
}

export function getRodBounds(rod: RodData, overrideX = rod.gridPos.x, overrideZ = rod.gridPos.z) {
  const { spanX, spanY, spanZ } = getRodSpans(rod.length, rod.orientation);
  return {
    minX: overrideX,
    maxX: overrideX + spanX - 1,
    minZ: overrideZ,
    maxZ: overrideZ + spanZ - 1,
    minY: rod.gridPos.y,
    maxY: rod.gridPos.y + spanY - 1,
  };
}

/**
 * 計算方塊放置於目標 (targetX, targetZ) 時應堆疊的高度（y）
 */
export function calculateStackHeight(
  movingRod: RodData,
  targetX: number,
  targetZ: number,
  allRods: RodData[]
): number {
  const movingBounds = getRodBounds(movingRod, targetX, targetZ);
  let highestTopY = 0;

  for (const other of allRods) {
    if (other.id === movingRod.id) continue;
    const otherBounds = getRodBounds(other);
    const overlapX = movingBounds.minX <= otherBounds.maxX && movingBounds.maxX >= otherBounds.minX;
    const overlapZ = movingBounds.minZ <= otherBounds.maxZ && movingBounds.maxZ >= otherBounds.minZ;

    if (overlapX && overlapZ) {
      highestTopY = Math.max(highestTopY, otherBounds.maxY + 1);
    }
  }

  return highestTopY;
}

/**
 * 全場重力落實：
 * 由底層往上排序，依序重新計算其所能落到的最低堆疊高度
 */
export function resolveGravityForAllRods(rods: RodData[]): RodData[] {
  const sorted = [...rods].sort((a, b) => a.gridPos.y - b.gridPos.y);
  const resolved: RodData[] = [];

  for (const rod of sorted) {
    const newY = calculateStackHeight(rod, rod.gridPos.x, rod.gridPos.z, resolved);
    resolved.push({
      ...rod,
      gridPos: { ...rod.gridPos, y: newY },
    });
  }

  return resolved;
}

/**
 * 自動尋找適合生成新方塊的位置（依序在 z=0, z=1, ... 尋找不與現有同高度重疊的起始點）
 */
export function findAvailablePosition(
  length: number,
  orientation: Orientation,
  existingRods: RodData[]
): { x: number; y: number; z: number } {
  const { spanX } = getRodSpans(length, orientation);
  const startX = -Math.floor(spanX / 2);

  // 嘗試從中心開始放置
  for (let offsetZ = 0; offsetZ <= 8; offsetZ = offsetZ <= 0 ? -offsetZ + 1 : -offsetZ) {
    const testZ = offsetZ;
    const clamped = clampGridPosition(startX, testZ, length, orientation);
    const dummyRod: RodData = {
      id: '__dummy__',
      length,
      orientation,
      gridPos: { x: clamped.x, y: 0, z: clamped.z },
    };
    const y = calculateStackHeight(dummyRod, clamped.x, clamped.z, existingRods);
    // 如果可以在地面上 (y === 0) 放置，優先選用
    if (y === 0) {
      return { x: clamped.x, y: 0, z: clamped.z };
    }
  }

  // 否則直接夾緊並堆疊在中央
  const clampedCenter = clampGridPosition(startX, 0, length, orientation);
  const dummyRod: RodData = {
    id: '__dummy__',
    length,
    orientation,
    gridPos: { x: clampedCenter.x, y: 0, z: clampedCenter.z },
  };
  const y = calculateStackHeight(dummyRod, clampedCenter.x, clampedCenter.z, existingRods);
  return { x: clampedCenter.x, y, z: clampedCenter.z };
}
