import React, { useState } from 'react';
import { isPerfectSquare } from '../utils/shiftLogic';
import './ControlPanel.css';

export default function ControlPanel({ onRun, onReset, isAnimating }) {
  const [p, setP] = useState(16);
  const [q, setQ] = useState(5);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    const pNum = parseInt(p);
    const qNum = parseInt(q);

    if (isNaN(pNum) || pNum < 4 || pNum > 64) {
      errs.p = 'p must be between 4 and 64';
    } else if (!isPerfectSquare(pNum)) {
      errs.p = 'p must be a perfect square (4,9,16,25,36,49,64)';
    }

    if (isNaN(qNum) || qNum < 1 || qNum >= pNum) {
      errs.q = `q must be between 1 and ${pNum - 1}`;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRun = () => {
    if (validate()) {
      onRun(parseInt(p), parseInt(q));
    }
  };

  const perfectSquares = [4, 9, 16, 25, 36, 49, 64];

  return (
    <div className="control-panel neo-box">
      <div className="cp-header">
        <span className="cp-tag">INPUT</span>
        <h2 className="cp-title">PARAMETERS</h2>
      </div>

      <div className="cp-fields">
        <div className="cp-field">
          <label className="cp-label">
            P — TOTAL NODES
            <span className="cp-hint">perfect square, 4–64</span>
          </label>
          <select
            className={`cp-select ${errors.p ? 'cp-error' : ''}`}
            value={p}
            onChange={e => { setP(e.target.value); setErrors({}); }}
            disabled={isAnimating}
          >
            {perfectSquares.map(val => (
              <option key={val} value={val}>{val} ({Math.sqrt(val)}×{Math.sqrt(val)} mesh)</option>
            ))}
          </select>
          {errors.p && <span className="cp-error-msg">{errors.p}</span>}
        </div>

        <div className="cp-field">
          <label className="cp-label">
            Q — SHIFT AMOUNT
            <span className="cp-hint">1 to p−1</span>
          </label>
          <input
            type="number"
            className={`cp-input ${errors.q ? 'cp-error' : ''}`}
            value={q}
            min={1}
            max={parseInt(p) - 1}
            onChange={e => { setQ(e.target.value); setErrors({}); }}
            disabled={isAnimating}
          />
          {errors.q && <span className="cp-error-msg">{errors.q}</span>}
        </div>

        <div className="cp-derived">
          <div className="cp-derived-item">
            <span className="cp-derived-label">√p (DIM)</span>
            <span className="cp-derived-value">{Math.sqrt(parseInt(p) || 16)}</span>
          </div>
          <div className="cp-derived-item">
            <span className="cp-derived-label">ROW SHIFT</span>
            <span className="cp-derived-value yellow">{parseInt(q) % Math.sqrt(parseInt(p))}</span>
          </div>
          <div className="cp-derived-item">
            <span className="cp-derived-label">COL SHIFT</span>
            <span className="cp-derived-value blue">{Math.floor(parseInt(q) / Math.sqrt(parseInt(p)))}</span>
          </div>
        </div>
      </div>

      <div className="cp-actions">
        <button
          className="cp-btn cp-btn-run"
          onClick={handleRun}
          disabled={isAnimating}
        >
          {isAnimating ? '⏳ RUNNING...' : '▶ RUN SHIFT'}
        </button>
        <button
          className="cp-btn cp-btn-reset"
          onClick={onReset}
          disabled={isAnimating}
        >
          ↺ RESET
        </button>
      </div>

      <div className="cp-formula">
        <div className="cp-formula-title">ALGORITHM</div>
        <code>node i → node (i + q) mod p</code>
        <code>Stage 1: col → (col + q mod √p) mod √p</code>
        <code>Stage 2: row → (row + ⌊q/√p⌋) mod √p</code>
      </div>
    </div>
  );
}
