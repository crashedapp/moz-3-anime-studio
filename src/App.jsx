import React, { useState, useEffect, useRef, useMemo } from 'react';
import Preview from './components/Preview';
import SlotPanel from './components/SlotPanel';
import SettingsPanel from './components/SettingsPanel';
import ExpressionTabs from './components/ExpressionTabs';
import CalibrationModal from './components/CalibrationModal';
import AboutModal from './components/AboutModal';

import useAudioAnalyzer from './hooks/useAudioAnalyzer';
import useAnimation from './hooks/useAnimation';
import { loadAppData, saveAppData, clearAppData, saveLastMicDevice, loadLastMicDevice } from './utils/storage';
import debounce from 'lodash/debounce';

export const DEFAULT_PARTS = {
  mouth0: null,
  mouth1: null,
  mouth2: null,
  mouth3: null,
  eyeOpen: null,
  eyeHalf: null,
  eyeClosed: null
};

export const DEFAULT_EXP_SETTINGS = {
  preset: 'off',
  idleAnim: 'breathing',
  breathSpeed: 50,
  transform: { x: 22, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
  backdrop: {
    enabled: true,
    diameter: 555,
    borderThickness: 10,
    borderColor: '#000000',
    fillColor: '#ffffff',
    offsetX: 6,
    offsetY: 6,
    bgImage: null,
    bgImageEnabled: false
  }
};

const handleWindowControl = (command) => {
  if (window.require) {
    const { ipcRenderer } = window.require('electron');
    ipcRenderer.send('window-control', command);
  }
};

const handleHeaderMouseDown = (e) => {
  // Only handle left-click drag, and not on interactive elements
  if (e.button !== 0) return;
  const tag = e.target.tagName;
  if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'TEXTAREA') return;
  if (e.target.closest('.expression-tabs, .window-controls, button, input')) return;

  if (window.require) {
    const { ipcRenderer } = window.require('electron');
    const startX = e.screenX;
    const startY = e.screenY;
    ipcRenderer.send('window-drag-start');

    const onMouseMove = (ev) => {
      ipcRenderer.send('window-dragging', { deltaX: ev.screenX - startX, deltaY: ev.screenY - startY });
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
};

function App() {
  const [activeTabId, setActiveTabId] = useState('1');
  const [expressions, setExpressions] = useState([
    {
      id: '1',
      name: 'Talk (Demo)',
      keybind: '1',
      parts: {
        ...DEFAULT_PARTS,
        mouth0: './demo/default_demo/base/base_1.png',
        mouth1: './demo/default_demo/base/base_kuchi_s_2.png',
        mouth2: './demo/default_demo/base/base_kuchi_m_3.png',
        mouth3: './demo/default_demo/base/base_kuchi_l_4.png',
        eyeOpen: './demo/default_demo/eyes/eye_open.png',
        eyeHalf: './demo/default_demo/eyes/eye_half.png',
        eyeClosed: './demo/default_demo/eyes/eye_close.png'
      },
      settings: { ...DEFAULT_EXP_SETTINGS, preset: 'poyon', breathSpeed: 15 }
    },
    {
      id: '2',
      name: 'Laugh (Demo)',
      keybind: '2',
      parts: { ...DEFAULT_PARTS, mouth0: './demo/lol_demo/base/laugh.png' },
      settings: { ...DEFAULT_EXP_SETTINGS, preset: 'nigiyaka' }
    },
    {
      id: '3',
      name: 'Sleep (Demo)',
      keybind: '3',
      parts: { ...DEFAULT_PARTS, mouth0: './demo/silence_demo/base/sleep.png' },
      settings: { ...DEFAULT_EXP_SETTINGS }
    }
  ]);

  const [globalSettings, setGlobalSettings] = useState({
    sensitivity: 50,
    bgColor: 'transparent',
    crossfade: true,
    crossfadeSpeed: 150
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isStreamMode, setIsStreamMode] = useState(false);

  const [hasLoadedData, setHasLoadedData] = useState(false);
  const [savedMicDeviceId, setSavedMicDeviceId] = useState('default');

  // Load data on mount
  useEffect(() => {
    const initData = async () => {
      const data = await loadAppData();
      if (data) {
        if (data.expressions && data.expressions.length > 0) {
          const merged = data.expressions.map(exp => ({
            ...exp,
            settings: { ...DEFAULT_EXP_SETTINGS, ...(exp.settings || {}) },
            parts: { ...DEFAULT_PARTS, ...(exp.parts || {}) }
          }));
          setExpressions(merged);
          setActiveTabId(merged[0].id);
        }
        if (data.globalSettings) {
          setGlobalSettings(prev => ({ ...prev, ...data.globalSettings, _initialCalibratedNormal: data.calibratedNormal }));
        }
      }
      const lastMic = await loadLastMicDevice();
      if (lastMic) setSavedMicDeviceId(lastMic);
      setHasLoadedData(true);
    };
    initData();
  }, []);

  useEffect(() => {
    // Handle Escape key to exit stream mode
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isStreamMode) {
        setIsStreamMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Toggle body classes for stream mode (fullscreen logic removed)
    if (isStreamMode) {
      document.documentElement.classList.add('stream-mode');
      document.body.classList.add('stream-mode');
    } else {
      document.documentElement.classList.remove('stream-mode');
      document.body.classList.remove('stream-mode');
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.documentElement.classList.remove('stream-mode');
      document.body.classList.remove('stream-mode');
    };
  }, [isStreamMode]);

  useEffect(() => {
    let hideCursorTimeout;

    const handleMouseMove = () => {
      if (!isStreamMode) return;

      document.documentElement.classList.remove('hide-cursor');
      clearTimeout(hideCursorTimeout);

      hideCursorTimeout = setTimeout(() => {
        if (isStreamMode) {
          document.documentElement.classList.add('hide-cursor');
        }
      }, 3000);
    };

    if (isStreamMode) {
      window.addEventListener('mousemove', handleMouseMove);
      // Initiate the timeout right away when entering stream mode
      handleMouseMove();
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(hideCursorTimeout);
      document.documentElement.classList.remove('hide-cursor');
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(hideCursorTimeout);
      document.documentElement.classList.remove('hide-cursor');
    };
  }, [isStreamMode]);

  const activeExpression = expressions.find(exp => exp.id === activeTabId) || expressions[0];

  const handlePartChange = (partName, url) => {
    setExpressions(prev => prev.map(exp => {
      if (exp.id === activeTabId) {
        return { ...exp, parts: { ...exp.parts, [partName]: url } };
      }
      return exp;
    }));
  };

  const handleExpSettingsChange = (newSettings) => {
    setExpressions(prev => prev.map(exp => {
      if (exp.id === activeTabId) {
        return { ...exp, settings: newSettings };
      }
      return exp;
    }));
  };

  // --- AUDIO & ANIMATION HOOKS ---
  const audioAnalyzer = useAudioAnalyzer(
    globalSettings,
    hasLoadedData ? globalSettings._initialCalibratedNormal : null,
    { initialDeviceId: savedMicDeviceId, onDeviceChange: saveLastMicDevice }
  );

  // Create a stable debounced save function
  const debouncedSave = useMemo(() => debounce(async (data) => {
    try {
      await saveAppData(data);
    } catch (e) {
      console.error(e);
    }
  }, 1000), []);

  const manualSave = async () => {
    try {
      await saveAppData({
        expressions,
        globalSettings,
        calibratedNormal: audioAnalyzer.calibratedNormal
      });
      window.alert('Saved the current state!');
    } catch (e) {
      // alert already handled in storage.js
    }
  };

  const resetAllData = async () => {
    if (window.confirm('Are you sure you want to reset all settings and tabs to their initial state?\n* Any custom image settings you added will be erased.')) {
      try {
        await clearAppData();
        window.location.reload();
      } catch (e) {
        window.alert('Failed to reset.');
      }
    }
  };

  // Save data when state changes (debounced)
  useEffect(() => {
    if (!hasLoadedData) return;

    debouncedSave({
      expressions,
      globalSettings,
      calibratedNormal: audioAnalyzer.calibratedNormal
    });

    const handleVisibilityChange = () => {
      if (document.hidden) {
        debouncedSave.flush(); 
      }
    };
    
    const handleBeforeUnload = () => {
        debouncedSave.flush();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [expressions, globalSettings, audioAnalyzer.calibratedNormal, hasLoadedData, debouncedSave]);

  const mouthKeys = ['mouth0', 'mouth1', 'mouth2', 'mouth3'];
  const activeMouths = mouthKeys.filter(k => activeExpression.parts[k] !== null);
  const activeMouthCount = activeMouths.length;

  const { currentEye, mouthIndex, transform } = useAnimation(
    audioAnalyzer,
    activeExpression.settings,
    activeMouthCount
  );

  const safeMouthIndex = Math.min(mouthIndex, activeMouthCount > 0 ? activeMouthCount - 1 : 0);
  const currentMouthKey = activeMouthCount > 0 ? activeMouths[safeMouthIndex] : null;

  return (
    <div className={`app-container ${isStreamMode ? 'stream-mode' : ''}`}>
      {!isStreamMode && (
        <header className="header" onMouseDown={handleHeaderMouseDown}>
          <div
            className="header-title-container"
            onClick={() => setIsAboutModalOpen(true)}
            style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
            title="About this app"
          >
            <img src="./logo.png" alt="Logo" className="header-logo" />
            <div className="header-title">MOZ-3 Anime Studio</div>
          </div>
          <ExpressionTabs
            tabs={expressions}
            activeId={activeTabId}
            onSelect={setActiveTabId}
            setTabs={setExpressions}
          />
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px', WebkitAppRegion: 'no-drag' }}>
            <button className="header-stream-btn" onClick={() => setIsStreamMode(true)} title="Start Stream Mode">📺</button>
            <button className="gear-btn" onClick={() => setIsModalOpen(true)} title="Audio Calibration Settings">⚙️</button>
            <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)', margin: '0 8px' }}></div>
            {/* Custom Window Controls */}
            <div className="window-controls" style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => handleWindowControl('minimize')} className="win-btn" title="Minimize">_</button>
              <button onClick={() => handleWindowControl('maximize')} className="win-btn" title="Maximize">□</button>
              <button onClick={() => handleWindowControl('close')} className="win-btn close-btn" title="Close">×</button>
            </div>
          </div>
        </header>
      )}

      <main className="main-content">
        <Preview
          activeTabId={activeTabId}
          globalSettings={globalSettings}
          parts={activeExpression.parts}
          transform={transform}
          currentEye={currentEye}
          currentMouthKey={currentMouthKey}
          isStreamMode={isStreamMode}
          layoutTransform={activeExpression.settings.transform || { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 }}
          onLayoutTransformChange={(t) => handleExpSettingsChange({ ...activeExpression.settings, transform: t })}
          backdrop={activeExpression.settings.backdrop}
        />
        {!isStreamMode && (
          <>
            <SlotPanel 
              parts={activeExpression.parts} 
              onPartChange={handlePartChange} 
              tabName={activeExpression.name}
              onResetTransform={() => handleExpSettingsChange({ ...activeExpression.settings, transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 } })}
              backdrop={activeExpression.settings.backdrop}
              onBackdropChange={(newBackdrop) => handleExpSettingsChange({ ...activeExpression.settings, backdrop: newBackdrop })}
              layoutTransform={activeExpression.settings.transform || { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 }}
              onLayoutTransformChange={(t) => handleExpSettingsChange({ ...activeExpression.settings, transform: t })}
            />
            <SettingsPanel
            globalSettings={globalSettings}
            onGlobalSettingsChange={setGlobalSettings}
            expSettings={expressions.find(e => e.id === activeTabId)?.settings || {}}
            onExpSettingsChange={handleExpSettingsChange}
            audioAnalyzer={audioAnalyzer}
            isStreamMode={isStreamMode}
            onManualSave={manualSave}
            onResetData={resetAllData}
            />
          </>
        )}
      </main>

      {!isStreamMode && (
        <CalibrationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          globalSettings={globalSettings}
          onGlobalSettingsChange={setGlobalSettings}
          audioAnalyzer={audioAnalyzer}
          onStartStream={() => {
            setIsStreamMode(true);
            setIsModalOpen(false);
          }}
        />
      )}

      {isStreamMode && (
        <button
          className="exit-stream-btn"
          onClick={() => setIsStreamMode(false)}
          title="Can also be exited with the Esc key"
        >
          ✖ Exit Stream Mode
        </button>
      )}

      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />
    </div>
  );
}

export default App;
