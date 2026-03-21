import React from 'react';
import DropZone from './DropZone';

export default function SlotPanel({ parts, onPartChange, tabName, onResetTransform, backdrop, onBackdropChange, layoutTransform, onLayoutTransformChange }) {

    const updateBackdrop = (key, value) => {
        onBackdropChange({ ...(backdrop || {}), [key]: value });
    };

    const updateTransform = (key, value) => {
        onLayoutTransformChange({ ...(layoutTransform || { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 }), [key]: value });
    };

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

                <div style={{ marginBottom: '16px' }}>
                    <div className="slider-header">
                        <span>Position X</span>
                        <span>{layoutTransform?.x || 0}px</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                        <input
                            type="range"
                            min="-1000"
                            max="2000"
                            value={layoutTransform?.x || 0}
                            onChange={(e) => updateTransform('x', parseInt(e.target.value, 10))}
                            className="range-slider"
                            style={{ flex: 1 }}
                        />
                        <input
                            type="number"
                            value={layoutTransform?.x || 0}
                            onChange={(e) => updateTransform('x', parseInt(e.target.value, 10) || 0)}
                            style={{ width: '60px', padding: '4px 6px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.85rem', textAlign: 'center' }}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <div className="slider-header">
                        <span>Position Y</span>
                        <span>{layoutTransform?.y || 0}px</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                        <input
                            type="range"
                            min="-1000"
                            max="2000"
                            value={layoutTransform?.y || 0}
                            onChange={(e) => updateTransform('y', parseInt(e.target.value, 10))}
                            className="range-slider"
                            style={{ flex: 1 }}
                        />
                        <input
                            type="number"
                            value={layoutTransform?.y || 0}
                            onChange={(e) => updateTransform('y', parseInt(e.target.value, 10) || 0)}
                            style={{ width: '60px', padding: '4px 6px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.85rem', textAlign: 'center' }}
                        />
                    </div>
                </div>

                <button
                    className="bg-toggle-btn"
                    style={{ width: '100%', padding: '12px' }}
                    onClick={onResetTransform}
                >
                    🔄 Reset {tabName}'s model placement
                </button>
            </div>

            {/* Backdrop Section */}
            <div className="slot-group" style={{ marginTop: '24px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                <h3 style={{ marginBottom: '12px' }}>⭕ Backdrop</h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span>Circle Border</span>
                    <button
                        className={`bg-toggle-btn ${backdrop?.enabled ? 'active' : ''}`}
                        onClick={() => updateBackdrop('enabled', !backdrop?.enabled)}
                    >
                        {backdrop?.enabled ? 'ON' : 'OFF'}
                    </button>
                </div>

                {backdrop?.enabled && (
                    <>
                        <div style={{ marginBottom: '16px' }}>
                            <div className="slider-header">
                                <span>Position X</span>
                                <span>{backdrop?.offsetX || 0}px</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                <input
                                    type="range"
                                    min="-1000"
                                    max="2000"
                                    value={backdrop?.offsetX || 0}
                                    onChange={(e) => updateBackdrop('offsetX', parseInt(e.target.value, 10))}
                                    className="range-slider"
                                    style={{ flex: 1 }}
                                />
                                <input
                                    type="number"
                                    value={backdrop?.offsetX || 0}
                                    onChange={(e) => updateBackdrop('offsetX', parseInt(e.target.value, 10) || 0)}
                                    style={{ width: '60px', padding: '4px 6px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.85rem', textAlign: 'center' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <div className="slider-header">
                                <span>Position Y</span>
                                <span>{backdrop?.offsetY || 0}px</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                <input
                                    type="range"
                                    min="-1000"
                                    max="2000"
                                    value={backdrop?.offsetY || 0}
                                    onChange={(e) => updateBackdrop('offsetY', parseInt(e.target.value, 10))}
                                    className="range-slider"
                                    style={{ flex: 1 }}
                                />
                                <input
                                    type="number"
                                    value={backdrop?.offsetY || 0}
                                    onChange={(e) => updateBackdrop('offsetY', parseInt(e.target.value, 10) || 0)}
                                    style={{ width: '60px', padding: '4px 6px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.85rem', textAlign: 'center' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <div className="slider-header">
                                <span>Diameter</span>
                                <span>{backdrop?.diameter || 100}px</span>
                            </div>
                            <input
                                type="range"
                                min="50"
                                max="2000"
                                value={backdrop?.diameter || 100}
                                onChange={(e) => updateBackdrop('diameter', parseInt(e.target.value, 10))}
                                className="range-slider"
                                style={{ marginTop: '8px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <div className="slider-header">
                                <span>Border Thickness</span>
                                <span>{backdrop?.borderThickness || 10}px</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={backdrop?.borderThickness || 10}
                                onChange={(e) => updateBackdrop('borderThickness', parseInt(e.target.value, 10))}
                                className="range-slider"
                                style={{ marginTop: '8px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <div className="slider-header" style={{ marginBottom: '8px' }}>
                                <span>Border Color</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="color"
                                    value={backdrop?.borderColor || '#800080'}
                                    onChange={(e) => updateBackdrop('borderColor', e.target.value)}
                                    style={{ width: '40px', height: '32px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                                />
                                <input
                                    type="text"
                                    value={backdrop?.borderColor || '#800080'}
                                    onChange={(e) => updateBackdrop('borderColor', e.target.value)}
                                    style={{ flex: 1, padding: '6px 8px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="slider-header" style={{ marginBottom: '8px' }}>
                                <span>Fill Color</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="color"
                                    value={backdrop?.fillColor || '#ffffff'}
                                    onChange={(e) => updateBackdrop('fillColor', e.target.value)}
                                    style={{ width: '40px', height: '32px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                                />
                                <input
                                    type="text"
                                    value={backdrop?.fillColor || '#ffffff'}
                                    onChange={(e) => updateBackdrop('fillColor', e.target.value)}
                                    style={{ flex: 1, padding: '6px 8px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span>Background Image</span>
                                <button
                                    className={`bg-toggle-btn ${backdrop?.bgImageEnabled ? 'active' : ''}`}
                                    onClick={() => updateBackdrop('bgImageEnabled', !backdrop?.bgImageEnabled)}
                                    disabled={!backdrop?.bgImage}
                                    style={{ opacity: backdrop?.bgImage ? 1 : 0.5 }}
                                >
                                    {backdrop?.bgImageEnabled ? 'ON' : 'OFF'}
                                </button>
                            </div>
                            <DropZone
                                label={backdrop?.bgImage ? 'Background Image Set' : 'Background Image'}
                                icon="🖼️"
                                value={backdrop?.bgImage}
                                onChange={(url) => {
                                    if (url) {
                                        onBackdropChange({ ...(backdrop || {}), bgImage: url, bgImageEnabled: true });
                                    } else {
                                        onBackdropChange({ ...(backdrop || {}), bgImage: null, bgImageEnabled: false });
                                    }
                                }}
                            />
                        </div>
                    </>
                )}
            </div>

        </div>
    );
}
