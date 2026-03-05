import './FloatingAlert.css';

interface FloatingAlertProps {
    readonly title: string;
    readonly description?: string;
    readonly visible: boolean;
    readonly onClose?: () => void;
}

export default function FloatingAlert({
    title,
    description,
    visible,
    onClose,
}: FloatingAlertProps) {
    if (!visible) return null;
    return (
        <div className="floating-alert">
            <div className="floating-alert-content">
                <div className="floating-alert-header">
                    <span className="floating-alert-title">{title}</span>
                    {onClose && (
                        <button
                            className="floating-alert-close"
                            onClick={onClose}
                        >
                            &times;
                        </button>
                    )}
                </div>
                {description && (
                    <div className="floating-alert-desc">{description}</div>
                )}
            </div>
        </div>
    );
}
