# Object Tracking and Zone Logic

The edge pipeline ships with a centroid tracker that assigns IDs to detections and tracks their bounding boxes. IOU-based matching chooses the best track for each detection.

Zone crossing uses polygon geometry. For each track, the centroid is calculated; entering or exiting polygons emits `entered_zone` or `exited_zone` events respectively.
