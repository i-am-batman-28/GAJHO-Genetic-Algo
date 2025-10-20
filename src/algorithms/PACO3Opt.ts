/**
 * Parallel Ant Colony Optimization with 3-Opt Local Search (PACO-3Opt)
 * Combines ACO pheromone-based construction with 3-Opt improvement
 * 
 * Key components:
 * 1. Pheromone trails (τ) - learned from good solutions
 * 2. Heuristic information (η) - distance-based guidance
 * 3. 3-Opt local search - removes 3 edges and reconnects optimally
 */

import type { City, Chromosome, Population, AlgorithmParams } from '../types/algorithm';
import { buildDistanceMatrix, calculateTotalDistanceWithMatrix } from '../utils/distance';

export class PACO3Opt {
  private cities: City[];
  private params: AlgorithmParams;
  private distanceMatrix: number[][];
  private pheromoneMatrix: number[][]; // τ[i][j] = pheromone on edge i→j
  private solutions: Chromosome[];
  private currentGeneration: number;
  
  // ACO parameters
  private alpha: number = 1.0;    // Pheromone importance
  private beta: number = 2.0;     // Heuristic importance
  private rho: number = 0.5;      // Evaporation rate
  private Q: number = 100;        // Pheromone deposit constant
  
  private stats: {
    generation: number;
    bestDistance: number;
    averageDistance: number;
    worstDistance: number;
    diversity: number;
    elapsedTime: number;
  }[];

  constructor(cities: City[], params: AlgorithmParams) {
    this.cities = cities;
    this.params = params;
    this.distanceMatrix = buildDistanceMatrix(cities);
    this.solutions = [];
    this.currentGeneration = 0;
    this.stats = [];
    
    // Initialize pheromone matrix with small uniform value
    const n = cities.length;
    const initialPheromone = 1.0 / n;
    this.pheromoneMatrix = Array(n).fill(null).map(() => 
      Array(n).fill(initialPheromone)
    );
  }

  initialize(): void {
    // Generate initial solutions using ACO construction
    this.solutions = Array.from({ length: this.params.populationSize }, () => 
      this.constructSolutionACO()
    );
    
    // Apply 3-Opt to each solution
    this.solutions = this.solutions.map(sol => this.apply3Opt(sol));
    
    // Update pheromones based on initial solutions
    this.updatePheromones();
    
    this.updateStats();
  }

  // Construct solution using ACO probabilistic rule
  private constructSolutionACO(): Chromosome {
    const n = this.cities.length;
    const genes: number[] = [];
    const unvisited = new Set(Array.from({ length: n }, (_, i) => i));
    
    // Start from random city
    let currentCity = Math.floor(Math.random() * n);
    genes.push(currentCity);
    unvisited.delete(currentCity);
    
    // Build tour by selecting next cities probabilistically
    while (unvisited.size > 0) {
      const nextCity = this.selectNextCity(currentCity, unvisited);
      genes.push(nextCity);
      unvisited.delete(nextCity);
      currentCity = nextCity;
    }
    
    const distance = calculateTotalDistanceWithMatrix(genes, this.distanceMatrix);
    
    return {
      genes,
      fitness: distance,
      distance
    };
  }

  // Select next city using ACO probability rule
  private selectNextCity(currentCity: number, unvisited: Set<number>): number {
    const unvisitedArray = Array.from(unvisited);
    
    // Calculate probabilities for each unvisited city
    const probabilities: number[] = [];
    let totalProb = 0;
    
    for (const city of unvisitedArray) {
      const pheromone = Math.pow(this.pheromoneMatrix[currentCity][city], this.alpha);
      const heuristic = Math.pow(1.0 / (this.distanceMatrix[currentCity][city] + 0.001), this.beta);
      const prob = pheromone * heuristic;
      
      probabilities.push(prob);
      totalProb += prob;
    }
    
    // Normalize probabilities
    const normalizedProbs = probabilities.map(p => p / totalProb);
    
    // Roulette wheel selection
    const rand = Math.random();
    let cumProb = 0;
    
    for (let i = 0; i < unvisitedArray.length; i++) {
      cumProb += normalizedProbs[i];
      if (rand <= cumProb) {
        return unvisitedArray[i];
      }
    }
    
    // Fallback (should not reach here)
    return unvisitedArray[0];
  }

  // Apply 3-Opt local search to improve solution
  private apply3Opt(solution: Chromosome): Chromosome {
    let genes = [...solution.genes];
    let improved = true;
    let iterations = 0;
    const maxIterations = 10; // Limit iterations for performance
    
    while (improved && iterations < maxIterations) {
      improved = false;
      iterations++;
      
      const n = genes.length;
      
      // Try all possible 3-opt moves
      for (let i = 0; i < n - 2; i++) {
        for (let j = i + 1; j < n - 1; j++) {
          for (let k = j + 1; k < n; k++) {
            // Current edges: (i,i+1), (j,j+1), (k,k+1)
            const newTours = this.generate3OptMoves(genes, i, j, k);
            
            for (const newTour of newTours) {
              const newDistance = calculateTotalDistanceWithMatrix(newTour, this.distanceMatrix);
              const currentDistance = calculateTotalDistanceWithMatrix(genes, this.distanceMatrix);
              
              if (newDistance < currentDistance) {
                genes = newTour;
                improved = true;
                break;
              }
            }
            
            if (improved) break;
          }
          if (improved) break;
        }
        if (improved) break;
      }
    }
    
    const distance = calculateTotalDistanceWithMatrix(genes, this.distanceMatrix);
    
    return {
      genes,
      fitness: distance,
      distance
    };
  }

  // Generate possible 3-opt reconnections
  private generate3OptMoves(tour: number[], i: number, j: number, k: number): number[][] {
    const segment1 = tour.slice(0, i + 1);
    const segment2 = tour.slice(i + 1, j + 1);
    const segment3 = tour.slice(j + 1, k + 1);
    const segment4 = tour.slice(k + 1);
    
    // Generate different reconnection options (simplified to 4 main cases)
    return [
      // Case 1: Reverse segment 2
      [...segment1, ...segment2.reverse(), ...segment3, ...segment4],
      
      // Case 2: Reverse segment 3
      [...segment1, ...segment2, ...segment3.reverse(), ...segment4],
      
      // Case 3: Swap segments 2 and 3
      [...segment1, ...segment3, ...segment2, ...segment4],
      
      // Case 4: Reverse and swap
      [...segment1, ...segment3.reverse(), ...segment2.reverse(), ...segment4]
    ];
  }

  // Update pheromone trails
  private updatePheromones(): void {
    const n = this.cities.length;
    
    // Evaporation
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        this.pheromoneMatrix[i][j] *= (1 - this.rho);
      }
    }
    
    // Deposit pheromones from all solutions (elite strategy)
    this.solutions.sort((a, b) => a.distance - b.distance);
    const eliteCount = Math.min(5, this.solutions.length); // Top 5 solutions
    
    for (let e = 0; e < eliteCount; e++) {
      const solution = this.solutions[e];
      const deposit = this.Q / solution.distance;
      
      // Add pheromone to edges in this solution
      for (let i = 0; i < solution.genes.length; i++) {
        const from = solution.genes[i];
        const to = solution.genes[(i + 1) % solution.genes.length];
        
        this.pheromoneMatrix[from][to] += deposit;
        this.pheromoneMatrix[to][from] += deposit; // Symmetric
      }
    }
  }

  runGeneration(): Population {
    const startTime = performance.now();
    
    // Construct new solutions using ACO
    const newSolutions = Array.from({ length: this.params.populationSize }, () => 
      this.constructSolutionACO()
    );
    
    // Apply 3-Opt to each new solution
    const improvedSolutions = newSolutions.map(sol => this.apply3Opt(sol));
    
    // Replace old solutions with new ones
    this.solutions = improvedSolutions;
    
    // Update pheromone trails
    this.updatePheromones();
    
    this.currentGeneration++;
    
    const endTime = performance.now();
    this.updateStats(endTime - startTime);
    
    return this.getPopulation();
  }

  private updateStats(elapsedTime: number = 0): void {
    this.solutions.sort((a, b) => a.distance - b.distance);
    
    const best = this.solutions[0];
    const worst = this.solutions[this.solutions.length - 1];
    const average = this.solutions.reduce((sum, s) => sum + s.distance, 0) / this.solutions.length;
    
    const uniqueSolutions = new Set(this.solutions.map(s => s.genes.join(','))).size;
    const diversity = uniqueSolutions / this.solutions.length;
    
    this.stats.push({
      generation: this.currentGeneration,
      bestDistance: best.distance,
      averageDistance: average,
      worstDistance: worst.distance,
      diversity,
      elapsedTime
    });
  }

  getPopulation(): Population {
    this.solutions.sort((a, b) => a.distance - b.distance);
    
    const best = this.solutions[0];
    const worst = this.solutions[this.solutions.length - 1];
    const average = this.solutions.reduce((sum, s) => sum + s.distance, 0) / this.solutions.length;
    
    const uniqueSolutions = new Set(this.solutions.map(s => s.genes.join(','))).size;
    const diversity = uniqueSolutions / this.solutions.length;
    
    return {
      chromosomes: [...this.solutions],
      generation: this.currentGeneration,
      best: { ...best },
      worst: { ...worst },
      average,
      diversity
    };
  }

  getStats() {
    return this.stats[this.stats.length - 1] || {
      generation: 0,
      bestDistance: 0,
      averageDistance: 0,
      worstDistance: 0,
      diversity: 0,
      elapsedTime: 0
    };
  }

  run(maxGenerations: number): void {
    for (let i = 0; i < maxGenerations; i++) {
      this.runGeneration();
    }
  }
}
