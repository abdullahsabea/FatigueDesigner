# Fatigue Designer

[![Next.js](https://img.shields.io/badge/Next.js-15.2-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-049EF4?style=flat&logo=threedotjs&logoColor=white)](https://threejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2D6?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A modern, high-performance web application for parametric design, real-time 3D lattice visualization, and fatigue testing specimen geometry generation.

---

## Key Capabilities

* **Interactive 3D Viewport:** Real-time WebGL rendering powered by Three.js and React Three Fiber.
* **Parametric Lattice Topologies:**
  * BCC (Body-Centered Cubic)
  * FCC (Face-Centered Cubic)
  * Gyroid (Triply Periodic Minimal Surface)
  * Diamond
* **Dynamic Parameter Control:** Real-time adjustments of unit cell size, strut diameter, relative density, and specimen bounds.
* **Responsive Architecture:** Clean UI built with Tailwind CSS, Radix UI primitives, and Lucide icons.
* **Specimen Export:** Ready for additive manufacturing and fatigue testing workflows.

---

## Tech Stack

* **Frontend Framework:** Next.js (App Router)
* **3D Engine:** Three.js, React Three Fiber, React Three Drei
* **UI & Styling:** Tailwind CSS, Radix UI
* **Language:** TypeScript
* **Package Manager:** PNPM

---

## Quick Start

### Prerequisites
* Node.js 20+
* PNPM (`npm install -g pnpm`)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/abdullahsabea/FatigueDesigner.git
cd FatigueDesigner

# 2. Install dependencies
pnpm install

# 3. Start local development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
FatigueDesigner/
├── app/                 # Next.js App Router pages and layouts
├── components/          # Reusable React UI and 3D viewport components
│   ├── ui/              # Radix UI primitives
│   └── three-canvas.tsx # 3D scene and lattice rendering canvas
├── lib/                 # Parametric lattice generation mathematics
├── public/              # Static assets and specimen presets
└── styles/              # Global styling
```

---

## Available Commands

* `pnpm dev` - Start development server with hot-reload
* `pnpm build` - Build optimized production bundle
* `pnpm start` - Launch production server
* `pnpm lint` - Run static ESLint checks

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Developed by <a href="https://github.com/abdullahsabea">Abdullah El Sabea</a> • Opole University of Technology</sub>
</div>