import { RodData } from '../types/rod.types';
import { getRodBounds } from './gridMath';

export interface ColumnStats {
  x: number;
  height: number;
  diffFromAverage: number; // 正數代表多，負數代表少
}

export interface StatsResult {
  columns: ColumnStats[];
  columnMap: Map<number, number>;
  totalHeight: number;
  columnCount: number;
  averageHeight: number;
  minActiveX: number;
  maxActiveX: number;
}

/**
 * 依 X 軸欄位分組統計柱狀高度與全場平均高度
 */
export function calculateStats(rods: RodData[]): StatsResult {
  if (rods.length === 0) {
    return {
      columns: [],
      columnMap: new Map(),
      totalHeight: 0,
      columnCount: 0,
      averageHeight: 0,
      minActiveX: 0,
      maxActiveX: 0,
    };
  }

  // 統計各 X 座標欄位的最高 Y 值 (頂部高度 = maxY + 1)
  const columnMap = new Map<number, number>();

  for (const rod of rods) {
    const bounds = getRodBounds(rod);
    for (let x = bounds.minX; x <= bounds.maxX; x++) {
      const currentHeight = columnMap.get(x) ?? 0;
      const rodTop = bounds.maxY + 1;
      if (rodTop > currentHeight) {
        columnMap.set(x, rodTop);
      }
    }
  }

  const activeXList = Array.from(columnMap.keys()).sort((a, b) => a - b);
  const columnCount = activeXList.length;

  if (columnCount === 0) {
    return {
      columns: [],
      columnMap,
      totalHeight: 0,
      columnCount: 0,
      averageHeight: 0,
      minActiveX: 0,
      maxActiveX: 0,
    };
  }

  let totalHeight = 0;
  for (const x of activeXList) {
    totalHeight += columnMap.get(x) ?? 0;
  }

  const rawAverage = totalHeight / columnCount;
  // 保留小數點後 2 位
  const averageHeight = Number(rawAverage.toFixed(2));

  const columns: ColumnStats[] = activeXList.map((x) => {
    const height = columnMap.get(x) ?? 0;
    return {
      x,
      height,
      diffFromAverage: Number((height - averageHeight).toFixed(2)),
    };
  });

  return {
    columns,
    columnMap,
    totalHeight,
    columnCount,
    averageHeight,
    minActiveX: activeXList[0],
    maxActiveX: activeXList[activeXList.length - 1],
  };
}
