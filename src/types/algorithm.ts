/**
 * Type Definitions for GA-JGHO Algorithm
 * Based on: "A genetic algorithm with jumping gene and heuristic operators for TSP"
 * Zhang et al., Applied Soft Computing, 2022
 */

/**
 * Represents a city/node in the TSP
 */
export interface City {
  id: number;
  x: number;
  y: number;
  name?: string;
}

/**
 * Represents a chromosome (solution) in the genetic algorithm
 */
export interface Chromosome {
  genes: number[];      // Array of city IDs representing the tour order
  fitness: number;      // Total distance (lower is better)
  distance: number;     // Same as fitness for TSP
}

/**
 * Represents the entire population at a given generation
 */
export interface Population {
  chromosomes: Chromosome[];
  generation: number;
  best: Chromosome;
  worst: Chromosome;
  average: number;
  diversity: number;
}

/**
 * Algorithm parameters based on the paper
 */
export interface AlgorithmParams {
  // Population settings
  populationSize: number;           // Default: 100
  maxGenerations: number;           // Default: 100
  eliteCount: number;               // Default: 2 (preserve best chromosomes)
  
  // Pfit parameters (for selection)
  PfitMax: number;                  // Default: 0.76
  PfitMin: number;                  // Default: 0.0657
  
  // Ps parameters (for mutation type selection)
  PsMax: number;                    // Default: 0.5446
  PsMin: number;                    // Default: 0.1607
  
  // Non-linear fitness parameter
  beta: number;                     // Default: 0.15, Optimized: 0.292
  
  // Jumping gene parameters
  PJG: number;                      // Probability of jumping gene, Default: 0.5, Optimized: 0.6464
  q: number;                        // Segment length for jumping gene, Default: 19
}

/**
 * Default algorithm parameters from the paper
 */
export const DEFAULT_PARAMS: AlgorithmParams = {
  populationSize: 100,
  maxGenerations: 100,
  eliteCount: 2,
  PfitMax: 0.76,
  PfitMin: 0.0657,
  PsMax: 0.5446,
  PsMin: 0.1607,
  beta: 0.292,      // Optimized value
  PJG: 0.6464,      // Optimized value
  q: 19
};

/**
 * Statistics for a single generation
 */
export interface GenerationStats {
  generation: number;
  bestDistance: number;
  averageDistance: number;
  worstDistance: number;
  diversity: number;
  elapsedTime: number;
}

/**
 * Complete algorithm run history
 */
export interface AlgorithmHistory {
  populations: Population[];
  stats: GenerationStats[];
  startTime: number;
  endTime: number;
  totalTime: number;
  finalBest: Chromosome;
}

/**
 * Operator types for visualization
 */
export type OperatorType = 
  | 'selection'
  | 'crossover'
  | 'mutation'
  | 'jumping-gene'
  | 'unique'
  | 'two-opt';

/**
 * Mutation operator types
 */
export type MutationType = 'swap' | 'inverse' | 'heuristic';

/**
 * Fitness function types
 */
export type FitnessType = 'linear' | 'non-linear';

/**
 * Algorithm state for UI
 */
export interface AlgorithmState {
  isRunning: boolean;
  isPaused: boolean;
  isComplete: boolean;
  currentGeneration: number;
  currentPopulation: Population | null;
  history: AlgorithmHistory | null;
}
