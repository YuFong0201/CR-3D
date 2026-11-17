import React from 'react';
import { useRodStore } from '../../store/useRodStore';
import { ROD_CONFIGS } from '../../constants/rods';
import { HelpCircle } from 'lucide-react';

export const BottomDock: React.FC = () => {
  const addRod = useRodStore((state) => state.addRod);

  const rodKeys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <footer className="w-full flex justify-center items-center pb-3 px-2 pointer-events-none select-none">
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-2.5 flex items-center gap-1.5 sm:gap-2 pointer-events-auto overflow-x-auto max-w-[98vw]">
        {/* 1~10 單位古氏積木按鈕 */}
        {rodKeys.map((len) => {
          const cfg = ROD_CONFIGS[len];
          // 判斷文字顏色對比
          const isLight = len === 1 || len === 3 || len === 5;
          const textColor = isLight ? 'text-slate-900' : 'text-white';

          return (
            <button
              key={len}
              onClick={() => addRod(len, false)}
              title={`${cfg.name} (代號: ${cfg.symbol})`}
              className="flex flex-col items-center justify-between min-w-[48px] h-[58px] sm:min-w-[54px] sm:h-[64px] rounded-xl font-bold shadow-md transition-all transform active:scale-90 hover:brightness-110 focus:outline-none border border-black/20"
              style={{ backgroundColor: cfg.color }}
            >
              <span className={`text-base sm:text-lg font-black mt-1 leading-none ${textColor}`}>
                {len}
              </span>
              <span className={`text-[10px] sm:text-xs font-semibold mb-1 opacity-80 ${textColor}`}>
                {cfg.symbol}
              </span>
            </button>
          );
        })}

        <div className="w-[1px] h-10 bg-slate-700 mx-1 flex-shrink-0" />

        {/* 神秘問號盲盒按鈕 */}
        <button
          onClick={() => {
            // 隨機生成 1~10 長度的盲盒
            const randomLen = Math.floor(Math.random() * 10) + 1;
            addRod(randomLen, true);
          }}
          title="生成未知數神秘盲盒 (? 積木)"
          className="flex flex-col items-center justify-between min-w-[52px] h-[58px] sm:min-w-[58px] sm:h-[64px] rounded-xl font-bold bg-slate-800 hover:bg-slate-750 text-amber-400 border border-amber-500/50 shadow-lg transition-all transform active:scale-90 focus:outline-none"
        >
          <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 mt-1.5 text-amber-400" />
          <span className="text-[10px] sm:text-xs font-bold mb-1 text-amber-300">
            盲盒 ?
          </span>
        </button>
      </div>
    </footer>
  );
};
