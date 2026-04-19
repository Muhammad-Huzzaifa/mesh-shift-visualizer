import React, { useEffect, useRef } from 'react';
import './MeshGrid.css';

function NodeCell({ nodeId, value, highlight, stage, dim, rowMovements, colMovements }) {
  const row = Math.floor(nodeId / dim);
  const col = nodeId % dim;

  const isRowActive = rowMovements?.some(m => m.from === nodeId);
  const isColActive = colMovements?.some(m => m.from === nodeId);

  let cellClass = 'mesh-node';
  if (highlight === 'row' && isRowActive) cellClass += ' mesh-node-row-active';
  if (highlight === 'col' && isColActive) cellClass += ' mesh-node-col-active';
  if (highlight === 'done') cellClass += ' mesh-node-done';

  return (
    <div className={cellClass} style={{ '--anim-delay': `${(row + col) * 0.03}s` }}>
      <span className="node-id">N{nodeId}</span>
      <span className="node-value">{value !== undefined ? value : nodeId}</span>
      <span className="node-pos">[{row},{col}]</span>
    </div>
  );
}

function ArrowOverlay({ movements, type, dim, nodeSize }) {
  if (!movements || movements.length === 0) return null;

  return (
    <div className={`arrow-overlay arrow-overlay-${type}`}>
      {type === 'row' && movements.slice(0, 1).map((m, i) => (
        <div key={i} className="arrow-label-row">
          → ROW SHIFT: {m.dstCol - m.srcCol < 0 ? dim + (m.dstCol - m.srcCol) : m.dstCol - m.srcCol} steps right
        </div>
      ))}
      {type === 'col' && movements.slice(0, 1).map((m, i) => (
        <div key={i} className="arrow-label-col">
          ↓ COL SHIFT: {m.dstRow - m.srcRow < 0 ? dim + (m.dstRow - m.srcRow) : m.dstRow - m.srcRow} steps down
        </div>
      ))}
    </div>
  );
}

export default function MeshGrid({ shiftData, phase, animPhase }) {
  if (!shiftData) {
    return (
      <div className="mesh-grid-wrapper mesh-grid-empty neo-box">
        <div className="mesh-empty-msg">
          <span className="mesh-empty-icon">⬛</span>
          <span>Configure parameters and click RUN SHIFT to visualize</span>
        </div>
      </div>
    );
  }

  const { dim, initial, afterRowShift, afterColShift, rowMovements, colMovements, p } = shiftData;

  const stageData = {
    initial: initial,
    row: afterRowShift,
    col: afterColShift,
    done: afterColShift,
  };

  const currentData = stageData[animPhase] || initial;

  const stageLabels = {
    initial: { label: 'INITIAL STATE', color: 'var(--black)', bg: 'var(--white)' },
    row: { label: 'STAGE 1 — ROW SHIFT', color: 'var(--black)', bg: 'var(--yellow)' },
    col: { label: 'STAGE 2 — COL SHIFT', color: 'var(--white)', bg: 'var(--blue)' },
    done: { label: 'FINAL STATE ✓', color: 'var(--black)', bg: 'var(--green)' },
  };

  const sl = stageLabels[animPhase] || stageLabels.initial;

  return (
    <div className="mesh-grid-wrapper neo-box">
      <div className="mesh-stage-header" style={{ background: sl.bg, color: sl.color }}>
        <span className="mesh-stage-label">{sl.label}</span>
        {animPhase === 'row' && (
          <span className="mesh-stage-detail">shift = q mod √p = {shiftData.rowShift} positions →</span>
        )}
        {animPhase === 'col' && (
          <span className="mesh-stage-detail">shift = ⌊q/√p⌋ = {shiftData.colShift} positions ↓</span>
        )}
        {animPhase === 'done' && (
          <span className="mesh-stage-detail">node i now holds data from node (i−q+p) mod p</span>
        )}
      </div>

      <div
        className="mesh-grid"
        style={{
          '--dim': dim,
          '--node-size': dim <= 4 ? '80px' : dim <= 6 ? '64px' : '52px',
        }}
      >
        {currentData.map((val, nodeId) => (
          <NodeCell
            key={nodeId}
            nodeId={nodeId}
            value={val}
            dim={dim}
            highlight={animPhase}
            rowMovements={animPhase === 'row' ? rowMovements : []}
            colMovements={animPhase === 'col' ? colMovements : []}
          />
        ))}
      </div>

      {animPhase === 'row' && rowMovements.length > 0 && (
        <ArrowOverlay movements={rowMovements} type="row" dim={dim} />
      )}
      {animPhase === 'col' && colMovements.length > 0 && (
        <ArrowOverlay movements={colMovements} type="col" dim={dim} />
      )}

      <div className="mesh-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: 'var(--black)' }} />
          <span>Node ID</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: 'var(--yellow)' }} />
          <span>Row shift active</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: 'var(--blue)' }} />
          <span>Col shift active</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: 'var(--green)' }} />
          <span>Complete</span>
        </div>
      </div>
    </div>
  );
}

export function StateComparison({ shiftData }) {
  if (!shiftData) return null;
  const { initial, afterRowShift, afterColShift, dim } = shiftData;

  const stages = [
    { label: 'BEFORE', sublabel: 'Initial', data: initial, color: 'var(--black)' },
    { label: 'AFTER S1', sublabel: 'Row Shift', data: afterRowShift, color: 'var(--orange)' },
    { label: 'AFTER S2', sublabel: 'Final', data: afterColShift, color: 'var(--blue)' },
  ];

  return (
    <div className="state-comparison neo-box">
      <div className="sc-header">
        <span className="cp-tag">DATA</span>
        <span className="sc-title">BEFORE / AFTER STATES</span>
      </div>
      <div className="sc-stages">
        {stages.map((s, si) => (
          <div key={si} className="sc-stage">
            <div className="sc-stage-label" style={{ borderBottom: `4px solid ${s.color}` }}>
              <strong>{s.label}</strong>
              <span>{s.sublabel}</span>
            </div>
            <div className="sc-grid" style={{ '--dim': dim }}>
              {s.data.map((val, i) => (
                <div
                  key={i}
                  className={`sc-cell ${val !== initial[i] && si > 0 ? 'sc-cell-changed' : ''}`}
                  title={`Node ${i}: data=${val}`}
                >
                  <span className="sc-cell-node">N{i}</span>
                  <span className="sc-cell-val">{val}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
