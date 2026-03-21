import { useState, useEffect, useRef } from 'react';

export default function useAnimation(audioData, expSettings, activeMouthCount) {
    const [currentEye, setCurrentEye] = useState('eyeOpen');
    const [mouthIndex, setMouthIndex] = useState(0);
    const [transform, setTransform] = useState({ scaleX: 1, scaleY: 1, translateY: 0, translateX: 0, rotateZ: 0, eyeX: 0, eyeY: 0 });
    const tiltDataRef = useRef({ rot: 0, scale: 1, eyeX: 0, eyeY: 0 });

    const blinkTimeoutRef = useRef(null);

    // Blink sequence logic
    useEffect(() => {
        let isSubscribed = true;

        const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const doBlink = async () => {
            setCurrentEye('eyeClosed');
            await wait(80);
            if (!isSubscribed) return;
            setCurrentEye('eyeHalf');
            await wait(80);
            if (!isSubscribed) return;
            setCurrentEye('eyeOpen');
        };

        const scheduleBlink = () => {
            const waitTime = 2000 + Math.random() * 4000; // 2-6 seconds
            blinkTimeoutRef.current = setTimeout(async () => {
                if (!isSubscribed) return;

                await doBlink();
                if (!isSubscribed) return;

                // 30% chance for a quick double blink
                if (Math.random() < 0.3) {
                    await wait(150);
                    if (!isSubscribed) return;
                    await doBlink();
                }

                scheduleBlink();
            }, waitTime);
        };

        scheduleBlink();

        return () => {
            isSubscribed = false;
            clearTimeout(blinkTimeoutRef.current);
        };
    }, []);

    const audioDataRef = useRef(audioData);
    const expSettingsRef = useRef(expSettings);
    const activeMouthCountRef = useRef(activeMouthCount);

    useEffect(() => {
        audioDataRef.current = audioData;
        expSettingsRef.current = expSettings;
        activeMouthCountRef.current = activeMouthCount;
    }, [audioData, expSettings, activeMouthCount]);

    // Frame-by-frame loop for continuous animation
    useEffect(() => {
        let animationFrame;
        const startTime = performance.now();

        const loop = (time) => {
            const currentAudioLevel = audioDataRef.current?.level || 0;
            const currentPitch = audioDataRef.current?.pitch || 300;
            const averagePitch = audioDataRef.current?.calibratedNormal || 300;
            const mouthOpenness = audioDataRef.current?.mouthOpenness || 0;
            const { preset, idleAnim, breathSpeed } = expSettingsRef.current;
            const currentMouthCount = activeMouthCountRef.current;

            // 1. Lip Sync Mapping (uses Meyda-enhanced mouthOpenness)
            let mIndex = 0;
            if (currentMouthCount > 1 && mouthOpenness > 0.01) {
                const thresholds = currentMouthCount - 1;
                mIndex = 1 + Math.floor(Math.min(mouthOpenness, 0.999) * thresholds);
            }
            setMouthIndex(mIndex);

            // 2. Transform Logic / Idling vs Bouncing
            const elapsed = time - startTime;

            // Idle Animation (always calculated, never stops unless set to 'none')
            let idleSy = 1.0;
            if (idleAnim === 'breathing') {
                const speedMult = 0.001 + (breathSpeed / 100) * 0.005;
                idleSy = 1.0 + 0.015 * Math.sin(elapsed * speedMult);
            }

            let sY = idleSy;
            let tY = 0;
            let tX = 0;

            // Bounce Preset is ONLY applied if audio is playing AND preset isn't off.
            const isTalking = currentAudioLevel > 0.05 && preset !== 'off';

            if (isTalking) {
                switch (preset) {
                    case 'poyon':
                        sY += currentAudioLevel * 0.15;
                        break;
                    case 'pyonpyon':
                        tY = -(currentAudioLevel * 40);
                        break;
                    case 'bibibi':
                        tX = (Math.random() - 0.5) * 10 * currentAudioLevel;
                        break;
                }
            }

            // Auto Head Tilt & Parallax (Pseudo-3D)
            let targetRotation = 0;
            let targetEyeOffsetX = 0;
            let targetEyeOffsetY = 0;
            let targetScaleTotal = 1.0;

            if (isTalking && preset === 'nigiyaka') {
                targetRotation = (currentPitch - averagePitch) * 0.05;
                targetRotation = Math.max(-10, Math.min(10, targetRotation));
                targetEyeOffsetX = targetRotation * -0.5;
                targetEyeOffsetY = currentAudioLevel * -2.0;
                targetScaleTotal = 1.0 + (currentAudioLevel * 0.03);
            }

            const currentTiltData = tiltDataRef.current;
            const smoothFactor = 0.15;
            currentTiltData.rot += (targetRotation - currentTiltData.rot) * smoothFactor;
            currentTiltData.scale += (targetScaleTotal - currentTiltData.scale) * smoothFactor;
            currentTiltData.eyeX += (targetEyeOffsetX - currentTiltData.eyeX) * smoothFactor;
            currentTiltData.eyeY += (targetEyeOffsetY - currentTiltData.eyeY) * smoothFactor;

            setTransform({
                scaleX: currentTiltData.scale,
                scaleY: sY + (currentTiltData.scale - 1.0),
                translateY: tY,
                translateX: tX,
                rotateZ: currentTiltData.rot,
                eyeX: currentTiltData.eyeX,
                eyeY: currentTiltData.eyeY
            });

            animationFrame = requestAnimationFrame(loop);
        };

        animationFrame = requestAnimationFrame(loop);

        return () => cancelAnimationFrame(animationFrame);
    }, []);

    return { currentEye, mouthIndex, transform };
}
