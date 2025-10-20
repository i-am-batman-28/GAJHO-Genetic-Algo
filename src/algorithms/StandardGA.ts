/**
 * Standard Genetic Algorithm (for comparison)
 * Without the 5 GA-JGHO modifications
 */

import type { City, Chromosome, Population, AlgorithmParams } from '../types/algorithm';
import { buildDistanceMatrix, calculateTotalDistanceWithMatrix } from '../utils/distance';

export class StandardGA {
  private cities: City[];
  private params: AlgorithmParams;
  private distanceMatrix: number[][];
  private population: Chromosome[];
  private currentGeneration: number;
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
    this.population = [];
    this.currentGeneration = 0;
    this.stats = [];
  }

  initialize(): void {
    // Simple random initialization (no greedy)
    this.population = Array.from({ length: this.params.populationSize }, () => 
      this.createRandomChromosome()
    );
    this.updateStats();
  }

  private createRandomChromosome(): Chromosome {
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

  // Standard roulette wheel selection (no fitness combination)
  private selection(): Chromosome[] {
    const selected: Chromosome[] = [];
    
    // Calculate fitness values (inverse of distance for minimization)
    const maxDistance = Math.max(...this.population.map(c => c.distance));
    const fitnesses = this.population.map(c => maxDistance - c.distance + 1);
    const totalFitness = fitnesses.reduce((a, b) => a + b, 0);
    
    // Select parents
    for (let i = 0; i < this.params.populationSize; i++) {
      const rand = Math.random() * totalFitness;
      let sum = 0;
      
      for (let j = 0; j < this.population.length; j++) {
        sum += fitnesses[j];
        if (sum >= rand) {
          selected.push({ ...this.population[j] });
          break;
        }
      }
    }
    
    return selected;
  }

  // Standard Order Crossover (OX) - not BHX
  private crossover(parent1: Chromosome, parent2: Chromosome): Chromosome {
    const n = parent1.genes.length;
    
    // Select two random crossover points
    const point1 = Math.floor(Math.random() * n);
    const point2 = Math.floor(Math.random() * n);
    const [start, end] = [Math.min(point1, point2), Math.max(point1, point2)];
    
    // Copy segment from parent1
    const child = new Array(n).fill(-1);
    for (let i = start; i <= end; i++) {
      child[i] = parent1.genes[i];
    }
    
    // Fill remaining from parent2
    let childIdx = (end + 1) % n;
    let parentIdx = (end + 1) % n;
    
    while (child.includes(-1)) {
      const gene = parent2.genes[parentIdx];
      if (!child.includes(gene)) {
        child[childIdx] = gene;
        childIdx = (childIdx + 1) % n;
      }
      parentIdx = (parentIdx + 1) % n;
    }
    
    const distance = calculateTotalDistanceWithMatrix(child, this.distanceMatrix);
    
    return {
      genes: child,
      fitness: distance,
      distance
    };
  }

  // Standard swap mutation only (no combination mutation)
  private mutation(chromosome: Chromosome): Chromosome {
    const genes = [...chromosome.genes];
    const mutationRate = 0.2; // Fixed rate, not adaptive
    
    if (Math.random() < mutationRate) {
      const i = Math.floor(Math.random() * genes.length);
      const j = Math.floor(Math.random() * genes.length);
      [genes[i], genes[j]] = [genes[j], genes[i]];
    }
    
    const distance = calculateTotalDistanceWithMatrix(genes, this.distanceMatrix);
    
    return {
      genes,
      fitness: distance,
      distance
    };
  }

  runGeneration(): Population {
    const startTime = performance.now();
    
    // Sort population by fitness
    this.population.sort((a, b) => a.distance - b.distance);
    
    // Elitism: keep best chromosomes
    const newPopulation: Chromosome[] = this.population.slice(0, this.params.eliteCount);
    
    // Selection
    const selected = this.selection();
    
    // Crossover
    while (newPopulation.length < this.params.populationSize) {
      const parent1 = selected[Math.floor(Math.random() * selected.length)];
      const parent2 = selected[Math.floor(Math.random() * selected.length)];
      
      const offspring = this.crossover(parent1, parent2);
      newPopulation.push(offspring);
    }
    
    // Mutation
    for (let i = this.params.eliteCount; i < newPopulation.length; i++) {
      newPopulation[i] = this.mutation(newPopulation[i]);
    }
    
    this.population = newPopulation;
    this.currentGeneration++;
    
    const endTime = performance.now();
    this.updateStats(endTime - startTime);
    
    return this.getPopulation();
  }

  private updateStats(elapsedTime: number = 0): void {
    this.population.sort((a, b) => a.distance - b.distance);
    
    const best = this.population[0];
    const worst = this.population[this.population.length - 1];
    const average = this.population.reduce((sum, c) => sum + c.distance, 0) / this.population.length;
    
    // Simple diversity calculation
    const uniqueRoutes = new Set(this.population.map(c => c.genes.join(','))).size;
    const diversity = uniqueRoutes / this.population.length;
    
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
    this.population.sort((a, b) => a.distance - b.distance);
    
    const best = this.population[0];
    const worst = this.population[this.population.length - 1];
    const average = this.population.reduce((sum, c) => sum + c.distance, 0) / this.population.length;
    
    const uniqueRoutes = new Set(this.population.map(c => c.genes.join(','))).size;
    const diversity = uniqueRoutes / this.population.length;
    
    return {
      chromosomes: [...this.population],
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
