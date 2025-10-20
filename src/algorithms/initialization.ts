/**
 * Population Initialization
 * Creates initial random population for GA-JGHO
 */

import type { Chromosome, City } from '../types/algorithm';
import { createChromosome } from '../utils/distance';

/**
 * Generate a random chromosome (random tour)
 * Uses Fisher-Yates shuffle for uniform random permutation
 */
export function generateRandomChromosome(cityCount: number): number[] {
  const genes: number[] = Array.from({ length: cityCount }, (_, i) => i);
  
  // Fisher-Yates shuffle
  for (let i = genes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [genes[i], genes[j]] = [genes[j], genes[i]];
  }
  
  return genes;
}

/**
 * Initialize population with random chromosomes
 */
export function initializePopulation(
  cities: City[],
  populationSize: number
): Chromosome[] {
  const population: Chromosome[] = [];
  
  for (let i = 0; i < populationSize; i++) {
    const genes = generateRandomChromosome(cities.length);
    const chromosome = createChromosome(genes, cities);
    population.push(chromosome);
  }
  
  return population;
}

/**
 * Create a greedy nearest-neighbor tour as a seed
 * This can improve initial population quality
 */
export function createGreedyChromosome(
  cities: City[],
  startCityId: number = 0
): number[] {
  const n = cities.length;
  const genes: number[] = [];
  const visited = new Set<number>();
  
  let currentCityId = startCityId;
  genes.push(currentCityId);
  visited.add(currentCityId);
  
  while (genes.length < n) {
    let nearestCityId = -1;
    let minDistance = Infinity;
    
    // Find nearest unvisited city
    for (let i = 0; i < n; i++) {
      if (!visited.has(i)) {
        const dx = cities[currentCityId].x - cities[i].x;
        const dy = cities[currentCityId].y - cities[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < minDistance) {
          minDistance = dist;
          nearestCityId = i;
        }
      }
    }
    
    if (nearestCityId !== -1) {
      genes.push(nearestCityId);
      visited.add(nearestCityId);
      currentCityId = nearestCityId;
    }
  }
  
  return genes;
}

/**
 * Initialize population with mix of random and greedy chromosomes
 * This can provide better initial solutions
 */
export function initializePopulationWithSeeds(
  cities: City[],
  populationSize: number,
  greedyCount: number = Math.floor(populationSize * 0.1)
): Chromosome[] {
  const population: Chromosome[] = [];
  
  // Add greedy chromosomes (10% of population)
  for (let i = 0; i < Math.min(greedyCount, cities.length); i++) {
    const genes = createGreedyChromosome(cities, i);
    const chromosome = createChromosome(genes, cities);
    population.push(chromosome);
  }
  
  // Fill rest with random chromosomes
  while (population.length < populationSize) {
    const genes = generateRandomChromosome(cities.length);
    const chromosome = createChromosome(genes, cities);
    population.push(chromosome);
  }
  
  return population;
}
