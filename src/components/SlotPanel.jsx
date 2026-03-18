import React from 'react';
import DropZone from './DropZone';

export default function SlotPanel({ parts, onPartChange, tabName, onResetTransform }) {

    const mouthConfigs = [
        { key: 'mouth0', icon: '😐', label: 'Closed Mouth' },
        { key: 'mouth1', icon: '😮', label: 'Slightly Open Mouth' },
        { key: 'mouth2', icon: '😲', label: 'Open Mouth' },
        { key: 'mouth3', icon: '📢', label: 'Wide Open Mouth' },
    ];

    const activeKeys = mouthConfigs.filter(c => parts[c.key] !== null).map(c => c.key);

    const getLabel = (key) => {
        const index = mouthConfigs.findIndex(c => c.key === key);
        if (parts[key] === null) return `Unset (${mouthConfigs[index].label})`;
        return mouthConfigs[index].label;
    };

    return (
        <div className="slots-container">
            <h2 className="slots-title">🧩 Assemble Model Assets</h2>

            <div className="slot-group">
                <h3>Model and Mouth (Lip-sync Variants)</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.4' }}>
                    The number of lip-sync variants you upload will be displayed according to the volume level. (Max 4 images, please use transparent PNGs)
                </p>
                <div className="drop-zones-grid">
                    {mouthConfigs.map(config => (
                        <DropZone
                            key={config.key}
                            label={parts[config.key] ? getLabel(config.key) : config.label}
                            icon={config.icon}
                            value={parts[config.key]}
                            onChange={(url) => onPartChange(config.key, url)}
                        />
                    ))}
                </div>
            </div>

            <div className="slot-group">
                <h3>Eyes (Blinking Variants)</h3>
                <div className="drop-zones-grid">
                    <DropZone label="Eyes Open" icon="👀" value={parts.eyeOpen} onChange={(url) => onPartChange('eyeOpen', url)} />
                    <DropZone label="Half-Open Eyes" icon="😑" value={parts.eyeHalf} onChange={(url) => onPartChange('eyeHalf', url)} />
                    <DropZone label="Eyes Closed" icon="😌" value={parts.eyeClosed} onChange={(url) => onPartChange('eyeClosed', url)} />
                </div>
            </div>

            <div className="slot-group" style={{ marginTop: '24px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                <h3 style={{ marginBottom: '12px' }}>Model Placement</h3>
                <button
                    className="bg-toggle-btn"
                    style={{ width: '100%', padding: '12px' }}
                    onClick={onResetTransform}
                >
                    🔄 Reset {tabName}'s model placement
                </button>
            </div>

        </div>
    );
}
