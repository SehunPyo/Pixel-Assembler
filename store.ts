
import { create } from 'zustand';
import { AppState, PixelLayer } from './types';

interface PixelStore extends AppState {
  addLayer: (layer: Omit<PixelLayer, 'zIndex' | 'id'>) => void;
  updateLayer: (id: string, updates: Partial<PixelLayer>) => void;
  removeLayer: (id: string) => void;
  setSelectedLayer: (id: string | null) => void;
  reorderLayers: (startIndex: number, endIndex: number) => void;
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  setCanvasSize: (width: number, height: number) => void;
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  loadProject: (state: Partial<AppState>) => void;
  alignLayerCenter: (id: string, axis: 'x' | 'y') => void;
}

export const usePixelStore = create<PixelStore>((set) => ({
  layers: [],
  selectedLayerId: null,
  canvasWidth: 800,
  canvasHeight: 600,
  zoom: 1,
  showGrid: true,

  addLayer: (newLayer) => set((state) => {
    const id = crypto.randomUUID();
    const layerWithMeta: PixelLayer = {
      ...newLayer,
      id,
      zIndex: state.layers.length,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
    };
    return { 
      layers: [...state.layers, layerWithMeta],
      selectedLayerId: id
    };
  }),

  updateLayer: (id, updates) => set((state) => ({
    layers: state.layers.map((l) => (l.id === id ? { ...l, ...updates } : l)),
  })),

  removeLayer: (id) => set((state) => ({
    layers: state.layers.filter((l) => l.id !== id),
    selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
  })),

  setSelectedLayer: (id) => set({ selectedLayerId: id }),

  reorderLayers: (startIndex, endIndex) => set((state) => {
    const result = [...state.layers];
    if (startIndex < 0 || startIndex >= result.length) return {};
    const [removed] = result.splice(startIndex, 1);
    if (!removed) return {};
    result.splice(endIndex, 0, removed);
    return { layers: result.map((l, i) => ({ ...l, zIndex: i })) };
  }),

  moveLayerUp: (id) => set((state) => {
    const index = state.layers.findIndex(l => l.id === id);
    if (index === -1 || index >= state.layers.length - 1) return {};
    const newLayers = [...state.layers];
    const temp = newLayers[index];
    newLayers[index] = newLayers[index + 1];
    newLayers[index + 1] = temp;
    return { layers: newLayers.map((l, i) => ({ ...l, zIndex: i })) };
  }),

  moveLayerDown: (id) => set((state) => {
    const index = state.layers.findIndex(l => l.id === id);
    if (index <= 0) return {};
    const newLayers = [...state.layers];
    const temp = newLayers[index];
    newLayers[index] = newLayers[index - 1];
    newLayers[index - 1] = temp;
    return { layers: newLayers.map((l, i) => ({ ...l, zIndex: i })) };
  }),

  setCanvasSize: (width, height) => set({ canvasWidth: width, canvasHeight: height }),
  setZoom: (zoom) => set({ zoom }),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  
  loadProject: (newState) => set((state) => ({
    ...state,
    layers: newState.layers || [],
    canvasWidth: newState.canvasWidth || 800,
    canvasHeight: newState.canvasHeight || 600,
    selectedLayerId: null // 불러오기 후 선택 초기화
  })),

  alignLayerCenter: (id, axis) => set((state) => {
    const layer = state.layers.find(l => l.id === id);
    if (!layer) return {};
    const updates = axis === 'x' 
      ? { x: Math.round((state.canvasWidth - layer.width) / 2) }
      : { y: Math.round((state.canvasHeight - layer.height) / 2) };
    return {
      layers: state.layers.map(l => l.id === id ? { ...l, ...updates } : l)
    };
  })
}));
