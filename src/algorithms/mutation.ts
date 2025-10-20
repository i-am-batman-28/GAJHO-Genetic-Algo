/**
 * Mutation Operators - Modification 3
 * Combination Mutation Operator
 * 
 * From paper: "The combination mutation operator is presented to balance
 * the exploration and exploitation ability"
 */

import type { Chromosome } from '../types/algorithm';

/**
 * Calculate adaptive Ps parameter
 * Ps = Pmax^s - (Pmax^s - Pmin^s) × (t / Tmax)
 * 
 * Early generations: High Ps → More swap mutation (exploration)
 * Late generations: Low Ps → More heuristic mutation (exploitation)
 */
export function calculatePs(
  currentGen: number,
  maxGen: number,
  PsMax: number,
  PsMin: number
): number {
  return PsMax - (PsMax - PsMin) * (currentGen / maxGen);
}

/**
 * Swap Mutation Operator
 * Strong exploration ability but slow convergence
 * 
 * Randomly select two positions and swap the cities
 */
export function swapMutation(chromosome: Chromosome): Chromosome {
  const genes = [...chromosome.genes];
  const n = genes.length;
  
  // Generate two different random positions
  const pos1 = Math.floor(Math.random() * n);
  let pos2 = Math.floor(Math.random() * n);
  
  while (pos2 === pos1) {
    pos2 = Math.floor(Math.random() * n);
  }
  
  // Swap cities
  [genes[pos1], genes[pos2]] = [genes[pos2], genes[pos1]];
  
  return {
    genes,
    fitness: 0, // Will be calculated later
    distance: 0
  };
}

/**
 * Inverse Mutation Operator
 * Balanced exploration and exploitation
 * 
 * Randomly select two positions and reverse the segment between them
 */
export function inverseMutation(chromosome: Chromosome): Chromosome {
  const genes = [...chromosome.genes];
  const n = genes.length;
  
  // Generate two random positions
  let pos1 = Math.floor(Math.random() * n);
  let pos2 = Math.floor(Math.random() * n);
  
  // Ensure pos1 < pos2
  if (pos1 > pos2) {
    [pos1, pos2] = [pos2, pos1];
  }
  
  // Reverse segment between pos1 and pos2
  while (pos1 < pos2) {
    [genes[pos1], genes[pos2]] = [genes[pos2], genes[pos1]];
    pos1++;
    pos2--;
  }
  
  return {
    genes,
    fitness: 0,
    distance: 0
  };
}

/**
 * Heuristic Mutation Operator
 * Strong exploitation, prone to local optimum
 * 
 * Select random city, find its nearest neighbor, place it adjacent
 */
export function heuristicMutation(
  chromosome: Chromosome,
  distanceMatrix: number[][]
): Chromosome {
  const genes = [...chromosome.genes];
  const n = genes.length;
  
  // Random position
  const pos1 = Math.floor(Math.random() * n);
  const city1 = genes[pos1];
  
  // Find nearest city to city1 (that's not already adjacent)
  let nearestCity = -1;
  let minDistance = Infinity;
  
  for (let i = 0; i < n; i++) {
    const city2 = genes[i];
    if (city2 === city1) continue;
    
    // Skip if already adjacent
    const prevPos = (pos1 - 1 + n) % n;
    const nextPos = (pos1 + 1) % n;
    if (i === prevPos || i === nextPos) continue;
    
    const dist = distanceMatrix[city1][city2];
    if (dist < minDistance) {
      minDistance = dist;
      nearestCity = city2;
    }
  }
  
  if (nearestCity !== -1) {
    // Remove nearest city from current position
    const pos2 = genes.indexOf(nearestCity);
    genes.splice(pos2, 1);
    
    // Insert it right after city1
    const insertPos = genes.indexOf(city1) + 1;
    genes.splice(insertPos, 0, nearestCity);
  }
  
  return {
    genes,
    fitness: 0,
    distance: 0
  };
}

/**
 * Combination Mutation Operator
 * 
 * Selects mutation type based on Ps and beta:
 * - If μ ≤ Ps: Swap mutation (exploration)
 * - If Ps < μ ≤ Ps + β: Inverse mutation (balanced)
 * - If μ > Ps + β: Heuristic mutation (exploitation)
 * 
 * Where μ is random number in [0, 1]
 */
export function combinationMutation(
  chromosome: Chromosome,
  Ps: number,
  beta: number,
  distanceMatrix: number[][]
): Chromosome {
  const mu = Math.random();
  
  if (mu <= Ps) {
    // Early stage: Swap mutation (exploration)
    return swapMutation(chromosome);
  } else if (mu <= Ps + beta) {
    // Middle stage: Inverse mutation (balanced)
    return inverseMutation(chromosome);
  } else {
    // Late stage: Heuristic mutation (exploitation)
    return heuristicMutation(chromosome, distanceMatrix);
  }
}

/**
 * Calculate fitness for mutated chromosomes
 */
export function calculateFitnessForChromosomes(
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
 * Apply mutation to multiple chromosomes
 */
export function performMutation(
  chromosomes: Chromosome[],
  Ps: number,
  beta: number,
  distanceMatrix: number[][]
): Chromosome[] {
  const mutated = chromosomes.map(chr =>
    combinationMutation(chr, Ps, beta, distanceMatrix)
  );
  
  // Calculate fitness for all mutated chromosomes
  return calculateFitnessForChromosomes(mutated, distanceMatrix);
}
