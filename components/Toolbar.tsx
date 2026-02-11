
import React, { useRef } from 'react';
import { usePixelStore } from '../store';
import { 
  ArrowUpTrayIcon, 
  FolderOpenIcon, 
  DocumentArrowDownIcon, 
  MagnifyingGlassPlusIcon, 
  MagnifyingGlassMinusIcon,
  Squares2X2Icon,
  CameraIcon
} from '@heroicons/react/24/solid';

const Toolbar: React.FC = () => {
  const { 
    addLayer, 
    zoom, 
    setZoom, 
    layers, 
    canvasWidth, 
    canvasHeight, 
    toggleGrid, 
    showGrid,
    loadProject,
    selectedLayerId,
    setSelectedLayer
  } = usePixelStore();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);

  const handleAssetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        addLayer({
          name: file.name.split('.')[0],
          x: Math.round((canvasWidth - img.width) / 2),
          y: Math.round((canvasHeight - img.height) / 2),
          width: img.width,
          height: img.height,
          dataUrl,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExportPNG = () => {
    const stage = (window as any).pixelStage;
    if (!stage) {
      alert("캔버스를 찾을 수 없습니다.");
      return;
    }
    
    const fileName = window.prompt("저장할 이미지 파일 이름을 입력하세요:", "pixel-art-export");
    if (!fileName) return;

    // 내보내기 시 가이드 라인과 선택 박스를 제거하기 위해 일시적으로 상태 변경
    const prevSelectedId = selectedLayerId;
    const prevGrid = showGrid;
    
    // 상태 업데이트가 렌더링에 반영되도록 보장
    setSelectedLayer(null);
    if (showGrid) toggleGrid();

    // 브라우저 렌더링 루프를 고려하여 짧은 지연 후 캡처
    setTimeout(() => {
      try {
        // scale이 적용된 상태에서 원래 크기로 뽑아내기 위해 1/zoom 적용
        const dataURL = stage.toDataURL({ 
          pixelRatio: 1 / zoom,
          mimeType: 'image/png'
        });

        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error(err);
        alert("이미지 내보내기 중 오류가 발생했습니다.");
      } finally {
        // 상태 복구
        if (prevSelectedId) setSelectedLayer(prevSelectedId);
        if (prevGrid) toggleGrid();
      }
    }, 100);
  };

  const handleSaveProject = () => {
    const fileName = window.prompt("저장할 프로젝트 파일 이름을 입력하세요:", "my-pixel-project");
    if (!fileName) return;

    const projectData = {
      layers,
      canvasWidth,
      canvasHeight
    };
    
    const jsonString = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = `${fileName}.pixeljson`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLoadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        
        if (data && Array.isArray(data.layers)) {
          loadProject(data);
        } else {
          throw new Error("Invalid project format");
        }
      } catch (err) {
        alert("올바른 프로젝트 파일이 아닙니다.");
        console.error(err);
      }
    };
    reader.readAsText(file);
    if (projectInputRef.current) projectInputRef.current.value = '';
  };

  return (
    <header className="h-14 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-4 z-10">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shadow-lg">
            <Squares2X2Icon className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-sm font-bold tracking-tighter text-white">PIXEL ASSEMBLER</h1>
        </div>

        <div className="h-8 w-px bg-neutral-800 mx-2" />

        <div className="flex items-center space-x-1">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleAssetUpload} 
            className="hidden" 
            accept="image/*" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs font-medium transition-colors"
            title="이미지 파일 추가"
          >
            <ArrowUpTrayIcon className="w-4 h-4 text-blue-400" />
            <span>에셋 추가</span>
          </button>

          <button 
            onClick={handleExportPNG}
            className="flex items-center space-x-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs font-medium transition-colors"
            title="현재 캔버스를 투명 PNG로 저장"
          >
            <CameraIcon className="w-4 h-4 text-green-400" />
            <span>PNG 내보내기</span>
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center bg-neutral-800 rounded-md p-1 space-x-1">
          <button 
            onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
            className="p-1 hover:bg-neutral-700 rounded text-neutral-400"
            title="축소"
          >
            <MagnifyingGlassMinusIcon className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-mono w-12 text-center text-neutral-400">{(zoom * 100).toFixed(0)}%</span>
          <button 
            onClick={() => setZoom(Math.min(10, zoom + 0.1))}
            className="p-1 hover:bg-neutral-700 rounded text-neutral-400"
            title="확대"
          >
            <MagnifyingGlassPlusIcon className="w-4 h-4" />
          </button>
        </div>

        <button 
          onClick={toggleGrid}
          className={`p-2 rounded transition-colors ${showGrid ? 'bg-blue-600/20 text-blue-400' : 'text-neutral-500 hover:bg-neutral-800'}`}
          title="그리드 보기/숨기기"
        >
          <Squares2X2Icon className="w-5 h-5" />
        </button>

        <div className="h-8 w-px bg-neutral-800 mx-2" />

        <div className="flex items-center space-x-2">
          <input 
            type="file" 
            ref={projectInputRef} 
            onChange={handleLoadProject} 
            className="hidden" 
            accept=".pixeljson" 
          />
          <button 
            onClick={() => projectInputRef.current?.click()}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
            title="기존 프로젝트 파일(.pixeljson) 열기"
          >
            <FolderOpenIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={handleSaveProject}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
            title="현재 작업 상태를 프로젝트 파일로 저장"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Toolbar;
