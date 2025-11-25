export type Point = { x: number; y: number };
export type Geometry = {
  type: 'Polygon';
  points: Point[];
  scale: number;
  translation: Point;
};

export const DEFAULT_GEOMETRY: Geometry = {
  type: 'Polygon',
  points: [],
  scale: 1,
  translation: { x: 0, y: 0 },
};

const EPSILON = 1e-6;

export function serializeGeometry(geometry: Geometry): string {
  return JSON.stringify(geometry);
}

export function parseGeometry(raw: string | Geometry | null | undefined): Geometry | null {
  if (!raw) return null;
  if (typeof raw !== 'string') return raw;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.type === 'Polygon' && Array.isArray(parsed.points)) {
      return {
        type: 'Polygon',
        points: parsed.points,
        scale: parsed.scale ?? 1,
        translation: parsed.translation ?? { x: 0, y: 0 },
      } as Geometry;
    }
  } catch (error) {
    return null;
  }
  return null;
}

function cross(p: Point, q: Point, r: Point) {
  return (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
}

function segmentsIntersect(p1: Point, p2: Point, p3: Point, p4: Point): boolean {
  const d1 = cross(p1, p2, p3);
  const d2 = cross(p1, p2, p4);
  const d3 = cross(p3, p4, p1);
  const d4 = cross(p3, p4, p2);

  if (
    Math.sign(d1) !== Math.sign(d2) &&
    Math.sign(d3) !== Math.sign(d4)
  ) {
    return true;
  }

  const onSegment = (a: Point, b: Point, c: Point) =>
    Math.min(a.x, b.x) - EPSILON <= c.x &&
    c.x <= Math.max(a.x, b.x) + EPSILON &&
    Math.min(a.y, b.y) - EPSILON <= c.y &&
    c.y <= Math.max(a.y, b.y) + EPSILON &&
    Math.abs(cross(a, b, c)) < EPSILON;

  return (
    (Math.abs(d1) < EPSILON && onSegment(p1, p2, p3)) ||
    (Math.abs(d2) < EPSILON && onSegment(p1, p2, p4)) ||
    (Math.abs(d3) < EPSILON && onSegment(p3, p4, p1)) ||
    (Math.abs(d4) < EPSILON && onSegment(p3, p4, p2))
  );
}

export function isSelfIntersecting(points: Point[]): boolean {
  if (points.length < 4) return false;
  for (let i = 0; i < points.length; i++) {
    const a1 = points[i];
    const a2 = points[(i + 1) % points.length];
    for (let j = i + 1; j < points.length; j++) {
      const b1 = points[j];
      const b2 = points[(j + 1) % points.length];
      if (Math.abs(i - j) <= 1 || (i === 0 && j === points.length - 1)) {
        continue; // adjacent edges
      }
      if (segmentsIntersect(a1, a2, b1, b2)) return true;
    }
  }
  return false;
}

export function polygonArea(points: Point[]): number {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y - points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
}

export function validatePolygon(points: Point[]): { valid: boolean; error?: string } {
  if (points.length < 3) {
    return { valid: false, error: 'Polygon requires at least 3 points.' };
  }
  if (isSelfIntersecting(points)) {
    return { valid: false, error: 'Polygon edges intersect each other.' };
  }
  if (polygonArea(points) < EPSILON) {
    return { valid: false, error: 'Polygon area is too small.' };
  }
  return { valid: true };
}

export function pointCount(geometry: Geometry | null): number {
  return geometry?.points?.length ?? 0;
}
