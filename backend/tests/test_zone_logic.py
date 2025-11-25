from edge.pipeline.zone_logic import evaluate_zone_crossings


def test_zone_crossing_enter_exit():
    zones = {1: [(0, 0), (10, 0), (10, 10), (0, 10)]}
    state = {}
    tracks = [{"id": 1, "bbox": [1, 1, 2, 2]}]
    events = evaluate_zone_crossings(tracks, zones, state)
    assert any(e.event_type == "entered_zone" for e in events)
    # move out
    tracks = [{"id": 1, "bbox": [20, 20, 2, 2]}]
    events = evaluate_zone_crossings(tracks, zones, state)
    assert any(e.event_type == "exited_zone" for e in events)
