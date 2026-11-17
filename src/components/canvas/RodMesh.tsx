import React, { useMemo } from 'react';
import * as THREE from 'three';
import { RodData } from '../../types/rod.types';
import { ROD_CONFIGS, MYSTERY_COLOR } from '../../constants/rods';
import { getRodSpans } from '../../utils/gridMath';
import { getMysteryTexture } from '../../utils/textureGenerator';
import { useRodStore } from '../../store/useRodStore';

interface RodMeshProps {
  rod: RodData;
  onStartDrag: (rod: RodData, point: THREE.Vector3) => void;
}

export const RodMesh: React.FC<RodMeshProps> = ({ rod, onStartDrag }) => {
  const selectedRodId = useRodStore((state) => state.selectedRodId);
  const unitRodId = useRodStore((state) => state.unitRodId);
  const isXRay = useRodStore((state) => state.isXRay);
  const showTicks = useRodStore((state) => state.showTicks);
  const explodeFactor = useRodStore((state) => state.explodeFactor);
  const setSelectedRodId = useRodStore((state) => state.setSelectedRodId);

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
        // 頂面線
        points.push(new THREE.Vector3(x, spanY / 2, -spanZ / 2));
        points.push(new THREE.Vector3(x, spanY / 2, spanZ / 2));
        // 前側面線
        points.push(new THREE.Vector3(x, -spanY / 2, spanZ / 2));
        points.push(new THREE.Vector3(x, spanY / 2, spanZ / 2));
        // 後側面線
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
      // 'Z'
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

    const geom = new THREE.BufferGeometry().setFromPoints(points);
    return geom;
  }, [rod.length, rod.orientation, rod.isMystery, spanX, spanY, spanZ]);

  // 材質設定（規則 2：盲盒強制不受 X 光影響）
  const materialProps = useMemo(() => {
    if (rod.isMystery) {
      return {
        color: MYSTERY_COLOR,
        map: mysteryTexture,
        roughness: 0.35,
        metalness: 0.15,
        transparent: false,
        opacity: 1.0,
        depthWrite: true,
      };
    }

    if (isXRay) {
      return {
        color: config.color,
        roughness: 0.2,
        metalness: 0.1,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      };
    }

    return {
      color: config.color,
      roughness: 0.3,
      metalness: 0.1,
      transparent: false,
      opacity: 1.0,
      depthWrite: true,
    };
  }, [rod.isMystery, isXRay, config.color, mysteryTexture]);

  return (
    <group
      position={[visualX, visualY, visualZ]}
      onPointerDown={(e) => {
        e.stopPropagation();
        setSelectedRodId(rod.id);
        onStartDrag(rod, e.point);
      }}
    >
      {/* 方塊實體 */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[spanX * 0.99, spanY * 0.99, spanZ * 0.99]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* 外輪廓邊緣線 */}
      <lineSegments geometry={edgesGeometry}>
        <lineBasicMaterial
          color={
            isUnitBase
              ? '#F59E0B'
              : isSelected
              ? '#38BDF8'
              : rod.isMystery
              ? '#64748B'
              : '#0F172A'
          }
          linewidth={isSelected || isUnitBase ? 2 : 1}
        />
      </lineSegments>

      {/* 單位刻度線（盲盒時隱藏） */}
      {showTicks && !rod.isMystery && tickLinesGeometry && (
        <lineSegments geometry={tickLinesGeometry}>
          <lineBasicMaterial color={config.tickColor} />
        </lineSegments>
      )}

      {/* 基準單位 1 標記環 */}
      {isUnitBase && (
        <mesh position={[0, spanY / 2 + 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.45, 32]} />
          <meshBasicMaterial color="#F59E0B" side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};
