/**
 * Distance Calculation Utilities for TSP
 */

import type { City, Chromosome } from '../types/algorithm';

/**
 * Calculate Euclidean distance between two cities
 */
export function calculateDistance(city1: City, city2: City): number {
  const dx = city1.x - city2.x;
  const dy = city1.y - city2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate total distance for a tour (chromosome)
 */
export function calculateTotalDistance(genes: number[], cities: City[]): number {
  let totalDistance = 0;
  
  for (let i = 0; i < genes.length; i++) {
    const currentCity = cities[genes[i]];
    const nextCity = cities[genes[(i + 1) % genes.length]];
    totalDistance += calculateDistance(currentCity, nextCity);
  }
  
  return totalDistance;
}

/**
 * Build a distance matrix for all city pairs (optimization)
 * This allows O(1) distance lookups instead of recalculating
 */
export function buildDistanceMatrix(cities: City[]): number[][] {
  const n = cities.length;
  const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));
  
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dist = calculateDistance(cities[i], cities[j]);
      matrix[i][j] = dist;
      matrix[j][i] = dist; // Symmetric
    }
  }
  
  return matrix;
}

/**
 * Calculate total distance using pre-built distance matrix (faster)
 */
export function calculateTotalDistanceWithMatrix(
  genes: number[],
  distanceMatrix: number[][]
): number {
  let totalDistance = 0;
  
  for (let i = 0; i < genes.length; i++) {
    const currentCityId = genes[i];
    const nextCityId = genes[(i + 1) % genes.length];
    totalDistance += distanceMatrix[currentCityId][nextCityId];
  }
  
  return totalDistance;
}

/**
 * Create a chromosome from genes and calculate its fitness
 */
export function createChromosome(genes: number[], cities: City[]): Chromosome {
  const distance = calculateTotalDistance(genes, cities);
  return {
    genes,
    fitness: distance,
    distance
  };
}

/**
 * Create a chromosome using distance matrix (faster)
 */
export function createChromosomeWithMatrix(
  genes: number[],
  distanceMatrix: number[][]
): Chromosome {
  const distance = calculateTotalDistanceWithMatrix(genes, distanceMatrix);
  return {
    genes,
    fitness: distance,
    distance
  };
}

/**
 * Find nearest unvisited city to a given city
 */
export function findNearestCity(
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
