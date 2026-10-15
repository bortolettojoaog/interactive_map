import './Version.css';

function Version() {
    const version = import.meta.env.VITE_APP_VERSION || 'dev';

    return (
        <div className="version-footer">
            v{version} powered by <b>BortolettoTech</b>
        </div>
    );
}

export default Version;
