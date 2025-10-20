/**
 * Global State Management with Zustand
 */

import { create } from 'zustand';
import type { City, Population, AlgorithmParams, GenerationStats } from '../types/algorithm';
import { DEFAULT_PARAMS } from '../types/algorithm';
import { GAJGHO } from '../algorithms/GAJGHO';

interface AlgorithmStore {
  // Cities
  cities: City[];
  nextCityId: number;
  
  // Algorithm state
  algorithm: GAJGHO | null;
  isRunning: boolean;
  isPaused: boolean;
  currentGeneration: number;
  currentPopulation: Population | null;
  history: GenerationStats[];
  
  // Parameters
  params: AlgorithmParams;
  
  // Actions - Cities
  addCity: (x: number, y: number, name?: string) => void;
  removeCity: (id: number) => void;
  clearCities: () => void;
  loadCities: (cities: City[]) => void;
  
  // Actions - Algorithm
  initializeAlgorithm: () => void;
  startAlgorithm: () => void;
  pauseAlgorithm: () => void;
  resetAlgorithm: () => void;
  stepGeneration: () => void;
  runToCompletion: () => void;
  
  // Actions - Parameters
  updateParams: (params: Partial<AlgorithmParams>) => void;
  resetParams: () => void;
}

export const useAlgorithmStore = create<AlgorithmStore>((set, get) => ({
  // Initial state
  cities: [],
  nextCityId: 0,
  algorithm: null,
  isRunning: false,
  isPaused: false,
  currentGeneration: 0,
  currentPopulation: null,
  history: [],
  params: DEFAULT_PARAMS,
  
  // City management
  addCity: (x, y, name) => {
    const { nextCityId, cities } = get();
    const newCity: City = {
      id: nextCityId,
      x,
      y,
      name: name || `City ${nextCityId + 1}`
    };
    set({
      cities: [...cities, newCity],
      nextCityId: nextCityId + 1
    });
  },
  
  removeCity: (id) => {
    set((state) => ({
      cities: state.cities.filter(city => city.id !== id)
    }));
  },
  
  clearCities: () => {
    set({
      cities: [],
      nextCityId: 0,
      algorithm: null,
      currentPopulation: null,
      history: [],
      isRunning: false,
      currentGeneration: 0
    });
  },
  
  loadCities: (cities) => {
    const maxId = cities.length > 0 ? Math.max(...cities.map(c => c.id)) : -1;
    set({
      cities,
      nextCityId: maxId + 1,
      algorithm: null,
      currentPopulation: null,
      history: [],
      isRunning: false,
      currentGeneration: 0
    });
  },
  
  // Algorithm control
  initializeAlgorithm: () => {
    const { cities, params } = get();
    
    if (cities.length < 3) {
      console.warn('Need at least 3 cities to run algorithm');
      return;
    }
    
    const algorithm = new GAJGHO(cities, params);
    algorithm.initialize();
    
    const population = algorithm.getPopulation();
    const stats = algorithm.getStats();
    
    set({
      algorithm,
      currentPopulation: population,
      currentGeneration: 0,
      history: [stats],
      isRunning: false,
      isPaused: false
    });
  },
  
  startAlgorithm: () => {
    const { algorithm } = get();
    
    if (!algorithm) {
      get().initializeAlgorithm();
    }
    
    set({ isRunning: true, isPaused: false });
    
    // Run algorithm in animation loop
    const runGeneration = () => {
      const state = get();
      
      if (!state.isRunning || state.isPaused) {
        return;
      }
      
      if (state.algorithm && state.currentGeneration < state.params.maxGenerations) {
        const population = state.algorithm.runGeneration();
        const stats = state.algorithm.getStats();
        
        set({
          currentPopulation: population,
          currentGeneration: stats.generation,
          history: [...state.history, stats]
        });
        
        // Continue to next generation
        requestAnimationFrame(runGeneration);
      } else {
        set({ isRunning: false });
      }
    };
    
    runGeneration();
  },
  
  pauseAlgorithm: () => {
    set({ isPaused: true, isRunning: false });
  },
  
  resetAlgorithm: () => {
    const { algorithm } = get();
    
    if (algorithm) {
      algorithm.reset();
    }
    
    set({
      algorithm: null,
      currentPopulation: null,
      currentGeneration: 0,
      history: [],
      isRunning: false,
      isPaused: false
    });
  },
  
  stepGeneration: () => {
    const { algorithm } = get();
    
    if (!algorithm) {
      get().initializeAlgorithm();
      return;
    }
    
    if (get().currentGeneration < get().params.maxGenerations) {
      const population = algorithm.runGeneration();
      const stats = algorithm.getStats();
      
      set((state) => ({
        currentPopulation: population,
        currentGeneration: stats.generation,
        history: [...state.history, stats]
      }));
    }
  },
  
  runToCompletion: () => {
    const { algorithm, cities, params } = get();
    
    const algo = algorithm || new GAJGHO(cities, params);
    
    if (!algorithm) {
      algo.initialize();
    }
    
    const history: GenerationStats[] = [];
    
    algo.run((_population, stats) => {
      history.push(stats);
    });
    
    const finalPopulation = algo.getPopulation();
    
    set({
      algorithm: algo,
      currentPopulation: finalPopulation,
      currentGeneration: finalPopulation.generation,
      history,
      isRunning: false
    });
  },
  
  // Parameter management
  updateParams: (newParams) => {
    set((state) => ({
      params: { ...state.params, ...newParams }
    }));
  },
  
  resetParams: () => {
    set({ params: DEFAULT_PARAMS });
  }
}));
