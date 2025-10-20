/**
 * Algorithm Comparison Component
 * Side-by-side comparison of Standard GA vs GA-JGHO
 */

import { useState, useEffect } from 'react';
import type { City, AlgorithmParams, GenerationStats } from '../types/algorithm';
import { StandardGA } from '../algorithms/StandardGA';
import { GAJGHO } from '../algorithms/GAJGHO';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AlgorithmComparison.css';

interface AlgorithmComparisonProps {
  cities: City[];
  params: AlgorithmParams;
  onClose: () => void;
}

export function AlgorithmComparison({ cities, params, onClose }: AlgorithmComparisonProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentGen, setCurrentGen] = useState(0);
  const [standardHistory, setStandardHistory] = useState<GenerationStats[]>([]);
  const [gajghoHistory, setGajghoHistory] = useState<GenerationStats[]>([]);
  const [standardGA, setStandardGA] = useState<StandardGA | null>(null);
  const [gajghoGA, setGajghoGA] = useState<GAJGHO | null>(null);

  useEffect(() => {
    // Initialize both algorithms
    const sga = new StandardGA(cities, params);
    const jga = new GAJGHO(cities, params);
    
    sga.initialize();
    jga.initialize();
    
    setStandardGA(sga);
    setGajghoGA(jga);
    setStandardHistory([sga.getStats()]);
    setGajghoHistory([jga.getStats()]);
  }, [cities, params]);

  const runComparison = async () => {
    if (!standardGA || !gajghoGA) return;
    
    setIsRunning(true);
    
    for (let gen = 0; gen < params.maxGenerations; gen++) {
      // Run one generation for both
      standardGA.runGeneration();
      gajghoGA.runGeneration();
      
      setCurrentGen(gen + 1);
      setStandardHistory(prev => [...prev, standardGA.getStats()]);
      setGajghoHistory(prev => [...prev, gajghoGA.getStats()]);
      
      // Small delay for visualization
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    setIsRunning(false);
  };

  const chartData = standardHistory.map((stat, idx) => ({
    generation: stat.generation,
    standardBest: parseFloat(stat.bestDistance.toFixed(2)),
    gajghoBest: gajghoHistory[idx]?.bestDistance ? parseFloat(gajghoHistory[idx].bestDistance.toFixed(2)) : 0,
    standardAvg: parseFloat(stat.averageDistance.toFixed(2)),
    gajghoAvg: gajghoHistory[idx]?.averageDistance ? parseFloat(gajghoHistory[idx].averageDistance.toFixed(2)) : 0
  }));

  const finalStandard = standardHistory[standardHistory.length - 1];
  const finalGajgho = gajghoHistory[gajghoHistory.length - 1];
  const improvement = finalStandard && finalGajgho 
    ? ((finalStandard.bestDistance - finalGajgho.bestDistance) / finalStandard.bestDistance * 100)
    : 0;

  return (
    <div className="comparison-modal">
      <div className="comparison-overlay" onClick={onClose} />
      <div className="comparison-content">
        <div className="comparison-header">
          <h2>⚔️ Algorithm Comparison: Standard GA vs GA-JGHO</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="comparison-body">
          {/* Control Section */}
          <div className="comparison-controls">
            <button 
              className="btn btn-primary btn-large"
              onClick={runComparison}
              disabled={isRunning}
            >
              {isRunning ? `🏃 Running... ${currentGen}/${params.maxGenerations}` : '▶ Start Comparison'}
            </button>
            <div className="comparison-info">
              <span className="info-badge">{cities.length} cities</span>
              <span className="info-badge">{params.populationSize} population</span>
              <span className="info-badge">{params.maxGenerations} generations</span>
            </div>
          </div>

          {/* Results Grid */}
          {standardHistory.length > 1 && (
            <>
              <div className="results-grid">
                {/* Standard GA Card */}
                <div className="algorithm-card standard">
                  <div className="algo-header">
                    <h3>🧪 Standard GA</h3>
                    <span className="algo-badge">Baseline</span>
                  </div>
                  <div className="algo-stats">
                    <div className="stat">
                      <span className="label">Best Distance</span>
                      <span className="value">{finalStandard?.bestDistance.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Average Distance</span>
                      <span className="value">{finalStandard?.averageDistance.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Diversity</span>
                      <span className="value">{finalStandard ? (finalStandard.diversity * 100).toFixed(1) + '%' : 'N/A'}</span>
                    </div>
                  </div>
                  <div className="algo-features">
                    <div className="feature">✓ Roulette Selection</div>
                    <div className="feature">✓ Order Crossover (OX)</div>
                    <div className="feature">✓ Swap Mutation</div>
                    <div className="feature">✓ Elitism</div>
                  </div>
                </div>

                {/* GA-JGHO Card */}
                <div className="algorithm-card gajgho">
                  <div className="algo-header">
                    <h3>🧬 GA-JGHO</h3>
                    <span className="algo-badge highlight">Enhanced</span>
                  </div>
                  <div className="algo-stats">
                    <div className="stat">
                      <span className="label">Best Distance</span>
                      <span className="value highlight">{finalGajgho?.bestDistance.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Average Distance</span>
                      <span className="value">{finalGajgho?.averageDistance.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Diversity</span>
                      <span className="value">{finalGajgho ? (finalGajgho.diversity * 100).toFixed(1) + '%' : 'N/A'}</span>
                    </div>
                  </div>
                  <div className="algo-features">
                    <div className="feature highlight">✓ Combination Fitness</div>
                    <div className="feature highlight">✓ BHX Crossover</div>
                    <div className="feature highlight">✓ Combination Mutation</div>
                    <div className="feature highlight">✓ Jumping Gene</div>
                    <div className="feature highlight">✓ Unique Operator</div>
                    <div className="feature highlight">✓ 2-Opt Search</div>
                  </div>
                </div>

                {/* Improvement Card */}
                <div className="improvement-card">
                  <div className="improvement-icon">
                    {improvement > 0 ? '🏆' : improvement < 0 ? '⚠️' : '🤝'}
                  </div>
                  <div className="improvement-value">
                    <span className={improvement > 0 ? 'positive' : improvement < 0 ? 'negative' : 'neutral'}>
                      {improvement > 0 ? '+' : ''}{improvement.toFixed(2)}%
                    </span>
                  </div>
                  <div className="improvement-label">
                    {improvement > 0 ? 'GA-JGHO is Better' : improvement < 0 ? 'Standard GA is Better' : 'Tie'}
                  </div>
                  <div className="improvement-desc">
                    {improvement > 0 
                      ? `GA-JGHO found a solution ${Math.abs(improvement).toFixed(2)}% shorter!`
                      : improvement < 0
                      ? `Standard GA performed better this time (rare)`
                      : 'Both algorithms found similar solutions'
                    }
                  </div>
                </div>
              </div>

              {/* Convergence Chart */}
              <div className="comparison-chart">
                <h3>📊 Convergence Comparison</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="generation" 
                      label={{ value: 'Generation', position: 'insideBottom', offset: -5 }}
                      stroke="#6b7280"
                    />
                    <YAxis 
                      label={{ value: 'Distance', angle: -90, position: 'insideLeft' }}
                      stroke="#6b7280"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="standardBest" 
                      stroke="#ef4444" 
                      strokeWidth={2.5}
                      name="Standard GA (Best)"
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="gajghoBest" 
                      stroke="#10b981" 
                      strokeWidth={2.5}
                      name="GA-JGHO (Best)"
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="standardAvg" 
                      stroke="#f87171" 
                      strokeWidth={1.5}
                      strokeDasharray="5 5"
                      name="Standard GA (Avg)"
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="gajghoAvg" 
                      stroke="#34d399" 
                      strokeWidth={1.5}
                      strokeDasharray="5 5"
                      name="GA-JGHO (Avg)"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {standardHistory.length <= 1 && !isRunning && (
            <div className="comparison-empty">
              <div className="empty-icon">⚔️</div>
              <p>Click "Start Comparison" to run both algorithms side-by-side</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
