import React from 'react';

export default function CalibrationModal({
    isOpen,
    onClose,
    globalSettings,
    onGlobalSettingsChange,
    audioAnalyzer,
    onStartStream
}) {
    if (!isOpen) return null;

    const updateGlobal = (key, value) => {
        onGlobalSettingsChange({ ...globalSettings, [key]: value });
    };

    const silenceSeconds = (0.5 + (globalSettings.silenceThreshold / 100) * 9.5).toFixed(1);

    const {
        calibrationPhase, startCalibration, resetCalibration,
        calibratedNormal,
        audioDevices, selectedDeviceId, changeDevice
    } = audioAnalyzer;

    const getWizardGuideText = () => {
        switch (calibrationPhase) {
            case 'normal': return '🎤 Speak in a normal voice for 3 seconds...';
            default: return 'Turn on the mic and then measure!';
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="calibration-modal glass-panel" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>×</button>
                <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>⚙️ Various Settings</h2>

                {/* --- Mic Settings Area --- */}
                <div className="setting-section" style={{ padding: '16px', marginBottom: '24px' }}>
                    <h3 style={{ marginBottom: '16px' }}>🎤 Mic Input</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <button
                            className={`mic-btn ${audioAnalyzer.isActive ? 'active' : ''}`}
                            onClick={audioAnalyzer.toggleMic}
                            style={{ width: '40px', height: '40px', fontSize: '1.2rem', flexShrink: 0 }}
                            title="Mic ON/OFF"
                        >
                            🎙️
                        </button>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                {audioAnalyzer.isActive ? 'Mic Connected' : 'Mic OFF'}
                            </div>
                            <div className="mic-level-bar" style={{ width: '100%', marginBottom: '8px' }}>
                                <div className="mic-level-fill" style={{ width: `${audioAnalyzer.level * 100}%` }}></div>
                            </div>
                            <select
                                value={selectedDeviceId}
                                onChange={(e) => changeDevice(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '6px',
                                    borderRadius: '4px',
                                    background: 'rgba(255,255,255,0.1)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--glass-border)',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="default">Default Mic</option>
                                {audioDevices.map(device => (
                                    <option key={device.deviceId} value={device.deviceId}>
                                        {device.label || `Mic ${device.deviceId.substring(0, 5)}...`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* ① Audio Calibration Area */}
                <div className="wizard-area">
                    <h3 style={{ marginBottom: '16px' }}>① Voice Measurement (Calibration)</h3>

                    <div className="wizard-status">
                        {getWizardGuideText()}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            className="learning-btn"
                            disabled={calibrationPhase !== 'idle'}
                            onClick={() => startCalibration('normal')}
                        >
                            Click & Speak (3s)
                        </button>
                        <button
                            className="learning-btn"
                            disabled={calibrationPhase !== 'idle'}
                            onClick={resetCalibration}
                            style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }}
                        >
                            Reset
                        </button>
                    </div>

                    <div className="pitch-values">
                        <div className="pitch-value-item">
                            <span style={{ fontSize: '0.8rem' }}>Measured Base Voice (Average Pitch)</span>
                            <span className="pitch-value-number">{Math.round(calibratedNormal)} Hz</span>
                        </div>
                    </div>
                </div>

                {/* ② Detailed Mode Settings Area */}
                <div className="setting-section">
                    <h3 style={{ marginBottom: '16px' }}>② Mode & Detailed Settings</h3>

                    {/* Expression Crossfade Settings */}
                    <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontWeight: 'bold', color: 'white' }}>Expression Transition Smoothing</span>
                            <button
                                className={`bg-toggle-btn ${globalSettings.crossfade ? 'active' : ''}`}
                                onClick={() => updateGlobal('crossfade', !globalSettings.crossfade)}
                                style={{ margin: 0 }}
                            >
                                {globalSettings.crossfade ? 'ON' : 'OFF'}
                            </button>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '12px' }}>
                            Frames blend smoothly. Use the "Smooth Speed" slider below to adjust transition duration.
                        </p>
                        <div className="slider-header" style={{ fontSize: '0.85rem' }}>
                            <span>Smooth Speed</span>
                            <span>{globalSettings.crossfadeSpeed || 150} ms</span>
                        </div>
                        <input
                            type="range"
                            min="50"
                            max="350"
                            step="10"
                            value={globalSettings.crossfadeSpeed || 150}
                            onChange={(e) => updateGlobal('crossfadeSpeed', parseInt(e.target.value, 10))}
                            className="range-slider"
                            style={{ marginTop: '8px' }}
                        />
                    </div>

                    {/* Laugh Settings */}
                    <div style={{ marginBottom: '16px', padding: '16px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', color: '#fbbf24' }}>Pitch Sensor</span>
                            <button
                                className={`bg-toggle-btn ${globalSettings.autoLaugh ? 'active' : ''}`}
                                onClick={() => updateGlobal('autoLaugh', !globalSettings.autoLaugh)}
                                style={{ margin: 0 }}
                            >
                                {globalSettings.autoLaugh ? 'ON' : 'OFF'}
                            </button>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '12px' }}>
                            If ON, an increase in pitch will automatically trigger tabs with "Change" in their name. If multiple "Change" tabs exist, one is picked at random.
                        </p>
                    </div>

                    {/* Silence Settings */}
                    <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontWeight: 'bold', color: 'white' }}>Silence Settings</span>
                            <button
                                className={`bg-toggle-btn ${globalSettings.autoSilence ? 'active' : ''}`}
                                onClick={() => updateGlobal('autoSilence', !globalSettings.autoSilence)}
                                style={{ margin: 0 }}
                            >
                                {globalSettings.autoSilence ? 'ON' : 'OFF'}
                            </button>
                        </div>
                        <div className="slider-header" style={{ fontSize: '0.85rem', marginTop: '12px' }}>
                            <span>Silent for how many seconds to switch?</span>
                            <span>{silenceSeconds}s</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={globalSettings.silenceThreshold}
                            onChange={(e) => updateGlobal('silenceThreshold', parseInt(e.target.value, 10))}
                            className="range-slider"
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                            If ON, when the mic is silent for a certain period, the app automatically switches to a tab with "Silence" in its name.
                        </p>
                    </div>

                    {/* Expression Stabilization (Common) */}
                    <div style={{ padding: '16px', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Expression Stabilization Time</span>
                            <button
                                className={`bg-toggle-btn ${globalSettings.enableCooldown !== false ? 'active' : ''}`}
                                onClick={() => updateGlobal('enableCooldown', globalSettings.enableCooldown === false)}
                                style={{ margin: 0 }}
                            >
                                {globalSettings.enableCooldown !== false ? 'ON' : 'OFF'}
                            </button>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Prevents flickering by maintaining an expression for the specified seconds after shifting.
                        </p>
                        <div className="slider-header" style={{ fontSize: '0.85rem', marginTop: '12px', opacity: globalSettings.enableCooldown !== false ? 1 : 0.5 }}>
                            <span>Maintain Time</span>
                            <span>{globalSettings.switchCooldown?.toFixed(1) || 1.0}s</span>
                        </div>
                        <input
                            type="range"
                            min="5"
                            max="30"
                            value={(globalSettings.switchCooldown || 1.0) * 10}
                            onChange={(e) => updateGlobal('switchCooldown', parseInt(e.target.value, 10) / 10)}
                            className="range-slider"
                            disabled={globalSettings.enableCooldown === false}
                            style={{ opacity: globalSettings.enableCooldown !== false ? 1 : 0.5 }}
                        />
                    </div>

                </div>

                {/* ③ Stream Mode (OBS Settings) Area */}
                <div className="setting-section" style={{ padding: '16px', border: '1px solid var(--accent-color)', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.05)' }}>
                    <h3 style={{ marginBottom: '16px', color: 'var(--accent-color)' }}>📹 ③ Stream Mode (for OBS)</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
                        Hides all UI like settings and buttons, and only displays the model (transparent background).<br />
                        Perfect for window capturing and chroma keying in broadcasting software like OBS.
                    </p>

                    <button
                        className="learning-btn"
                        onClick={onStartStream}
                        style={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--accent-color)' }}
                    >
                        <span>📺</span> Start Stream Mode
                    </button>

                    <div style={{ background: 'var(--bg-color)', padding: '12px', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-primary)' }}>[OBS Setup Procedure]</div>
                        <ol style={{ paddingLeft: '20px', margin: 0, lineHeight: '1.8' }}>
                            <li>Select <strong>"Window Capture"</strong> from the "+" button in OBS Sources.</li>
                            <li>In the "Window" section, select the currently open browser (MOZ-3 Anime Studio).</li>
                            <li>Change "Capture Method" to "Windows 10 or later" (if screen is black).</li>
                            <li>If necessary, hold Alt and drag the edge of the source to crop out empty spaces.</li>
                            <li>If you want transparency, change the app's background color to "Green" or "Magenta", right-click the OBS source, add a <strong>"Chroma Key"</strong> filter, and apply it to the chosen color.</li>
                        </ol>
                    </div>
                </div>
                {/* ℹ️ Credit & Version Info */}
                <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '24px 0 16px', opacity: 0.5 }} />
                <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', margin: '4px 0' }}>MOZ-3 Anime Studio</div>
                    <div>Version: v1.0.0 Beta</div>
                    <div>Creator: Motaro</div>
                    <div>Character Design: Motaro</div>
                    <div>BGM: Motaro</div>
                </div>
            </div>
        </div>
    );
}
