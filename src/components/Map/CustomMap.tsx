import '@arcgis/core/assets/esri/themes/light/main.css';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import { MutableRefObject, useEffect, useRef } from 'react';
import { usePolygonStore } from '../../hooks/store';
import { createMapMiddleware } from '../../middleware/mapMiddleware';
import { createArcGISMap, setupMapEvents } from '../../utils/Map';

import './CustomMap.css';

export default function CustomMap() {
    const mapDiv = useRef<HTMLDivElement | null>(null);
    const graphicsLayerRef = useRef<GraphicsLayer | null>(null);
    const setPoints = usePolygonStore((s) => s.setPoints);
    const tempPointsRef = useRef<[number, number][]>([]);

    useEffect(() => {
        if (!mapDiv.current) return;
        const graphicsLayer = new GraphicsLayer();
        graphicsLayerRef.current = graphicsLayer;

        const { view } = createArcGISMap({
            container: mapDiv.current,
            graphicsLayer,
            center: [-47.8689551, -22.0589343],
            zoom: 14,
        });

        const { drawGeometry } = createMapMiddleware(
            graphicsLayer,
            setPoints,
            tempPointsRef as MutableRefObject<[number, number][]>,
            view
        );

        setupMapEvents({
            view,
            tempPointsRef: tempPointsRef as MutableRefObject<
                [number, number][]
            >,
            setPoints,
            drawGeometry,
        });

        const unsubClear = usePolygonStore.subscribe((state) => {
            if (state.clearMapFlag) {
                graphicsLayer.removeAll();
            }
        });

        const unsub = usePolygonStore.subscribe((state) => {
            const coords = state.points.map(
                (p) => [p.lng, p.lat] as [number, number]
            );
            tempPointsRef.current = coords;
            drawGeometry(coords);
        });

        const unsubFocus = usePolygonStore.subscribe((state) => {
            const focus = state.focusRequest;
            if (focus) {
                view.goTo({ center: [focus.lng, focus.lat], zoom: 18 });
                usePolygonStore.getState().resetFocusRequest();
            }
        });

        if (mapDiv.current) {
            mapDiv.current.addEventListener('contextmenu', (e) =>
                e.preventDefault()
            );
        }

        return () => {
            unsub();
            unsubClear();
            unsubFocus();
            view.destroy();
        };
    }, [setPoints]);

    return <div className="map-container" ref={mapDiv} />;
}
