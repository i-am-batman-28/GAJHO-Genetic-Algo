/**
 * Artificial Bee Colony Algorithm for TSP (ABCTSP)
 * Based on Karaboga's ABC algorithm adapted for TSP
 * 
 * Three types of bees:
 * 1. Employed bees - exploit food sources (solutions)
 * 2. Onlooker bees - select good sources based on fitness
 * 3. Scout bees - explore new random sources
 */

import type { City, Chromosome, Population, AlgorithmParams } from '../types/algorithm';
import { buildDistanceMatrix, calculateTotalDistanceWithMatrix } from '../utils/distance';

export class ABCTSP {
  private cities: City[];
  private params: AlgorithmParams;
  private distanceMatrix: number[][];
  private foodSources: Chromosome[]; // Current solutions
  private trials: number[]; // Number of trials for each source
  private currentGeneration: number;
  private limit: number; // Abandonment limit
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
    this.foodSources = [];
    this.trials = [];
    this.currentGeneration = 0;
    this.limit = Math.floor(params.populationSize * cities.length / 2); // Abandonment limit
    this.stats = [];
  }

  initialize(): void {
    const colonySize = Math.floor(this.params.populationSize / 2); // Half for employed, half for onlookers
    
    // Initialize food sources (solutions) randomly
    this.foodSources = Array.from({ length: colonySize }, () => 
      this.createRandomSolution()
    );
    this.trials = Array(colonySize).fill(0);
    
    this.updateStats();
  }

  private createRandomSolution(): Chromosome {
    const genes = Array.from({ length: this.cities.length }, (_, i) => i);
    
    // Fisher-Yates shuffle
    for (let i = genes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [genes[i], genes[j]] = [genes[j], genes[i]];
    }
    
    const distance = calculateTotalDistanceWithMatrix(genes, this.distanceMatrix);
    
    return {
      genes,
      fitness: distance,
      distance
    };
  }

  // Employed bee phase - exploit current food sources
  private employedBeePhase(): void {
    for (let i = 0; i < this.foodSources.length; i++) {
      const newSolution = this.generateNeighborSolution(this.foodSources[i]);
      
      // Greedy selection
      if (newSolution.distance < this.foodSources[i].distance) {
        this.foodSources[i] = newSolution;
        this.trials[i] = 0; // Reset trial counter
      } else {
        this.trials[i]++;
      }
    }
  }

  // Generate neighbor solution using swap or 2-opt
  private generateNeighborSolution(source: Chromosome): Chromosome {
    const genes = [...source.genes];
    const n = genes.length;
    
    // Randomly choose between swap and 2-opt
    if (Math.random() < 0.5) {
      // Swap mutation
      const i = Math.floor(Math.random() * n);
      const j = Math.floor(Math.random() * n);
      [genes[i], genes[j]] = [genes[j], genes[i]];
    } else {
      // 2-opt style reverse
      const i = Math.floor(Math.random() * n);
      const j = Math.floor(Math.random() * n);
      const [start, end] = [Math.min(i, j), Math.max(i, j)];
      
      // Reverse segment
      const segment = genes.slice(start, end + 1).reverse();
      genes.splice(start, end - start + 1, ...segment);
    }
    
    const distance = calculateTotalDistanceWithMatrix(genes, this.distanceMatrix);
    
    return {
      genes,
      fitness: distance,
      distance
    };
  }

  // Calculate fitness probability for onlooker selection
  private calculateFitnessProbabilities(): number[] {
    // Convert distances to fitness (inverse for minimization)
    const maxDistance = Math.max(...this.foodSources.map(s => s.distance));
    const fitnesses = this.foodSources.map(s => maxDistance - s.distance + 1);
    const totalFitness = fitnesses.reduce((a, b) => a + b, 0);
    
    // Calculate probabilities
    return fitnesses.map(f => f / totalFitness);
  }

  // Onlooker bee phase - select good sources and exploit
  private onlookerBeePhase(): void {
    const probabilities = this.calculateFitnessProbabilities();
    let t = 0;
    let i = 0;
    
    // Each onlooker selects a source based on probability
    while (t < this.foodSources.length) {
      if (Math.random() < probabilities[i]) {
        const newSolution = this.generateNeighborSolution(this.foodSources[i]);
        
        // Greedy selection
        if (newSolution.distance < this.foodSources[i].distance) {
          this.foodSources[i] = newSolution;
          this.trials[i] = 0;
        } else {
          this.trials[i]++;
        }
        
        t++;
      }
      
      i = (i + 1) % this.foodSources.length;
    }
  }

  // Scout bee phase - abandon poor sources and explore new ones
  private scoutBeePhase(): void {
    for (let i = 0; i < this.foodSources.length; i++) {
      if (this.trials[i] >= this.limit) {
        // Abandon this source and generate new random solution
        this.foodSources[i] = this.createRandomSolution();
        this.trials[i] = 0;
      }
    }
  }

  runGeneration(): Population {
    const startTime = performance.now();
    
    // ABC algorithm phases
    this.employedBeePhase();
    this.onlookerBeePhase();
    this.scoutBeePhase();
    
    this.currentGeneration++;
    
    const endTime = performance.now();
    this.updateStats(endTime - startTime);
    
    return this.getPopulation();
  }

  private updateStats(elapsedTime: number = 0): void {
    this.foodSources.sort((a, b) => a.distance - b.distance);
    
    const best = this.foodSources[0];
    const worst = this.foodSources[this.foodSources.length - 1];
    const average = this.foodSources.reduce((sum, s) => sum + s.distance, 0) / this.foodSources.length;
    
    // Calculate diversity
    const uniqueSolutions = new Set(this.foodSources.map(s => s.genes.join(','))).size;
    const diversity = uniqueSolutions / this.foodSources.length;
    
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
    this.foodSources.sort((a, b) => a.distance - b.distance);
    
    const best = this.foodSources[0];
    const worst = this.foodSources[this.foodSources.length - 1];
    const average = this.foodSources.reduce((sum, s) => sum + s.distance, 0) / this.foodSources.length;
    
    const uniqueSolutions = new Set(this.foodSources.map(s => s.genes.join(','))).size;
    const diversity = uniqueSolutions / this.foodSources.length;
    
    return {
      chromosomes: [...this.foodSources],
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
