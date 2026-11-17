import React, { useState, useEffect } from 'react';
import { SceneCanvas } from './components/canvas/SceneCanvas';
import { BottomDock } from './components/ui/BottomDock';
import { ActionToolbar } from './components/ui/ActionToolbar';
import { ModeSwitcher } from './components/ui/ModeSwitcher';
import { useRodStore } from './store/useRodStore';
import { Info, Maximize, Minimize } from 'lucide-react';

export const App: React.FC = () => {
  const teachingMode = useRodStore((state) => state.teachingMode);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('全螢幕模式切換失敗:', err);
    }
  };

  const getModeHint = () => {
    switch (teachingMode) {
      case 'fraction':
        return '分數尺規模式：點選任意積木並設為「基準單位 1」，系統即時換算顯示帶分數與假分數。';
      case 'stats':
        return '平均數統計模式：即時計算各欄位高度與平均水平虛線，進行「移多補少」等高教學。';
      case 'free':
      default:
        return '數與量自由模式：由底部選取 1~10 單位積木生成，單指拖曳磁吸堆疊，點選可旋轉 90°。';
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 flex flex-col font-sans select-none">
      {/* 頂部標題與教學指引列 */}
      <header className="absolute top-3 left-3 z-20 pointer-events-none select-none max-w-[calc(100vw-360px)]">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-4 py-2.5 rounded-2xl shadow-xl flex flex-col gap-1 pointer-events-auto">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 shadow-sm" />
              <h1 className="text-sm sm:text-base font-black text-white tracking-wide">
                古氏積木3D
              </h1>
            </div>

            {/* 全螢幕切換按鈕 */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? '結束全螢幕' : '全螢幕顯示 (適合電子白板/大螢幕)'}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-xs font-bold text-slate-200 border border-slate-600/70 transition-all shadow-sm"
            >
              {isFullscreen ? (
                <>
                  <Minimize className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] text-amber-300">結束全螢幕</span>
                </>
              ) : (
                <>
                  <Maximize className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-[11px] text-sky-300">全螢幕</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-300 font-medium">
            <Info className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
            <span className="truncate">{getModeHint()}</span>
          </div>
        </div>
      </header>

      {/* 右上角切換器面板 */}
      <ModeSwitcher />

      {/* 主 3D 畫布區域 */}
      <main className="flex-1 w-full h-full relative">
        <SceneCanvas />
      </main>

      {/* 底部浮動操作區 (選取動作條 + 1~10 積木生成盤) */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center gap-2 pointer-events-none">
        <ActionToolbar />
        <BottomDock />
      </div>
    </div>
  );
};

export default App;
