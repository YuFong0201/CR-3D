import React, { useMemo } from 'react';
import * as THREE from 'three';
import { RodData } from '../../types/rod.types';
import { ROD_CONFIGS, MYSTERY_COLOR } from '../../constants/rods';
import { getRodSpans } from '../../utils/gridMath';
import { getMysteryTexture } from '../../utils/textureGenerator';
import { useRodStore } from '../../store/useRodStore';

interface RodMeshProps {
  rod: RodData;
  onPointerDown: (rod: RodData, e: any) => void;
}

export const RodMesh: React.FC<RodMeshProps> = ({ rod, onPointerDown }) => {
  const selectedRodId = useRodStore((state) => state.selectedRodId);
  const unitRodId = useRodStore((state) => state.unitRodId);
  const isXRay = useRodStore((state) => state.isXRay);
  const showTicks = useRodStore((state) => state.showTicks);
  const explodeFactor = useRodStore((state) => state.explodeFactor);

  const isSelected = selectedRodId === rod.id;
  const isUnitBase = unitRodId === rod.id;

  const { spanX, spanY, spanZ } = getRodSpans(rod.length, rod.orientation);

  // 計算三維視覺座標 (基準座標 + 視圖炸開偏移)
  const baseX = rod.gridPos.x + spanX / 2 - 0.5;
  const baseY = rod.gridPos.y + spanY / 2;
  const baseZ = rod.gridPos.z + spanZ / 2 - 0.5;

  const explodeOffsetX = rod.gridPos.x * explodeFactor * 0.6;
  const explodeOffsetY = rod.gridPos.y * explodeFactor * 0.9;
  const explodeOffsetZ = rod.gridPos.z * explodeFactor * 0.6;

  const visualX = baseX + explodeOffsetX;
  const visualY = baseY + explodeOffsetY;
  const visualZ = baseZ + explodeOffsetZ;

  const config = ROD_CONFIGS[rod.length] ?? ROD_CONFIGS[1];
  const mysteryTexture = useMemo(() => getMysteryTexture(256), []);

  // 外框邊緣線幾何
  const edgesGeometry = useMemo(() => {
    const box = new THREE.BoxGeometry(spanX, spanY, spanZ);
    return new THREE.EdgesGeometry(box);
  }, [spanX, spanY, spanZ]);

  // 內部單位刻度線 (長度 > 1 且非盲盒時)
  const tickLinesGeometry = useMemo(() => {
    if (rod.isMystery || rod.length <= 1) return null;

    const points: THREE.Vector3[] = [];
    const len = rod.length;

    if (rod.orientation === 'X') {
      const start = -spanX / 2;
      for (let i = 1; i < len; i++) {
        const x = start + i;
        points.push(new THREE.Vector3(x, spanY / 2, -spanZ / 2));
        points.push(new THREE.Vector3(x, spanY / 2, spanZ / 2));
        points.push(new THREE.Vector3(x, -spanY / 2, spanZ / 2));
        points.push(new THREE.Vector3(x, spanY / 2, spanZ / 2));
        points.push(new THREE.Vector3(x, -spanY / 2, -spanZ / 2));
        points.push(new THREE.Vector3(x, spanY / 2, -spanZ / 2));
      }
    } else if (rod.orientation === 'Y') {
      const start = -spanY / 2;
      for (let i = 1; i < len; i++) {
        const y = start + i;
        points.push(new THREE.Vector3(-spanX / 2, y, spanZ / 2));
        points.push(new THREE.Vector3(spanX / 2, y, spanZ / 2));
        points.push(new THREE.Vector3(spanX / 2, y, -spanZ / 2));
        points.push(new THREE.Vector3(-spanX / 2, y, -spanZ / 2));
      }
    } else {
      const start = -spanZ / 2;
      for (let i = 1; i < len; i++) {
        const z = start + i;
        points.push(new THREE.Vector3(-spanX / 2, spanY / 2, z));
        points.push(new THREE.Vector3(spanX / 2, spanY / 2, z));
        points.push(new THREE.Vector3(spanX / 2, -spanY / 2, z));
        points.push(new THREE.Vector3(spanX / 2, spanY / 2, z));
        points.push(new THREE.Vector3(-spanX / 2, -spanY / 2, z));
        points.push(new THREE.Vector3(-spanX / 2, spanY / 2, z));
      }
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  }, [rod.length, rod.orientation, rod.isMystery, spanX, spanY, spanZ]);

  const isTranslucent = !rod.isMystery && isXRay;

  return (
    <group position={[visualX, visualY, visualZ]}>
      {/* 
        點擊判定專屬於實體立方體，userData 綁定 rodId 供射線穿透判定。
        使用 key 強制在 X光模式切換時完整重建材質與管線，確保透明深度緩衝生效！
      */}
      <mesh
        castShadow={!isTranslucent}
        receiveShadow
        userData={{ rodId: rod.id }}
        onPointerDown={(e) => onPointerDown(rod, e)}
      >
        <boxGeometry args={[spanX * 0.99, spanY * 0.99, spanZ * 0.99]} />
        <meshStandardMaterial
          key={rod.isMystery ? 'mystery' : isTranslucent ? 'xray-mat' : 'solid-mat'}
          color={rod.isMystery ? MYSTERY_COLOR : config.color}
          map={rod.isMystery ? mysteryTexture : null}
          transparent={isTranslucent}
          opacity={isTranslucent ? 0.3 : 1.0}
          depthWrite={!isTranslucent}
          depthTest={true}
          side={isTranslucent ? THREE.DoubleSide : THREE.FrontSide}
          roughness={isTranslucent ? 0.1 : 0.3}
          metalness={isTranslucent ? 0.05 : 0.1}
        />
      </mesh>

      {/* 外輪廓邊緣線：在 X 光模式下關閉 depthTest，線條貫穿顯示透視積木結構！ */}
      <lineSegments geometry={edgesGeometry} raycast={() => null}>
        <lineBasicMaterial
          color={
            isUnitBase
              ? '#F59E0B'
              : isSelected
              ? '#38BDF8'
              : rod.isMystery
              ? '#64748B'
              : isTranslucent
              ? '#38BDF8'
              : '#0F172A'
          }
          linewidth={isSelected || isUnitBase ? 2 : 1}
          depthTest={!isTranslucent}
          transparent={isTranslucent}
          opacity={isTranslucent ? 0.9 : 1.0}
        />
      </lineSegments>

      {/* 單位刻度線（盲盒時隱藏，X光時深度穿透以利內部清點） */}
      {showTicks && !rod.isMystery && tickLinesGeometry && (
        <lineSegments geometry={tickLinesGeometry} raycast={() => null}>
          <lineBasicMaterial
            color={config.tickColor}
            depthTest={!isTranslucent}
            transparent={isTranslucent}
            opacity={isTranslucent ? 0.8 : 1.0}
          />
        </lineSegments>
      )}

      {/* 基準單位 1 標記環 */}
      {isUnitBase && (
        <mesh
          position={[0, spanY / 2 + 0.15, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          raycast={() => null}
        >
          <ringGeometry args={[0.3, 0.45, 32]} />
          <meshBasicMaterial color="#F59E0B" side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};
