import React, { useRef } from 'react';

export default function SettingsPanel({
    globalSettings, onGlobalSettingsChange,
    expSettings, onExpSettingsChange,
    audioAnalyzer,
    isStreamMode,
    onManualSave,
    onResetData
}) {
    const fileInputRef = useRef(null);

    const updateGlobal = (key, value) => {
        onGlobalSettingsChange({ ...globalSettings, [key]: value });
    };

    const updateExp = (key, value) => {
        onExpSettingsChange({ ...expSettings, [key]: value });
    };

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            audioAnalyzer.handleFileUpload(e.target.files[0]);
        }
    };

    // Calculate actual seconds for display
    const silenceSeconds = (0.5 + (globalSettings.silenceThreshold / 100) * 9.5).toFixed(1);

    return (
        <div className="settings-container">
            <div className="setting-section glass-panel" style={{ padding: '16px', marginBottom: '24px' }}>
                <h3>🎤 Mic and Model Movement</h3>

                <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        className={`mic-btn ${audioAnalyzer.isActive ? 'active' : ''}`}
                        onClick={audioAnalyzer.toggleMic}
                        style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}
                    >
                        🎙️
                    </button>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {audioAnalyzer.isActive ? 'Mic Active' : 'Mic Off'}
                        </div>
                        <div className="mic-level-bar" style={{ width: '100%', marginTop: '4px' }}>
                            <div className="mic-level-fill" style={{ width: `${audioAnalyzer.level * 100}%` }}></div>
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <div className="slider-header">
                        <span>Mic Sensitivity</span>
                        <span>{globalSettings.sensitivity}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={globalSettings.sensitivity}
                        onChange={(e) => updateGlobal('sensitivity', parseInt(e.target.value, 10))}
                        className="range-slider"
                        style={{ marginTop: '8px' }}
                    />
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <div className="slider-header" style={{ marginBottom: '8px' }}>
                        <span>Idle Animation</span>
                    </div>
                    <div className="bg-toggles">
                        <button
                            className={`bg-toggle-btn ${expSettings.idleAnim === 'breathing' ? 'active' : ''}`}
                            onClick={() => updateExp('idleAnim', expSettings.idleAnim === 'breathing' ? 'none' : 'breathing')}
                        >
                            Breathing
                        </button>
                    </div>
                </div>

                {expSettings.idleAnim === 'breathing' && (
                    <div style={{ marginBottom: '16px' }}>
                        <div className="slider-header">
                            <span>Breathing Speed</span>
                            <span>{expSettings.breathSpeed}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={expSettings.breathSpeed}
                            onChange={(e) => updateExp('breathSpeed', parseInt(e.target.value, 10))}
                            className="range-slider"
                            style={{ marginTop: '8px' }}
                        />
                    </div>
                )}

                <div>
                    <div className="slider-header" style={{ marginBottom: '8px' }}>
                        <span>Talking Animation</span>
                    </div>
                    <div className="preset-options">
                        {[
                            { id: 'nigiyaka', label: 'Lively' },
                            { id: 'poyon', label: 'Stretch' },
                            { id: 'pyonpyon', label: 'Bounce' },
                            { id: 'bibibi', label: 'Shiver' }
                        ].map(preset => (
                            <button
                                key={preset.id}
                                className={`preset-btn ${expSettings.preset === preset.id ? 'active' : ''}`}
                                onClick={() => updateExp('preset', expSettings.preset === preset.id ? 'off' : preset.id)}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>


            </div>

            <div className="setting-section glass-panel" style={{ padding: '16px', marginBottom: '24px' }}>
                <h3>🎨 Background Color</h3>

                <div>
                    <div className="slider-header" style={{ marginBottom: '8px' }}>
                        <span>Color</span>
                    </div>
                    <div className="bg-toggles">
                        <button
                            className={`bg-toggle-btn ${globalSettings.bgColor === 'transparent' ? 'active' : ''}`}
                            onClick={() => updateGlobal('bgColor', 'transparent')}
                        >
                            Transparent
                        </button>
                        <button
                            className={`bg-toggle-btn ${globalSettings.bgColor === 'green' ? 'active' : ''}`}
                            onClick={() => updateGlobal('bgColor', 'green')}
                        >
                            Green
                        </button>
                        <button
                            className={`bg-toggle-btn ${globalSettings.bgColor === 'blue' ? 'active' : ''}`}
                            onClick={() => updateGlobal('bgColor', 'blue')}
                        >
                            Blue
                        </button>
                        <button
                            className={`bg-toggle-btn ${globalSettings.bgColor === 'magenta' ? 'active' : ''}`}
                            onClick={() => updateGlobal('bgColor', 'magenta')}
                        >
                            Magenta
                        </button>
                    </div>
                </div>
            </div>

            <div className="setting-section glass-panel" style={{ padding: '16px' }}>
                <h3>🎵 Lip-Sync with Audio File</h3>

                <div style={{ marginBottom: '12px' }}>
                    <input
                        type="file"
                        accept="audio/*"
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    <button
                        className="preset-btn"
                        style={{ width: '100%', marginBottom: '8px' }}
                        onClick={triggerFileUpload}
                    >
                        {audioAnalyzer.audioFileName || "📂 Upload Audio File"}
                    </button>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                        Upload your own audio to have the model lip-sync
                    </p>
                </div>

                {audioAnalyzer.audioFile && (
                    <div>
                        <div className="bg-toggles" style={{ marginBottom: '12px' }}>
                            {!audioAnalyzer.isPlayingFile ? (
                                <button className="bg-toggle-btn" onClick={audioAnalyzer.playFile}>▶ Play</button>
                            ) : (
                                <button className="bg-toggle-btn" onClick={audioAnalyzer.pauseFile}>⏸ Pause</button>
                            )}
                            <button className="bg-toggle-btn" onClick={audioAnalyzer.stopFile}>⏹ Stop</button>
                        </div>

                        <div className="slider-header">
                            <span>Playback Progress</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={audioAnalyzer.fileProgress}
                            onChange={(e) => audioAnalyzer.seekFile(parseFloat(e.target.value))}
                            className="range-slider"
                            style={{ marginTop: '8px' }}
                        />
                    </div>
                )}
            </div>

            {/* Save & Reset Settings */}
            <div className="setting-section" style={{ border: '1px solid var(--accent-color)', background: 'rgba(6, 182, 212, 0.05)', padding: '16px' }}>
                <h3 style={{ marginBottom: '12px', color: 'var(--accent-color)' }}>💾 Save & Reset</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    Settings are saved automatically, but you can use manual save if you want to ensure data is preserved. You can reset all settings to start over.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="learning-btn" 
                      onClick={onManualSave}
                      style={{ flex: 1, background: 'var(--accent-color)', color: 'black', fontWeight: 'bold' }}
                    >
                        Manual Save
                    </button>
                    <button 
                      className="learning-btn" 
                      onClick={onResetData}
                      style={{ flex: 1, background: 'rgba(255, 50, 50, 0.2)', border: '1px solid #ef4444', color: '#fca5a5' }}
                    >
                        Reset All Data
                    </button>
                </div>
            </div>
        </div>
    );
}
