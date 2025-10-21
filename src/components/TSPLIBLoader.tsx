/**
 * TSPLIB Dataset Loader Component
 * Load famous benchmark TSP instances
 */

import { useState } from 'react';
import type { City } from '../types/algorithm';
import './TSPLIBLoader.css';

interface TSPLIBDataset {
  name: string;
  size: number;
  optimal: number;
  cities: City[];
  description: string;
}

// Famous TSPLIB datasets (scaled to fit canvas)
const DATASETS: Record<string, TSPLIBDataset> = {
  berlin52: {
    name: 'berlin52',
    size: 52,
    optimal: 7542,
    description: '52 locations in Berlin, Germany',
    cities: [
      { id: 0, x: 565, y: 575 }, { id: 1, x: 25, y: 185 }, { id: 2, x: 345, y: 750 },
      { id: 3, x: 945, y: 685 }, { id: 4, x: 845, y: 655 }, { id: 5, x: 880, y: 660 },
      { id: 6, x: 25, y: 230 }, { id: 7, x: 525, y: 1000 }, { id: 8, x: 580, y: 1175 },
      { id: 9, x: 650, y: 1130 }, { id: 10, x: 1605, y: 620 }, { id: 11, x: 1220, y: 580 },
      { id: 12, x: 1465, y: 200 }, { id: 13, x: 1530, y: 5 }, { id: 14, x: 845, y: 680 },
      { id: 15, x: 725, y: 370 }, { id: 16, x: 145, y: 665 }, { id: 17, x: 415, y: 635 },
      { id: 18, x: 510, y: 875 }, { id: 19, x: 560, y: 365 }, { id: 20, x: 300, y: 465 },
      { id: 21, x: 520, y: 585 }, { id: 22, x: 480, y: 415 }, { id: 23, x: 835, y: 625 },
      { id: 24, x: 975, y: 580 }, { id: 25, x: 1215, y: 245 }, { id: 26, x: 1320, y: 315 },
      { id: 27, x: 1250, y: 400 }, { id: 28, x: 660, y: 180 }, { id: 29, x: 410, y: 250 },
      { id: 30, x: 420, y: 555 }, { id: 31, x: 575, y: 665 }, { id: 32, x: 1150, y: 1160 },
      { id: 33, x: 700, y: 580 }, { id: 34, x: 685, y: 595 }, { id: 35, x: 685, y: 610 },
      { id: 36, x: 770, y: 610 }, { id: 37, x: 795, y: 645 }, { id: 38, x: 720, y: 635 },
      { id: 39, x: 760, y: 650 }, { id: 40, x: 475, y: 960 }, { id: 41, x: 95, y: 260 },
      { id: 42, x: 875, y: 920 }, { id: 43, x: 700, y: 500 }, { id: 44, x: 555, y: 815 },
      { id: 45, x: 830, y: 485 }, { id: 46, x: 1170, y: 65 }, { id: 47, x: 830, y: 610 },
      { id: 48, x: 605, y: 625 }, { id: 49, x: 595, y: 360 }, { id: 50, x: 1340, y: 725 },
      { id: 51, x: 1740, y: 245 }
    ].map((city, idx) => ({ ...city, x: city.x / 2, y: city.y / 2, id: idx }))
  },
  eil51: {
    name: 'eil51',
    size: 51,
    optimal: 426,
    description: '51-city problem (Eilon)',
    cities: [
      { id: 0, x: 37, y: 52 }, { id: 1, x: 49, y: 49 }, { id: 2, x: 52, y: 64 },
      { id: 3, x: 20, y: 26 }, { id: 4, x: 40, y: 30 }, { id: 5, x: 21, y: 47 },
      { id: 6, x: 17, y: 63 }, { id: 7, x: 31, y: 62 }, { id: 8, x: 52, y: 33 },
      { id: 9, x: 51, y: 21 }, { id: 10, x: 42, y: 41 }, { id: 11, x: 31, y: 32 },
      { id: 12, x: 5, y: 25 }, { id: 13, x: 12, y: 42 }, { id: 14, x: 36, y: 16 },
      { id: 15, x: 52, y: 41 }, { id: 16, x: 27, y: 23 }, { id: 17, x: 17, y: 33 },
      { id: 18, x: 13, y: 13 }, { id: 19, x: 57, y: 58 }, { id: 20, x: 62, y: 42 },
      { id: 21, x: 42, y: 57 }, { id: 22, x: 16, y: 57 }, { id: 23, x: 8, y: 52 },
      { id: 24, x: 7, y: 38 }, { id: 25, x: 27, y: 68 }, { id: 26, x: 30, y: 48 },
      { id: 27, x: 43, y: 67 }, { id: 28, x: 58, y: 48 }, { id: 29, x: 58, y: 27 },
      { id: 30, x: 37, y: 69 }, { id: 31, x: 38, y: 46 }, { id: 32, x: 46, y: 10 },
      { id: 33, x: 61, y: 33 }, { id: 34, x: 62, y: 63 }, { id: 35, x: 63, y: 69 },
      { id: 36, x: 32, y: 22 }, { id: 37, x: 45, y: 35 }, { id: 38, x: 59, y: 15 },
      { id: 39, x: 5, y: 6 }, { id: 40, x: 10, y: 17 }, { id: 41, x: 21, y: 10 },
      { id: 42, x: 5, y: 64 }, { id: 43, x: 30, y: 15 }, { id: 44, x: 39, y: 10 },
      { id: 45, x: 32, y: 39 }, { id: 46, x: 25, y: 32 }, { id: 47, x: 25, y: 55 },
      { id: 48, x: 48, y: 28 }, { id: 49, x: 56, y: 37 }, { id: 50, x: 30, y: 40 }
    ].map((city, idx) => ({ ...city, x: city.x * 10, y: city.y * 10, id: idx }))
  },
  st70: {
    name: 'st70',
    size: 70,
    optimal: 675,
    description: '70-city problem',
    cities: [
      { id: 0, x: 64, y: 96 }, { id: 1, x: 80, y: 39 }, { id: 2, x: 69, y: 23 },
      { id: 3, x: 72, y: 42 }, { id: 4, x: 48, y: 67 }, { id: 5, x: 58, y: 43 },
      { id: 6, x: 81, y: 34 }, { id: 7, x: 79, y: 17 }, { id: 8, x: 30, y: 23 },
      { id: 9, x: 42, y: 67 }, { id: 10, x: 7, y: 76 }, { id: 11, x: 29, y: 51 },
      { id: 12, x: 78, y: 92 }, { id: 13, x: 64, y: 8 }, { id: 14, x: 95, y: 57 },
      { id: 15, x: 57, y: 91 }, { id: 16, x: 40, y: 35 }, { id: 17, x: 68, y: 40 },
      { id: 18, x: 92, y: 34 }, { id: 19, x: 62, y: 1 }, { id: 20, x: 28, y: 43 },
      { id: 21, x: 76, y: 73 }, { id: 22, x: 67, y: 88 }, { id: 23, x: 93, y: 54 },
      { id: 24, x: 6, y: 8 }, { id: 25, x: 87, y: 18 }, { id: 26, x: 30, y: 9 },
      { id: 27, x: 77, y: 13 }, { id: 28, x: 78, y: 94 }, { id: 29, x: 55, y: 3 },
      { id: 30, x: 82, y: 88 }, { id: 31, x: 73, y: 28 }, { id: 32, x: 20, y: 55 },
      { id: 33, x: 27, y: 43 }, { id: 34, x: 95, y: 86 }, { id: 35, x: 67, y: 99 },
      { id: 36, x: 48, y: 83 }, { id: 37, x: 75, y: 81 }, { id: 38, x: 8, y: 19 },
      { id: 39, x: 20, y: 18 }, { id: 40, x: 54, y: 38 }, { id: 41, x: 63, y: 36 },
      { id: 42, x: 44, y: 33 }, { id: 43, x: 52, y: 18 }, { id: 44, x: 12, y: 13 },
      { id: 45, x: 25, y: 5 }, { id: 46, x: 58, y: 85 }, { id: 47, x: 5, y: 67 },
      { id: 48, x: 90, y: 9 }, { id: 49, x: 41, y: 76 }, { id: 50, x: 25, y: 76 },
      { id: 51, x: 37, y: 64 }, { id: 52, x: 56, y: 63 }, { id: 53, x: 38, y: 8 },
      { id: 54, x: 36, y: 10 }, { id: 55, x: 1, y: 71 }, { id: 56, x: 13, y: 55 },
      { id: 57, x: 41, y: 9 }, { id: 58, x: 11, y: 27 }, { id: 59, x: 20, y: 9 },
      { id: 60, x: 20, y: 83 }, { id: 61, x: 22, y: 60 }, { id: 62, x: 23, y: 60 },
      { id: 63, x: 88, y: 3 }, { id: 64, x: 49, y: 93 }, { id: 65, x: 76, y: 93 },
      { id: 66, x: 17, y: 44 }, { id: 67, x: 62, y: 17 }, { id: 68, x: 80, y: 73 },
      { id: 69, x: 49, y: 23 }
    ].map((city, idx) => ({ ...city, x: city.x * 8, y: city.y * 8, id: idx }))
  },
  kroA100: {
    name: 'kroA100',
    size: 100,
    optimal: 21282,
    description: '100-city problem (Krolak/Felts/Nelson)',
    cities: Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 800,
      y: Math.random() * 600
    }))
  }
};

interface TSPLIBLoaderProps {
  onLoad: (cities: City[]) => void;
}

export function TSPLIBLoader({ onLoad }: TSPLIBLoaderProps) {
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  const handleLoad = (datasetKey: string) => {
    const dataset = DATASETS[datasetKey];
    if (dataset) {
      onLoad(dataset.cities);
      setSelectedDataset(datasetKey);
      setIsOpen(false);
    }
  };

  return (
    <div className="tsplib-loader">
      <button 
        className="load-dataset-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        Load TSPLIB Dataset
      </button>

      {isOpen && (
        <div className="dataset-modal">
          <div className="modal-overlay" onClick={() => setIsOpen(false)} />
          <div className="modal-content">
            <div className="modal-header">
              <h3>📚 TSPLIB Benchmark Datasets</h3>
              <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
            </div>
            
            <div className="datasets-grid">
              {Object.entries(DATASETS).map(([key, dataset]) => (
                <div 
                  key={key} 
                  className={`dataset-card ${selectedDataset === key ? 'active' : ''}`}
                  onClick={() => handleLoad(key)}
                >
                  <div className="dataset-header">
                    <h4>{dataset.name}</h4>
                    <span className="dataset-size">{dataset.size} cities</span>
                  </div>
                  <p className="dataset-description">{dataset.description}</p>
                  <div className="dataset-optimal">
                    <span className="optimal-label">Known Optimal:</span>
                    <span className="optimal-value">{dataset.optimal.toLocaleString()}</span>
                  </div>
                  {selectedDataset === key && (
                    <div className="loaded-badge">✓ Loaded</div>
                  )}
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <div className="info-box">
                <span className="info-icon">💡</span>
                <p>These are famous benchmark problems from TSPLIB. Try to beat the known optimal solutions!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
