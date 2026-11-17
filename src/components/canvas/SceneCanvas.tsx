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
      // 俯視 (X-Z 平面)
      camera.position.set(0, 30, 0.001);
      controlsRef.current.target.set(0, 0, 0);
    } else if (view === 'front') {
      // 正視 (X-Y 平面)
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
      enabled={!isDragging} // 拖曳方塊時鎖定視角，防止白板手勢干擾
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

  // 暫存拖曳中的方塊與抓取偏移值
  const draggingRodRef = useRef<RodData | null>(null);
  const grabOffsetRef = useRef<{ x: number; z: number }>({ x: 0, z: 0 });

  const handleStartDrag = (rod: RodData, hitPoint: THREE.Vector3) => {
    // 規則 1：炸開模式一旦點擊拖曳，自動將 explodeFactor 歸零
    setExplodeFactor(0);

    draggingRodRef.current = rod;
    grabOffsetRef.current = {
      x: rod.gridPos.x - hitPoint.x,
      z: rod.gridPos.z - hitPoint.z,
    };

    setIsDragging(true);

    const clamped = clampGridPosition(rod.gridPos.x, rod.gridPos.z, rod.length, rod.orientation);
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

  const handlePointerMove = (e: any) => {
    if (!isDragging || !draggingRodRef.current) return;
    e.stopPropagation();

    const rod = draggingRodRef.current;
    const hitPoint = e.point;

    const rawTargetX = hitPoint.x + grabOffsetRef.current.x;
    const rawTargetZ = hitPoint.z + grabOffsetRef.current.z;

    const clamped = clampGridPosition(rawTargetX, rawTargetZ, rod.length, rod.orientation);
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

  const handlePointerUp = () => {
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

      {/* 網格基座與拖曳接收底板 */}
      <GridBoard onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} />

      {/* 所有方塊渲染 */}
      {rods.map((rod) => (
        <RodMesh key={rod.id} rod={rod} onStartDrag={handleStartDrag} />
      ))}

      {/* 半透明落點預覽 */}
      <GhostPreview />

      {/* 分數教學動態尺規 */}
      <UnitRuler3D />

      {/* 平均數教學水平雷射線 */}
      <AverageLine3D />
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
