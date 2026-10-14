import { create } from 'zustand';

export type LatLng = { lat: number; lng: number };

export interface PolygonState {
    points: LatLng[];
    setPoints: (points: LatLng[]) => void;
    addPoint: (point: LatLng) => void;
    clearPoints: () => void;
    clearMapFlag: number;
    clearAll: () => void;
    focusRequest: LatLng | null;
    focusFirstPoint: () => void;
    resetFocusRequest: () => void;
    editMode: boolean;
    setEditMode: (editMode: boolean) => void;
}

export const usePolygonStore = create<PolygonState>((set, get) => ({
    points: [],
    setPoints: (points) => set({ points }),
    addPoint: (point) => set((state) => ({ points: [...state.points, point] })),
    clearPoints: () => set({ points: [] }),
    clearMapFlag: 0,
    clearAll: () =>
        set({ points: [], clearMapFlag: Date.now(), editMode: false }),
    focusRequest: null,
    focusFirstPoint: () => {
        const pts = get().points;
        if (pts.length > 0) {
            set({ focusRequest: pts[0] });
        }
    },
    resetFocusRequest: () => set({ focusRequest: null }),
    editMode: false,
    setEditMode: (editMode) => set({ editMode }),
}));

export type AlertType = 'fast-right-click' | 'custom';

export interface Alert {
    id: string;
    type: AlertType;
    title: string;
    description?: string;
    visible: boolean;
}

interface AlertState {
    alerts: Alert[];
    showAlert: (type: AlertType, title: string, description?: string) => void;
    hideAlert: (type: AlertType) => void;
}

const ALERT_DURATION_MS = 4000;
const alertTimers = new Map<AlertType, ReturnType<typeof setTimeout>>();

export const useAlertStore = create<AlertState>((set) => ({
    alerts: [],
    showAlert: (type, title, description) => {
        set((state) => {
            const id = type;
            const others = state.alerts.filter((a) => a.id !== id);
            return {
                alerts: [
                    ...others,
                    { id, type, title, description, visible: true },
                ],
            };
        });

        const existingTimer = alertTimers.get(type);
        if (existingTimer) clearTimeout(existingTimer);
        alertTimers.set(
            type,
            setTimeout(() => {
                alertTimers.delete(type);
                useAlertStore.getState().hideAlert(type);
            }, ALERT_DURATION_MS)
        );
    },
    hideAlert: (type) => {
        const existingTimer = alertTimers.get(type);
        if (existingTimer) {
            clearTimeout(existingTimer);
            alertTimers.delete(type);
        }
        set((state) => ({
            alerts: state.alerts.map((a) =>
                a.type === type ? { ...a, visible: false } : a
            ),
        }));
    },
}));

export const alertSet = useAlertStore.setState;
