/**
 * Parameter Tuning Component
 * Interactive sliders for GA-JGHO parameters
 */

import { useState } from 'react';
import type { AlgorithmParams } from '../types/algorithm';
import { DEFAULT_PARAMS } from '../types/algorithm';
import './ParameterTuning.css';

interface ParameterTuningProps {
  params: AlgorithmParams;
  onParamsChange: (params: Partial<AlgorithmParams>) => void;
  onReset: () => void;
  disabled?: boolean;
}

interface Preset {
  name: string;
  description: string;

  params: AlgorithmParams;
}

const PRESETS: Preset[] = [
  {
    name: 'Paper Optimal',
    description: 'Optimized values from research paper',
    params: DEFAULT_PARAMS
  },
  {
    name: 'Aggressive',
    description: 'Fast exploration, high diversity',
    params: {
      populationSize: 150,
      maxGenerations: 80,
      eliteCount: 3,
      PfitMax: 0.85,
      PfitMin: 0.10,
      PsMax: 0.70,
      PsMin: 0.25,
      beta: 0.35,
      PJG: 0.75,
      q: 25
    }
  },
  {
    name: 'Balanced',
    description: 'Good all-around performance',
  
    params: {
      populationSize: 100,
      maxGenerations: 100,
      eliteCount: 2,
      PfitMax: 0.76,
      PfitMin: 0.0657,
      PsMax: 0.5446,
      PsMin: 0.1607,
      beta: 0.292,
      PJG: 0.6464,
      q: 19
    }
  },
  {
    name: 'Conservative',
    description: 'Slow, thorough exploitation',
    params: {
      populationSize: 80,
      maxGenerations: 150,
      eliteCount: 5,
      PfitMax: 0.60,
      PfitMin: 0.03,
      PsMax: 0.40,
      PsMin: 0.08,
      beta: 0.20,
      PJG: 0.50,
      q: 15
    }
  },
  {
    name: 'Large Scale',
    description: 'Optimized for 200+ cities',
    params: {
      populationSize: 200,
      maxGenerations: 200,
      eliteCount: 4,
      PfitMax: 0.80,
      PfitMin: 0.05,
      PsMax: 0.60,
      PsMin: 0.12,
      beta: 0.32,
      PJG: 0.70,
      q: 30
    }
  }
];

export function ParameterTuning({ params, onParamsChange, onReset, disabled = false }: ParameterTuningProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'selection' | 'mutation' | 'jumping'>('basic');

  const handleSliderChange = (param: keyof AlgorithmParams, value: number) => {
    onParamsChange({ [param]: value });
  };

  const applyPreset = (preset: Preset) => {
    onParamsChange(preset.params);
  };

  return (
    <div className="parameter-tuning">
      <div className="tuning-header">
        <h3>🎛️ Parameter Tuning</h3>
        <button 
          className="reset-btn"
          onClick={onReset}
          disabled={disabled}
        >
          <span>🔄</span> Reset to Paper Defaults
        </button>
      </div>

      {/* Preset Profiles */}
      <div className="preset-profiles">
        <div className="preset-label">Quick Presets:</div>
        <div className="preset-buttons">
          {PRESETS.map(preset => (
            <button
              key={preset.name}
              className="preset-card"
              onClick={() => applyPreset(preset)}
              disabled={disabled}
            >
              <div className="preset-icon">{preset.icon}</div>
              <div className="preset-name">{preset.name}</div>
              <div className="preset-desc">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="param-tabs">
        <button 
          className={`tab ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          Basic
        </button>
        <button 
          className={`tab ${activeTab === 'selection' ? 'active' : ''}`}
          onClick={() => setActiveTab('selection')}
        >
          Selection (Pfit)
        </button>
        <button 
          className={`tab ${activeTab === 'mutation' ? 'active' : ''}`}
          onClick={() => setActiveTab('mutation')}
        >
          Mutation (Ps)
        </button>
        <button 
          className={`tab ${activeTab === 'jumping' ? 'active' : ''}`}
          onClick={() => setActiveTab('jumping')}
        >
          Jumping Gene
        </button>
      </div>

      {/* Parameter Sliders */}
      <div className="param-content">
        {activeTab === 'basic' && (
          <div className="param-section">
            {/* Population Size */}
            <div className="param-group">
              <div className="param-header">
                <label>Population Size</label>
                <span className="param-value">{params.populationSize}</span>
              </div>
              <input
                type="range"
                min="20"
                max="300"
                step="10"
                value={params.populationSize}
                onChange={(e) => handleSliderChange('populationSize', parseInt(e.target.value))}
                disabled={disabled}
                className="slider"
              />
              <div className="param-info">
                <span className="info-icon">💡</span>
                <span>Number of competing solutions. Larger = more diversity, slower convergence.</span>
              </div>
            </div>

            {/* Max Generations */}
            <div className="param-group">
              <div className="param-header">
                <label>Max Generations</label>
                <span className="param-value">{params.maxGenerations}</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="10"
                value={params.maxGenerations}
                onChange={(e) => handleSliderChange('maxGenerations', parseInt(e.target.value))}
                disabled={disabled}
                className="slider"
              />
              <div className="param-info">
                <span className="info-icon">💡</span>
                <span>Number of evolution cycles. More generations = better solution, longer runtime.</span>
              </div>
            </div>

            {/* Elite Count */}
            <div className="param-group">
              <div className="param-header">
                <label>Elite Count</label>
                <span className="param-value">{params.eliteCount}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={params.eliteCount}
                onChange={(e) => handleSliderChange('eliteCount', parseInt(e.target.value))}
                disabled={disabled}
                className="slider"
              />
              <div className="param-info">
                <span className="info-icon">💡</span>
                <span>Best solutions preserved unchanged. Prevents losing good solutions.</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'selection' && (
          <div className="param-section">
            {/* PfitMax */}
            <div className="param-group">
              <div className="param-header">
                <label>Pfit Max (Early Selection)</label>
                <span className="param-value">{params.PfitMax.toFixed(4)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.0"
                step="0.01"
                value={params.PfitMax}
                onChange={(e) => handleSliderChange('PfitMax', parseFloat(e.target.value))}
                disabled={disabled}
                className="slider"
              />
              <div className="param-info">
                <span className="info-icon">💡</span>
                <span>Selection probability at generation 0. Higher = more diverse selection initially.</span>
              </div>
            </div>

            {/* PfitMin */}
            <div className="param-group">
              <div className="param-header">
                <label>Pfit Min (Late Selection)</label>
                <span className="param-value">{params.PfitMin.toFixed(4)}</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.3"
                step="0.01"
                value={params.PfitMin}
                onChange={(e) => handleSliderChange('PfitMin', parseFloat(e.target.value))}
                disabled={disabled}
                className="slider"
              />
              <div className="param-info">
                <span className="info-icon">💡</span>
                <span>Selection probability at final generation. Lower = more selective (only best).</span>
              </div>
            </div>

            {/* Beta */}
            <div className="param-group">
              <div className="param-header">
                <label>β (Beta) - Non-linear Fitness</label>
                <span className="param-value">{params.beta.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.01"
                value={params.beta}
                onChange={(e) => handleSliderChange('beta', parseFloat(e.target.value))}
                disabled={disabled}
                className="slider"
              />
              <div className="param-info">
                <span className="info-icon">💡</span>
                <span>Favoritism level for best solutions. Paper optimal: 0.292</span>
              </div>
            </div>

            <div className="formula-box">
              <div className="formula-title">📐 Selection Formula:</div>
              <div className="formula">Pfit(t) = PfitMax - (PfitMax - PfitMin) × (t / Tmax)</div>
              <div className="formula-desc">Decreases linearly from {params.PfitMax.toFixed(2)} → {params.PfitMin.toFixed(4)} over {params.maxGenerations} generations</div>
            </div>
          </div>
        )}

        {activeTab === 'mutation' && (
          <div className="param-section">
            {/* PsMax */}
            <div className="param-group">
              <div className="param-header">
                <label>Ps Max (Early Mutation)</label>
                <span className="param-value">{params.PsMax.toFixed(4)}</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="0.8"
                step="0.01"
                value={params.PsMax}
                onChange={(e) => handleSliderChange('PsMax', parseFloat(e.target.value))}
                disabled={disabled}
                className="slider"
              />
              <div className="param-info">
                <span className="info-icon">💡</span>
                <span>Mutation type selector at generation 0. Higher = more swap mutations (exploration).</span>
              </div>
            </div>

            {/* PsMin */}
            <div className="param-group">
              <div className="param-header">
                <label>Ps Min (Late Mutation)</label>
                <span className="param-value">{params.PsMin.toFixed(4)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.4"
                step="0.01"
                value={params.PsMin}
                onChange={(e) => handleSliderChange('PsMin', parseFloat(e.target.value))}
                disabled={disabled}
                className="slider"
              />
              <div className="param-info">
                <span className="info-icon">💡</span>
                <span>Mutation type selector at final generation. Lower = more heuristic mutations (exploitation).</span>
              </div>
            </div>

            <div className="formula-box">
              <div className="formula-title">📐 Mutation Formula:</div>
              <div className="formula">Ps(t) = PsMax - (PsMax - PsMin) × (t / Tmax)</div>
              <div className="formula-desc">
                <div>• If Ps(t) &gt; 0.5: <strong>Swap Mutation</strong> (exploration)</div>
                <div>• If 0.25 &lt; Ps(t) ≤ 0.5: <strong>Inverse Mutation</strong> (balanced)</div>
                <div>• If Ps(t) ≤ 0.25: <strong>Heuristic Mutation</strong> (exploitation)</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'jumping' && (
          <div className="param-section">
            {/* PJG */}
            <div className="param-group">
              <div className="param-header">
                <label>PJG - Jumping Gene Probability</label>
                <span className="param-value">{params.PJG.toFixed(4)}</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="0.9"
                step="0.01"
                value={params.PJG}
                onChange={(e) => handleSliderChange('PJG', parseFloat(e.target.value))}
                disabled={disabled}
                className="slider"
              />
              <div className="param-info">
                <span className="info-icon">💡</span>
                <span>Probability of applying jumping gene operator. Higher = more segment relocations, escapes local optima.</span>
              </div>
            </div>

            {/* q */}
            <div className="param-group">
              <div className="param-header">
                <label>q - Segment Length</label>
                <span className="param-value">{params.q}</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                step="1"
                value={params.q}
                onChange={(e) => handleSliderChange('q', parseInt(e.target.value))}
                disabled={disabled}
                className="slider"
              />
              <div className="param-info">
                <span className="info-icon">💡</span>
                <span>Length of gene segment to extract and relocate. Paper optimal: 19</span>
              </div>
            </div>

            <div className="formula-box">
              <div className="formula-title">🧬 Jumping Gene Process:</div>
              <div className="formula-desc">
                <div>1. Generate binary mask of length q</div>
                <div>2. Extract segment according to mask (e.g., positions marked '1')</div>
                <div>3. Remove extracted genes from chromosome</div>
                <div>4. Insert segment at random position</div>
                <div>5. Applied with probability PJG = {(params.PJG * 100).toFixed(2)}%</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="param-summary">
        <div className="summary-title">Current Configuration Summary:</div>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Population:</span>
            <span className="summary-value">{params.populationSize} chromosomes</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Evolution:</span>
            <span className="summary-value">{params.maxGenerations} generations</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Selection:</span>
            <span className="summary-value">{params.PfitMax.toFixed(2)} → {params.PfitMin.toFixed(4)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Mutation:</span>
            <span className="summary-value">{params.PsMax.toFixed(2)} → {params.PsMin.toFixed(4)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Jumping Gene:</span>
            <span className="summary-value">{(params.PJG * 100).toFixed(2)}% @ {params.q} genes</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Elitism:</span>
            <span className="summary-value">Top {params.eliteCount} preserved</span>
          </div>
        </div>
      </div>
    </div>
  );
}
