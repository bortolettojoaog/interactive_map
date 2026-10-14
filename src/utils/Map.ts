import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import { alertSet, usePolygonStore } from '../hooks/store';

type LatLng = { lat: number; lng: number };

interface CreateArcGISMapParams {
    container: string | HTMLDivElement;
    graphicsLayer: GraphicsLayer;
    center: [number, number];
    zoom: number;
}

export function createArcGISMap({
    container,
    graphicsLayer,
    center,
    zoom,
}: CreateArcGISMapParams): { map: Map; view: __esri.MapView } {
    const map = new Map({
        basemap: 'hybrid',
        layers: [graphicsLayer],
    });
    const view = new MapView({
        container,
        map,
        center,
        zoom,
        constraints: {
            minZoom: 3,
        },
    });
    return { map, view };
}

interface SetupMapEventsParams {
    view: __esri.MapView;
    tempPointsRef: { current: [number, number][] };
    setPoints: (pts: LatLng[]) => void;
    drawGeometry: (coords: [number, number][]) => void;
}

export function setupMapEvents({
    view,
    tempPointsRef,
    setPoints,
    drawGeometry,
}: SetupMapEventsParams) {
    let suppressNextClick = false;
    let rightClickLocked = false;
    const RIGHT_CLICK_DEBOUNCE = 300;

    function syncTempPointsWithStore(points: LatLng[]) {
        tempPointsRef.current = points.map((p) => [p.lng, p.lat]);
        drawGeometry(tempPointsRef.current);
    }

    view.on('pointer-down', (event: any) => {
        if (usePolygonStore.getState().editMode) return;
        event.preventDefault();
        if (event.button === 2) {
            if (rightClickLocked) {
                alertSet((state: { alerts: any[] }) => {
                    const type = 'fast-right-click';
                    const id = type;
                    const others = state.alerts.filter((a: any) => a.id !== id);
                    return {
                        alerts: [
                            ...others,
                            {
                                id,
                                type,
                                title: 'Right-click too fast',
                                description:
                                    'Please wait a moment before removing another point.',
                                visible: true,
                            },
                        ],
                    };
                });
                suppressNextClick = true;

                syncTempPointsWithStore(
                    tempPointsRef.current.map(([lng, lat]) => ({ lat, lng }))
                );
                return;
            }
            rightClickLocked = true;
            setTimeout(() => {
                rightClickLocked = false;
            }, RIGHT_CLICK_DEBOUNCE);

            suppressNextClick = true;
            if (tempPointsRef.current.length > 0) {
                tempPointsRef.current.pop();
                setPoints(
                    tempPointsRef.current.map(([lng, lat]) => ({ lat, lng }))
                );
                drawGeometry(tempPointsRef.current);
            }
        }
    });

    view.on('click', (event: any) => {
        if (usePolygonStore.getState().editMode) return;
        if (suppressNextClick) {
            suppressNextClick = false;
            return;
        }
        view.hitTest(event).then(() => {
            const { latitude, longitude } = event.mapPoint;
            tempPointsRef.current.push([longitude, latitude]);
            setPoints(
                tempPointsRef.current.map(([lng, lat]) => ({ lat, lng }))
            );
            drawGeometry(tempPointsRef.current);
        });
    });
}
