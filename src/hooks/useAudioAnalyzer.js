import { useState, useRef, useEffect } from 'react';
import Meyda from 'meyda';

export default function useAudioAnalyzer(globalSettings, initialCalibratedNormal = null, { initialDeviceId = 'default', onDeviceChange = null } = {}) {
    const { sensitivity } = globalSettings;
    // Refs for states to ensure the loop closure always reads the latest values
    const isActiveRef = useRef(false);
    const isPlayingFileRef = useRef(false);

    const [isActive, setIsActiveState] = useState(false);
    const [level, setLevel] = useState(0); // 0-1
    const [mouthOpenness, setMouthOpenness] = useState(0); // 0-1, Meyda-enhanced lip sync signal
    const [pitch, setPitch] = useState(0);
    const smoothedOpennessRef = useRef(0);

    // Audio File Elements
    const [audioFile, setAudioFile] = useState(null);
    const [audioFileName, setAudioFileName] = useState("");
    const [isPlayingFile, setIsPlayingFileState] = useState(false);
    const [fileProgress, setFileProgress] = useState(0);

    const setIsActive = (val) => {
        isActiveRef.current = val;
        setIsActiveState(val);
    };

    const setIsPlayingFile = (val) => {
        isPlayingFileRef.current = val;
        setIsPlayingFileState(val);
    };

    const audioContextRef = useRef(null);
    const micAnalyserRef = useRef(null);
    const fileAnalyserRef = useRef(null);
    const sourceRef = useRef(null);
    const fileSourceRef = useRef(null);
    const animationFrameRef = useRef(null);
    const audioElemRef = useRef(null);

    // Device Selection
    const [audioDevices, setAudioDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState(initialDeviceId);
    const hasAutoStartedRef = useRef(false);

    // --- Calibration Logic ---
    const [calibratedNormal, setCalibratedNormal] = useState(initialCalibratedNormal || 300);

    const [calibrationPhase, setCalibrationPhase] = useState('idle'); // 'idle', 'normal'
    const tempPitchesRef = useRef([]);

    const recentPitchesRef = useRef([]); // for pitch moving average

    const startCalibration = (phase) => {
        setCalibrationPhase(phase);
        tempPitchesRef.current = [];

        setTimeout(() => {
            const pitches = tempPitchesRef.current;
            if (pitches.length > 0) {
                if (phase === 'normal') {
                    const avg = pitches.reduce((a, b) => a + b, 0) / pitches.length;
                    setCalibratedNormal(avg);
                }
            }
            setCalibrationPhase('idle');
        }, 3000);
    };

    const resetCalibration = () => {
        setCalibratedNormal(300);
    };

    const initContext = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();

            micAnalyserRef.current = audioContextRef.current.createAnalyser();
            micAnalyserRef.current.fftSize = 1024;
            micAnalyserRef.current.smoothingTimeConstant = 0.5;

            fileAnalyserRef.current = audioContextRef.current.createAnalyser();
            fileAnalyserRef.current.fftSize = 1024;
            fileAnalyserRef.current.smoothingTimeConstant = 0.5;

            audioElemRef.current = new Audio();
            audioElemRef.current.addEventListener('timeupdate', () => {
                if (audioElemRef.current.duration) {
                    setFileProgress((audioElemRef.current.currentTime / audioElemRef.current.duration) * 100);
                }
            });
            audioElemRef.current.addEventListener('ended', () => {
                setIsPlayingFile(false);
                setFileProgress(0);
                smoothedOpennessRef.current = 0;
                setMouthOpenness(0);
            });

            fileSourceRef.current = audioContextRef.current.createMediaElementSource(audioElemRef.current);
            fileSourceRef.current.connect(fileAnalyserRef.current);
            fileAnalyserRef.current.connect(audioContextRef.current.destination);
        }

        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    };

    const getAudioDevices = async () => {
        try {
            const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true }); // Request permission first
            tempStream.getTracks().forEach(t => t.stop()); // Stop immediately to free the hardware

            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioInputs = devices.filter(device => device.kind === 'audioinput');
            setAudioDevices(audioInputs);
        } catch (err) {
            console.error("Error fetching audio devices: ", err);
        }
    };

    useEffect(() => {
        getAudioDevices();
        navigator.mediaDevices.addEventListener('devicechange', getAudioDevices);
        return () => navigator.mediaDevices.removeEventListener('devicechange', getAudioDevices);
    }, []);

    // Auto-start mic on mount once devices are enumerated
    useEffect(() => {
        if (hasAutoStartedRef.current || audioDevices.length === 0) return;
        hasAutoStartedRef.current = true;

        // If saved device is available, use it; otherwise fall back to default
        let deviceToUse = 'default';
        if (initialDeviceId && initialDeviceId !== 'default') {
            const found = audioDevices.find(d => d.deviceId === initialDeviceId);
            if (found) {
                deviceToUse = initialDeviceId;
            }
        }
        setSelectedDeviceId(deviceToUse);
        startMicAnalysis(deviceToUse);
    }, [audioDevices]);

    const startMicAnalysis = async (deviceId = selectedDeviceId) => {
        try {
            if (isPlayingFile) stopFile();
            initContext();

            const constraints = {
                audio: deviceId && deviceId !== 'default' ? { deviceId: { exact: deviceId } } : true
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
            sourceRef.current.connect(micAnalyserRef.current);

            setIsActive(true);
            recentPitchesRef.current = [];
        } catch (err) {
            console.error("Microphone access denied or error: ", err);
            setIsActive(false);
            if (sourceRef.current) {
                sourceRef.current.disconnect();
                sourceRef.current = null;
            }
        }
    };

    const stopAnalysis = () => {
        setIsActive(false);
        if (sourceRef.current) {
            sourceRef.current.mediaStream.getTracks().forEach(t => t.stop());
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        setLevel(0);
        smoothedOpennessRef.current = 0;
        setMouthOpenness(0);
    };

    const toggleMic = () => {
        if (isActive) stopAnalysis();
        else startMicAnalysis(selectedDeviceId);
    };

    const changeDevice = (deviceId) => {
        setSelectedDeviceId(deviceId);
        if (onDeviceChange) onDeviceChange(deviceId);
        if (isActive) {
            stopAnalysis();
            startMicAnalysis(deviceId);
        }
    };

    // --- AUDIO FILE LOGIC ---
    const handleFileUpload = (file) => {
        if (file && file.type.startsWith('audio/')) {
            const url = URL.createObjectURL(file);
            setAudioFile(url);
            setAudioFileName(file.name);
            setFileProgress(0);
            if (isPlayingFile) stopFile();
        }
    };

    const playFile = () => {
        if (!audioFile) return;
        if (isActive) stopAnalysis();
        initContext();

        audioElemRef.current.src = audioFile;
        const seekTime = (fileProgress / 100) * (audioElemRef.current.duration || 0);
        if (fileProgress > 0 && seekTime < audioElemRef.current.duration) {
            audioElemRef.current.currentTime = seekTime;
        } else {
            audioElemRef.current.currentTime = 0;
        }
        audioElemRef.current.play();
        setIsPlayingFile(true);
        recentPitchesRef.current = [];
    };

    const pauseFile = () => {
        if (audioElemRef.current) audioElemRef.current.pause();
        setIsPlayingFile(false);
    };

    const stopFile = () => {
        if (audioElemRef.current) {
            audioElemRef.current.pause();
            audioElemRef.current.currentTime = 0;
        }
        setIsPlayingFile(false);
        setFileProgress(0);
        smoothedOpennessRef.current = 0;
        setMouthOpenness(0);
    };

    const seekFile = (percentage) => {
        setFileProgress(percentage);
        if (audioElemRef.current && audioElemRef.current.duration) {
            audioElemRef.current.currentTime = (percentage / 100) * audioElemRef.current.duration;
        }
    };

    const loop = (time) => {
        const currentlyActive = isActiveRef.current;
        const currentlyPlaying = isPlayingFileRef.current;

        if (!currentlyActive && !currentlyPlaying) {
            setLevel(0);
            smoothedOpennessRef.current = 0;
            setMouthOpenness(0);
            animationFrameRef.current = requestAnimationFrame(loop);
            return;
        }

        const activeAnalyser = currentlyActive ? micAnalyserRef.current : fileAnalyserRef.current;
        if (!activeAnalyser || (!currentlyActive && !currentlyPlaying)) {
            setLevel(0);
            smoothedOpennessRef.current = 0;
            setMouthOpenness(0);
            animationFrameRef.current = requestAnimationFrame(loop);
            return;
        }

        // --- Volume Analysis ---
        const dataArray = new Uint8Array(activeAnalyser.frequencyBinCount);
        activeAnalyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const multiplier = (sensitivity / 50) * 1.5;
        let normalized = (average / 128) * multiplier;
        if (normalized > 1) normalized = 1;

        setLevel(normalized);

        // --- Meyda Feature Extraction for Improved Lip Sync ---
        const timeDomainData = new Float32Array(activeAnalyser.fftSize);
        activeAnalyser.getFloatTimeDomainData(timeDomainData);

        Meyda.bufferSize = activeAnalyser.fftSize;
        Meyda.sampleRate = audioContextRef.current.sampleRate;

        let meydaFeatures = null;
        try {
            meydaFeatures = Meyda.extract(['rms', 'spectralCentroid', 'spectralFlatness'], timeDomainData);
        } catch (e) {
            // Meyda can throw on edge cases (e.g. all-zero buffer)
        }

        let targetOpenness = 0;
        if (meydaFeatures && meydaFeatures.rms != null) {
            const rms = meydaFeatures.rms;

            // Gate: ignore very quiet input (noise floor)
            if (rms > 0.008) {
                const sensMult = (sensitivity / 50) * 1.5;

                // RMS for speech typically ranges 0.01-0.3, scale to 0-1
                let baseOpenness = Math.min(rms * sensMult * 5.0, 1.0);
                // Power curve: subtle at low end, dramatic at high end
                baseOpenness = Math.pow(baseOpenness, 0.7);

                // Spectral centroid vowel modifier
                // Open vowels (ah, oh) have centroid ~400-1200Hz -> mouth opens more
                // Closed sounds (ee, ss, ff) have centroid ~2000-5000Hz -> mouth opens less
                const sRate = audioContextRef.current.sampleRate;
                const centroidBin = meydaFeatures.spectralCentroid || 0;
                const centroidHz = centroidBin * (sRate / activeAnalyser.fftSize);

                let vowelMod = 1.0;
                if (centroidHz > 200 && centroidHz < 8000) {
                    const norm = Math.min(Math.max((centroidHz - 200) / 4000, 0), 1);
                    vowelMod = 1.0 - (norm * 0.3); // Range: 0.7 to 1.0
                }

                // Noise rejection via spectral flatness (tonal speech ≈ 0, noise ≈ 1)
                const flatness = meydaFeatures.spectralFlatness || 0;
                const tonality = 1.0 - Math.min(flatness * 2.0, 0.5); // Range: 0.5 to 1.0

                targetOpenness = Math.min(baseOpenness * vowelMod * tonality, 1.0);
            }
        }

        // Asymmetric EMA: open mouth faster, close slower for natural feel
        const prev = smoothedOpennessRef.current;
        const alpha = targetOpenness > prev ? 0.45 : 0.12;
        smoothedOpennessRef.current = prev + (targetOpenness - prev) * alpha;
        if (smoothedOpennessRef.current < 0.005) smoothedOpennessRef.current = 0;

        setMouthOpenness(smoothedOpennessRef.current);

        // --- Pitch Analysis ---
        const sampleRate = audioContextRef.current.sampleRate;
        const binSize = sampleRate / activeAnalyser.fftSize;

        let maxVal = -1;
        let maxIndex = -1;
        const startBin = Math.floor(50 / binSize);
        const endBin = Math.floor(1500 / binSize);

        for (let i = startBin; i < endBin && i < dataArray.length; i++) {
            if (dataArray[i] > maxVal) {
                maxVal = dataArray[i];
                maxIndex = i;
            }
        }

        const peakFreq = maxIndex * binSize;

        // --- Pitch Smoothing (Moving Average) ---
        let smoothedPitch = peakFreq;
        if (normalized > 0.05 && peakFreq > 50) {
            recentPitchesRef.current.push(peakFreq);
            if (recentPitchesRef.current.length > 5) { // Average over ~100ms
                recentPitchesRef.current.shift();
            }
        } else {
            recentPitchesRef.current = [];
        }

        if (recentPitchesRef.current.length > 0) {
            smoothedPitch = recentPitchesRef.current.reduce((a, b) => a + b, 0) / recentPitchesRef.current.length;
        }
        setPitch(smoothedPitch);

        // --- Learning Calibration Phase ---
        if (calibrationPhase !== 'idle' && normalized > 0.1 && smoothedPitch > 50) {
            tempPitchesRef.current.push(smoothedPitch);
        }

        animationFrameRef.current = requestAnimationFrame(loop);
    };

    useEffect(() => {
        animationFrameRef.current = requestAnimationFrame(loop);
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [isActive, isPlayingFile, sensitivity, calibrationPhase, calibratedNormal, selectedDeviceId]);

    useEffect(() => {
        return () => {
            stopAnalysis();
            if (audioElemRef.current) audioElemRef.current.pause();
            if (audioContextRef.current) audioContextRef.current.close().catch(() => { });
        };
    }, []);

    // Listen for external initial calibration updates
    useEffect(() => {
        if (initialCalibratedNormal !== null && calibratedNormal === 200) {
            setCalibratedNormal(initialCalibratedNormal);
        }
    }, [initialCalibratedNormal]);

    return {
        isActive, toggleMic, level, mouthOpenness, pitch,
        audioDevices, selectedDeviceId, changeDevice,
        calibrationPhase, startCalibration, resetCalibration,
        calibratedNormal,
        audioFile, audioFileName, isPlayingFile, fileProgress,
        handleFileUpload, playFile, pauseFile, stopFile, seekFile
    };
}
