import React, { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useRodStore } from '../../store/useRodStore';
import { GridBoard } from './GridBoard';
import { RodMesh } from './RodMesh';
import { GhostPreview } from './GhostPreview';
import { UnitRuler3D } from './UnitRuler3D';
import { AverageLine3D } from './AverageLine3D';
import { RodData, CameraView } from '../../types/rod.types';
import { clampGridPosition, calculateStackHeight } from '../../utils/gridMath';

// 相機視角控制器組件
const CameraController: React.FC<{ view: CameraView }> = ({ view }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (!controlsRef.current) return;

    if (view === '3d') {
      camera.position.set(15, 18, 22);
      controlsRef.current.target.set(0, 2, 0);
    } else if (view === 'top') {
      camera.position.set(0, 30, 0.001);
      controlsRef.current.target.set(0, 0, 0);
    } else if (view === 'front') {
      camera.position.set(0, 5, 28);
      controlsRef.current.target.set(0, 4, 0);
    }
    controlsRef.current.update();
  }, [view, camera]);

  const isDragging = useRodStore((state) => state.isDragging);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enabled={!isDragging} // 拖曳積木時鎖定視角，防止白板手勢干擾
      enableDamping
      dampingFactor={0.08}
      maxPolarAngle={view === 'top' ? 0.01 : Math.PI / 2 - 0.05} // 防止視角穿透地表
      minDistance={5}
      maxDistance={60}
    />
  );
};

// 場景內部組件（處理拖曳與渲染）
const SceneContent: React.FC = () => {
  const rods = useRodStore((state) => state.rods);
  const cameraView = useRodStore((state) => state.cameraView);
  const ghost = useRodStore((state) => state.ghost);
  const isDragging = useRodStore((state) => state.isDragging);
  const updateRodPosition = useRodStore((state) => state.updateRodPosition);
  const setGhost = useRodStore((state) => state.setGhost);
  const setIsDragging = useRodStore((state) => state.setIsDragging);
  const setExplodeFactor = useRodStore((state) => state.setExplodeFactor);
  const setSelectedRodId = useRodStore((state) => state.setSelectedRodId);
  const cycleSelect = useRodStore((state) => state.cycleSelect);

  // 暫存拖曳中的積木與計算基準
  const draggingRodRef = useRef<RodData | null>(null);
  const dragStartHitRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const dragStartGridRef = useRef<{ x: number; z: number }>({ x: 0, z: 0 });
  const dragPlaneYRef = useRef<number>(0);

  const handleRodPointerDown = (clickedRod: RodData, e: any) => {
    e.stopPropagation();

    // 1. 取得這條射線上擊中的所有積木 ID（由近到遠排序）
    const hitRodIds: string[] = [];
    if (e.intersections && e.intersections.length > 0) {
      for (const hit of e.intersections) {
        const id = hit.object?.userData?.rodId;
        if (id && !hitRodIds.includes(id)) {
          hitRodIds.push(id);
        }
      }
    }
    if (!hitRodIds.includes(clickedRod.id)) {
      hitRodIds.unshift(clickedRod.id);
    }

    // 2. 穿透循環選取（Cycle Selection）：
    // 若點擊處有多個積木疊合，點擊會在堆疊中的積木之間循環選取
    const targetId = cycleSelect(hitRodIds) || clickedRod.id;
    const targetRod = rods.find((r) => r.id === targetId) || clickedRod;

    // 3. 設定拖曳基準
    setExplodeFactor(0);
    draggingRodRef.current = targetRod;
    // 將拖曳參考面精準對齊到點擊時的 3D 空間高度，防止換面時座標瞬間跳動
    dragPlaneYRef.current = e.point.y;
    dragStartHitRef.current.copy(e.point);
    dragStartGridRef.current = { x: targetRod.gridPos.x, z: targetRod.gridPos.z };

    setIsDragging(true);

    const clamped = clampGridPosition(
      targetRod.gridPos.x,
      targetRod.gridPos.z,
      targetRod.length,
      targetRod.orientation
    );
    const otherRods = rods.filter((r) => r.id !== targetRod.id);
    const targetY = calculateStackHeight(targetRod, clamped.x, clamped.z, otherRods);

    setGhost({
      active: true,
      rodId: targetRod.id,
      length: targetRod.length,
      orientation: targetRod.orientation,
      targetPos: { x: clamped.x, y: targetY, z: clamped.z },
      isValid: true,
    });
  };

  const handlePointerMove = (e: any) => {
    if (!isDragging || !draggingRodRef.current) return;
    e.stopPropagation();

    const rod = draggingRodRef.current;
    const currentHit = e.point;

    // 4. 計算滑鼠在拖曳平面上的位移增量
    const deltaX = currentHit.x - dragStartHitRef.current.x;
    const deltaZ = currentHit.z - dragStartHitRef.current.z;

    // 根據抓取基準加上整數網格位移
    const targetGridX = Math.round(dragStartGridRef.current.x + deltaX);
    const targetGridZ = Math.round(dragStartGridRef.current.z + deltaZ);

    const clamped = clampGridPosition(targetGridX, targetGridZ, rod.length, rod.orientation);
    const otherRods = rods.filter((r) => r.id !== rod.id);
    const targetY = calculateStackHeight(rod, clamped.x, clamped.z, otherRods);

    setGhost({
      active: true,
      rodId: rod.id,
      length: rod.length,
      orientation: rod.orientation,
      targetPos: { x: clamped.x, y: targetY, z: clamped.z },
      isValid: true,
    });
  };

  const handlePointerUp = (e?: any) => {
    if (e) e.stopPropagation();
    if (isDragging && draggingRodRef.current && ghost.active) {
      updateRodPosition(
        draggingRodRef.current.id,
        ghost.targetPos.x,
        ghost.targetPos.z,
        true
      );
    }
    draggingRodRef.current = null;
    setIsDragging(false);
    setGhost({ ...ghost, active: false });
  };

  return (
    <>
      <CameraController view={cameraView} />

      {/* 燈光設置 */}
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[15, 25, 15]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <directionalLight position={[-10, 15, -10]} intensity={0.4} />

      {/* 網格基座：點擊空白處可取消選取 */}
      <GridBoard onFloorPointerDown={() => setSelectedRodId(null)} />

      {/* 所有積木渲染（點擊判定專屬各積木圖形幾何） */}
      {rods.map((rod) => (
        <RodMesh key={rod.id} rod={rod} onPointerDown={handleRodPointerDown} />
      ))}

      {/* 半透明落點預覽 */}
      <GhostPreview />

      {/* 分數教學動態尺規 */}
      <UnitRuler3D />

      {/* 平均數教學水平雷射線 */}
      <AverageLine3D />

      {/* 
        動態拖曳捕獲平面：僅在 isDragging===true 時存在於場景中，
        高度精確對齊抓取點 Y，拖曳結束後自動消失，完全不干擾平時的積木點選！
      */}
      {isDragging && (
        <mesh
          position={[0, dragPlaneYRef.current, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <planeGeometry args={[200, 200]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      )}
    </>
  );
};

export const SceneCanvas: React.FC = () => {
  return (
    <div className="w-full h-full relative select-none touch-none">
      <Canvas
        shadows
        camera={{ position: [15, 18, 22], fov: 45 }}
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
      >
        <color attach="background" args={['#0F172A']} />
        <SceneContent />
      </Canvas>
    </div>
  );
};
