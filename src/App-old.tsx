import './App.css'
import { useAlgorithmStore } from './store/algorithmStore'

function App() {
  const { 
    cities, 
    currentPopulation,
    currentGeneration,
    isRunning,
    params,
    addCity,
    clearCities,
    startAlgorithm,
    pauseAlgorithm,
    resetAlgorithm,
    stepGeneration
  } = useAlgorithmStore()

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    addCity(x, y)
  }

  const bestDistance = currentPopulation?.best.distance.toFixed(2) || 'N/A'
  const avgDistance = currentPopulation?.average.toFixed(2) || 'N/A'

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>🧬 TSP GA-JGHO Algorithm</h1>
      <p>Click on the canvas to add cities, then run the algorithm!</p>
      
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        {/* Canvas */}
        <div>
          <div
            onClick={handleCanvasClick}
            style={{
              width: '600px',
              height: '400px',
              border: '2px solid #333',
              borderRadius: '8px',
              position: 'relative',
              background: '#f5f5f5',
              cursor: 'crosshair'
            }}
          >
            {/* Draw cities */}
            {cities.map((city) => (
              <div
                key={city.id}
                style={{
                  position: 'absolute',
                  left: city.x - 6,
                  top: city.y - 6,
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#ff4444',
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
                title={city.name}
              />
            ))}
            
            {/* Draw best route */}
            {currentPopulation && currentPopulation.best && (
              <svg
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none'
                }}
              >
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
                      stroke="#4444ff"
                      strokeWidth="2"
                      opacity="0.7"
                    />
                  )
                })}
              </svg>
            )}
          </div>
          
          <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            Cities: {cities.length} | Generation: {currentGeneration}/{params.maxGenerations}
          </div>
        </div>
        
        {/* Controls */}
        <div style={{ flex: 1 }}>
          <div style={{ 
            padding: '20px', 
            border: '1px solid #ddd', 
            borderRadius: '8px',
            background: 'white'
          }}>
            <h3>Controls</h3>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
              <button
                onClick={startAlgorithm}
                disabled={isRunning || cities.length < 3}
                style={{
                  padding: '10px 20px',
                  background: isRunning ? '#ccc' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isRunning || cities.length < 3 ? 'not-allowed' : 'pointer'
                }}
              >
                ▶️ Start
              </button>
              
              <button
                onClick={pauseAlgorithm}
                disabled={!isRunning}
                style={{
                  padding: '10px 20px',
                  background: !isRunning ? '#ccc' : '#ff9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: !isRunning ? 'not-allowed' : 'pointer'
                }}
              >
                ⏸️ Pause
              </button>
              
              <button
                onClick={stepGeneration}
                disabled={isRunning || cities.length < 3}
                style={{
                  padding: '10px 20px',
                  background: isRunning || cities.length < 3 ? '#ccc' : '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isRunning || cities.length < 3 ? 'not-allowed' : 'pointer'
                }}
              >
                ⏭️ Step
              </button>
              
              <button
                onClick={resetAlgorithm}
                style={{
                  padding: '10px 20px',
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                🔄 Reset
              </button>
              
              <button
                onClick={clearCities}
                style={{
                  padding: '10px 20px',
                  background: '#9E9E9E',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                🗑️ Clear All
              </button>
            </div>
            
            <div style={{ marginTop: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '4px' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Statistics</h4>
              <div><strong>Best Distance:</strong> {bestDistance}</div>
              <div><strong>Average Distance:</strong> {avgDistance}</div>
              <div><strong>Generation:</strong> {currentGeneration}/{params.maxGenerations}</div>
              <div><strong>Population Size:</strong> {params.populationSize}</div>
            </div>
            
            <div style={{ marginTop: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '4px' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Algorithm Parameters</h4>
              <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
                <div><strong>Pfit:</strong> {params.PfitMax.toFixed(2)} → {params.PfitMin.toFixed(4)}</div>
                <div><strong>Ps:</strong> {params.PsMax.toFixed(2)} → {params.PsMin.toFixed(4)}</div>
                <div><strong>β (beta):</strong> {params.beta.toFixed(3)}</div>
                <div><strong>PJG:</strong> {params.PJG.toFixed(4)}</div>
                <div><strong>q (segment):</strong> {params.q}</div>
              </div>
            </div>
            
            <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
              <p><strong>Instructions:</strong></p>
              <ol style={{ paddingLeft: '20px', margin: '5px 0' }}>
                <li>Click on canvas to place cities (min 3)</li>
                <li>Click "Start" to run the algorithm</li>
                <li>Watch the route optimize in real-time!</li>
                <li>Use "Step" to advance one generation at a time</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '30px', padding: '20px', background: '#fff3cd', borderRadius: '8px' }}>
        <h3>📚 About GA-JGHO</h3>
        <p>This implements the algorithm from: "A genetic algorithm with jumping gene and heuristic operators for traveling salesman problem" (Zhang et al., 2022)</p>
        <p><strong>The 5 Modifications:</strong></p>
        <ol>
          <li><strong>Combination Fitness Selection</strong> - Adaptive selection with Pfit parameter</li>
          <li><strong>Bidirectional Heuristic Crossover (BHX)</strong> - Greedy nearest-neighbor construction</li>
          <li><strong>Combination Mutation</strong> - Adaptive mutation with Ps parameter (swap/inverse/heuristic)</li>
          <li><strong>Jumping Gene Operator</strong> - Segment extraction and relocation (PJG probability)</li>
          <li><strong>Unique Operator</strong> - Remove duplicates to maintain diversity</li>
        </ol>
        <p><strong>Plus:</strong> 2-Opt local search for solution refinement</p>
      </div>
    </div>
  )
}

export default App
