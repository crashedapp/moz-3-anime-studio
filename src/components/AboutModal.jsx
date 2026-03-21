import React, { useState } from 'react';

export default function AboutModal({ isOpen, onClose }) {
    const [showTerms, setShowTerms] = useState(false);

    if (!isOpen) {
        if (showTerms) setShowTerms(false); // Reset state when closed
        return null;
    }

    const handleYoutubeClick = () => {
        const url = 'https://www.youtube.com/c/モタロ';
        if (window.require) {
            const { shell } = window.require('electron');
            shell.openExternal(url);
        } else {
            window.open(url, '_blank');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 3000 }}>
            <div
                className="calibration-modal"
                onClick={e => e.stopPropagation()}
                style={{ textAlign: 'center', position: 'relative', width: showTerms ? '600px' : '400px', padding: '32px', transition: 'width 0.2s ease' }}
            >
                <button className="modal-close-btn" onClick={() => {
                    if (showTerms) {
                        setShowTerms(false);
                    } else {
                        onClose();
                    }
                }}>
                    {showTerms ? '←' : '×'}
                </button>

                {showTerms ? (
                    // --- Terms of Service View ---
                    <div style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
                        <h3 style={{ marginBottom: '24px', fontSize: '1.2rem', color: 'var(--accent-color)', textAlign: 'center' }}>
                            📘 "Avatarian" Terms of Service
                        </h3>

                        <div style={{ fontSize: '0.85rem', lineHeight: '1.8', maxHeight: '60vh', overflowY: 'auto', paddingRight: '8px' }}>
                            <p style={{ marginBottom: '16px' }}>
                                These terms establish the conditions of use for "Avatarian" (hereinafter referred to as "this app") provided by the creator, Motaro.
                            </p>

                            
                            <h4 style={{ color: 'var(--text-primary)', marginTop: '20px', marginBottom: '8px' }}>2. Prohibited Actions</h4>
                            <p style={{ marginBottom: '16px' }}>
                                Modification, analysis (reverse engineering), and secondary distribution of the programs and data of this app are strictly prohibited.<br />
                                Extracting, using, or distributing images and BGM incorporated into this app individually for purposes other than the intended use of this app is prohibited.
                            </p>

                            <h4 style={{ color: 'var(--text-primary)', marginTop: '20px', marginBottom: '8px' }}>3. Disclaimer</h4>
                            <p style={{ marginBottom: '16px' }}>
                                The creator assumes no responsibility for any trouble or damage caused by the use of this app.
                            </p>

                            <h4 style={{ color: 'var(--text-primary)', marginTop: '20px', marginBottom: '8px' }}>4. Request from the Creator</h4>
                            <p style={{ marginBottom: '16px' }}>
                                If you like this app, please subscribe to Motaro's YouTube channel!
                            </p>

                            <div style={{ textAlign: 'center', marginTop: '24px' }}>
                                <button
                                    onClick={handleYoutubeClick}
                                    style={{ background: '#ff0000', color: 'white', padding: '10px 24px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    ▶ Official YouTube Channel
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    // --- About View ---
                    <>
                        <h3 style={{ marginBottom: '24px', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                            About this app
                        </h3>

                        

                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '32px' }}>
                            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px', fontSize: '1rem' }}>
                                Avatarian A Fork Of MOZ-3 Anime Studio
                            </div>
                            <div>Version: v1.0.0</div>
                            <div>Original Creator: Motaro</div>
                            <div>Original Character Design: Motaro</div>
                            
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                            <button
                                onClick={handleYoutubeClick}
                                style={{ background: '#ff0000', color: 'white', padding: '10px 24px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '80%' }}
                            >
                                ▶ Original Creator's Official YouTube Channel
                            </button>

                            <button
                                onClick={() => setShowTerms(true)}
                                style={{ background: 'transparent', color: 'var(--accent-color)', padding: '10px 24px', border: '1px solid var(--accent-color)', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '80%' }}
                            >
                                📘 Open Terms of Service
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
