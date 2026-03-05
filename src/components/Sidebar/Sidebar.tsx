import React, { useEffect, useRef, useState } from 'react';
import { useAlertStore, usePolygonStore } from '../../hooks/store';
import Version from '../Version/Version';
import './Sidebar.css';

export default function Sidebar() {
    const points = usePolygonStore((s) => s.points);
    const setPoints = usePolygonStore((s) => s.setPoints);
    const clearAll = usePolygonStore((s) => s.clearAll);

    const [textareaValue, setTextareaValue] = useState('');

    const isFromTextarea = useRef(false);
    useEffect(() => {
        if (!isFromTextarea.current || textareaValue.trim() === '') {
            setTextareaValue(
                points.map((p) => `${p.lat}, ${p.lng}`).join('\n')
            );
        }
        isFromTextarea.current = false;
    }, [points]);

    function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setTextareaValue(e.target.value);
        isFromTextarea.current = true;
        const lines = e.target.value.split('\n');
        const pts = lines
            .map((line) => line.trim().split(/,\s*|\s+/))
            .filter(
                (arr) =>
                    arr.length === 2 &&
                    !isNaN(Number(arr[0])) &&
                    !isNaN(Number(arr[1]))
            )
            .map(([lat, lng]): { lat: number; lng: number } => ({
                lat: parseFloat(lat),
                lng: parseFloat(lng),
            }));
        setPoints(pts);
    }

    function handleFocusFirstPoint() {
        if (points.length > 0) {
            usePolygonStore.getState().focusFirstPoint();
        }
    }

    function handleClear() {
        clearAll();
    }

    function showCopyAlert(label: string) {
        useAlertStore
            .getState()
            .showAlert(
                'custom',
                'Copied!',
                `Format ${label} copied to clipboard.`
            );
    }

    function handleCopyLatLng() {
        const arr = points.map((p) => [p.lat, p.lng]);
        navigator.clipboard.writeText(JSON.stringify(arr));
        showCopyAlert('Array [lat, lng]');
    }

    function handleCopyLngLat() {
        const arr = points.map((p) => [p.lng, p.lat]);
        navigator.clipboard.writeText(JSON.stringify(arr));
        showCopyAlert('Inverted Array [lng, lat]');
    }

    function handleCopyJson() {
        navigator.clipboard.writeText(JSON.stringify(points));
        showCopyAlert('JSON [{lat, lng}]');
    }

    function handleCopyJsonLngLat() {
        const arr = points.map((p) => ({ lng: p.lat, lat: p.lng }));
        navigator.clipboard.writeText(JSON.stringify(arr));
        showCopyAlert('Inverted JSON [{lng, lat}]');
    }

    return (
        <div className="sidebar">
            <div>
                <h2>Polygon Points</h2>
                <textarea
                    value={textareaValue}
                    onChange={handleTextareaChange}
                    placeholder="Enter one lat,lng per line or draw on map"
                />
                <div className="copy-buttons">
                    <button
                        type="button"
                        onClick={handleCopyLatLng}
                        style={{ flex: 1 }}
                        title="Copy as array [lat, lng]"
                    >
                        List
                    </button>
                    <button
                        type="button"
                        onClick={handleCopyLngLat}
                        style={{ flex: 1 }}
                        title="Copy as array [lng, lat]"
                    >
                        Inv. List
                    </button>
                    <button
                        type="button"
                        onClick={handleCopyJson}
                        style={{ flex: 1 }}
                        title="Copy as JSON [{lat, lng}]"
                    >
                        JSON
                    </button>
                    <button
                        type="button"
                        onClick={handleCopyJsonLngLat}
                        style={{ flex: 1 }}
                        title="Copy as JSON [{lng, lat}]"
                    >
                        Inv. JSON
                    </button>
                </div>
            </div>
            <div className="sidebar-actions">
                <button
                    onClick={handleFocusFirstPoint}
                    disabled={points.length === 0}
                    title="Focus on first point"
                >
                    Focus 1st
                </button>
                <button onClick={handleClear}>Clear</button>
            </div>
            <Version />
        </div>
    );
}
