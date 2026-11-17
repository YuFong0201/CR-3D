import React from 'react';
import { BOARD_MIN, BOARD_MAX } from '../../constants/rods';

interface GridBoardProps {
  onPointerMove?: (e: any) => void;
  onPointerUp?: (e: any) => void;
}

export const GridBoard: React.FC<GridBoardProps> = ({ onPointerMove, onPointerUp }) => {
  const size = BOARD_MAX - BOARD_MIN + 1; // 21

  return (
    <group>
      {/* 底部基座平台 */}
      <mesh position={[0, -0.25, 0]} receiveShadow>
        <boxGeometry args={[size + 1, 0.5, size + 1]} />
        <meshStandardMaterial color="#1E293B" roughness={0.8} />
      </mesh>

      {/* 20x20 網格地面線條 */}
      <gridHelper
        args={[size, size, '#94A3B8', '#334155']}
        position={[0, 0.002, 0]}
      />

      {/* 座標中心原點十字標記 */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.3, 32]} />
        <meshBasicMaterial color="#38BDF8" />
      </mesh>

      {/* 隱形射線捕獲平面 (接收拖曳滑動事件) */}
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  );
};
