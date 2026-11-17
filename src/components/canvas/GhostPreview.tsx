import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useRodStore } from '../../store/useRodStore';
import { getRodSpans } from '../../utils/gridMath';

export const GhostPreview: React.FC = () => {
  const ghost = useRodStore((state) => state.ghost);

  const { spanX, spanY, spanZ } = getRodSpans(ghost.length, ghost.orientation);
  const posX = ghost.targetPos.x + spanX / 2 - 0.5;
  const posY = ghost.targetPos.y + spanY / 2;
  const posZ = ghost.targetPos.z + spanZ / 2 - 0.5;

  const edgesGeometry = useMemo(() => {
    const box = new THREE.BoxGeometry(spanX, spanY, spanZ);
    return new THREE.EdgesGeometry(box);
  }, [spanX, spanY, spanZ]);

  if (!ghost.active) return null;

  return (
    <group position={[posX, posY, posZ]}>
      {/* 半透明落點實體盒（完全不參與射線判定） */}
      <mesh raycast={() => null}>
        <boxGeometry args={[spanX * 0.98, spanY * 0.98, spanZ * 0.98]} />
        <meshStandardMaterial
          color={ghost.isValid ? '#22C55E' : '#EF4444'}
          transparent
          opacity={0.45}
          roughness={0.2}
          depthWrite={false}
        />
      </mesh>

      {/* 外框線標示 */}
      <lineSegments geometry={edgesGeometry} raycast={() => null}>
        <lineBasicMaterial color={ghost.isValid ? '#4ADE80' : '#F87171'} />
      </lineSegments>
    </group>
  );
};
