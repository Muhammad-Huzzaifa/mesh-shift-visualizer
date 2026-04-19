import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';
import './ComplexityPanel.css';

export default function ComplexityPanel({ complexity, p, q }) {
  if (!complexity) {
    return (
      <div className="complexity-panel neo-box">
        <div className="cp2-header">
          <span className="cp-tag">ANALYSIS</span>
          <h2 className="cp2-title">COMPLEXITY PANEL</h2>
        </div>
        <div className="cp2-empty">Run a shift to see complexity analysis</div>
      </div>
    );
  }

  const { rowShift, colShift, meshSteps, ringSteps, speedup } = complexity;

  const chartData = [
    { name: 'RING', steps: ringSteps, fill: '#ff2d2d' },
    { name: 'MESH', steps: meshSteps, fill: '#0057ff' },
  ];

  const efficiency = ringSteps > meshSteps
    ? `${((ringSteps - meshSteps) / ringSteps * 100).toFixed(0)}% fewer steps`
    : ringSteps === meshSteps
    ? 'Same steps'
    : 'Ring is better';

  return (
    <div className="complexity-panel neo-box">
      <div className="cp2-header">
        <span className="cp-tag">ANALYSIS</span>
        <h2 className="cp2-title">COMPLEXITY PANEL</h2>
      </div>

      <div className="cp2-body">
        {/* Metrics */}
        <div className="cp2-metrics">
          <div className="cp2-metric cp2-metric-yellow">
            <span className="cp2-metric-label">ROW SHIFT</span>
            <span className="cp2-metric-value">{rowShift}</span>
            <span className="cp2-metric-formula">q mod √p = {q} mod {Math.sqrt(p)}</span>
          </div>
          <div className="cp2-metric cp2-metric-blue">
            <span className="cp2-metric-label">COL SHIFT</span>
            <span className="cp2-metric-value">{colShift}</span>
            <span className="cp2-metric-formula">⌊q/√p⌋ = ⌊{q}/{Math.sqrt(p)}⌋</span>
          </div>
          <div className="cp2-metric cp2-metric-green">
            <span className="cp2-metric-label">MESH TOTAL</span>
            <span className="cp2-metric-value">{meshSteps}</span>
            <span className="cp2-metric-formula">row + col = {rowShift}+{colShift}</span>
          </div>
          <div className="cp2-metric cp2-metric-red">
            <span className="cp2-metric-label">RING STEPS</span>
            <span className="cp2-metric-value">{ringSteps}</span>
            <span className="cp2-metric-formula">min(q, p−q) = min({q},{p - q})</span>
          </div>
        </div>

        {/* Formula comparison */}
        <div className="cp2-formulas">
          <div className="cp2-formula-title">STEP COUNT FORMULA</div>
          <div className="cp2-formula-row">
            <div className="cp2-formula-box cp2-ring">
              <span className="cp2-fl">RING</span>
              <code>min(q, p−q)</code>
              <span className="cp2-fv cp2-fv-red">{ringSteps} steps</span>
            </div>
            <div className="cp2-vs">VS</div>
            <div className="cp2-formula-box cp2-mesh">
              <span className="cp2-fl">MESH</span>
              <code>(q mod √p) + ⌊q/√p⌋</code>
              <span className="cp2-fv cp2-fv-blue">{meshSteps} steps</span>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="cp2-chart-section">
          <div className="cp2-chart-title">COMMUNICATION STEPS COMPARISON</div>
          <div className="cp2-chart">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontFamily: 'Space Mono', fontSize: 11, fontWeight: 700 }}
                  axisLine={{ stroke: '#0a0a0a', strokeWidth: 2 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontFamily: 'Space Mono', fontSize: 10 }}
                  axisLine={{ stroke: '#0a0a0a', strokeWidth: 2 }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    fontFamily: 'Space Mono',
                    fontSize: 12,
                    border: '3px solid #0a0a0a',
                    boxShadow: '4px 4px 0 #0a0a0a',
                    borderRadius: 0,
                  }}
                  formatter={(v) => [`${v} steps`, 'Steps']}
                />
                <Bar dataKey="steps" isAnimationActive={true} animationDuration={800}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} stroke="#0a0a0a" strokeWidth={2} />
                  ))}
                  <LabelList
                    dataKey="steps"
                    position="top"
                    style={{ fontFamily: 'Bebas Neue', fontSize: 18, fill: '#0a0a0a' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Speedup badge */}
        <div className={`cp2-verdict ${meshSteps <= ringSteps ? 'cp2-verdict-win' : 'cp2-verdict-neutral'}`}>
          {meshSteps < ringSteps ? (
            <>
              <span className="cp2-verdict-icon">⚡</span>
              <span>MESH IS <strong>{speedup}×</strong> FASTER — {efficiency}</span>
            </>
          ) : meshSteps === ringSteps ? (
            <>
              <span className="cp2-verdict-icon">↔</span>
              <span>MESH and RING are tied at {meshSteps} steps</span>
            </>
          ) : (
            <>
              <span className="cp2-verdict-icon">ℹ</span>
              <span>Ring is more efficient for this q value</span>
            </>
          )}
        </div>

        {/* Explanation */}
        <div className="cp2-explanation">
          <p>The mesh decomposes a single q-shift into <strong>two orthogonal shifts</strong> of smaller magnitude, reducing the maximum communication distance from O(p) on a ring to O(√p) on a mesh.</p>
        </div>
      </div>
    </div>
  );
}
