import './App.css'
import { useState } from 'react'
import { useAlgorithmStore } from './store/algorithmStore'
import { PerformanceCharts } from './components/PerformanceCharts'
import { TSPLIBLoader } from './components/TSPLIBLoader'
import { MultiAlgorithmComparison } from './components/MultiAlgorithmComparison'
import { ParameterTuning } from './components/ParameterTuning'

function App() {
  const { 
    cities, 
    currentPopulation,
    currentGeneration,
    isRunning,
    params,
    history,
    addCity,
    clearCities,
    loadCities,
    startAlgorithm,
    pauseAlgorithm,
    resetAlgorithm,
    stepGeneration,
    updateParams,
    resetParams
  } = useAlgorithmStore()

  const [showComparison, setShowComparison] = useState(false)

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    addCity(x, y)
  }

  const bestDistance = currentPopulation?.best.distance.toFixed(2) || 'N/A'
  const avgDistance = currentPopulation?.average.toFixed(2) || 'N/A'
  const diversity = currentPopulation?.diversity ? (currentPopulation.diversity * 100).toFixed(1) : 'N/A'

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-title">
            <div className="icon">🧬</div>
            <div>
              <h1>TSP GA-JGHO Solver</h1>
              <p className="subtitle">Genetic Algorithm with Jumping Gene & Heuristic Operators</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-badge">
              <span className="stat-label">Cities</span>
              <span className="stat-value">{cities.length}</span>
            </div>
            <div className="stat-badge">
              <span className="stat-label">Generation</span>
              <span className="stat-value">{currentGeneration}/{params.maxGenerations}</span>
            </div>
            <div className="stat-badge success">
              <span className="stat-label">Best</span>
              <span className="stat-value">{bestDistance}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-grid">
          {/* Left Side - Canvas */}
          <div className="canvas-section">
            <div className="card">
              <div className="card-header">
                <h2>Interactive Canvas</h2>
                <p className="card-subtitle">Click to place cities on the map</p>
              </div>
              <div 
                className="canvas-container"
                onClick={handleCanvasClick}
              >
                {/* Draw cities */}
                {cities.map((city) => (
                  <div
                    key={city.id}
                    className="city-marker"
                    style={{
                      left: city.x - 8,
                      top: city.y - 8,
                    }}
                    title={city.name}
                  >
                    <div className="city-dot"></div>
                    <div className="city-label">{city.id + 1}</div>
                  </div>
                ))}
                
                {/* Draw best route */}
                {currentPopulation && currentPopulation.best && (
                  <svg className="route-svg">
                    {currentPopulation.best.genes.map((cityId, idx) => {
                      const currentCity = cities[cityId]
                      const nextCityId = currentPopulation.best.genes[(idx + 1) % currentPopulation.best.genes.length]
                      const nextCity = cities[nextCityId]
                      
                      return (
                        <line
                          key={idx}
                          x1={currentCity.x}
                          y1={currentCity.y}
                          x2={nextCity.x}
                          y2={nextCity.y}
                          className="route-line"
                        />
                      )
                    })}
                  </svg>
                )}

                {/* Empty state */}
                {cities.length === 0 && (
                  <div className="empty-state">
                    {/* <div className="empty-icon">🗺️</div> */}
                    <h3>Start by Adding Cities</h3>
                    <p>Click anywhere on this canvas to place cities</p>
                    <p className="text-sm">Minimum 3 cities required</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Controls & Info */}
          <div className="sidebar">
            {/* Controls */}
            <div className="card">
              <div className="card-header">
                <h2>Controls</h2>
              </div>
              <div className="controls-grid">
                <button
                  onClick={startAlgorithm}
                  disabled={isRunning || cities.length < 3}
                  className="btn btn-primary btn-icon"
                >
                  <span className="btn-icon-text">▶</span>
                  <span>Start</span>
                </button>
                
                <button
                  onClick={pauseAlgorithm}
                  disabled={!isRunning}
                  className="btn btn-warning btn-icon"
                >
                  <span className="btn-icon-text">⏸</span>
                  <span>Pause</span>
                </button>
                
                <button
                  onClick={stepGeneration}
                  disabled={isRunning || cities.length < 3}
                  className="btn btn-info btn-icon"
                >
                  <span className="btn-icon-text">⏭</span>
                  <span>Step</span>
                </button>
                
                <button
                  onClick={resetAlgorithm}
                  className="btn btn-danger btn-icon"
                >
                  {/* <span className="btn-icon-text">🔄</span> */}
                  <span>Reset</span>
                </button>
                
                <button
                  onClick={clearCities}
                  className="btn btn-secondary btn-icon btn-full"
                >
                  {/* <span className="btn-icon-text">🗑️</span> */}
                  <span>Clear All Cities</span>
                </button>
                
                <div className="btn-full">
                  <TSPLIBLoader onLoad={loadCities} />
                </div>
                
                <button
                  onClick={() => setShowComparison(true)}
                  disabled={cities.length < 3}
                  className="btn btn-info btn-icon btn-full"
                >
                  <span>Compare Algos</span>
                </button>
              </div>
            </div>

            {/* Statistics */}
            <div className="card">
              <div className="card-header">
                <h2>Statistics</h2>
              </div>
              <div className="stats-list">
                <div className="stat-row">
                  <span className="stat-label">Best Distance</span>
                  <span className="stat-value highlight-success">{bestDistance}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Average Distance</span>
                  <span className="stat-value">{avgDistance}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Generation</span>
                  <span className="stat-value">{currentGeneration} / {params.maxGenerations}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Population Size</span>
                  <span className="stat-value">{params.populationSize}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Diversity</span>
                  <span className="stat-value">{diversity}%</span>
                </div>
              </div>
            </div>

            {/* Algorithm Parameters */}
            <div className="card">
              <div className="card-header">
                <h2>Algorithm Parameters</h2>
                <span className="badge">GA-JGHO</span>
              </div>
              <div className="params-grid">
                <div className="param-item">
                  <span className="param-label">Pfit</span>
                  <span className="param-value">{params.PfitMax.toFixed(2)} → {params.PfitMin.toFixed(4)}</span>
                  <span className="param-desc">Selection fitness</span>
                </div>
                <div className="param-item">
                  <span className="param-label">Ps</span>
                  <span className="param-value">{params.PsMax.toFixed(2)} → {params.PsMin.toFixed(4)}</span>
                  <span className="param-desc">Mutation selector</span>
                </div>
                <div className="param-item">
                  <span className="param-label">β (beta)</span>
                  <span className="param-value">{params.beta.toFixed(3)}</span>
                  <span className="param-desc">Non-linear fitness</span>
                </div>
                <div className="param-item">
                  <span className="param-label">PJG</span>
                  <span className="param-value">{params.PJG.toFixed(4)}</span>
                  <span className="param-desc">Jumping gene prob</span>
                </div>
                <div className="param-item">
                  <span className="param-label">q</span>
                  <span className="param-value">{params.q}</span>
                  <span className="param-desc">Segment length</span>
                </div>
              </div>
            </div>

            {/* Quick Guide */}
            <div className="card guide-card">
              <div className="card-header">
                <h2>Quick Guide</h2>
              </div>
              <ol className="guide-list">
                <li>Click on canvas to place cities (min 3)</li>
                <li>Press <strong>Start</strong> to run algorithm</li>
                <li>Watch the route optimize in real-time</li>
                <li>Use <strong>Step</strong> for generation-by-generation view</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Performance Charts Section */}
        <PerformanceCharts history={history} />

        {/* Parameter Tuning Section */}
        <ParameterTuning 
          params={params}
          onParamsChange={updateParams}
          onReset={resetParams}
          disabled={isRunning}
        />
      </main>

      {/* Footer - About Section */}
      <footer className="footer">
        <div className="footer-content">
          <div className="about-section">
            <h3> About GA-JGHO Algorithm</h3>
            <p className="about-text">
              Implementation of "A genetic algorithm with jumping gene and heuristic operators for traveling salesman problem" 
              (Zhang et al., Applied Soft Computing, 2022)
            </p>
            <div className="modifications-grid">
              <div className="modification-card">
                <div className="mod-number">1</div>
                <div className="mod-content">
                  <strong>Combination Fitness Selection</strong>
                  <p>Adaptive selection with Pfit parameter</p>
                </div>
              </div>
              <div className="modification-card">
                <div className="mod-number">2</div>
                <div className="mod-content">
                  <strong>Bidirectional Heuristic Crossover (BHX)</strong>
                  <p>Greedy nearest-neighbor construction</p>
                </div>
              </div>
              <div className="modification-card">
                <div className="mod-number">3</div>
                <div className="mod-content">
                  <strong>Combination Mutation</strong>
                  <p>Adaptive mutation (swap/inverse/heuristic)</p>
                </div>
              </div>
              <div className="modification-card">
                <div className="mod-number">4</div>
                <div className="mod-content">
                  <strong>Jumping Gene Operator</strong>
                  <p>Segment extraction and relocation</p>
                </div>
              </div>
              <div className="modification-card">
                <div className="mod-number">5</div>
                <div className="mod-content">
                  <strong>Unique Operator</strong>
                  <p>Remove duplicates for diversity</p>
                </div>
              </div>
              <div className="modification-card highlight">
                <div className="mod-number">+</div>
                <div className="mod-content">
                  <strong>2-Opt Local Search</strong>
                  <p>Solution refinement</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Algorithm Comparison Modal */}
      {showComparison && (
        <MultiAlgorithmComparison 
          cities={cities}
          params={params}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  )
}

export default App
