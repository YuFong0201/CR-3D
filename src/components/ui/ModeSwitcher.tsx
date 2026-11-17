import React, { useState } from 'react';
import { useRodStore } from '../../store/useRodStore';
import { TeachingMode, CameraView } from '../../types/rod.types';
import {
  Layers,
  Camera,
  Eye,
  Sliders,
  Hash,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';

export const ModeSwitcher: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  const teachingMode = useRodStore((state) => state.teachingMode);
  const cameraView = useRodStore((state) => state.cameraView);
  const isXRay = useRodStore((state) => state.isXRay);
  const showTicks = useRodStore((state) => state.showTicks);
  const explodeFactor = useRodStore((state) => state.explodeFactor);

  const setTeachingMode = useRodStore((state) => state.setTeachingMode);
  const setCameraView = useRodStore((state) => state.setCameraView);
  const toggleXRay = useRodStore((state) => state.toggleXRay);
  const toggleTicks = useRodStore((state) => state.toggleTicks);
  const setExplodeFactor = useRodStore((state) => state.setExplodeFactor);

  const modes: { id: TeachingMode; label: string; desc: string }[] = [
    { id: 'free', label: '數與量', desc: '自由拼裝與比較' },
    { id: 'fraction', label: '分數尺規', desc: '基準單位與帶/假分數' },
    { id: 'stats', label: '平均數', desc: '移多補少統計模式' },
  ];

  const views: { id: CameraView; label: string }[] = [
    { id: '3d', label: '3D 立體' },
    { id: 'top', label: '2D 俯視' },
    { id: 'front', label: '2D 正視' },
  ];

  return (
    <div className="absolute top-3 right-3 z-30 select-none max-w-[340px] pointer-events-auto">
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-3 text-white transition-all">
        {/* 標題與收合控制 */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5 text-sky-400 font-black text-sm">
            <Sparkles className="w-4 h-4" />
            <span>教學模式與視角</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
            title={isExpanded ? '收合面板' : '展開面板'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-2.5 flex flex-col gap-3 text-xs">
            {/* 1. 教學功能模組切換 */}
            <div>
              <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                <span>教學情境</span>
              </div>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {modes.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setTeachingMode(m.id)}
                    className={`py-1.5 px-1 rounded-lg font-bold text-center transition-all ${
                      teachingMode === m.id
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. 視角快速切換 */}
            <div>
              <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" />
                <span>鏡頭視角</span>
              </div>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {views.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setCameraView(v.id)}
                    className={`py-1.5 px-1 rounded-lg font-bold text-center transition-all ${
                      cameraView === v.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. 視覺輔助開關 (刻度 / X光透視) */}
            <div>
              <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>視覺輔助</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={toggleTicks}
                  className={`flex-1 py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    showTicks
                      ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <Hash className="w-3.5 h-3.5" />
                  <span>{showTicks ? '顯示刻度' : '隱藏刻度'}</span>
                </button>

                <button
                  onClick={toggleXRay}
                  className={`flex-1 py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    isXRay
                      ? 'bg-violet-600/20 text-violet-300 border-violet-500/50'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isXRay ? 'X光半透' : '實心材質'}</span>
                </button>
              </div>
            </div>

            {/* 4. 一鍵視圖炸開滑桿 (Explode View) */}
            <div className="pt-1 border-t border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <div className="text-slate-400 font-semibold flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>視圖炸開 (點數觀察)</span>
                </div>
                <span className="text-amber-400 font-mono font-bold">
                  {Math.round(explodeFactor * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={explodeFactor}
                onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
                className="w-full accent-amber-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
              {explodeFactor > 0 && (
                <p className="text-[10px] text-amber-300/90 mt-1 text-center font-medium">
                  ⚡ 觀察模式中（拖曳積木時將自動收合）
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
