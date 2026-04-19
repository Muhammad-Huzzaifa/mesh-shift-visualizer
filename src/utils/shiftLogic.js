/**
 * shiftLogic.js
 * Pure functions for Circular Q-Shift on a 2D Mesh Topology
 * Fully testable, no side effects.
 */

/**
 * Validate if a number is a perfect square
 */
export function isPerfectSquare(n) {
  if (n < 1) return false;
  const sqrt = Math.sqrt(n);
  return Number.isInteger(sqrt);
}

/**
 * Get grid dimension (√p)
 */
export function getDim(p) {
  return Math.round(Math.sqrt(p));
}

/**
 * Generate initial node data: node i holds value i
 */
export function generateInitialData(p) {
  return Array.from({ length: p }, (_, i) => i);
}

/**
 * Perform Stage 1: Row Shift
 * Each node i at position (row, col) sends data to (row, (col + rowShift) % dim)
 * rowShift = q mod √p
 *
 * @param {number[]} data - current data array, index = node id
 * @param {number} p - total nodes
 * @param {number} q - shift amount
 * @returns {{ result: number[], rowShift: number, movements: Array }}
 */
export function applyRowShift(data, p, q) {
  const dim = getDim(p);
  const rowShift = q % dim;
  const result = new Array(p).fill(0);
  const movements = [];

  for (let row = 0; row < dim; row++) {
    for (let col = 0; col < dim; col++) {
      const srcNode = row * dim + col;
      const dstCol = (col + rowShift) % dim;
      const dstNode = row * dim + dstCol;
      result[dstNode] = data[srcNode];
      if (rowShift > 0) {
        movements.push({ from: srcNode, to: dstNode, row, srcCol: col, dstCol });
      }
    }
  }

  return { result, rowShift, movements };
}

/**
 * Compensation step between row and column shifts.
 * After the row shift, the first `rowShift` columns must move one row down
 * (with wrap-around) to preserve global circular ordering.
 *
 * @param {number[]} data - data after row shift
 * @param {number} p - total nodes
 * @param {number} rowShift - q mod √p
 * @returns {{ result: number[], movements: Array }}
 */
export function applyWrapCompensation(data, p, rowShift) {
  const dim = getDim(p);
  const result = data.slice();
  const movements = [];

  if (rowShift <= 0) {
    return { result, movements };
  }

  for (let col = 0; col < rowShift; col++) {
    const colValues = [];
    for (let row = 0; row < dim; row++) {
      colValues.push(data[row * dim + col]);
    }

    for (let row = 0; row < dim; row++) {
      const srcRow = row;
      const dstRow = (row + 1) % dim;
      const srcNode = srcRow * dim + col;
      const dstNode = dstRow * dim + col;
      result[dstNode] = colValues[row];
      movements.push({ from: srcNode, to: dstNode, col, srcRow, dstRow });
    }
  }

  return { result, movements };
}

/**
 * Perform Stage 2: Column Shift
 * Each node at position (row, col) sends data to ((row + colShift) % dim, col)
 * colShift = ⌊q / √p⌋
 *
 * @param {number[]} data - data after row shift
 * @param {number} p - total nodes
 * @param {number} q - shift amount
 * @returns {{ result: number[], colShift: number, movements: Array }}
 */
export function applyColShift(data, p, q) {
  const dim = getDim(p);
  const colShift = Math.floor(q / dim);
  const result = new Array(p).fill(0);
  const movements = [];

  for (let row = 0; row < dim; row++) {
    for (let col = 0; col < dim; col++) {
      const srcNode = row * dim + col;
      const dstRow = (row + colShift) % dim;
      const dstNode = dstRow * dim + col;
      result[dstNode] = data[srcNode];
      if (colShift > 0) {
        movements.push({ from: srcNode, to: dstNode, col, srcRow: row, dstRow });
      }
    }
  }

  return { result, colShift, movements };
}

/**
 * Full circular q-shift: returns all stages
 */
export function computeCircularShift(p, q) {
  const initial = generateInitialData(p);
  const dim = getDim(p);
  const rowShift = q % dim;
  const colShift = Math.floor(q / dim);

  const stage1 = applyRowShift(initial, p, q);
  const compensation = applyWrapCompensation(stage1.result, p, rowShift);
  const stage2 = applyColShift(compensation.result, p, q);

  // Verification: node i should now hold value (i - q + p) % p
  const expectedFinal = stage2.result.map((_, i) => {
    // final[i] = initial[(i - q + p) % p]
    return (i - q + p) % p;
  });

  return {
    p, q, dim,
    initial,
    rowShift,
    colShift,
    afterRowShift: stage1.result,
    rowMovements: stage1.movements,
    afterCompensation: compensation.result,
    compensationMovements: compensation.movements,
    afterColShift: stage2.result,
    colMovements: stage2.movements,
    verified: JSON.stringify(stage2.result) === JSON.stringify(expectedFinal),
  };
}

/**
 * Complexity analysis
 */
export function computeComplexity(p, q) {
  const dim = getDim(p);
  const rowShift = q % dim;
  const colShift = Math.floor(q / dim);
  const meshSteps = rowShift + colShift;

  // Ring steps: in a p-node ring, min circular distance
  const ringSteps = Math.min(q, p - q);

  return {
    rowShift,
    colShift,
    meshSteps,
    ringSteps,
    totalMeshComm: meshSteps,
    speedup: ringSteps > 0 ? (ringSteps / meshSteps).toFixed(2) : 'N/A',
  };
}
