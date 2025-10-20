/**
 * Unique Operator - Modification 5
 * 
 * From paper: "A unique operator is added to avoid the occurrence
 * of nimiety identical individuals in the population"
 */

import type { Chromosome } from '../types/algorithm';
import { generateRandomChromosome } from './initialization';

/**
 * Unique Operator
 * 
 * Removes duplicate chromosomes from population and replaces them
 * with randomly generated individuals to maintain diversity
 */
export function uniqueOperator(
  population: Chromosome[],
  cityCount: number
): Chromosome[] {
  const seen = new Map<string, boolean>();
  const result: Chromosome[] = [];
  
  for (const chromosome of population) {
    // Create unique key from genes
    const key = chromosome.genes.join(',');
    
    if (seen.has(key)) {
      // Duplicate found - replace with random chromosome
      const randomGenes = generateRandomChromosome(cityCount);
      result.push({
        genes: randomGenes,
        fitness: 0, // Will be calculated later
        distance: 0
      });
    } else {
      // Unique chromosome - keep it
      seen.set(key, true);
      result.push(chromosome);
    }
  }
  
  return result;
}

/**
 * Calculate fitness for chromosomes after unique operator
 */
export function calculateFitnessAfterUnique(
  chromosomes: Chromosome[],
  distanceMatrix: number[][]
): Chromosome[] {
  return chromosomes.map(chr => {
    if (chr.fitness === 0) {
      let distance = 0;
      for (let i = 0; i < chr.genes.length; i++) {
        const current = chr.genes[i];
        const next = chr.genes[(i + 1) % chr.genes.length];
        distance += distanceMatrix[current][next];
      }
      return {
        ...chr,
        fitness: distance,
        distance
      };
    }
    return chr;
  });
}

/**
 * Count duplicate chromosomes in population
 * Useful for statistics and monitoring diversity
 */
export function countDuplicates(population: Chromosome[]): number {
  const seen = new Set<string>();
  let duplicateCount = 0;
  
  for (const chromosome of population) {
    const key = chromosome.genes.join(',');
    if (seen.has(key)) {
      duplicateCount++;
    } else {
      seen.add(key);
    }
  }
  
  return duplicateCount;
}

/**
 * Calculate population diversity
 * Returns ratio of unique individuals to total population
 */
export function calculateDiversity(population: Chromosome[]): number {
  const uniqueKeys = new Set<string>();
  
  for (const chromosome of population) {
    const key = chromosome.genes.join(',');
    uniqueKeys.add(key);
  }
  
  return uniqueKeys.size / population.length;
}
