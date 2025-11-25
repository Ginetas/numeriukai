export type PlateEvent = {
  id?: number;
  plate_text: string;
  confidence?: number;
  camera_id?: number | string;
  zone_id?: number | string;
  bbox: { x: number; y: number; w: number; h: number };
  full_frame_url?: string;
  crop_url?: string;
  timestamp: string;
};
