/**
 * 2-Opt Local Search Operator
 * 
 * From paper: "The local search operator is integrated to enhance exploitation ability"
 * 
 * The 2-Opt algorithm eliminates crossing edges by swapping connections
 */

import type { Chromosome } from '../types/algorithm';

/**
 * 2-Opt Local Search
 * 
 * Iteratively improves tour by eliminating crossing edges:
 * 1. For each pair of edges (i, i+1) and (j, j+1)
 * 2. Calculate current distance
 * 3. Calculate distance after reversing segment between i+1 and j
 * 4. If improvement found, apply the swap
 * 5. Repeat until no improvement possible
 */
export function twoOptOperator(
  chromosome: Chromosome,
  distanceMatrix: number[][]
): Chromosome {
  let genes = [...chromosome.genes];
  let improved = true;
  const n = genes.length;
  
  while (improved) {
    improved = false;
    
    for (let i = 0; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        // Current edges: (i -> i+1) and (j -> j+1)
        const currentDist =
          distanceMatrix[genes[i]][genes[i + 1]] +
          distanceMatrix[genes[j]][genes[(j + 1) % n]];
        
        // New edges after swap: (i -> j) and (i+1 -> j+1)
        const newDist =
          distanceMatrix[genes[i]][genes[j]] +
          distanceMatrix[genes[i + 1]][genes[(j + 1) % n]];
        
        // If improvement found
        if (newDist < currentDist) {
          // Reverse segment between i+1 and j
          genes = [
            ...genes.slice(0, i + 1),
            ...genes.slice(i + 1, j + 1).reverse(),
            ...genes.slice(j + 1)
          ];
          improved = true;
        }
      }
    }
  }
  
  // Calculate final distance
  let distance = 0;
  for (let i = 0; i < n; i++) {
    distance += distanceMatrix[genes[i]][genes[(i + 1) % n]];
  }
  
  return {
    genes,
    fitness: distance,
    distance
  };
}

/**
 * Apply 2-Opt to entire population
 * Usually applied only to best chromosomes to save time
 */
export function applyTwoOptToPopulation(
  population: Chromosome[],
  distanceMatrix: number[][],
  applyToAll: boolean = false,
  topN: number = 10
): Chromosome[] {
  if (applyToAll) {
    // Apply to all chromosomes
    return population.map(chr => twoOptOperator(chr, distanceMatrix));
  } else {
    // Apply only to top N best chromosomes
    const sorted = [...population].sort((a, b) => a.distance - b.distance);
    const improved: Chromosome[] = [];
    
    for (let i = 0; i < population.length; i++) {
      if (i < topN) {
        improved.push(twoOptOperator(sorted[i], distanceMatrix));
      } else {
        improved.push(sorted[i]);
      }
    }
    
    return improved;
  }
}

/**
 * Simple 2-Opt variant that only does one pass
 * Faster but less optimal
 */
export function twoOptSinglePass(
  chromosome: Chromosome,
  distanceMatrix: number[][]
): Chromosome {
  let genes = [...chromosome.genes];
  const n = genes.length;
  let bestImprovement = 0;
  let bestI = -1;
  let bestJ = -1;
  
  // Find best single improvement
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const currentDist =
        distanceMatrix[genes[i]][genes[i + 1]] +
        distanceMatrix[genes[j]][genes[(j + 1) % n]];
      
      const newDist =
        distanceMatrix[genes[i]][genes[j]] +
        distanceMatrix[genes[i + 1]][genes[(j + 1) % n]];
      
      const improvement = currentDist - newDist;
      
      if (improvement > bestImprovement) {
        bestImprovement = improvement;
        bestI = i;
        bestJ = j;
      }
    }
  }
  
  // Apply best improvement if found
  if (bestI !== -1 && bestJ !== -1) {
    genes = [
      ...genes.slice(0, bestI + 1),
      ...genes.slice(bestI + 1, bestJ + 1).reverse(),
      ...genes.slice(bestJ + 1)
    ];
  }
  
  // Calculate final distance
  let distance = 0;
  for (let i = 0; i < n; i++) {
    distance += distanceMatrix[genes[i]][genes[(i + 1) % n]];
  }
  
  return {
    genes,
    fitness: distance,
    distance
  };
}
