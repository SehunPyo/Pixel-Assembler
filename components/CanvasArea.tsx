
import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer, Rect, Group, Line } from 'react-konva';
import { usePixelStore } from '../store';
import useImage from 'use-image';

const PixelImage: React.FC<{ 
  layer: any; 
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: any) => void;
}> = ({ layer, isSelected, onSelect, onChange }) => {
  const [img] = useImage(layer.dataUrl);
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <KonvaImage
        image={img}
        x={layer.x}
        y={layer.y}
        width={layer.width}
        height={layer.height}
        rotation={layer.rotation}
        opacity={layer.opacity}
        visible={layer.visible}
        draggable={!layer.locked}
        ref={shapeRef}
        onClick={onSelect}
        onTap={onSelect}
        imageSmoothingEnabled={false} // 픽셀 아트 선명도 유지
        onDragEnd={(e) => {
          onChange({
            x: Math.round(e.target.x()),
            y: Math.round(e.target.y()),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);

          onChange({
            x: Math.round(node.x()),
            y: Math.round(node.y()),
            width: Math.max(1, Math.round(node.width() * scaleX)),
            height: Math.max(1, Math.round(node.height() * scaleY)),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && !layer.locked && (
        <Transformer
          ref={trRef}
          rotateEnabled={true}
          keepRatio={true}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 1 || Math.abs(newBox.height) < 1) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

const Grid: React.FC<{ width: number; height: number; zoom: number }> = ({ width, height, zoom }) => {
  const gridSize = 16;
  const lines = [];

  for (let i = 0; i <= width / gridSize; i++) {
    lines.push(
      <Line
        key={`v-${i}`}
        points={[i * gridSize, 0, i * gridSize, height]}
        stroke="#444"
        strokeWidth={1 / zoom}
        dash={[4, 4]}
      />
    );
  }
  for (let j = 0; j <= height / gridSize; j++) {
    lines.push(
      <Line
        key={`h-${j}`}
        points={[0, j * gridSize, width, j * gridSize]}
        stroke="#444"
        strokeWidth={1 / zoom}
        dash={[4, 4]}
      />
    );
  }

  return <Group>{lines}</Group>;
};

const CanvasArea: React.FC = () => {
  const { 
    layers, 
    selectedLayerId, 
    setSelectedLayer, 
    updateLayer, 
    canvasWidth, 
    canvasHeight, 
    zoom, 
    showGrid 
  } = usePixelStore();
  
  const stageRef = useRef<any>(null);

  const handleStageMouseDown = (e: any) => {
    if (e.target === e.target.getStage()) {
      setSelectedLayer(null);
      return;
    }
  };

  useEffect(() => {
    (window as any).pixelStage = stageRef.current;
  }, []);

  return (
    <div className="relative shadow-2xl border border-neutral-700 bg-neutral-950">
      {/* 캔버스 가이드 배경 (실제 저장물에는 미포함) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{ 
          backgroundImage: 'radial-gradient(#333 1px, transparent 0)',
          backgroundSize: `${16 * zoom}px ${16 * zoom}px`
        }}
      />
      
      <Stage
        width={canvasWidth * zoom}
        height={canvasHeight * zoom}
        scaleX={zoom}
        scaleY={zoom}
        onMouseDown={handleStageMouseDown}
        ref={stageRef}
        style={{ cursor: 'crosshair' }}
      >
        <Layer imageSmoothingEnabled={false}>
          {/* 그리드 레이어 */}
          {showGrid && <Grid width={canvasWidth} height={canvasHeight} zoom={zoom} />}

          {/* 레이어 콘텐츠 */}
          {layers.map((layer) => (
            <PixelImage
              key={layer.id}
              layer={layer}
              isSelected={layer.id === selectedLayerId}
              onSelect={() => setSelectedLayer(layer.id)}
              onChange={(newAttrs) => updateLayer(layer.id, newAttrs)}
            />
          ))}
        </Layer>
      </Stage>
      
      {/* 정보 표시기 */}
      <div className="absolute -bottom-8 left-0 text-xs text-neutral-500 font-mono">
        {canvasWidth} x {canvasHeight} px | 확대: {(zoom * 100).toFixed(0)}%
      </div>
    </div>
  );
};

export default CanvasArea;
