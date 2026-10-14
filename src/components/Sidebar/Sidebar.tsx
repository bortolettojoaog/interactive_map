import React, { useEffect, useRef, useState } from 'react';
import { useAlertStore, usePolygonStore } from '../../hooks/store';
import Version from '../Version/Version';
import './Sidebar.css';

function IconCopy() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="8" y="8" width="12" height="12" rx="2" />
            <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
        </svg>
    );
}

function IconTarget() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="7" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
    );
}

function IconTrash() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
        </svg>
    );
}

function IconEdit() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
    );
}

export default function Sidebar() {
    const points = usePolygonStore((s) => s.points);
    const setPoints = usePolygonStore((s) => s.setPoints);
    const clearAll = usePolygonStore((s) => s.clearAll);
    const editMode = usePolygonStore((s) => s.editMode);
    const setEditMode = usePolygonStore((s) => s.setEditMode);

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
            <div className="sidebar-scroll">
                <header className="sidebar-header">
                    <h2>Polygon Points</h2>
                    <span className="point-count">
                        {points.length}{' '}
                        {points.length === 1 ? 'point' : 'points'}
                    </span>
                </header>

                <textarea
                    className="points-input"
                    value={textareaValue}
                    onChange={handleTextareaChange}
                    placeholder="Enter one lat,lng per line or draw on map"
                />

                <label
                    className={[
                        'edit-toggle',
                        editMode && 'edit-toggle-active',
                        points.length === 0 && 'edit-toggle-disabled',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                    title="Drag existing points on the map instead of adding new ones"
                >
                    <span className="edit-toggle-icon">
                        <IconEdit />
                    </span>
                    <span className="btn-text">
                        <span className="btn-label">Edit mode</span>
                        <span className="btn-format">
                            {editMode
                                ? 'Drag points to reshape'
                                : 'Click to add, right-click to remove'}
                        </span>
                    </span>
                    <input
                        type="checkbox"
                        checked={editMode}
                        disabled={points.length === 0}
                        onChange={(e) => setEditMode(e.target.checked)}
                    />
                    <span className="edit-toggle-switch" />
                </label>

                <div className="field-group">
                    <span className="field-label">Copy coordinates as</span>
                    <div className="copy-buttons">
                        <button
                            type="button"
                            className="btn-copy"
                            onClick={handleCopyLatLng}
                            title="Copy as array [lat, lng]"
                        >
                            <IconCopy />
                            <span className="btn-text">
                                <span className="btn-label">List</span>
                                <span className="btn-format">
                                    [lat, lng]
                                </span>
                            </span>
                        </button>
                        <button
                            type="button"
                            className="btn-copy"
                            onClick={handleCopyLngLat}
                            title="Copy as array [lng, lat]"
                        >
                            <IconCopy />
                            <span className="btn-text">
                                <span className="btn-label">
                                    Inverted list
                                </span>
                                <span className="btn-format">
                                    [lng, lat]
                                </span>
                            </span>
                        </button>
                        <button
                            type="button"
                            className="btn-copy"
                            onClick={handleCopyJson}
                            title="Copy as JSON [{lat, lng}]"
                        >
                            <IconCopy />
                            <span className="btn-text">
                                <span className="btn-label">JSON</span>
                                <span className="btn-format">
                                    [{'{lat, lng}'}]
                                </span>
                            </span>
                        </button>
                        <button
                            type="button"
                            className="btn-copy"
                            onClick={handleCopyJsonLngLat}
                            title="Copy as JSON [{lng, lat}]"
                        >
                            <IconCopy />
                            <span className="btn-text">
                                <span className="btn-label">
                                    Inverted JSON
                                </span>
                                <span className="btn-format">
                                    [{'{lng, lat}'}]
                                </span>
                            </span>
                        </button>
                    </div>
                </div>

                <div className="field-group">
                    <span className="field-label">Actions</span>
                    <div className="sidebar-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleFocusFirstPoint}
                            disabled={points.length === 0}
                            title="Center the map on the first point"
                        >
                            <IconTarget />
                            Focus first point
                        </button>
                        <button
                            type="button"
                            className="btn-danger"
                            onClick={handleClear}
                            disabled={points.length === 0}
                            title="Remove all points"
                        >
                            <IconTrash />
                            Clear all
                        </button>
                    </div>
                </div>
            </div>

            <Version />
        </div>
    );
}
