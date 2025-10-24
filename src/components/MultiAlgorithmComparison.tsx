/**
 * Multi-Algorithm Comparison Component
 * Compare GA-JGHO against multiple algorithms simultaneously
 */

import { useState, useEffect } from 'react';
import type { City, AlgorithmParams, GenerationStats } from '../types/algorithm';
import { StandardGA } from '../algorithms/StandardGA';
import { GAJGHO } from '../algorithms/GAJGHO';
import { ABCTSP } from '../algorithms/ABCTSP';
import { PACO3Opt } from '../algorithms/PACO3Opt';
import { ExportImport } from './ExportImport';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AlgorithmComparison.css';

interface AlgorithmInfo {
  id: string;
  name: string;
  fullName: string;
  color: string;
  description: string;
  instance: any;
  history: GenerationStats[];
  enabled: boolean;
  executionTime?: number; // Time taken in milliseconds
}

interface MultiAlgorithmComparisonProps {
  cities: City[];
  params: AlgorithmParams;
  onClose: () => void;
}

export function MultiAlgorithmComparison({ cities, params, onClose }: MultiAlgorithmComparisonProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentGen, setCurrentGen] = useState(0);
  
  const [algorithms, setAlgorithms] = useState<AlgorithmInfo[]>([
    {
      id: 'gajgho',
      name: 'GA-JGHO',
      fullName: 'GA with Jumping Gene & Heuristic Operators',
      color: '#10b981',
      description: '5 modifications + 2-Opt',
      instance: null,
      history: [],
      enabled: true // Always enabled
    },
    {
      id: 'standardga',
      name: 'Standard GA',
      fullName: 'Standard Genetic Algorithm',
      color: '#ef4444',
      description: 'Baseline with OX crossover',
      instance: null,
      history: [],
      enabled: true
    },
    {
      id: 'abctsp',
      name: 'ABCTSP',
      fullName: 'Artificial Bee Colony for TSP',
      color: '#f59e0b',
      description: 'Swarm-based optimization',
      instance: null,
      history: [],
      enabled: true
    },
    {
      id: 'paco3opt',
      name: 'PACO-3Opt',
      fullName: 'Parallel ACO with 3-Opt',
      color: '#8b5cf6',
      description: 'Hybrid ACO + local search',
      instance: null,
      history: [],
      enabled: true
    }
  ]);

  useEffect(() => {
    // Initialize all enabled algorithms
    setAlgorithms(prev => prev.map(algo => {
      if (!algo.enabled) return algo;
      
      let instance;
      switch (algo.id) {
        case 'gajgho':
          instance = new GAJGHO(cities, params);
          break;
        case 'standardga':
          instance = new StandardGA(cities, params);
          break;
        case 'abctsp':
          instance = new ABCTSP(cities, params);
          break;
        case 'paco3opt':
          instance = new PACO3Opt(cities, params);
          break;
        default:
          return algo;
      }
      
      instance.initialize();
      return {
        ...algo,
        instance,
        history: [instance.getStats()]
      };
    }));
  }, [cities, params]);

  const toggleAlgorithm = (id: string) => {
    if (id === 'gajgho') return; // Can't disable GA-JGHO
    
    setAlgorithms(prev => prev.map(algo => 
      algo.id === id ? { ...algo, enabled: !algo.enabled } : algo
    ));
  };

  const selectPreset = (preset: string) => {
    setAlgorithms(prev => prev.map(algo => {
      switch (preset) {
        case 'quick':
          return { ...algo, enabled: algo.id === 'gajgho' || algo.id === 'standardga' };
        case 'all':
          return { ...algo, enabled: true };
        case 'swarm':
          return { ...algo, enabled: algo.id === 'gajgho' || algo.id === 'abctsp' || algo.id === 'paco3opt' };
        default:
          return algo;
      }
    }));
  };

  const runComparison = async () => {
    const enabledAlgos = algorithms.filter(a => a.enabled && a.instance);
    if (enabledAlgos.length === 0) return;
    
    setIsRunning(true);
    
    // Track start time for each algorithm
    const startTimes: { [key: string]: number } = {};
    enabledAlgos.forEach(algo => {
      startTimes[algo.id] = performance.now();
    });
    
    for (let gen = 0; gen < params.maxGenerations; gen++) {
      // Run one generation for all enabled algorithms
      setAlgorithms(prev => prev.map(algo => {
        if (!algo.enabled || !algo.instance) return algo;
        
        algo.instance.runGeneration();
        return {
          ...algo,
          history: [...algo.history, algo.instance.getStats()]
        };
      }));
      
      setCurrentGen(gen + 1);
      
      // Small delay for visualization
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Calculate execution time for each algorithm (excluding visualization delays)
    const totalDelayTime = params.maxGenerations * 50; // Total visualization delay
    setAlgorithms(prev => prev.map(algo => {
      if (!algo.enabled || !algo.instance) return algo;
      
      const endTime = performance.now();
      const totalTime = endTime - startTimes[algo.id];
      const actualExecutionTime = totalTime - totalDelayTime; // Remove visualization delays
      
      return {
        ...algo,
        executionTime: actualExecutionTime
      };
    }));
    
    setIsRunning(false);
  };

  // Prepare chart data
  const chartData = algorithms[0]?.history.map((_, idx) => {
    const dataPoint: any = { generation: idx };
    
    algorithms.forEach(algo => {
      if (algo.enabled && algo.history[idx]) {
        dataPoint[`${algo.id}Best`] = parseFloat(algo.history[idx].bestDistance.toFixed(2));
      }
    });
    
    return dataPoint;
  }) || [];

  // Count enabled algorithms for button
  const enabledCount = algorithms.filter(a => a.enabled).length;
  
  // Calculate rankings (only for algorithms with results)
  const enabledAlgos = algorithms.filter(a => a.enabled && a.history.length > 1);
  const finalResults = enabledAlgos.map(algo => ({
    ...algo,
    finalBest: algo.history[algo.history.length - 1]?.bestDistance || 0
  })).sort((a, b) => a.finalBest - b.finalBest);

  const winner = finalResults[0];

  return (
    <div className="comparison-modal">
      <div className="comparison-overlay" onClick={onClose} />
      <div className="comparison-content">
        <div className="comparison-header">
          <h2>⚔️ Multi-Algorithm Comparison</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="comparison-body">
          {/* Algorithm Selection */}
          <div className="algorithm-selection">
            <div className="selection-header">
              <h3>Select Algorithms to Compare:</h3>
              <div className="preset-buttons">
                <button onClick={() => selectPreset('quick')} className="preset-btn">Quick (2)</button>
                <button onClick={() => selectPreset('swarm')} className="preset-btn">Swarm (3)</button>
                <button onClick={() => selectPreset('all')} className="preset-btn">All (4)</button>
              </div>
            </div>
            
            <div className="algorithm-checkboxes">
              {algorithms.map(algo => (
                <label 
                  key={algo.id}
                  className={`algo-checkbox ${!algo.enabled ? 'disabled' : ''} ${algo.id === 'gajgho' ? 'required' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={algo.enabled}
                    onChange={() => toggleAlgorithm(algo.id)}
                    disabled={algo.id === 'gajgho'}
                  />
                  <div className="checkbox-content">
                    <div className="checkbox-header">
                      <div className="algo-name" style={{ color: algo.color }}>
                        <span className="color-indicator" style={{ background: algo.color }}></span>
                        {algo.name}
                      </div>
                      {algo.id === 'gajgho' && <span className="required-badge">Required</span>}
                    </div>
                    <div className="algo-desc">{algo.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Control Section */}
          <div className="comparison-controls">
            <button 
              className="btn btn-primary btn-large"
              onClick={runComparison}
              disabled={isRunning || enabledCount === 0}
            >
              {isRunning ? `🏃 Running... ${currentGen}/${params.maxGenerations}` : `▶ Start Comparison (${enabledCount} algorithms)`}
            </button>
            <div className="comparison-info">
              <span className="info-badge">{cities.length} cities</span>
              <span className="info-badge">{params.populationSize} population</span>
              <span className="info-badge">{params.maxGenerations} generations</span>
            </div>
          </div>

          {/* Results */}
          {finalResults.length > 0 && chartData.length > 1 && (
            <>
              {/* Winner Announcement */}
              <div className="winner-announcement">
                <div className="trophy-icon"></div>
                <div className="winner-text">
                  <div className="winner-label">Winner:</div>
                  <div className="winner-name" style={{ color: winner.color }}>
                    {winner.name}
                  </div>
                  <div className="winner-score">
                    Best Distance: {winner.finalBest.toFixed(2)}
                    {winner.executionTime !== undefined && (
                      <span className="winner-time-inline"> • {winner.executionTime.toFixed(0)} ms</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Rankings Table */}
              <div className="rankings-table">
                <h3>Final Rankings</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Algorithm</th>
                      <th>Best Distance</th>
                      <th>Average</th>
                      <th>Diversity</th>
                      <th>Execution Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finalResults.map((algo, idx) => {
                      const final = algo.history[algo.history.length - 1];
                      return (
                        <tr key={algo.id} className={idx === 0 ? 'winner-row' : ''}>
                          <td className="rank-cell">
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                          </td>
                          <td>
                            <div className="algo-cell">
                              <span className="color-indicator" style={{ background: algo.color }}></span>
                              <strong>{algo.name}</strong>
                            </div>
                          </td>
                          <td className="distance-cell">{final.bestDistance.toFixed(2)}</td>
                          <td>{final.averageDistance.toFixed(2)}</td>
                          <td>{(final.diversity * 100).toFixed(1)}%</td>
                          <td className="time-cell">
                            {algo.executionTime !== undefined 
                              ? `${algo.executionTime.toFixed(0)} ms` 
                              : 'N/A'}
                          </td>
                          <td>
                            {idx === 0 && <span className="status-badge winner">Winner</span>}
                            {idx > 0 && (
                              <span className="status-badge">
                                +{((final.bestDistance - winner.finalBest) / winner.finalBest * 100).toFixed(1)}%
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Convergence Chart */}
              <div className="comparison-chart">
                <h3>Convergence Comparison</h3>
                <ResponsiveContainer width="100%" height={400}>
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
                    {enabledAlgos.map(algo => (
                      <Line 
                        key={algo.id}
                        type="monotone" 
                        dataKey={`${algo.id}Best`}
                        stroke={algo.color}
                        strokeWidth={2.5}
                        name={algo.name}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Export/Import Section */}
              <ExportImport
                algorithms={algorithms}
                params={params}
                datasetName={cities.length > 0 ? `${cities.length}-cities` : 'Custom'}
                datasetSize={cities.length}
                totalGenerations={params.maxGenerations}
              />
            </>
          )}

          {chartData.length <= 1 && !isRunning && (
            <div className="comparison-empty">
              <div className="empty-icon">⚔️</div>
              <p>Select algorithms and click "Start Comparison" to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
