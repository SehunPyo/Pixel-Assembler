
import React, { useEffect } from 'react';
import Toolbar from './components/Toolbar';
import CanvasArea from './components/CanvasArea';
import Sidebar from './components/Sidebar';
import { usePixelStore } from './store';

const App: React.FC = () => {
  const { selectedLayerId, layers, updateLayer } = usePixelStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedLayerId) return;
      const layer = layers.find(l => l.id === selectedLayerId);
      if (!layer || layer.locked) return;

      const step = e.shiftKey ? 10 : 1;
      
      switch (e.key) {
        case 'ArrowUp':
          updateLayer(selectedLayerId, { y: Math.round(layer.y - step) });
          e.preventDefault();
          break;
        case 'ArrowDown':
          updateLayer(selectedLayerId, { y: Math.round(layer.y + step) });
          e.preventDefault();
          break;
        case 'ArrowLeft':
          updateLayer(selectedLayerId, { x: Math.round(layer.x - step) });
          e.preventDefault();
          break;
        case 'ArrowRight':
          updateLayer(selectedLayerId, { x: Math.round(layer.x + step) });
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLayerId, layers, updateLayer]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-900 text-neutral-200">
      {/* 헤더 / 툴바 */}
      <Toolbar />

      <div className="flex flex-1 overflow-hidden">
        {/* 메인 캔버스 영역 */}
        <main className="flex-1 relative bg-neutral-800 overflow-auto scrollbar-thin flex items-center justify-center p-8">
          <CanvasArea />
        </main>

        {/* 사이드바 / 속성 / 레이어 */}
        <Sidebar />
      </div>

      {/* 푸터 상태 바 */}
      <footer className="h-6 bg-neutral-950 border-t border-neutral-800 px-4 flex items-center text-[10px] text-neutral-500 uppercase tracking-widest justify-between">
        <div>Pixel Assembler v1.1.0</div>
        <div>
          {selectedLayerId ? (
            <span>선택됨: {layers.find(l => l.id === selectedLayerId)?.name}</span>
          ) : (
            <span>선택된 레이어 없음</span>
          )}
        </div>
      </footer>
    </div>
  );
};

export default App;
