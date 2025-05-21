# Fatigue Designer

[![Deploy to GitHub Pages](https://github.com/abdullahsabea/FatigueDesigner/actions/workflows/deploy.yml/badge.svg)](https://github.com/abdullahsabea/FatigueDesigner/actions/workflows/deploy.yml)

A modern web application for designing and visualizing lattice structures for fatigue testing specimens. Built with Next.js, Three.js, and TypeScript.

## Features

- Interactive 3D visualization of lattice structures
- Support for multiple lattice types:
  - BCC (Body-Centered Cubic)
  - FCC (Face-Centered Cubic)
  - Gyroid
  - Diamond
- Real-time parameter adjustments
- Modern, responsive UI built with Tailwind CSS
- Optimized performance for complex 3D models

## Tech Stack

- **Frontend Framework**: Next.js 15.2.4
- **3D Visualization**: Three.js with React Three Fiber
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Package Manager**: PNPM
- **UI Components**: Radix UI

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- PNPM package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/abdullahsabea/FatigueDesigner.git
   cd FatigueDesigner
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
FatigueDesigner/
├── app/                 # Next.js app directory
├── components/          # React components
│   ├── ui/             # UI components
│   └── three-canvas.tsx # 3D visualization component
├── lib/                # Utility functions and lattice generators
├── public/             # Static assets
└── styles/             # Global styles
```

## Development

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Three.js community for 3D visualization tools
- Next.js team for the amazing framework
- Radix UI for accessible components 

NEXT_PUBLIC_BASE_PATH=/FatigueDesigner 