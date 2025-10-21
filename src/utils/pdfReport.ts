/**
 * PDF Report Generator
 * Generates comprehensive research-quality reports matching the paper's analysis
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { GenerationStats, AlgorithmParams } from '../types/algorithm';

interface AlgorithmResult {
  name: string;
  fullName: string;
  color: string;
  history: GenerationStats[];
  bestDistance: number;
  avgDistance: number;
  worstDistance: number;
  bestGeneration: number;
  convergenceRate: number;
  finalDiversity: number;
}

interface ReportData {
  algorithms: AlgorithmResult[];
  params: AlgorithmParams;
  datasetName: string;
  datasetSize: number;
  optimalDistance?: number;
  runDate: Date;
  totalGenerations: number;
}

export class PDFReportGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
    this.currentY = this.margin;
  }

  /**
   * Generate complete research report
   */
  public generateReport(data: ReportData): void {
    this.addTitle(data);
    this.addExecutiveSummary(data);
    this.addDatasetInformation(data);
    this.addAlgorithmParameters(data);
    this.addPerformanceComparison(data);
    this.addStatisticalAnalysis(data);
    this.addConvergenceAnalysis(data);
    this.addDetailedResults(data);
    this.addConclusions(data);
    this.addReferences();
    
    // Save the PDF
    const filename = `TSP_Report_${data.datasetName}_${this.formatDate(data.runDate)}.pdf`;
    this.doc.save(filename);
  }

  private addTitle(data: ReportData): void {
    // Header with logo area
    this.doc.setFillColor(16, 185, 129); // Emerald color
    this.doc.rect(0, 0, this.pageWidth, 40, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Traveling Salesman Problem', this.pageWidth / 2, 15, { align: 'center' });
    
    this.doc.setFontSize(18);
    this.doc.text('Comparative Algorithm Analysis Report', this.pageWidth / 2, 25, { align: 'center' });
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Dataset: ${data.datasetName} | Generated: ${this.formatDateTime(data.runDate)}`, this.pageWidth / 2, 33, { align: 'center' });
    
    this.currentY = 50;
    this.doc.setTextColor(0, 0, 0);
  }

  private addExecutiveSummary(data: ReportData): void {
    this.addSectionHeader('Executive Summary');
    
    const winner = this.findWinner(data.algorithms);
    const improvement = this.calculateImprovement(data.algorithms, winner);
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    const summaryText = [
      `This report presents a comprehensive comparative analysis of ${data.algorithms.length} algorithms for solving the Traveling Salesman Problem (TSP) on the ${data.datasetName} dataset (${data.datasetSize} cities).`,
      '',
      `Best Performing Algorithm: ${winner.fullName}`,
      `Best Solution Found: ${winner.bestDistance.toFixed(2)} distance units`,
      data.optimalDistance ? `Gap from Known Optimal: ${((winner.bestDistance / data.optimalDistance - 1) * 100).toFixed(2)}%` : '',
      `Convergence Generation: ${winner.bestGeneration} of ${data.totalGenerations}`,
      '',
      `Performance Improvement: ${winner.name} achieved ${improvement.toFixed(2)}% better results than the worst-performing algorithm.`,
      `All algorithms were tested under identical conditions with ${data.totalGenerations} generations and population size of ${data.params.populationSize}.`
    ].filter(Boolean);

    summaryText.forEach(text => {
      if (text === '') {
        this.currentY += 3;
      } else {
        const lines = this.doc.splitTextToSize(text, this.pageWidth - 2 * this.margin);
        this.doc.text(lines, this.margin, this.currentY);
        this.currentY += lines.length * 5;
      }
    });

    this.currentY += 5;
  }

  private addDatasetInformation(data: ReportData): void {
    this.checkPageBreak(60);
    this.addSectionHeader('Dataset Information');

    const tableData = [
      ['Parameter', 'Value'],
      ['Dataset Name', data.datasetName],
      ['Number of Cities', data.datasetSize.toString()],
      ['Known Optimal Solution', data.optimalDistance ? data.optimalDistance.toFixed(2) : 'Unknown'],
      ['Problem Type', 'Symmetric Euclidean TSP'],
      ['Search Space Size', this.calculateSearchSpace(data.datasetSize)]
    ];

    autoTable(this.doc, {
      startY: this.currentY,
      head: [tableData[0]],
      body: tableData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
      margin: { left: this.margin, right: this.margin },
      styles: { fontSize: 9 }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
  }

  private addAlgorithmParameters(data: ReportData): void {
    this.checkPageBreak(80);
    this.addSectionHeader('Algorithm Parameters');

    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Common Parameters (Applied to all algorithms):', this.margin, this.currentY);
    this.currentY += 7;

    const commonParams = [
      ['Population Size', data.params.populationSize.toString()],
      ['Generations', data.totalGenerations.toString()],
      ['Elite Count', data.params.eliteCount.toString()]
    ];

    autoTable(this.doc, {
      startY: this.currentY,
      body: commonParams,
      theme: 'plain',
      margin: { left: this.margin + 10, right: this.pageWidth / 2 },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 30 }
      }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;

    // GA-JGHO Specific Parameters
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('GA-JGHO Specific Parameters:', this.margin, this.currentY);
    this.currentY += 7;

    const gajghoParams = [
      ['Pfit Max', data.params.PfitMax.toFixed(2)],
      ['Pfit Min', data.params.PfitMin.toFixed(2)],
      ['Ps Max', data.params.PsMax.toFixed(2)],
      ['Ps Min', data.params.PsMin.toFixed(2)],
      ['Beta (β)', data.params.beta.toFixed(2)],
      ['PJG (Jumping Gene Prob)', data.params.PJG.toFixed(2)],
      ['q (Selection Pressure)', data.params.q.toFixed(2)]
    ];

    autoTable(this.doc, {
      startY: this.currentY,
      body: gajghoParams,
      theme: 'striped',
      margin: { left: this.margin + 10, right: this.margin },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 30 }
      }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
  }

  private addPerformanceComparison(data: ReportData): void {
    this.checkPageBreak(100);
    this.addSectionHeader('Performance Comparison Summary');

    // Sort algorithms by best distance
    const sortedAlgos = [...data.algorithms].sort((a, b) => a.bestDistance - b.bestDistance);

    const tableData = sortedAlgos.map((algo, index) => {
      const gapFromOptimal = data.optimalDistance 
        ? ((algo.bestDistance / data.optimalDistance - 1) * 100).toFixed(2) + '%'
        : 'N/A';
      
      return [
        (index + 1).toString(),
        algo.fullName,
        algo.bestDistance.toFixed(2),
        algo.avgDistance.toFixed(2),
        algo.worstDistance.toFixed(2),
        gapFromOptimal,
        algo.bestGeneration.toString(),
        (algo.convergenceRate * 100).toFixed(1) + '%'
      ];
    });

    autoTable(this.doc, {
      startY: this.currentY,
      head: [[
        'Rank',
        'Algorithm',
        'Best',
        'Average',
        'Worst',
        'Gap from Optimal',
        'Best Gen',
        'Conv. Rate'
      ]],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [16, 185, 129], 
        textColor: [255, 255, 255], 
        fontStyle: 'bold',
        fontSize: 8
      },
      margin: { left: this.margin, right: this.margin },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 50 },
        2: { cellWidth: 20, halign: 'right' },
        3: { cellWidth: 20, halign: 'right' },
        4: { cellWidth: 20, halign: 'right' },
        5: { cellWidth: 18, halign: 'right' },
        6: { cellWidth: 15, halign: 'center' },
        7: { cellWidth: 18, halign: 'right' }
      }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;

    // Add interpretation
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'italic');
    const interpretation = `Convergence Rate represents the percentage improvement from initial to final solution. Higher values indicate faster optimization.`;
    const lines = this.doc.splitTextToSize(interpretation, this.pageWidth - 2 * this.margin);
    this.doc.text(lines, this.margin, this.currentY);
    this.currentY += lines.length * 4 + 5;
  }

  private addStatisticalAnalysis(data: ReportData): void {
    this.checkPageBreak(80);
    this.addSectionHeader('Statistical Analysis');

    // Calculate statistics
    const stats = this.calculateStatistics(data.algorithms);

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Performance Distribution:', this.margin, this.currentY);
    this.currentY += 7;

    const statsData = [
      ['Mean Best Distance', stats.mean.toFixed(2)],
      ['Standard Deviation', stats.stdDev.toFixed(2)],
      ['Coefficient of Variation', (stats.cv * 100).toFixed(2) + '%'],
      ['Range (Max - Min)', stats.range.toFixed(2)],
      ['Relative Performance Spread', (stats.relativeSpread * 100).toFixed(2) + '%']
    ];

    autoTable(this.doc, {
      startY: this.currentY,
      body: statsData,
      theme: 'plain',
      margin: { left: this.margin + 10, right: this.pageWidth / 2 },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { cellWidth: 40 }
      }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;

    // Statistical interpretation
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    const interpretationText = [
      'Statistical Interpretation:',
      '',
      `• Low CV (${(stats.cv * 100).toFixed(1)}%) indicates ${stats.cv < 0.05 ? 'consistent' : stats.cv < 0.1 ? 'moderate' : 'high'} variability across algorithms.`,
      `• Performance spread of ${(stats.relativeSpread * 100).toFixed(1)}% shows ${stats.relativeSpread < 0.1 ? 'minimal' : stats.relativeSpread < 0.2 ? 'moderate' : 'significant'} differences between best and worst performers.`,
      `• The winning algorithm outperforms the mean by ${((stats.best / stats.mean - 1) * 100).toFixed(2)}%.`
    ];

    interpretationText.forEach(text => {
      if (text === '') {
        this.currentY += 3;
      } else {
        const lines = this.doc.splitTextToSize(text, this.pageWidth - 2 * this.margin);
        this.doc.text(lines, this.margin, this.currentY);
        this.currentY += lines.length * 5;
      }
    });

    this.currentY += 5;
  }

  private addConvergenceAnalysis(data: ReportData): void {
    this.checkPageBreak(80);
    this.addSectionHeader('Convergence Analysis');

    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    
    const convergenceData = data.algorithms.map(algo => {
      const initial = algo.history[0]?.bestDistance || 0;
      const final = algo.bestDistance;
      const improvement = ((initial - final) / initial * 100);
      const stagnationGen = this.detectStagnation(algo.history);
      
      return [
        algo.name,
        initial.toFixed(2),
        final.toFixed(2),
        improvement.toFixed(2) + '%',
        algo.bestGeneration.toString(),
        stagnationGen ? stagnationGen.toString() : 'N/A'
      ];
    });

    autoTable(this.doc, {
      startY: this.currentY,
      head: [[
        'Algorithm',
        'Initial Best',
        'Final Best',
        'Improvement',
        'Best Found at Gen',
        'Stagnation from Gen'
      ]],
      body: convergenceData,
      theme: 'grid',
      headStyles: { 
        fillColor: [139, 92, 246], 
        textColor: [255, 255, 255], 
        fontStyle: 'bold',
        fontSize: 8
      },
      margin: { left: this.margin, right: this.margin },
      styles: { fontSize: 8 }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;

    // Convergence insights
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'italic');
    const insights = 'Stagnation indicates the generation where no improvement occurred for 10+ consecutive generations, suggesting premature convergence or local optima.';
    const lines = this.doc.splitTextToSize(insights, this.pageWidth - 2 * this.margin);
    this.doc.text(lines, this.margin, this.currentY);
    this.currentY += lines.length * 4 + 10;
  }

  private addDetailedResults(data: ReportData): void {
    this.checkPageBreak(60);
    this.addSectionHeader('Detailed Algorithm Analysis');

    data.algorithms.forEach((algo, index) => {
      if (index > 0) this.checkPageBreak(50);
      
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      const rgb = this.hexToRgb(algo.color);
      this.doc.setTextColor(rgb[0], rgb[1], rgb[2]);
      this.doc.text(`${index + 1}. ${algo.fullName}`, this.margin, this.currentY);
      this.currentY += 7;
      this.doc.setTextColor(0, 0, 0);

      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      
      const details = [
        `Best Solution: ${algo.bestDistance.toFixed(2)} (found at generation ${algo.bestGeneration})`,
        `Average Distance: ${algo.avgDistance.toFixed(2)}`,
        `Worst Distance: ${algo.worstDistance.toFixed(2)}`,
        `Convergence Rate: ${(algo.convergenceRate * 100).toFixed(2)}%`,
        `Final Population Diversity: ${(algo.finalDiversity * 100).toFixed(2)}%`,
        ''
      ];

      details.forEach(text => {
        if (text === '') {
          this.currentY += 3;
        } else {
          this.doc.text(text, this.margin + 5, this.currentY);
          this.currentY += 5;
        }
      });
    });
  }

  private addConclusions(data: ReportData): void {
    this.checkPageBreak(80);
    this.addSectionHeader('Conclusions and Recommendations');

    const winner = this.findWinner(data.algorithms);
    const stats = this.calculateStatistics(data.algorithms);

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    const conclusions = [
      `Based on the comparative analysis of ${data.algorithms.length} algorithms on the ${data.datasetName} dataset:`,
      '',
      `1. Best Performer: ${winner.fullName} achieved the optimal solution with a distance of ${winner.bestDistance.toFixed(2)}, which is ${data.optimalDistance ? ((winner.bestDistance / data.optimalDistance - 1) * 100).toFixed(2) + '% from the known optimal' : 'the best observed solution'}.`,
      '',
      `2. Convergence Speed: ${winner.name} found its best solution at generation ${winner.bestGeneration}, demonstrating ${winner.bestGeneration < data.totalGenerations * 0.5 ? 'fast' : 'gradual'} convergence characteristics.`,
      '',
      `3. Algorithm Consistency: The coefficient of variation of ${(stats.cv * 100).toFixed(2)}% indicates ${stats.cv < 0.05 ? 'highly consistent' : stats.cv < 0.1 ? 'moderately consistent' : 'variable'} performance across tested algorithms.`,
      '',
      `4. Practical Recommendation: For similar TSP instances of size ~${data.datasetSize} cities, ${winner.name} is recommended for its superior balance of solution quality and convergence speed.`
    ];

    conclusions.forEach(text => {
      if (text === '') {
        this.currentY += 3;
      } else {
        const lines = this.doc.splitTextToSize(text, this.pageWidth - 2 * this.margin);
        this.doc.text(lines, this.margin, this.currentY);
        this.currentY += lines.length * 5;
      }
    });

    this.currentY += 10;
  }

  private addReferences(): void {
    this.checkPageBreak(50);
    this.addSectionHeader('References');

    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');

    const references = [
      '[1] Nagata, Y., & Kobayashi, S. (2013). A powerful genetic algorithm using edge assembly crossover for the traveling salesman problem. INFORMS Journal on Computing, 25(2), 346-363.',
      '',
      '[2] Dorigo, M., & Gambardella, L. M. (1997). Ant colony system: a cooperative learning approach to the traveling salesman problem. IEEE Transactions on Evolutionary Computation, 1(1), 53-66.',
      '',
      '[3] Karaboga, D., & Gorkemli, B. (2014). A quick artificial bee colony (qABC) algorithm and its performance on optimization problems. Applied Soft Computing, 23, 227-238.',
      '',
      '[4] Whitley, D., Starkweather, T., & Shaner, D. (1991). The traveling salesman and sequence scheduling: Quality solutions using genetic edge recombination. Handbook of genetic algorithms.',
      '',
      '---',
      'Generated by GA-JGHO TSP Solver | Research-Quality Comparative Analysis Tool',
      this.formatDateTime(new Date())
    ];

    references.forEach(text => {
      if (text === '') {
        this.currentY += 3;
      } else if (text === '---') {
        this.currentY += 5;
      } else {
        const lines = this.doc.splitTextToSize(text, this.pageWidth - 2 * this.margin);
        this.doc.text(lines, this.margin, this.currentY);
        this.currentY += lines.length * 4;
      }
    });
  }

  // Helper methods
  private addSectionHeader(title: string): void {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(16, 185, 129);
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 2;
    
    // Underline
    this.doc.setDrawColor(16, 185, 129);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 8;
    
    this.doc.setTextColor(0, 0, 0);
  }

  private checkPageBreak(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  private findWinner(algorithms: AlgorithmResult[]): AlgorithmResult {
    return algorithms.reduce((best, current) => 
      current.bestDistance < best.bestDistance ? current : best
    );
  }

  private calculateImprovement(algorithms: AlgorithmResult[], winner: AlgorithmResult): number {
    const worst = algorithms.reduce((worst, current) => 
      current.bestDistance > worst.bestDistance ? current : worst
    );
    return ((worst.bestDistance - winner.bestDistance) / worst.bestDistance) * 100;
  }

  private calculateStatistics(algorithms: AlgorithmResult[]) {
    const distances = algorithms.map(a => a.bestDistance);
    const mean = distances.reduce((sum, d) => sum + d, 0) / distances.length;
    const variance = distances.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / distances.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean;
    const best = Math.min(...distances);
    const worst = Math.max(...distances);
    const range = worst - best;
    const relativeSpread = range / mean;

    return { mean, stdDev, cv, range, relativeSpread, best, worst };
  }

  private detectStagnation(history: GenerationStats[]): number | null {
    let stagnationCount = 0;
    let lastBest = history[0]?.bestDistance || 0;
    
    for (let i = 1; i < history.length; i++) {
      if (Math.abs(history[i].bestDistance - lastBest) < 0.001) {
        stagnationCount++;
        if (stagnationCount >= 10) {
          return i - 10;
        }
      } else {
        stagnationCount = 0;
        lastBest = history[i].bestDistance;
      }
    }
    return null;
  }

  private calculateSearchSpace(n: number): string {
    // For TSP: (n-1)!/2 for symmetric
    if (n <= 10) {
      const factorial = this.factorial(n - 1);
      return (factorial / 2).toExponential(2);
    }
    // Use Stirling's approximation for large n
    const logFactorial = (n - 1) * Math.log10(n - 1) - (n - 1) * Math.log10(Math.E) + 0.5 * Math.log10(2 * Math.PI * (n - 1));
    return `~10^${Math.floor(logFactorial - Math.log10(2))}`;
  }

  private factorial(n: number): number {
    if (n <= 1) return 1;
    return n * this.factorial(n - 1);
  }

  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 0, 0];
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private formatDateTime(date: Date): string {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
