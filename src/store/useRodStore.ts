import { create } from 'zustand';
import { RodData, TeachingMode, CameraView, DragGhostState, Orientation } from '../types/rod.types';
import {
  clampGridPosition,
  calculateStackHeight,
  resolveGravityForAllRods,
  findAvailablePosition,
  getRodBounds,
} from '../utils/gridMath';

const MAX_HISTORY = 30;

interface RodStoreState {
  // 積木資料與選取
  rods: RodData[];
  selectedRodId: string | null;
  unitRodId: string | null;

  // 教學與檢視設定
  teachingMode: TeachingMode;
  cameraView: CameraView;
  isXRay: boolean;
  showTicks: boolean;
  explodeFactor: number;

  // 互動狀態
  isDragging: boolean;
  ghost: DragGhostState;

  // 歷史紀錄 (Undo / Redo)
  past: RodData[][];
  future: RodData[][];

  // Actions
  addRod: (length: number, isMystery?: boolean) => void;
  updateRodPosition: (id: string, x: number, z: number, saveHistory?: boolean) => void;
  rotateRod: (id: string) => void;
  deleteRod: (id: string) => void;
  clearAllRods: () => void;
  setSelectedRodId: (id: string | null) => void;
  selectRodAbove: () => void;
  selectRodBelow: () => void;
  cycleSelect: (intersectedIds: string[]) => string | null;
  setUnitRodId: (id: string | null) => void;
  revealMystery: (id: string) => void;
  revealAllMysteries: () => void;

  setTeachingMode: (mode: TeachingMode) => void;
  setCameraView: (view: CameraView) => void;
  toggleXRay: () => void;
  toggleTicks: () => void;
  setExplodeFactor: (factor: number) => void;

  setIsDragging: (isDragging: boolean) => void;
  setGhost: (ghost: DragGhostState) => void;

  undo: () => void;
  redo: () => void;
}

export const useRodStore = create<RodStoreState>((set, get) => ({
  rods: [],
  selectedRodId: null,
  unitRodId: null,

  teachingMode: 'free',
  cameraView: '3d',
  isXRay: false,
  showTicks: true,
  explodeFactor: 0,

  isDragging: false,
  ghost: {
    active: false,
    rodId: null,
    length: 1,
    orientation: 'X',
    targetPos: { x: 0, y: 0, z: 0 },
    isValid: true,
  },

  past: [],
  future: [],

  addRod: (length: number, isMystery = false) => {
    const { rods, past } = get();
    // 預設朝向為 X 軸（水平）
    const orientation: Orientation = 'X';
    const pos = findAvailablePosition(length, orientation, rods);

    const newRod: RodData = {
      id: `rod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      length,
      orientation,
      gridPos: pos,
      isMystery,
    };

    const nextRods = resolveGravityForAllRods([...rods, newRod]);

    set({
      past: [...past.slice(-MAX_HISTORY + 1), rods],
      future: [],
      rods: nextRods,
      selectedRodId: newRod.id,
      explodeFactor: 0, // 新增時自動收合炸開視圖
    });
  },

  updateRodPosition: (id: string, x: number, z: number, saveHistory = true) => {
    const { rods, past } = get();
    const rodIndex = rods.findIndex((r) => r.id === id);
    if (rodIndex === -1) return;

    const movingRod = rods[rodIndex];
    // 1. 動態邊界夾緊（防止超界）
    const clamped = clampGridPosition(x, z, movingRod.length, movingRod.orientation);

    // 2. 計算目標堆疊高度
    const otherRods = rods.filter((r) => r.id !== id);
    const targetY = calculateStackHeight(movingRod, clamped.x, clamped.z, otherRods);

    const updatedRod: RodData = {
      ...movingRod,
      gridPos: { x: clamped.x, y: targetY, z: clamped.z },
    };

    // 3. 全場重力落實（防浮空）
    const newRods = resolveGravityForAllRods([...otherRods, updatedRod]);

    set({
      ...(saveHistory ? { past: [...past.slice(-MAX_HISTORY + 1), rods], future: [] } : {}),
      rods: newRods,
    });
  },

  rotateRod: (id: string) => {
    const { rods, past } = get();
    const rodIndex = rods.findIndex((r) => r.id === id);
    if (rodIndex === -1) return;

    const current = rods[rodIndex];
    // 旋轉順序：X -> Z -> Y -> X
    const nextOrientation: Orientation =
      current.orientation === 'X' ? 'Z' : current.orientation === 'Z' ? 'Y' : 'X';

    // (1) 邊界夾緊修正
    const clamped = clampGridPosition(
      current.gridPos.x,
      current.gridPos.z,
      current.length,
      nextOrientation
    );

    const rotatedRod: RodData = {
      ...current,
      orientation: nextOrientation,
      gridPos: { ...current.gridPos, x: clamped.x, z: clamped.z },
    };

    const otherRods = rods.filter((r) => r.id !== id);
    // (2) calculateStackHeight() 重算目標高度
    const targetY = calculateStackHeight(rotatedRod, clamped.x, clamped.z, otherRods);
    rotatedRod.gridPos.y = targetY;

    // (3) resolveGravityForAllRods() 全場重力落實
    const resolved = resolveGravityForAllRods([...otherRods, rotatedRod]);

    set({
      past: [...past.slice(-MAX_HISTORY + 1), rods],
      future: [],
      rods: resolved,
    });
  },

  deleteRod: (id: string) => {
    const { rods, selectedRodId, unitRodId, past } = get();
    const remaining = rods.filter((r) => r.id !== id);
    const resolved = resolveGravityForAllRods(remaining);

    set({
      past: [...past.slice(-MAX_HISTORY + 1), rods],
      future: [],
      rods: resolved,
      selectedRodId: selectedRodId === id ? null : selectedRodId,
      unitRodId: unitRodId === id ? null : unitRodId,
    });
  },

  clearAllRods: () => {
    const { rods, past } = get();
    if (rods.length === 0) return;
    set({
      past: [...past.slice(-MAX_HISTORY + 1), rods],
      future: [],
      rods: [],
      selectedRodId: null,
      unitRodId: null,
    });
  },

  setSelectedRodId: (id: string | null) => {
    set({ selectedRodId: id });
  },

  selectRodAbove: () => {
    const { rods, selectedRodId } = get();
    if (!selectedRodId) return;
    const current = rods.find((r) => r.id === selectedRodId);
    if (!current) return;
    const currentBounds = getRodBounds(current);

    const aboveRods = rods
      .filter((r) => {
        if (r.id === current.id || r.gridPos.y <= current.gridPos.y) return false;
        const b = getRodBounds(r);
        const overlapX = currentBounds.minX <= b.maxX && currentBounds.maxX >= b.minX;
        const overlapZ = currentBounds.minZ <= b.maxZ && currentBounds.maxZ >= b.minZ;
        return overlapX && overlapZ;
      })
      .sort((a, b) => a.gridPos.y - b.gridPos.y);

    if (aboveRods.length > 0) {
      set({ selectedRodId: aboveRods[0].id });
    }
  },

  selectRodBelow: () => {
    const { rods, selectedRodId } = get();
    if (!selectedRodId) return;
    const current = rods.find((r) => r.id === selectedRodId);
    if (!current) return;
    const currentBounds = getRodBounds(current);

    const belowRods = rods
      .filter((r) => {
        if (r.id === current.id || r.gridPos.y >= current.gridPos.y) return false;
        const b = getRodBounds(r);
        const overlapX = currentBounds.minX <= b.maxX && currentBounds.maxX >= b.minX;
        const overlapZ = currentBounds.minZ <= b.maxZ && currentBounds.maxZ >= b.minZ;
        return overlapX && overlapZ;
      })
      .sort((a, b) => b.gridPos.y - a.gridPos.y);

    if (belowRods.length > 0) {
      set({ selectedRodId: belowRods[0].id });
    }
  },

  cycleSelect: (intersectedIds: string[]) => {
    if (!intersectedIds || intersectedIds.length === 0) {
      set({ selectedRodId: null });
      return null;
    }
    const { selectedRodId } = get();
    let nextId = intersectedIds[0];

    if (selectedRodId && intersectedIds.includes(selectedRodId)) {
      const idx = intersectedIds.indexOf(selectedRodId);
      nextId = intersectedIds[(idx + 1) % intersectedIds.length];
    }

    set({ selectedRodId: nextId });
    return nextId;
  },

  setUnitRodId: (id: string | null) => {
    const { unitRodId } = get();
    set({ unitRodId: unitRodId === id ? null : id });
  },

  revealMystery: (id: string) => {
    const { rods, past } = get();
    const updated = rods.map((r) => (r.id === id ? { ...r, isMystery: false } : r));
    set({
      past: [...past.slice(-MAX_HISTORY + 1), rods],
      future: [],
      rods: updated,
    });
  },

  revealAllMysteries: () => {
    const { rods, past } = get();
    const updated = rods.map((r) => ({ ...r, isMystery: false }));
    set({
      past: [...past.slice(-MAX_HISTORY + 1), rods],
      future: [],
      rods: updated,
    });
  },

  setTeachingMode: (mode: TeachingMode) => {
    set({ teachingMode: mode });
  },

  setCameraView: (view: CameraView) => {
    set({ cameraView: view });
  },

  toggleXRay: () => {
    set((state) => ({ isXRay: !state.isXRay }));
  },

  toggleTicks: () => {
    set((state) => ({ showTicks: !state.showTicks }));
  },

  setExplodeFactor: (factor: number) => {
    set({ explodeFactor: factor });
  },

  setIsDragging: (isDragging: boolean) => {
    set({ isDragging });
  },

  setGhost: (ghost: DragGhostState) => {
    set({ ghost });
  },

  undo: () => {
    const { past, rods, future } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    set({
      past: newPast,
      future: [rods, ...future.slice(0, MAX_HISTORY - 1)],
      rods: previous,
      selectedRodId: null,
    });
  },

  redo: () => {
    const { past, rods, future } = get();
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    set({
      past: [...past.slice(-MAX_HISTORY + 1), rods],
      future: newFuture,
      rods: next,
      selectedRodId: null,
    });
  },
}));
