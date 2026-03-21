import React, { useEffect, useRef } from 'react';
import TransformBox from './TransformBox';

export default function Preview({ globalSettings, activeTabId, parts, transform, currentEye, currentMouthKey, isStreamMode, layoutTransform, onLayoutTransformChange, backdrop }) {

    const [crossfadeData, setCrossfadeData] = React.useState(null);
    const prevTabRef = useRef(activeTabId);
    const prevImagesRef = useRef({ mouth: null, eye: null });
    const crossfadeTimeoutRef = useRef(null);
    const wrapperRef = useRef(null);
    const [containerSize, setContainerSize] = React.useState({ width: 0, height: 0 });

    useEffect(() => {
        const el = wrapperRef.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => {
            setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        if (globalSettings.crossfade && activeTabId !== prevTabRef.current) {
            setCrossfadeData({
                mouth: prevImagesRef.current.mouth,
                eye: prevImagesRef.current.eye,
            });

            const speed = globalSettings.crossfadeSpeed || 150;
            if (crossfadeTimeoutRef.current) clearTimeout(crossfadeTimeoutRef.current);
            crossfadeTimeoutRef.current = setTimeout(() => {
                setCrossfadeData(null);
            }, speed);
        }

        prevTabRef.current = activeTabId;
    }, [activeTabId, globalSettings.crossfade, globalSettings.crossfadeSpeed]);

    useEffect(() => {
        prevImagesRef.current = {
            mouth: currentMouthKey ? parts[currentMouthKey] : null,
            eye: parts[currentEye] ? parts[currentEye] : null
        };
    }, [parts, currentEye, currentMouthKey]);

    const isFading = crossfadeData !== null;
    const fadeSpeed = globalSettings.crossfadeSpeed || 150;

    const handleTransformChange = (newTransform) => {
        if (onLayoutTransformChange) {
            onLayoutTransformChange(newTransform);
        }
    };

    const gTransform = layoutTransform || { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 };

    return (
        <div className="preview-container" style={{ position: 'relative' }}>
            <div ref={wrapperRef} className={`preview-canvas-wrapper ${isFading ? 'cf-bounce' : ''}`} style={{ backgroundColor: getBgColor(globalSettings.bgColor), animationDuration: `${fadeSpeed}ms` }}>
                <TransformBox
                    transform={gTransform}
                    onChange={handleTransformChange}
                >
                    {/* Backdrop: Fill circle (bottom layer) */}
                    {backdrop?.enabled && (() => {
                        const d = backdrop.diameter || 100;
                        const bt = backdrop.borderThickness || 10;
                        const ox = backdrop.offsetX || 0;
                        const oy = backdrop.offsetY || 0;
                        return (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                bottom: 0,
                                left: 0,
                                pointerEvents: 'none',
                                zIndex: 0
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    right: `${ox}px`,
                                    top: `${oy}px`,
                                    width: `${d}px`,
                                    height: `${d}px`,
                                    borderRadius: '50%',
                                    backgroundColor: backdrop.fillColor || '#ffffff',
                                    overflow: 'hidden',
                                }}>
                                    {backdrop.bgImageEnabled && backdrop.bgImage && (
                                        <img src={backdrop.bgImage} style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            display: 'block'
                                        }} alt="backdrop-bg" />
                                    )}
                                </div>
                            </div>
                        );
                    })()}

                    {/* Character layer — clipped to backdrop circle when enabled */}
                    {backdrop?.enabled ? (() => {
                        const d = backdrop.diameter || 100;
                        const bt = backdrop.borderThickness || 10;
                        const ox = backdrop.offsetX || 0;
                        const oy = backdrop.offsetY || 0;
                        const mx = gTransform?.x || 0;
                        const my = gTransform?.y || 0;
                        return (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                bottom: 0,
                                left: 0,
                                pointerEvents: 'none',
                                zIndex: 1
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    right: `${ox + 1}px`,
                                    top: `${oy + 1}px`,
                                    width: `${d - 2}px`,
                                    height: `${d - 2}px`,
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        transform: `translate(${mx}px, ${my}px)`
                                    }}>
                                        <div
                                            className="preview-canvas"
                                            style={{
                                                transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scaleX || 1}, ${transform.scaleY}) rotate(${transform.rotateZ || 0}deg)`,
                                                transformOrigin: 'bottom center'
                                            }}
                                        >
                                            {crossfadeData && (
                                                <>
                                                    {crossfadeData.mouth && (
                                                        <img src={crossfadeData.mouth} className="avatar-layer cf-fade-out" style={{ zIndex: 0, animationDuration: `${fadeSpeed}ms` }} alt="prev-mouth" />
                                                    )}
                                                    {crossfadeData.eye && (
                                                        <div style={{ zIndex: 2, position: 'absolute', width: '100%', height: '100%', transform: `translate(${transform.eyeX || 0}px, ${transform.eyeY || 0}px)` }}>
                                                            <img src={crossfadeData.eye} className="avatar-layer cf-eye-slide-out" style={{ animationDuration: `${fadeSpeed}ms` }} alt="prev-eye" />
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                            {currentMouthKey && <img src={parts[currentMouthKey]} className={`avatar-layer ${isFading ? 'cf-fade-in' : ''}`} style={{ zIndex: 1, animationDuration: `${fadeSpeed}ms` }} alt="base/mouth" />}
                                            <div style={{ zIndex: 3, position: 'absolute', width: '100%', height: '100%', transform: `translate(${transform.eyeX || 0}px, ${transform.eyeY || 0}px)` }}>
                                                {parts[currentEye] && <img src={parts[currentEye]} className={`avatar-layer ${isFading ? 'cf-eye-slide-in' : ''}`} style={{ animationDuration: `${fadeSpeed}ms` }} alt="eye" />}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })() : (
                        <div style={{
                            position: 'absolute',
                            right: `${gTransform?.x || 0}px`,
                            top: `${gTransform?.y || 0}px`,
                        }}>
                            <div
                                className="preview-canvas"
                                style={{
                                    transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scaleX || 1}, ${transform.scaleY}) rotate(${transform.rotateZ || 0}deg)`,
                                    transformOrigin: 'bottom center'
                                }}
                            >
                            {crossfadeData && (
                                <>
                                    {crossfadeData.mouth && (
                                        <img src={crossfadeData.mouth} className="avatar-layer cf-fade-out" style={{ zIndex: 0, animationDuration: `${fadeSpeed}ms` }} alt="prev-mouth" />
                                    )}
                                    {crossfadeData.eye && (
                                        <div style={{ zIndex: 2, position: 'absolute', width: '100%', height: '100%', transform: `translate(${transform.eyeX || 0}px, ${transform.eyeY || 0}px)` }}>
                                            <img src={crossfadeData.eye} className="avatar-layer cf-eye-slide-out" style={{ animationDuration: `${fadeSpeed}ms` }} alt="prev-eye" />
                                        </div>
                                    )}
                                </>
                            )}
                            {currentMouthKey && <img src={parts[currentMouthKey]} className={`avatar-layer ${isFading ? 'cf-fade-in' : ''}`} style={{ zIndex: 1, animationDuration: `${fadeSpeed}ms` }} alt="base/mouth" />}
                            <div style={{ zIndex: 3, position: 'absolute', width: '100%', height: '100%', transform: `translate(${transform.eyeX || 0}px, ${transform.eyeY || 0}px)` }}>
                                {parts[currentEye] && <img src={parts[currentEye]} className={`avatar-layer ${isFading ? 'cf-eye-slide-in' : ''}`} style={{ animationDuration: `${fadeSpeed}ms` }} alt="eye" />}
                            </div>
                            </div>
                        </div>
                    )}

                    {/* Backdrop: Border ring (top layer, above character) */}
                    {backdrop?.enabled && (() => {
                        const d = backdrop.diameter || 100;
                        const bt = backdrop.borderThickness || 10;
                        const ox = backdrop.offsetX || 0;
                        const oy = backdrop.offsetY || 0;
                        return (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                bottom: 0,
                                left: 0,
                                pointerEvents: 'none',
                                zIndex: 5
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    right: `${ox}px`,
                                    top: `${oy}px`,
                                    width: `${d}px`,
                                    height: `${d}px`,
                                    borderRadius: '50%',
                                    border: `${bt}px solid ${backdrop.borderColor || '#800080'}`,
                                    backgroundColor: 'transparent',
                                    boxSizing: 'border-box',
                                }} />
                            </div>
                        );
                    })()}
                </TransformBox>
            </div>
        </div>
    );
}

function getBgColor(type) {
    if (type === 'green') return '#00FF00';
    if (type === 'blue') return '#0000FF';
    if (type === 'magenta') return '#FF00FF';
    return 'transparent';
}
