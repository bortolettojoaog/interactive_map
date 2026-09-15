import Graphic from '@arcgis/core/Graphic';
import Polygon from '@arcgis/core/geometry/Polygon';

type LatLng = { lat: number; lng: number };
type Coord = [number, number];
type TempPointsRef = { current: Coord[] };

interface MapMiddleware {
    drawGeometry: (coords: Coord[]) => void;
    removePointAtIndex: (idx: number) => void;
    focusFirstPoint: () => void;
}

export function createMapMiddleware(
    graphicsLayer: __esri.GraphicsLayer,
    setPoints: (pts: LatLng[]) => void,
    tempPointsRef: TempPointsRef,
    view: __esri.MapView
): MapMiddleware {
    function drawGeometry(coords: Coord[]): void {
        graphicsLayer.removeAll();
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

    return {
        drawGeometry,
        removePointAtIndex,
        focusFirstPoint,
    };
}
