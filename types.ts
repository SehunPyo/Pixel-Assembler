
export interface PixelLayer {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  dataUrl: string;
  zIndex: number;
}

export interface AppState {
  layers: PixelLayer[];
  selectedLayerId: string | null;
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  showGrid: boolean;
}
