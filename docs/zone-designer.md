# Zone Designer

The Zone Designer is an interactive tool embedded in the configuration UI for defining spatial polygons (zones) used by the ANPR platform.

## Key capabilities
- Draw polygon vertices by clicking on the canvas. Double-click or press **Finish** to close the shape.
- Undo the last point, clear the entire drawing, or start over.
- Switch between zone types (Entry, Exit, Control) and rename zones inline.
- Pan with right-click + drag and zoom with the scroll wheel while keeping coordinates consistent.
- Validate that polygons have at least three points and do not self-intersect.
- Serialize geometry (points, scale, translation) to JSON for backend storage.

## How to use
1. Navigate to **Config → Zones** and click **Create zone** (or **Edit** on an existing one).
2. In the dialog, use the toolbar to set the name and zone type.
3. Click on the canvas to place vertices. The polygon preview closes automatically.
4. Zoom with the scroll wheel. Right-click and drag to pan.
5. Click **Finish** to validate the polygon. Use **Undo** or **Clear** as needed.
6. Press **Save** to persist the zone to the backend.

## Geometry format
The saved geometry matches the following schema:
```json
{
  "type": "Polygon",
  "points": [
    { "x": 123, "y": 244 },
    { "x": 200, "y": 300 }
  ],
  "scale": 1,
  "translation": { "x": 0, "y": 0 }
}
```
- **points** represent the raw canvas coordinates before applying zoom/pan.
- **scale** and **translation** capture the viewport so the backend can rebuild the original geometry.

## Editing existing zones
Opening a saved zone preloads its name, type, points, scale, and translation. You can continue drawing, undo points, or clear to redraw. Saving issues a `PUT /config/zones/{id}` request.

## Persistence
- **Create** uses `POST /config/zones`.
- **Update** uses `PUT /config/zones/{id}`.
- **Delete** uses `DELETE /config/zones/{id}` from the list view.

## Integrating with the pipeline
The serialized geometry can be consumed by edge processing stages such as line-crossing or region-of-interest filters. A typical pattern is to transform detected object coordinates into the same space as the stored polygon and then test whether the point lies within the polygon or intersects polygon edges for entry/exit logic.
