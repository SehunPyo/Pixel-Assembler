
import React from 'react';
import { usePixelStore } from '../store';
import { 
  TrashIcon, 
  ChevronUpIcon, 
  ChevronDownIcon, 
  EyeIcon, 
  EyeSlashIcon,
  LockClosedIcon,
  LockOpenIcon,
  ArrowsRightLeftIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  const { 
    layers, 
    selectedLayerId, 
    setSelectedLayer, 
    updateLayer, 
    removeLayer,
    moveLayerUp,
    moveLayerDown,
    canvasWidth,
    canvasHeight,
    setCanvasSize,
    alignLayerCenter
  } = usePixelStore();

  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  return (
    <aside className="w-80 border-l border-neutral-800 bg-neutral-900 flex flex-col overflow-hidden">
      {/* 캔버스 설정 */}
      <div className="p-4 border-b border-neutral-800">
        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">캔버스 설정</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] text-neutral-500 mb-1">너비 (px)</label>
            <input 
              type="number" 
              value={canvasWidth}
              onChange={(e) => setCanvasSize(parseInt(e.target.value) || 0, canvasHeight)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] text-neutral-500 mb-1">높이 (px)</label>
            <input 
              type="number" 
              value={canvasHeight}
              onChange={(e) => setCanvasSize(canvasWidth, parseInt(e.target.value) || 0)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs focus:border-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* 속성 패널 */}
      <div className="p-4 border-b border-neutral-800 flex-shrink-0">
        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">속성</h3>
        {selectedLayer ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-neutral-500 mb-1">X 좌표</label>
                <input 
                  type="number" 
                  value={selectedLayer.x}
                  onChange={(e) => updateLayer(selectedLayer.id, { x: parseInt(e.target.value) || 0 })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-500 mb-1">Y 좌표</label>
                <input 
                  type="number" 
                  value={selectedLayer.y}
                  onChange={(e) => updateLayer(selectedLayer.id, { y: parseInt(e.target.value) || 0 })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-500 mb-1">너비</label>
                <input 
                  type="number" 
                  value={selectedLayer.width}
                  onChange={(e) => updateLayer(selectedLayer.id, { width: parseInt(e.target.value) || 0 })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-500 mb-1">높이</label>
                <input 
                  type="number" 
                  value={selectedLayer.height}
                  onChange={(e) => updateLayer(selectedLayer.id, { height: parseInt(e.target.value) || 0 })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* 정렬 버튼 추가 */}
            <div>
              <label className="block text-[10px] text-neutral-500 mb-2">정렬</label>
              <div className="flex space-x-2">
                <button 
                  onClick={() => alignLayerCenter(selectedLayer.id, 'x')}
                  className="flex-1 flex items-center justify-center space-x-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded py-1.5 text-[10px] transition-colors"
                >
                  <ArrowsRightLeftIcon className="w-3 h-3" />
                  <span>가로 중앙</span>
                </button>
                <button 
                  onClick={() => alignLayerCenter(selectedLayer.id, 'y')}
                  className="flex-1 flex items-center justify-center space-x-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded py-1.5 text-[10px] transition-colors"
                >
                  <ArrowsUpDownIcon className="w-3 h-3" />
                  <span>세로 중앙</span>
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] text-neutral-500 mb-1">투명도: {Math.round(selectedLayer.opacity * 100)}%</label>
              <input 
                type="range" min="0" max="1" step="0.01" 
                value={selectedLayer.opacity}
                onChange={(e) => updateLayer(selectedLayer.id, { opacity: parseFloat(e.target.value) })}
                className="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-neutral-600 italic text-xs">
            레이어를 선택하면 속성이 표시됩니다
          </div>
        )}
      </div>

      {/* 레이어 패널 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 flex items-center justify-between">
          <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">레이어</h3>
          <span className="text-[10px] text-neutral-600">총 {layers.length}개</span>
        </div>
        
        <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
          {[...layers].reverse().map((layer) => (
            <div 
              key={layer.id}
              onClick={() => setSelectedLayer(layer.id)}
              className={`group flex items-center p-2 rounded cursor-pointer transition-colors ${
                selectedLayerId === layer.id ? 'bg-blue-600 text-white' : 'bg-neutral-800/50 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div className="w-8 h-8 bg-neutral-900 border border-neutral-700 rounded flex-shrink-0 flex items-center justify-center mr-3 overflow-hidden">
                <img src={layer.dataUrl} className="max-w-full max-h-full pixelated" alt="" />
              </div>
              <div className="flex-1 truncate text-xs font-medium">
                {layer.name}
              </div>
              
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { visible: !layer.visible }); }}
                  className="p-1 hover:bg-black/20 rounded"
                  title={layer.visible ? "숨기기" : "보이기"}
                >
                  {layer.visible ? <EyeIcon className="w-3.5 h-3.5" /> : <EyeSlashIcon className="w-3.5 h-3.5 opacity-50" />}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { locked: !layer.locked }); }}
                  className="p-1 hover:bg-black/20 rounded"
                  title={layer.locked ? "잠금 해제" : "잠금"}
                >
                  {layer.locked ? <LockClosedIcon className="w-3.5 h-3.5" /> : <LockOpenIcon className="w-3.5 h-3.5 opacity-50" />}
                </button>
              </div>
            </div>
          ))}
          {layers.length === 0 && (
            <div className="text-center py-12 text-neutral-600 text-xs">
              레이어가 없습니다. 에셋을 추가하세요!
            </div>
          )}
        </div>

        {/* 레이어 조작 푸터 */}
        {selectedLayerId && (
          <div className="p-2 border-t border-neutral-800 bg-neutral-950 flex items-center justify-around">
            <button 
              onClick={() => moveLayerUp(selectedLayerId)}
              title="위로 이동"
              className="p-2 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition-colors"
            >
              <ChevronUpIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={() => moveLayerDown(selectedLayerId)}
              title="아래로 이동"
              className="p-2 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition-colors"
            >
              <ChevronDownIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={() => removeLayer(selectedLayerId)}
              title="레이어 삭제"
              className="p-2 hover:bg-neutral-800 rounded text-red-400 hover:text-red-300 transition-colors"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
