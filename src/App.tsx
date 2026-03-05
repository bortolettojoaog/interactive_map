import './App.css';
import FloatingAlert from './components/FloatingAlert/FloatingAlert';
import CustomMap from './components/Map/CustomMap';
import Sidebar from './components/Sidebar/Sidebar';
import { useAlertStore } from './hooks/store';

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
                <CustomMap />
                <Sidebar />
            </section>
        </>
    );
}

export default App;
