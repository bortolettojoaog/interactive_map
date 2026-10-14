import Graphic from '@arcgis/core/Graphic';
import Polygon from '@arcgis/core/geometry/Polygon';
import { webMercatorToGeographic } from '@arcgis/core/geometry/support/webMercatorUtils';

type LatLng = { lat: number; lng: number };
type Coord = [number, number];
type TempPointsRef = { current: Coord[] };

interface MapMiddleware {
    drawGeometry: (coords: Coord[]) => void;
    removePointAtIndex: (idx: number) => void;
    focusFirstPoint: () => void;
    getCurrentGraphic: () => __esri.Graphic | null;
    syncGraphicToPoints: (graphic: __esri.Graphic) => void;
}

export function createMapMiddleware(
    graphicsLayer: __esri.GraphicsLayer,
    setPoints: (pts: LatLng[]) => void,
    tempPointsRef: TempPointsRef,
    view: __esri.MapView
): MapMiddleware {
    let currentGraphic: __esri.Graphic | null = null;

    function drawGeometry(coords: Coord[]): void {
        graphicsLayer.removeAll();
        currentGraphic = null;
        if (coords.length === 1) {
            const [lng, lat] = coords[0];
            const pointGraphic = new Graphic({
                geometry: { type: 'point', longitude: lng, latitude: lat },
                symbol: {
                    type: 'simple-marker',
                    color: [51, 51, 204, 0.8],
                    size: 12,
                    outline: { color: [255, 255, 255], width: 2 },
                },
            });
            graphicsLayer.add(pointGraphic);
            currentGraphic = pointGraphic;
        } else if (coords.length === 2) {
            const lineGraphic = new Graphic({
                geometry: {
                    type: 'polyline',
                    paths: [coords],
                    spatialReference: { wkid: 4326 },
                },
                symbol: {
                    type: 'simple-line',
                    color: [51, 51, 204],
                    width: 3,
                },
            });
            graphicsLayer.add(lineGraphic);
            currentGraphic = lineGraphic;
        } else if (coords.length > 2) {
            const closedCoords = [...coords];
            if (
                coords[0][0] !== coords[coords.length - 1][0] ||
                coords[0][1] !== coords[coords.length - 1][1]
            ) {
                closedCoords.push(coords[0]);
            }
            const polygon = new Polygon({ rings: [closedCoords] });
            const graphic = new Graphic({
                geometry: polygon,
                symbol: {
                    type: 'simple-fill',
                    color: [51, 51, 204, 0.2],
                    outline: { color: [51, 51, 204], width: 2 },
                },
            });
            graphicsLayer.add(graphic);
            currentGraphic = graphic;
        }
    }

    function removePointAtIndex(idx: number): void {
        tempPointsRef.current.splice(idx, 1);
        setPoints(tempPointsRef.current.map(([lng, lat]) => ({ lat, lng })));
        drawGeometry(tempPointsRef.current);
    }

    function focusFirstPoint(): void {
        const firstPoint = tempPointsRef.current[0];
        if (firstPoint && view) {
            const [lng, lat] = firstPoint;
            view.goTo({ center: [lng, lat], zoom: 18 });
        }
    }

    function getCurrentGraphic(): __esri.Graphic | null {
        return currentGraphic;
    }

    function syncGraphicToPoints(graphic: __esri.Graphic): void {
        const rawGeometry = graphic.geometry;
        if (!rawGeometry) return;

        // O SketchViewModel devolve a geometria na projecao da view (Web
        // Mercator, em metros); o store trabalha em lat/lng.
        const geometry = rawGeometry.spatialReference?.isWebMercator
            ? webMercatorToGeographic(rawGeometry)
            : rawGeometry;
        if (!geometry) return;

        let coords: Coord[] = [];

        if (geometry.type === 'point') {
            const point = geometry as __esri.Point;
            if (point.longitude == null || point.latitude == null) return;
            coords = [[point.longitude, point.latitude]];
        } else if (geometry.type === 'polyline') {
            const polyline = geometry as __esri.Polyline;
            coords = (polyline.paths[0] || []) as Coord[];
        } else if (geometry.type === 'polygon') {
            const polygon = geometry as __esri.Polygon;
            const ring = (polygon.rings[0] || []) as Coord[];
            const isClosed =
                ring.length > 1 &&
                ring[0][0] === ring[ring.length - 1][0] &&
                ring[0][1] === ring[ring.length - 1][1];
            coords = isClosed ? ring.slice(0, -1) : ring;
        }

        tempPointsRef.current = coords;
        setPoints(coords.map(([lng, lat]) => ({ lat, lng })));
    }

    return {
        drawGeometry,
        removePointAtIndex,
        focusFirstPoint,
        getCurrentGraphic,
        syncGraphicToPoints,
    };
}
