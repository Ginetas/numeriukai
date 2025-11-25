export interface Camera {
  id: number;
  name: string;
  rtsp_url: string;
  zone_id?: number | null;
  fps?: number | null;
  enabled: boolean;
}

export interface Zone {
  id: number;
  name: string;
  type: string;
  polygon: string;
}

export interface ModelConfig {
  id: number;
  name: string;
  type: string;
  version?: string | null;
  active: boolean;
  config: string;
}

export interface Sensor {
  id: number;
  name: string;
  type: string;
  config: string;
  camera_id?: number | null;
  zone_id?: number | null;
}

export interface Exporter {
  id: number;
  name: string;
  type: string;
  endpoint?: string | null;
  config: string;
  enabled: boolean;
  last_status?: string | null;
}

export interface PlateEvent {
  id: number;
  plate: string;
  camera_id?: number | null;
  zone_id?: number | null;
  timestamp: string;
  meta: Record<string, unknown>;
}

export interface HealthResponse {
  status: string;
}
