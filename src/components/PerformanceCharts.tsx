/**
 * Performance Charts Component
 * Visualizes algorithm convergence over generations
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { GenerationStats } from '../types/algorithm';
import './PerformanceCharts.css';

interface PerformanceChartsProps {
  history: GenerationStats[];
}

export function PerformanceCharts({ history }: PerformanceChartsProps) {
  if (history.length === 0) {
    return (
      <div className="charts-container">
        <div className="charts-empty">
          <div className="empty-icon"></div>
          <p>Performance charts will appear here once the algorithm starts running</p>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const chartData = history.map(stat => ({
    generation: stat.generation,
    best: parseFloat(stat.bestDistance.toFixed(2)),
    average: parseFloat(stat.averageDistance.toFixed(2)),
    worst: parseFloat(stat.worstDistance.toFixed(2)),
    diversity: parseFloat((stat.diversity * 100).toFixed(2))
  }));

  return (
    <div className="charts-container">
      <div className="charts-header">
        <h2>Performance Analysis</h2>
        <div className="charts-stats">
          <div className="chart-stat">
            <span className="label">Total Generations:</span>
            <span className="value">{history.length}</span>
          </div>
          <div className="chart-stat">
            <span className="label">Improvement:</span>
            <span className="value">
              {history.length > 1 
                ? `${((1 - history[history.length - 1].bestDistance / history[0].bestDistance) * 100).toFixed(1)}%`
                : 'N/A'
              }
            </span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        {/* Distance Convergence Chart */}
        <div className="chart-card">
          <div className="chart-title">
            <span className="chart-icon"></span>
            <h3>Distance Convergence</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 25, right: 20, left: 0, bottom: 35 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="generation" 
                label={{ value: 'Generation', position: 'insideBottom', offset: -8}}
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
              <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '12px' }} />
              <Line 
                type="monotone" 
                dataKey="best" 
                stroke="#10b981" 
                strokeWidth={2.5}
                name="Best Distance"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="average" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Average Distance"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="worst" 
                stroke="#ef4444" 
                strokeWidth={1.5}
                name="Worst Distance"
                dot={false}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="chart-insight">
            <span className="insight-icon">💡</span>
            <p>Lower is better. Best distance should decrease and stabilize over generations.</p>
          </div>
        </div>

        {/* Diversity Chart */}
        <div className="chart-card">
          <div className="chart-title">
            <span className="chart-icon"></span>
            <h3>Population Diversity</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 25, right: 20, left: 0, bottom: 35 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="generation" 
                label={{ value: 'Generation', position: 'insideBottom', offset: -8 }}
                stroke="#6b7280"
              />
              <YAxis 
                label={{ value: 'Diversity (%)', angle: -90, position: 'insideLeft' }}
                stroke="#6b7280"
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                align="center" 
                wrapperStyle={{ paddingTop: '12px', textAlign: 'center' }} 
              />
              <Line 
                type="monotone" 
                dataKey="diversity" 
                stroke="#8b5cf6" 
                strokeWidth={2.5}
                name="Diversity %"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="chart-insight">
            <span className="insight-icon">💡</span>
            <p>Healthy diversity (60-90%) prevents premature convergence to local optima.</p>
          </div>
        </div>
      </div>

      {/* Convergence Summary */}
      <div className="convergence-summary">
        <div className="summary-card">
          <span className="summary-label">Initial Best</span>
          <span className="summary-value">{history[0].bestDistance.toFixed(2)}</span>
        </div>
        <div className="summary-arrow">→</div>
        <div className="summary-card">
          <span className="summary-label">Final Best</span>
          <span className="summary-value highlight">{history[history.length - 1].bestDistance.toFixed(2)}</span>
        </div>
        <div className="summary-arrow">≈</div>
        <div className="summary-card">
          <span className="summary-label">Improvement</span>
          <span className="summary-value success">
            {(history[0].bestDistance - history[history.length - 1].bestDistance).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
