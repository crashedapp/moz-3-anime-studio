import React, { useRef, useState, useEffect } from 'react';

export default function TransformBox({ transform, onChange, isEditMode, setEditMode, isStreamMode, children }) {
    const containerRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    const handleDoubleClick = () => {
        if (!isStreamMode) {
            setEditMode(!isEditMode);
        }
    };

    const handlePointerDown = (e) => {
        if (!isEditMode) return;
        setDragging(true);
        setStartPos({ x: e.clientX, y: e.clientY });
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!dragging) return;
        const dx = e.clientX - startPos.x;
        const dy = e.clientY - startPos.y;
        
        onChange({
            ...transform,
            x: transform.x + dx,
            y: transform.y + dy
        });
        
        setStartPos({ x: e.clientX, y: e.clientY });
    };

    const handlePointerUp = (e) => {
        if (!dragging) return;
        setDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

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
            onDoubleClick={handleDoubleClick}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                cursor: isEditMode ? 'move' : 'default',
                border: isEditMode ? '2px dashed blue' : 'none',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    transform: `translate(${transform.x || 0}px, ${transform.y || 0}px) scale(${transform.scaleX || 1}, ${transform.scaleY || 1}) rotate(${transform.rotation || 0}deg)`,
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