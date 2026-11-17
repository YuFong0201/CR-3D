import { describe, it, expect } from 'vitest';
import {
  clampGridPosition,
  calculateStackHeight,
  resolveGravityForAllRods,
} from './gridMath';
import { calculateFraction } from './fractionMath';
import { calculateStats } from './statsMath';
import { RodData } from '../types/rod.types';
import { BOARD_MAX, BOARD_MIN } from '../constants/rods';

describe('核心數學引擎與演算法測試', () => {
  // 1. 邊界夾緊（長度 10 積木不超界）
  it('1. clampGridPosition: 長度為 10 的積木在 x=8 時應被動態夾緊至最大容許位置', () => {
    // BOARD_MAX = 10, length = 10, orientation = 'X', spanX = 10
    // maxX 容許值 = BOARD_MAX - spanX + 1 = 10 - 10 + 1 = 1
    const clamped = clampGridPosition(8, 0, 10, 'X');
    expect(clamped.x).toBe(1);
    // 驗證尾端座標不會超過 BOARD_MAX
    expect(clamped.x + 10 - 1).toBe(BOARD_MAX);
  });

  // 2. 邊界夾緊（負邊界不超界）
  it('2. clampGridPosition: 座標超出負向邊界時應夾緊至 BOARD_MIN', () => {
    const clamped = clampGridPosition(-15, -12, 3, 'X');
    expect(clamped.x).toBe(BOARD_MIN);
    expect(clamped.z).toBe(BOARD_MIN);
  });

  // 3. 跨格重疊堆疊（AABB 投影完全重疊）
  it('3. calculateStackHeight: 積木完全重疊時高度應自動疊加 (y = 1)', () => {
    const bottomRod: RodData = {
      id: 'rod-1',
      length: 4,
      orientation: 'X',
      gridPos: { x: 0, y: 0, z: 0 },
    };
    const topRod: RodData = {
      id: 'rod-2',
      length: 4,
      orientation: 'X',
      gridPos: { x: 0, y: 0, z: 0 },
    };

    const targetY = calculateStackHeight(topRod, 0, 0, [bottomRod]);
    expect(targetY).toBe(1);
  });

  // 4. 部分重疊堆疊（X 軸交叉重疊）
  it('4. calculateStackHeight: 積木部分交叉重疊時應準確計算最高堆疊高度', () => {
    // bottomRod: x 從 0 到 3, y=0, z=0
    const bottomRod: RodData = {
      id: 'rod-1',
      length: 4,
      orientation: 'X',
      gridPos: { x: 0, y: 0, z: 0 },
    };
    // topRod: length 2, 放置在 x=2, z=0 (重疊 x=2..3)
    const topRod: RodData = {
      id: 'rod-2',
      length: 2,
      orientation: 'X',
      gridPos: { x: 2, y: 0, z: 0 },
    };

    const targetY = calculateStackHeight(topRod, 2, 0, [bottomRod]);
    expect(targetY).toBe(1);
  });

  // 5. 無重疊情況高度為 0
  it('5. calculateStackHeight: 無投影重疊時積木高度應保持在地面 y = 0', () => {
    const rod1: RodData = {
      id: 'rod-1',
      length: 3,
      orientation: 'X',
      gridPos: { x: 0, y: 0, z: 0 },
    };
    const rod2: RodData = {
      id: 'rod-2',
      length: 3,
      orientation: 'X',
      gridPos: { x: 5, y: 0, z: 0 },
    };

    const targetY = calculateStackHeight(rod2, 5, 0, [rod1]);
    expect(targetY).toBe(0);
  });

  // 6. 抽走底層積木重力落實（全場下墜）
  it('6. resolveGravityForAllRods: 抽走底層積木後，浮空積木應自動下墜至地面或下方積木', () => {
    // 假設原本有 rod-1 (y=0), rod-2 (y=1), rod-3 (y=2)
    // 抽走 rod-1 後，rod-2 應墜落至 y=0，rod-3 墜落至 y=1
    const floatingRods: RodData[] = [
      { id: 'rod-2', length: 2, orientation: 'X', gridPos: { x: 0, y: 1, z: 0 } },
      { id: 'rod-3', length: 2, orientation: 'X', gridPos: { x: 0, y: 2, z: 0 } },
    ];

    const resolved = resolveGravityForAllRods(floatingRods);
    const resolvedRod2 = resolved.find((r) => r.id === 'rod-2');
    const resolvedRod3 = resolved.find((r) => r.id === 'rod-3');

    expect(resolvedRod2?.gridPos.y).toBe(0);
    expect(resolvedRod3?.gridPos.y).toBe(1);
  });

  // 7. 分數數學函式（假分數 7/3 轉 2 又 1/3）
  it('7. calculateFraction: 7 單位長度相對於 3 單位基準應格式化為 7/3 與 2 又 1/3', () => {
    const fraction = calculateFraction(7, 3);
    expect(fraction.improper).toBe('7/3');
    expect(fraction.mixed).toBe('2 又 1/3');
    expect(fraction.wholePart).toBe(2);
    expect(fraction.remainder).toBe(1);
    expect(fraction.isWhole).toBe(false);

    // 測試整除情況 (6/3 = 2)
    const wholeFraction = calculateFraction(6, 3);
    expect(wholeFraction.improper).toBe('6/3');
    expect(wholeFraction.mixed).toBe('2');
    expect(wholeFraction.isWhole).toBe(true);
  });

  // 8. 平均高度計算（長條圖平均數移多補少）
  it('8. calculateStats: 正確統計各欄位高度與平均高度', () => {
    // 欄位 x=0 高度 4 (直立 Y 方向)，欄位 x=1 高度 2 (直立 Y 方向)
    const rods: RodData[] = [
      { id: 'col-0', length: 4, orientation: 'Y', gridPos: { x: 0, y: 0, z: 0 } },
      { id: 'col-1', length: 2, orientation: 'Y', gridPos: { x: 1, y: 0, z: 0 } },
    ];

    const stats = calculateStats(rods);
    expect(stats.columnCount).toBe(2);
    expect(stats.totalHeight).toBe(6);
    expect(stats.averageHeight).toBe(3);

    const col0 = stats.columns.find((c) => c.x === 0);
    const col1 = stats.columns.find((c) => c.x === 1);
    expect(col0?.height).toBe(4);
    expect(col0?.diffFromAverage).toBe(1); // 4 - 3 = +1 (多 1)
    expect(col1?.height).toBe(2);
    expect(col1?.diffFromAverage).toBe(-1); // 2 - 3 = -1 (少 1)
  });
});
