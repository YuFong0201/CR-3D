import React from 'react';
import { BOARD_MIN, BOARD_MAX } from '../../constants/rods';

interface GridBoardProps {
  onFloorPointerDown?: () => void;
}

export const GridBoard: React.FC<GridBoardProps> = ({ onFloorPointerDown }) => {
  const size = BOARD_MAX - BOARD_MIN + 1; // 21

  return (
    <group>
      {/* 底部基座平台：點擊底板空白處可取消選取 */}
      <mesh
        position={[0, -0.25, 0]}
        receiveShadow
        onPointerDown={(e) => {
          e.stopPropagation();
          onFloorPointerDown?.();
        }}
      >
        <boxGeometry args={[size + 1, 0.5, size + 1]} />
        <meshStandardMaterial color="#1E293B" roughness={0.8} />
      </mesh>

      {/* 20x20 網格地面線條（不參與射線判定） */}
      <gridHelper
        args={[size, size, '#94A3B8', '#334155']}
        position={[0, 0.002, 0]}
        raycast={() => null}
      />

      {/* 座標中心原點十字標記（不參與射線判定） */}
      <mesh
        position={[0, 0.005, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        raycast={() => null}
      >
        <ringGeometry args={[0.2, 0.3, 32]} />
        <meshBasicMaterial color="#38BDF8" />
      </mesh>
    </group>
  );
};
