# 🧬 GA-JGHO: Genetic Algorithm with Jumping Gene & Heuristic Operators for TSP# React + TypeScript + Vite



**Interactive web application for solving the Traveling Salesman Problem using GA-JGHO algorithm**This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.



🎯 **Live Demo:** [Coming soon - Deploy to Vercel]Currently, two official plugins are available:



---- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh

- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## ✨ Features

## React Compiler

- 🧬 **Complete GA-JGHO Implementation** with all 5 modifications from the research paper

- ⚔️ **Multi-Algorithm Comparison** (GA-JGHO vs Standard GA vs ABCTSP vs PACO-3Opt)The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

- 📊 **Real-time Performance Charts** (convergence, diversity tracking)

- 🎛️ **Interactive Parameter Tuning** with sliders and presets## Expanding the ESLint configuration

- 📁 **TSPLIB Benchmark Datasets** (berlin52, eil51, st70, kroA100)

- 🖱️ **Interactive Canvas** for placing citiesIf you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

- 📱 **Responsive Design** for all devices

```js

---export default defineConfig([

  globalIgnores(['dist']),

## 🚀 Quick Start  {

    files: ['**/*.{ts,tsx}'],

```bash    extends: [

# Clone repository      // Other configs...

git clone https://github.com/i-am-batman-28/GAJHO-Genetic-Algo.git

cd GAJHO-Genetic-Algo/tsp-ga-jgho-app      // Remove tseslint.configs.recommended and replace with this

      tseslint.configs.recommendedTypeChecked,

# Install dependencies      // Alternatively, use this for stricter rules

npm install      tseslint.configs.strictTypeChecked,

      // Optionally, add this for stylistic rules

# Run development server      tseslint.configs.stylisticTypeChecked,

npm run dev

      // Other configs...

# Build for production    ],

npm run build    languageOptions: {

```      parserOptions: {

        project: ['./tsconfig.node.json', './tsconfig.app.json'],

---        tsconfigRootDir: import.meta.dirname,

      },

## 📖 About      // other options...

    },

Implementation based on:  },

**"A genetic algorithm with jumping gene and heuristic operators for traveling salesman problem"**  ])

Zhang et al., Applied Soft Computing, 2022```



### Algorithm Features:You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

1. ✅ **Combination Fitness Selection** - Adaptive Pfit (0.76 → 0.0657)

2. ✅ **Bidirectional Heuristic Crossover (BHX)** - Greedy construction```js

3. ✅ **Combination Mutation** - Adaptive Ps (0.5446 → 0.1607)// eslint.config.js

4. ✅ **Jumping Gene Operator** - Escape local optima (PJG = 0.6464)import reactX from 'eslint-plugin-react-x'

5. ✅ **Unique Operator** - Diversity maintenanceimport reactDom from 'eslint-plugin-react-dom'

6. ✅ **2-Opt Local Search** - Solution refinement

export default defineConfig([

---  globalIgnores(['dist']),

  {

## 🎮 Usage    files: ['**/*.{ts,tsx}'],

    extends: [

1. **Place Cities:** Click on canvas or load TSPLIB dataset      // Other configs...

2. **Run Algorithm:** Click "Start" to watch GA-JGHO optimize      // Enable lint rules for React

3. **Compare Algorithms:** Test against Standard GA, ABCTSP, PACO-3Opt      reactX.configs['recommended-typescript'],

4. **Tune Parameters:** Adjust sliders to experiment with settings      // Enable lint rules for React DOM

      reactDom.configs.recommended,

---    ],

    languageOptions: {

## 🛠️ Tech Stack      parserOptions: {

        project: ['./tsconfig.node.json', './tsconfig.app.json'],

- React 19.1.1 + TypeScript 5.9.3        tsconfigRootDir: import.meta.dirname,

- Vite 7.1.7      },

- Zustand (state management)      // other options...

- D3.js + Recharts (visualization)    },

- Deployed on Vercel  },

])

---```


## 📈 Results from Paper

GA-JGHO achieved:
- **23/30 optimal solutions** on TSPLIB instances
- **0.27% mean deviation** from optimal (best among 7 algorithms)
- Outperformed: ABCTSP, PACO-3Opt, D-GWO, AGBSO3, DBMEA, DBAL

---

## 📄 License

MIT License

---

## 👤 Author

**@i-am-batman-28**  
GitHub: https://github.com/i-am-batman-28

---

⭐ **Star this repo if you find it useful!**
