export type OCRModel = {
  id?: number;
  name: string;
  type: string;
  weight: number;
  enabled: boolean;
  priority: number;
  params: Record<string, unknown>;
};
