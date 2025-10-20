/**
 * Main GA-JGHO Algorithm
 * 
 * Implements the complete algorithm from:
 * "A genetic algorithm with jumping gene and heuristic operators for TSP"
 * Zhang et al., Applied Soft Computing, 2022
 */

import type { City, Chromosome, Population, AlgorithmParams, GenerationStats } from '../types/algorithm';
import { buildDistanceMatrix } from '../utils/distance';
import { initializePopulation } from './initialization';
import { calculatePfit, selectParents } from './selection';
import { performCrossover } from './crossover';
import { calculatePs, performMutation } from './mutation';
import { applyJumpingGeneToPopulation, calculateFitnessAfterJumping } from './jumpingGene';
import { uniqueOperator, calculateFitnessAfterUnique, calculateDiversity } from './unique';
import { applyTwoOptToPopulation } from './twoOpt';

/**
 * GA-JGHO Algorithm Class
 */
export class GAJGHO {
  private cities: City[];
  private params: AlgorithmParams;
  private distanceMatrix: number[][];
  private currentPopulation: Chromosome[];
  private generation: number;
  private startTime: number;
  
  constructor(cities: City[], params: AlgorithmParams) {
    this.cities = cities;
    this.params = params;
    this.distanceMatrix = buildDistanceMatrix(cities);
    this.currentPopulation = [];
    this.generation = 0;
    this.startTime = Date.now();
  }
  
  /**
   * Initialize population
   */
  public initialize(): void {
    this.currentPopulation = initializePopulation(this.cities, this.params.populationSize);
    this.generation = 0;
    this.startTime = Date.now();
  }
  
  /**
   * Run single generation
   */
  public runGeneration(): Population {
    const { populationSize, maxGenerations, eliteCount, PfitMax, PfitMin, PsMax, PsMin, beta, PJG, q } = this.params;
    
    // Calculate adaptive parameters
    const Pfit = calculatePfit(this.generation, maxGenerations, PfitMax, PfitMin);
    const Ps = calculatePs(this.generation, maxGenerations, PsMax, PsMin);
    
    // Step 1: Selection
    const parents = selectParents(this.currentPopulation, populationSize, Pfit, beta);
    
    // Step 2: Crossover (BHX)
    let offspring = performCrossover(parents, this.distanceMatrix, populationSize);
    
    // Step 3: Unique Operator (remove duplicates)
    offspring = uniqueOperator(offspring, this.cities.length);
    offspring = calculateFitnessAfterUnique(offspring, this.distanceMatrix);
    
    // Step 4: Mutation
    offspring = performMutation(offspring, Ps, beta, this.distanceMatrix);
    
    // Step 5: Jumping Gene Operator
    offspring = applyJumpingGeneToPopulation(offspring, PJG, q);
    offspring = calculateFitnessAfterJumping(offspring, this.distanceMatrix);
    
    // Step 6: 2-Opt Local Search (on top chromosomes only for speed)
    offspring = applyTwoOptToPopulation(offspring, this.distanceMatrix, false, Math.floor(populationSize * 0.2));
    
    // Step 7: Elitism - preserve best chromosomes from previous generation
    const sortedPrevious = [...this.currentPopulation].sort((a, b) => a.distance - b.distance);
    const elites = sortedPrevious.slice(0, eliteCount);
    
    // Replace worst offspring with elites
    const sortedOffspring = [...offspring].sort((a, b) => a.distance - b.distance);
    this.currentPopulation = [
      ...sortedOffspring.slice(0, populationSize - eliteCount),
      ...elites
    ];
    
    // Re-sort final population
    this.currentPopulation.sort((a, b) => a.distance - b.distance);
    
    // Increment generation
    this.generation++;
    
    return this.getPopulation();
  }
  
  /**
   * Run complete algorithm
   */
  public run(onGenerationComplete?: (population: Population, stats: GenerationStats) => void): Population {
    this.initialize();
    
    for (let gen = 0; gen < this.params.maxGenerations; gen++) {
      const population = this.runGeneration();
      
      if (onGenerationComplete) {
        const stats = this.getStats();
        onGenerationComplete(population, stats);
      }
      
      // Optional: Early stopping if solution is very good
      if (this.shouldStop()) {
        break;
      }
    }
    
    return this.getPopulation();
  }
  
  /**
   * Get current population state
   */
  public getPopulation(): Population {
    const sorted = [...this.currentPopulation].sort((a, b) => a.distance - b.distance);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    const average = sorted.reduce((sum, chr) => sum + chr.distance, 0) / sorted.length;
    const diversity = calculateDiversity(this.currentPopulation);
    
    return {
      chromosomes: this.currentPopulation,
      generation: this.generation,
      best,
      worst,
      average,
      diversity
    };
  }
  
  /**
   * Get statistics for current generation
   */
  public getStats(): GenerationStats {
    const population = this.getPopulation();
    
    return {
      generation: this.generation,
      bestDistance: population.best.distance,
      averageDistance: population.average,
      worstDistance: population.worst.distance,
      diversity: population.diversity,
      elapsedTime: Date.now() - this.startTime
    };
  }
  
  /**
   * Check if algorithm should stop early
   */
  private shouldStop(): boolean {
    const population = this.getPopulation();
    
    // Stop if diversity is very low (population has converged)
    if (population.diversity < 0.01) {
      return true;
    }
    
    // Stop if no improvement in last 20 generations
    if (this.generation > 20) {
      // This would require keeping history, simplified here
      return false;
    }
    
    return false;
  }
  
  /**
   * Get best solution found so far
   */
  public getBestSolution(): Chromosome {
    const sorted = [...this.currentPopulation].sort((a, b) => a.distance - b.distance);
    return sorted[0];
  }
  
  /**
   * Reset algorithm
   */
  public reset(): void {
    this.currentPopulation = [];
    this.generation = 0;
    this.startTime = Date.now();
  }
}
