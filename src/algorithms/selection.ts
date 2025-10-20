/**
 * Selection Operator - Modification 1
 * Roulette Selection with Combination Fitness Function
 * 
 * From paper: "An improved roulette selection of combined fitness function is proposed
 * to maintain population diversity and strengthen the exploitation ability"
 */

import type { Chromosome } from '../types/algorithm';

/**
 * Calculate adaptive Pfit parameter
 * Pfit = Pmax^fit - (Pmax^fit - Pmin^fit) × (t / Tmax)
 * 
 * Early generations: High Pfit → More likely to use linear fitness (exploration)
 * Late generations: Low Pfit → More likely to use non-linear fitness (exploitation)
 */
export function calculatePfit(
  currentGen: number,
  maxGen: number,
  PfitMax: number,
  PfitMin: number
): number {
  return PfitMax - (PfitMax - PfitMin) * (currentGen / maxGen);
}

/**
 * Calculate linear fitness function
 * f_i = (NP - i + 1) / NP
 * 
 * Where:
 * - NP is population size
 * - i is the rank (0 = best, NP-1 = worst after sorting)
 * 
 * This gives higher probability to worse solutions (exploration)
 */
export function calculateLinearFitness(population: Chromosome[]): number[] {
  const NP = population.length;
  
  // Sort by distance (ascending) - best solution first
  const sorted = [...population].sort((a, b) => a.distance - b.distance);
  
  // Create fitness array with same order as original population
  const fitnessMap = new Map<string, number>();
  sorted.forEach((chr, rank) => {
    const key = chr.genes.join(',');
    fitnessMap.set(key, (NP - rank) / NP);
  });
  
  // Map back to original order
  return population.map(chr => {
    const key = chr.genes.join(',');
    return fitnessMap.get(key) || 0;
  });
}

/**
 * Calculate non-linear fitness function
 * f_i = β(1-β)^(i-1)
 * 
 * Where:
 * - β is a constant (default 0.15, optimized 0.292)
 * - i is the rank (1 = best, NP = worst)
 * 
 * This gives much higher probability to best solutions (exploitation)
 */
export function calculateNonLinearFitness(
  population: Chromosome[],
  beta: number
): number[] {
  // Sort by distance (ascending) - best solution first
  const sorted = [...population].sort((a, b) => a.distance - b.distance);
  
  // Create fitness array
  const fitnessMap = new Map<string, number>();
  sorted.forEach((chr, rank) => {
    const key = chr.genes.join(',');
    const fitness = beta * Math.pow(1 - beta, rank);
    fitnessMap.set(key, fitness);
  });
  
  // Map back to original order
  return population.map(chr => {
    const key = chr.genes.join(',');
    return fitnessMap.get(key) || 0;
  });
}

/**
 * Roulette wheel selection
 * Select one chromosome based on fitness values
 */
function rouletteWheelSelect(
  population: Chromosome[],
  fitnessValues: number[]
): Chromosome {
  // Calculate total fitness
  const totalFitness = fitnessValues.reduce((sum, f) => sum + f, 0);
  
  if (totalFitness === 0) {
    // Fallback to random selection
    return population[Math.floor(Math.random() * population.length)];
  }
  
  // Spin the wheel
  const spin = Math.random() * totalFitness;
  
  let cumulative = 0;
  for (let i = 0; i < population.length; i++) {
    cumulative += fitnessValues[i];
    if (cumulative >= spin) {
      return population[i];
    }
  }
  
  // Fallback (should never reach here)
  return population[population.length - 1];
}

/**
 * Roulette selection with combination fitness function
 * 
 * This is the core of Modification 1:
 * 1. Calculate Pfit based on current generation
 * 2. Generate random number r
 * 3. If r ≤ Pfit: use linear fitness (exploration)
 * 4. If r > Pfit: use non-linear fitness (exploitation)
 * 5. Select chromosome using roulette wheel
 */
export function rouletteSelection(
  population: Chromosome[],
  Pfit: number,
  beta: number
): Chromosome {
  const r = Math.random();
  
  // Choose fitness function based on Pfit
  const fitnessValues = r <= Pfit
    ? calculateLinearFitness(population)
    : calculateNonLinearFitness(population, beta);
  
  // Select using roulette wheel
  return rouletteWheelSelect(population, fitnessValues);
}

/**
 * Select multiple parents for reproduction
 */
export function selectParents(
  population: Chromosome[],
  count: number,
  Pfit: number,
  beta: number
): Chromosome[] {
  const parents: Chromosome[] = [];
  
  for (let i = 0; i < count; i++) {
    parents.push(rouletteSelection(population, Pfit, beta));
  }
  
  return parents;
}
