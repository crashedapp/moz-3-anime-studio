import React, { useRef, useEffect } from 'react';

export default function TransformBox({ transform, onChange, isEditMode, setEditMode, isStreamMode, children }) {
    const containerRef = useRef(null);

    const handleWheel = (e) => {
        if (!isEditMode) return;
        e.preventDefault();
        const zoomSpeed = 0.05;
        const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
        const newScaleFactor = Math.max(0.1, (transform.scaleX || 1) + delta);
        onChange({
            ...transform,
            scaleX: newScaleFactor,
            scaleY: newScaleFactor,
        });
    };

    useEffect(() => {
        const el = containerRef.current;
        if (el && isEditMode) {
            el.addEventListener('wheel', handleWheel, { passive: false });
            return () => el.removeEventListener('wheel', handleWheel);
        }
    }, [isEditMode, transform, onChange]);

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    transform: `scale(${transform.scaleX || 1}, ${transform.scaleY || 1}) rotate(${transform.rotation || 0}deg)`,
                    transformOrigin: 'center center',
                    width: '100%',
                    height: '100%',
                }}
            >
                {children}
            </div>
        </div>
    );
}