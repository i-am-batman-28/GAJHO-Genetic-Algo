/**
 * Crossover Operator - Modification 2
 * Bidirectional Heuristic Crossover (BHX)
 * 
 * From paper: "A bidirectional heuristic crossover operator is proposed,
 * which aims to increase the possibility of the potential offspring produced"
 */

import type { Chromosome } from '../types/algorithm';

/**
 * Find neighbors of a city in a chromosome
 * Considering the direction (clockwise or counterclockwise)
 */
function findNeighbors(
  cityId: number,
  chromosome: Chromosome,
  direction: 'clockwise' | 'counterclockwise'
): number[] {
  const genes = chromosome.genes;
  const n = genes.length;
  const pos = genes.indexOf(cityId);
  
  if (direction === 'clockwise') {
    // Next city in tour
    return [genes[(pos + 1) % n]];
  } else {
    // Previous city in tour
    return [genes[(pos - 1 + n) % n]];
  }
}

/**
 * Bidirectional Heuristic Crossover (BHX)
 * 
 * Algorithm:
 * 1. Randomly choose direction (clockwise/counterclockwise)
 * 2. Start from random city in parent1
 * 3. Find neighbors in both parents based on direction
 * 4. Choose nearest unvisited neighbor
 * 5. If no neighbors available, choose nearest unvisited city
 * 6. Repeat until all cities visited
 */
export function bidirectionalHeuristicCrossover(
  parent1: Chromosome,
  parent2: Chromosome,
  distanceMatrix: number[][]
): Chromosome {
  const n = parent1.genes.length;
  const offspring: number[] = [];
  const visited = new Set<number>();
  
  // Randomly choose direction
  const direction: 'clockwise' | 'counterclockwise' = 
    Math.random() < 0.5 ? 'clockwise' : 'counterclockwise';
  
  // Start from random city in parent1
  let currentCity = parent1.genes[Math.floor(Math.random() * n)];
  offspring.push(currentCity);
  visited.add(currentCity);
  
  // Build offspring
  while (offspring.length < n) {
    // Find neighbors in both parents
    const neighbors1 = findNeighbors(currentCity, parent1, direction);
    const neighbors2 = findNeighbors(currentCity, parent2, direction);
    const allNeighbors = [...neighbors1, ...neighbors2];
    
    // Filter out visited cities
    const unvisitedNeighbors = allNeighbors.filter(city => !visited.has(city));
    
    let nextCity: number;
    
    if (unvisitedNeighbors.length === 0) {
      // No unvisited neighbors - choose nearest unvisited city
      const remainingCities = Array.from({ length: n }, (_, i) => i)
        .filter(city => !visited.has(city));
      
      if (remainingCities.length === 0) break; // Safety check
      
      nextCity = findNearestCity(currentCity, remainingCities, distanceMatrix);
    } else {
      // Choose nearest unvisited neighbor
      nextCity = findNearestCity(currentCity, unvisitedNeighbors, distanceMatrix);
    }
    
    offspring.push(nextCity);
    visited.add(nextCity);
    currentCity = nextCity;
  }
  
  // Calculate fitness
  const distance = calculateDistanceWithMatrix(offspring, distanceMatrix);
  
  return {
    genes: offspring,
    fitness: distance,
    distance
  };
}

/**
 * Find nearest city among candidates using distance matrix
 */
function findNearestCity(
  fromCityId: number,
  candidateCityIds: number[],
  distanceMatrix: number[][]
): number {
  let nearestCityId = candidateCityIds[0];
  let minDistance = distanceMatrix[fromCityId][nearestCityId];
  
  for (const cityId of candidateCityIds) {
    const dist = distanceMatrix[fromCityId][cityId];
    if (dist < minDistance) {
      minDistance = dist;
      nearestCityId = cityId;
    }
  }
  
  return nearestCityId;
}

/**
 * Calculate total distance using distance matrix
 */
function calculateDistanceWithMatrix(
  genes: number[],
  distanceMatrix: number[][]
): number {
  let totalDistance = 0;
  
  for (let i = 0; i < genes.length; i++) {
    const currentCity = genes[i];
    const nextCity = genes[(i + 1) % genes.length];
    totalDistance += distanceMatrix[currentCity][nextCity];
  }
  
  return totalDistance;
}

/**
 * Perform crossover on multiple parent pairs
 */
export function performCrossover(
  parents: Chromosome[],
  distanceMatrix: number[][],
  offspringCount?: number
): Chromosome[] {
  const offspring: Chromosome[] = [];
  const targetCount = offspringCount || parents.length;
  
  for (let i = 0; i < targetCount; i += 2) {
    const parent1 = parents[i % parents.length];
    const parent2 = parents[(i + 1) % parents.length];
    
    // Create two offspring by swapping parent order
    offspring.push(bidirectionalHeuristicCrossover(parent1, parent2, distanceMatrix));
    
    if (offspring.length < targetCount) {
      offspring.push(bidirectionalHeuristicCrossover(parent2, parent1, distanceMatrix));
    }
  }
  
  return offspring.slice(0, targetCount);
}
