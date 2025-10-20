/**
 * Jumping Gene Operator - Modification 4
 * 
 * From paper: "A jumping gene operator is designed, which is beneficial
 * to expand the searching space and reduce the possibility of falling into a local optimum"
 */

import type { Chromosome } from '../types/algorithm';

/**
 * Jumping Gene Operator
 * 
 * Algorithm:
 * 1. Generate binary mask of length n
 * 2. Extract genes where mask = 1
 * 3. Take first q genes from extracted
 * 4. Remove these genes from remaining positions
 * 5. Insert segment at random position
 * 
 * Applied with probability PJG (default 0.5, optimized 0.6464)
 */
export function jumpingGeneOperator(
  chromosome: Chromosome,
  PJG: number,
  q: number
): Chromosome {
  // Apply with probability PJG
  if (Math.random() > PJG) {
    return chromosome; // No jumping
  }
  
  const n = chromosome.genes.length;
  const genes = [...chromosome.genes];
  
  // Step 1: Generate binary mask (random 0s and 1s)
  const mask = Array.from({ length: n }, () => Math.random() < 0.5 ? 1 : 0);
  
  // Step 2: Extract genes where mask = 1
  const extractedGenes: number[] = [];
  const remainingGenes: number[] = [];
  
  for (let i = 0; i < n; i++) {
    if (mask[i] === 1) {
      extractedGenes.push(genes[i]);
    } else {
      remainingGenes.push(genes[i]);
    }
  }
  
  // Step 3: Take first q genes from extracted (or all if less than q)
  const segmentLength = Math.min(q, extractedGenes.length);
  const segment = extractedGenes.slice(0, segmentLength);
  
  // Put remaining extracted genes back
  const leftoverExtracted = extractedGenes.slice(segmentLength);
  
  // Step 4: Remove segment genes from remaining
  const finalRemaining = remainingGenes.filter(gene => !segment.includes(gene));
  
  // Add leftover extracted genes
  finalRemaining.push(...leftoverExtracted);
  
  // Step 5: Insert segment at random position
  const insertPos = Math.floor(Math.random() * (finalRemaining.length + 1));
  const newGenes = [
    ...finalRemaining.slice(0, insertPos),
    ...segment,
    ...finalRemaining.slice(insertPos)
  ];
  
  return {
    genes: newGenes,
    fitness: 0, // Will be calculated later
    distance: 0
  };
}

/**
 * Apply jumping gene operator to entire population
 */
export function applyJumpingGeneToPopulation(
  population: Chromosome[],
  PJG: number,
  q: number
): Chromosome[] {
  return population.map(chr => jumpingGeneOperator(chr, PJG, q));
}

/**
 * Calculate fitness after jumping gene operation
 */
export function calculateFitnessAfterJumping(
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
