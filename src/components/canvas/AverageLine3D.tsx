import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useRodStore } from '../../store/useRodStore';
import { calculateStats } from '../../utils/statsMath';
import { BOARD_MIN, BOARD_MAX } from '../../constants/rods';

export const AverageLine3D: React.FC = () => {
  const rods = useRodStore((state) => state.rods);
  const teachingMode = useRodStore((state) => state.teachingMode);

  const stats = useMemo(() => calculateStats(rods), [rods]);

  if (teachingMode !== 'stats') return null;
  if (stats.columnCount === 0) return null;

  const avgY = stats.averageHeight;
  const lineStartX = Math.min(BOARD_MIN, stats.minActiveX - 2);
  const lineEndX = Math.max(BOARD_MAX, stats.maxActiveX + 2);

  return (
    <group raycast={() => null}>
      {/* 水平雷射虛線主體 */}
      <line>
        <bufferGeometry
          attach="geometry"
          onUpdate={(geom) => {
            const points = [
              new THREE.Vector3(lineStartX, avgY, 0),
              new THREE.Vector3(lineEndX, avgY, 0),
            ];
            geom.setFromPoints(points);
          }}
        />
        <lineDashedMaterial
          color="#38BDF8"
          dashSize={0.4}
          gapSize={0.2}
          linewidth={3}
        />
      </line>

      {/* 半透明雷射參考切面（不阻擋下方積木點選） */}
      <mesh position={[0, avgY, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <planeGeometry args={[lineEndX - lineStartX, 4]} />
        <meshBasicMaterial
          color="#0284C7"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 平均線左側數值資訊懸浮看板 */}
      <group position={[lineStartX, avgY, 0]}>
        <Html center distanceFactor={15} pointerEvents="none">
          <div className="bg-sky-950/95 text-sky-200 border border-sky-400 px-3 py-1.5 rounded-lg shadow-xl text-xs font-bold whitespace-nowrap flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
            <span>平均高度線：</span>
            <span className="text-white text-sm font-black underline">{avgY}</span>
            <span className="text-[10px] text-sky-300">
              (總高 {stats.totalHeight} ÷ {stats.columnCount} 欄)
            </span>
          </div>
        </Html>
      </group>

      {/* 各欄位「移多補少」差量懸浮標籤 */}
      {stats.columns.map((col) => (
        <group key={col.x} position={[col.x, col.height + 0.5, 0]}>
          <Html center distanceFactor={14} pointerEvents="none">
            <div
              className={`px-2 py-0.5 rounded text-[11px] font-bold shadow-md whitespace-nowrap ${
                col.diffFromAverage > 0
                  ? 'bg-rose-500/90 text-white'
                  : col.diffFromAverage < 0
                  ? 'bg-amber-500/90 text-slate-950'
                  : 'bg-emerald-500/90 text-white'
              }`}
            >
              {col.diffFromAverage > 0
                ? `多 +${col.diffFromAverage}`
                : col.diffFromAverage < 0
                ? `少 ${col.diffFromAverage}`
                : '✓ 平'}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
};
