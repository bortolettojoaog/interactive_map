import { lazy, Suspense } from 'react';
import './App.css';
import FloatingAlert from './components/FloatingAlert/FloatingAlert';
import './components/Map/CustomMap.css';
import Sidebar from './components/Sidebar/Sidebar';
import { useAlertStore } from './hooks/store';

const CustomMap = lazy(() => import('./components/Map/CustomMap'));

function App() {
    const { alerts, hideAlert } = useAlertStore();

    const visibleAlert = [...alerts].reverse().find((a) => a.visible);
    return (
        <>
            {visibleAlert && (
                <FloatingAlert
                    visible={visibleAlert.visible}
                    title={visibleAlert.title}
                    description={visibleAlert.description}
                    onClose={() => hideAlert(visibleAlert.type)}
                />
            )}
            <section className="principal">
                <Suspense
                    fallback={<div className="map-container map-loading" />}
                >
                    <CustomMap />
                </Suspense>
                <Sidebar />
            </section>
        </>
    );
}

export default App;
