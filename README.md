# Mesh Circular Shift Visualizer

An interactive web application that simulates and visualizes **circular q-shift** operations on a 2D mesh topology — a fundamental operation in parallel computing.

## 🚀 Live Deployment

**[→ View Live App](https://mesh-shift-visualizer.vercel.app)**

## 📐 Algorithm

A circular q-shift moves data from node `i` to node `(i + q) mod p`.

On a 2D mesh, this is implemented in two stages:

- **Stage 1 (Row Shift):** shift = `q mod √p` positions right
- **Stage 2 (Column Shift):** shift = `⌊q / √p⌋` positions down

This reduces communication from `O(p)` (ring) to `O(√p)` (mesh).

## ✨ Features

- **Input Controls** — select p (4–64, perfect squares) and q (1 to p−1) with validation
- **Mesh Grid Visualization** — renders √p × √p node grid with indices and data values
- **Step-by-Step Animation** — animated phases: Initial → Row Shift → Col Shift → Final
- **Before/After States** — side-by-side data comparison across all three stages
- **Complexity Panel** — real-time analysis with bar chart comparing Mesh vs Ring steps

## 🗂️ Project Structure

```
mesh-shift-visualizer/
├── public/
├── src/
│   ├── components/
│   │   ├── MeshGrid.jsx       ← grid rendering + animation
│   │   ├── MeshGrid.css
│   │   ├── ControlPanel.jsx   ← user inputs + validation
│   │   ├── ControlPanel.css
│   │   ├── ComplexityPanel.jsx ← analysis + bar chart
│   │   └── ComplexityPanel.css
│   ├── utils/
│   │   └── shiftLogic.js      ← pure shift algorithm (testable)
│   ├── App.jsx
│   ├── App.css
│   ├── index.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## 🛠️ Setup Instructions

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/mesh-shift-visualizer.git
cd mesh-shift-visualizer

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🧠 Complexity Analysis

| Topology | Steps Formula | Example (p=16, q=5) |
|----------|--------------|----------------------|
| Ring     | `min(q, p−q)` | min(5, 11) = **5** |
| Mesh     | `(q mod √p) + ⌊q/√p⌋` | 1 + 1 = **2** |

The mesh is more efficient because it exploits 2D locality.

## 🎨 Tech Stack

- **React 18** + **Vite 5**
- **Recharts** for bar chart visualization
- **Neo-Brutalism** design theme
- Deployed on **Vercel**
