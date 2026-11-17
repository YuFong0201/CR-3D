import React from 'react';
import { Html } from '@react-three/drei';
import { useRodStore } from '../../store/useRodStore';
import { calculateFraction } from '../../utils/fractionMath';
import { getRodSpans } from '../../utils/gridMath';

export const UnitRuler3D: React.FC = () => {
  const rods = useRodStore((state) => state.rods);
  const unitRodId = useRodStore((state) => state.unitRodId);
  const teachingMode = useRodStore((state) => state.teachingMode);

  // 僅在分數模式或已指定基準單位 1 時顯示
  const isFractionMode = teachingMode === 'fraction';
  if (!isFractionMode && !unitRodId) return null;

  const unitRod = rods.find((r) => r.id === unitRodId);
  const unitLength = unitRod ? unitRod.length : 1;

  return (
    <group>
      {/* 遍歷各方塊顯示懸浮分數標籤 */}
      {rods.map((rod) => {
        if (rod.isMystery) return null; // 盲盒不顯示分數標籤

        const { spanX, spanY, spanZ } = getRodSpans(rod.length, rod.orientation);
        const posX = rod.gridPos.x + spanX / 2 - 0.5;
        const posY = rod.gridPos.y + spanY + 0.35;
        const posZ = rod.gridPos.z + spanZ / 2 - 0.5;

        const isUnit = rod.id === unitRodId;
        const fraction = calculateFraction(rod.length, unitLength);

        return (
          <group key={rod.id} position={[posX, posY, posZ]}>
            <Html center distanceFactor={14} pointerEvents="none">
              <div
                className={`px-2.5 py-1 rounded-lg shadow-lg text-xs font-bold whitespace-nowrap transition-all border ${
                  isUnit
                    ? 'bg-amber-500/95 text-slate-950 border-amber-300 ring-2 ring-amber-400'
                    : 'bg-slate-900/90 text-white border-slate-700'
                }`}
              >
                {isUnit ? (
                  <div className="flex items-center gap-1">
                    <span>★ 基準 1</span>
                    <span className="text-[10px] opacity-80">({rod.length}格)</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="text-amber-400 text-sm font-black">
                      {fraction.mixed}
                    </span>
                    {unitLength > 1 && !fraction.isWhole && (
                      <span className="text-[10px] text-slate-300">
                        ({fraction.improper})
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};
