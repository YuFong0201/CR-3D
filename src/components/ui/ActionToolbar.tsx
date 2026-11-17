import React from 'react';
import { useRodStore } from '../../store/useRodStore';
import { ROD_CONFIGS } from '../../constants/rods';
import {
  RotateCw,
  Trash2,
  Undo2,
  Redo2,
  Star,
  Eye,
  Eraser,
  X,
} from 'lucide-react';

export const ActionToolbar: React.FC = () => {
  const rods = useRodStore((state) => state.rods);
  const selectedRodId = useRodStore((state) => state.selectedRodId);
  const unitRodId = useRodStore((state) => state.unitRodId);
  const past = useRodStore((state) => state.past);
  const future = useRodStore((state) => state.future);

  const rotateRod = useRodStore((state) => state.rotateRod);
  const deleteRod = useRodStore((state) => state.deleteRod);
  const clearAllRods = useRodStore((state) => state.clearAllRods);
  const setSelectedRodId = useRodStore((state) => state.setSelectedRodId);
  const setUnitRodId = useRodStore((state) => state.setUnitRodId);
  const revealMystery = useRodStore((state) => state.revealMystery);
  const revealAllMysteries = useRodStore((state) => state.revealAllMysteries);
  const undo = useRodStore((state) => state.undo);
  const redo = useRodStore((state) => state.redo);

  const selectedRod = rods.find((r) => r.id === selectedRodId);
  const hasMysteries = rods.some((r) => r.isMystery);
  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  return (
    <div className="flex flex-col items-center gap-2 pointer-events-none select-none px-3">
      {/* 選中方塊專屬操作列 */}
      {selectedRod && (
        <div className="bg-slate-900/95 backdrop-blur-md border border-sky-500/60 rounded-xl shadow-xl px-3 py-2 flex items-center gap-2 pointer-events-auto animate-fade-in text-white">
          <div className="flex items-center gap-2 pr-2 border-r border-slate-700">
            <span
              className="w-3.5 h-3.5 rounded-full inline-block border border-white/40"
              style={{
                backgroundColor: selectedRod.isMystery
                  ? '#334155'
                  : ROD_CONFIGS[selectedRod.length]?.color,
              }}
            />
            <span className="text-xs sm:text-sm font-bold text-sky-300">
              {selectedRod.isMystery
                ? '神秘盲盒'
                : `${ROD_CONFIGS[selectedRod.length]?.name} (${selectedRod.length}格)`}
            </span>
            <span className="text-xs text-slate-400">
              方向: {selectedRod.orientation}
            </span>
          </div>

          {/* 旋轉 90° */}
          <button
            onClick={() => rotateRod(selectedRod.id)}
            title="原地旋轉 90 度 (X → Z → Y)"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 active:scale-95 text-xs sm:text-sm font-bold shadow-md transition-all"
          >
            <RotateCw className="w-4 h-4" />
            <span>旋轉 90°</span>
          </button>

          {/* 設為基準單位 1 */}
          <button
            onClick={() => setUnitRodId(selectedRod.id)}
            title="設定此方塊為基準單位 1 (計算分數比率)"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 ${
              unitRodId === selectedRod.id
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 ring-2 ring-amber-300'
                : 'bg-slate-800 text-amber-400 border border-amber-500/40 hover:bg-slate-700'
            }`}
          >
            <Star className="w-4 h-4 fill-current" />
            <span>{unitRodId === selectedRod.id ? '取消基準 1' : '設為基準 1'}</span>
          </button>

          {/* 揭曉盲盒 */}
          {selectedRod.isMystery && (
            <button
              onClick={() => revealMystery(selectedRod.id)}
              title="揭曉此盲盒長度與顏色"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-xs sm:text-sm font-bold shadow-md transition-all"
            >
              <Eye className="w-4 h-4" />
              <span>揭曉</span>
            </button>
          )}

          {/* 刪除方塊 */}
          <button
            onClick={() => deleteRod(selectedRod.id)}
            title="刪除此方塊"
            className="p-2 rounded-lg bg-rose-600/80 hover:bg-rose-500 active:scale-95 text-white transition-all shadow-md"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* 關閉選取 */}
          <button
            onClick={() => setSelectedRodId(null)}
            title="取消選取"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 全域快捷工具列 (Undo / Redo / 揭曉全盲盒 / 清空) */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-lg px-2 py-1.5 flex items-center gap-1.5 pointer-events-auto">
        <button
          onClick={undo}
          disabled={!canUndo}
          title="復原上一步 (Undo)"
          className={`p-2 rounded-lg flex items-center gap-1 text-xs font-semibold transition-all ${
            canUndo
              ? 'bg-slate-800 hover:bg-slate-700 text-white active:scale-95'
              : 'text-slate-600 cursor-not-allowed'
          }`}
        >
          <Undo2 className="w-4 h-4" />
          <span className="hidden sm:inline">復原</span>
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          title="重做下一步 (Redo)"
          className={`p-2 rounded-lg flex items-center gap-1 text-xs font-semibold transition-all ${
            canRedo
              ? 'bg-slate-800 hover:bg-slate-700 text-white active:scale-95'
              : 'text-slate-600 cursor-not-allowed'
          }`}
        >
          <Redo2 className="w-4 h-4" />
          <span className="hidden sm:inline">重做</span>
        </button>

        {hasMysteries && (
          <button
            onClick={revealAllMysteries}
            title="揭曉全場所有神秘盲盒"
            className="px-2.5 py-1.5 rounded-lg bg-amber-600/90 hover:bg-amber-500 text-white flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>全場揭曉</span>
          </button>
        )}

        <div className="w-[1px] h-5 bg-slate-700 mx-0.5" />

        <button
          onClick={() => {
            if (rods.length === 0) return;
            if (window.confirm('確定要清空場上所有古氏方塊嗎？')) {
              clearAllRods();
            }
          }}
          disabled={rods.length === 0}
          title="清空全場方塊"
          className={`p-2 rounded-lg flex items-center gap-1 text-xs font-semibold transition-all ${
            rods.length > 0
              ? 'text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 active:scale-95'
              : 'text-slate-600 cursor-not-allowed'
          }`}
        >
          <Eraser className="w-4 h-4" />
          <span className="hidden sm:inline">清空</span>
        </button>
      </div>
    </div>
  );
};
