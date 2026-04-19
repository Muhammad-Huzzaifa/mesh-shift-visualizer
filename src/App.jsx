import React, { useState, useEffect, useRef, useCallback } from 'react';
import ControlPanel from './components/ControlPanel';
import MeshGrid, { StateComparison } from './components/MeshGrid';
import ComplexityPanel from './components/ComplexityPanel';
import { computeCircularShift, computeComplexity } from './utils/shiftLogic';
import './App.css';

const PHASE_SEQUENCE = ['initial', 'row', 'col', 'done'];
const PHASE_DURATION = 2000; // ms per phase

export default function App() {
  const [shiftData, setShiftData] = useState(null);
  const [complexity, setComplexity] = useState(null);
  const [animPhase, setAnimPhase] = useState('initial');
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentP, setCurrentP] = useState(null);
  const [currentQ, setCurrentQ] = useState(null);
  const timerRef = useRef(null);

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const runAnimation = useCallback((data) => {
    setIsAnimating(true);
    setAnimPhase('initial');

    const phases = ['initial', 'row', 'col', 'done'];
    let idx = 0;

    const advance = () => {
      idx++;
      if (idx >= phases.length) {
        setIsAnimating(false);
        return;
      }
      setAnimPhase(phases[idx]);
      if (idx < phases.length - 1) {
        timerRef.current = setTimeout(advance, PHASE_DURATION);
      } else {
        setIsAnimating(false);
      }
    };

    timerRef.current = setTimeout(advance, PHASE_DURATION);
  }, []);

  const handleRun = (p, q) => {
    clearTimers();
    const data = computeCircularShift(p, q);
    const comp = computeComplexity(p, q);
    setShiftData(data);
    setComplexity(comp);
    setCurrentP(p);
    setCurrentQ(q);
    runAnimation(data);
  };

  const handleReset = () => {
    clearTimers();
    setShiftData(null);
    setComplexity(null);
    setAnimPhase('initial');
    setIsAnimating(false);
    setCurrentP(null);
    setCurrentQ(null);
  };

  useEffect(() => () => clearTimers(), []);

  const phaseIndex = PHASE_SEQUENCE.indexOf(animPhase);
  const canRerun = currentP !== null && currentQ !== null && !isAnimating;
  const canReset = shiftData !== null || isAnimating;

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="header-badge">PARALLEL COMPUTING</div>
          <h1 className="header-title">MESH CIRCULAR SHIFT</h1>
          <p className="header-sub">2D Mesh Topology — Circular Q-Shift Visualizer</p>
        </div>
        <div className="header-right">
          {currentP && currentQ && (
            <div className="header-params">
              <div className="hp-item">
                <span className="hp-label">p</span>
                <span className="hp-value">{currentP}</span>
              </div>
              <div className="hp-sep">→</div>
              <div className="hp-item">
                <span className="hp-label">q</span>
                <span className="hp-value">{currentQ}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Phase Progress Bar */}
      <div className="phase-bar">
        {PHASE_SEQUENCE.map((ph, i) => (
          <div
            key={ph}
            className={`phase-step ${i <= phaseIndex ? 'phase-step-active' : ''} ${i === phaseIndex ? 'phase-step-current' : ''}`}
          >
            <span className="phase-num">{i + 1}</span>
            <span className="phase-name">
              {ph === 'initial' && 'BEFORE'}
              {ph === 'row' && 'ROW SHIFT'}
              {ph === 'col' && 'COL SHIFT'}
              {ph === 'done' && 'COMPLETE'}
            </span>
            {i < PHASE_SEQUENCE.length - 1 && <span className="phase-arrow">→</span>}
          </div>
        ))}
        <div className="phase-actions" role="group" aria-label="Run controls">
          <button
            type="button"
            className="phase-action-btn phase-action-btn-run"
            onClick={() => canRerun && handleRun(currentP, currentQ)}
            disabled={!canRerun}
          >
            ↻ RUN AGAIN
          </button>
          <button
            type="button"
            className="phase-action-btn phase-action-btn-reset"
            onClick={handleReset}
            disabled={!canReset}
          >
            RESET VIEW
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <main className="app-main">
        {/* Left Column */}
        <aside className="app-sidebar">
          <ControlPanel
            onRun={handleRun}
            onReset={handleReset}
            isAnimating={isAnimating}
          />
          <ComplexityPanel
            complexity={complexity}
            p={currentP}
            q={currentQ}
          />
        </aside>

        {/* Right Column */}
        <section className="app-content">
          <MeshGrid
            shiftData={shiftData}
            animPhase={animPhase}
            isAnimating={isAnimating}
          />
          {shiftData && (
            <StateComparison shiftData={shiftData} />
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <span>MESH CIRCULAR SHIFT VISUALIZER</span>
        <span className="footer-sep">|</span>
        <span>node i → node (i + q) mod p</span>
        <span className="footer-sep">|</span>
        <a href="https://github.com/Muhammad-Huzzaifa/mesh-shift-visualizer.git" target="_blank" rel="noopener noreferrer" className="footer-link">
          ⊞ GITHUB REPO
        </a>
      </footer>
    </div>
  );
}
