export type Orientation = 'X' | 'Y' | 'Z';

export interface GridPos {
  x: number;
  y: number;
  z: number;
}

export interface RodData {
  id: string;
  length: number; // 1 to 10
  orientation: Orientation;
  gridPos: GridPos;
  isMystery?: boolean;
}

export type TeachingMode = 'free' | 'fraction' | 'stats';

export type CameraView = '3d' | 'top' | 'front';

export interface RodConfig {
  length: number;
  name: string;
  color: string;
  symbol: string;
  tickColor: string;
}

export interface DragGhostState {
  active: boolean;
  rodId: string | null;
  length: number;
  orientation: Orientation;
  targetPos: GridPos;
  isValid: boolean;
}
