/**
 * Export/Import Component
 * Handles PDF report generation and data export/import
 */

import { useState } from 'react';
import type { GenerationStats, AlgorithmParams } from '../types/algorithm';
import { PDFReportGenerator } from '../utils/pdfReport';
import './ExportImport.css';

interface AlgorithmData {
  id: string;
  name: string;
  fullName: string;
  color: string;
  history: GenerationStats[];
  enabled: boolean;
}

interface ExportImportProps {
  algorithms: AlgorithmData[];
  params: AlgorithmParams;
  datasetName: string;
  datasetSize: number;
  optimalDistance?: number;
  totalGenerations: number;
}

export function ExportImport({
  algorithms,
  params,
  datasetName,
  datasetSize,
  optimalDistance,
  totalGenerations
}: ExportImportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string>('');

  const handleExportPDF = () => {
    setIsExporting(true);
    setExportStatus('Generating comprehensive PDF report...');

    try {
      // Filter only enabled algorithms with data
      const enabledAlgos = algorithms.filter(a => a.enabled && a.history.length > 0);

      if (enabledAlgos.length === 0) {
        setExportStatus('❌ No algorithm data to export. Please run algorithms first.');
        setIsExporting(false);
        return;
      }

      // Transform data for PDF generator
      const reportData = {
        algorithms: enabledAlgos.map(algo => {
          const distances = algo.history.map(h => h.bestDistance);
          const bestDistance = Math.min(...distances);
          const bestGeneration = distances.indexOf(bestDistance);
          
          return {
            name: algo.name,
            fullName: algo.fullName,
            color: algo.color,
            history: algo.history,
            bestDistance,
            avgDistance: algo.history.reduce((sum, h) => sum + h.bestDistance, 0) / algo.history.length,
            worstDistance: Math.max(...distances),
            bestGeneration,
            convergenceRate: algo.history.length > 0 
              ? (algo.history[0].bestDistance - bestDistance) / algo.history[0].bestDistance 
              : 0,
            finalDiversity: algo.history[algo.history.length - 1]?.diversity || 0
          };
        }),
        params,
        datasetName,
        datasetSize,
        optimalDistance,
        runDate: new Date(),
        totalGenerations
      };

      // Generate PDF
      const generator = new PDFReportGenerator();
      generator.generateReport(reportData);

      setExportStatus('✅ PDF report generated successfully!');
      setTimeout(() => setExportStatus(''), 3000);
    } catch (error) {
      console.error('PDF generation error:', error);
      setExportStatus('❌ Error generating PDF. Check console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = () => {
    const enabledAlgos = algorithms.filter(a => a.enabled && a.history.length > 0);

    if (enabledAlgos.length === 0) {
      setExportStatus('❌ No algorithm data to export.');
      return;
    }

    const exportData = {
      metadata: {
        dataset: datasetName,
        cityCount: datasetSize,
        optimalDistance,
        exportDate: new Date().toISOString(),
        totalGenerations,
        parameters: params
      },
      algorithms: enabledAlgos.map(algo => ({
        id: algo.id,
        name: algo.name,
        fullName: algo.fullName,
        history: algo.history
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TSP_Results_${datasetName}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportStatus('✅ JSON data exported successfully!');
    setTimeout(() => setExportStatus(''), 3000);
  };

  const handleExportCSV = () => {
    const enabledAlgos = algorithms.filter(a => a.enabled && a.history.length > 0);

    if (enabledAlgos.length === 0) {
      setExportStatus('❌ No algorithm data to export.');
      return;
    }

    // Create CSV header
    let csv = 'Algorithm,Generation,Best Distance,Average Distance,Worst Distance,Diversity\n';

    // Add data for each algorithm
    enabledAlgos.forEach(algo => {
      algo.history.forEach(gen => {
        csv += `${algo.name},${gen.generation},${gen.bestDistance},${gen.averageDistance},${gen.worstDistance},${gen.diversity}\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TSP_Data_${datasetName}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportStatus('✅ CSV data exported successfully!');
    setTimeout(() => setExportStatus(''), 3000);
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        console.log('Imported data:', data);
        setExportStatus('✅ Data imported successfully! (Feature in development)');
        setTimeout(() => setExportStatus(''), 3000);
      } catch (error) {
        console.error('Import error:', error);
        setExportStatus('❌ Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="export-import-container">
      <div className="export-section">
        <h3>Export Results</h3>
        <div className="export-buttons">
          <button
            className="export-btn pdf-btn"
            onClick={handleExportPDF}
            disabled={isExporting}
            title="Generate comprehensive PDF report with statistical analysis"
          >
            <span className="btn-icon">📄</span>
            <span className="btn-text">
              <strong>Export PDF Report</strong>
              <small>Comprehensive analysis matching paper methodology</small>
            </span>
          </button>

          <button
            className="export-btn json-btn"
            onClick={handleExportJSON}
            title="Export raw data in JSON format"
          >
            <span className="btn-icon">📋</span>
            <span className="btn-text">
              <strong>Export JSON</strong>
              <small>Raw data for further analysis</small>
            </span>
          </button>

          <button
            className="export-btn csv-btn"
            onClick={handleExportCSV}
            title="Export data in CSV format for Excel/spreadsheets"
          >
            <span className="btn-icon">📊</span>
            <span className="btn-text">
              <strong>Export CSV</strong>
              <small>Excel-compatible format</small>
            </span>
          </button>
        </div>
      </div>

      <div className="import-section">
        <h3>Import Data</h3>
        <label className="import-btn" title="Import previously exported JSON data">
          <span className="btn-icon">📁</span>
          <span className="btn-text">
            <strong>Import JSON</strong>
            <small>Load saved results</small>
          </span>
          <input
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {exportStatus && (
        <div className={`status-message ${exportStatus.includes('❌') ? 'error' : 'success'}`}>
          {exportStatus}
        </div>
      )}

      <div className="export-info">
        <h4>PDF Report Contents:</h4>
        <ul>
          <li>Executive Summary with winner analysis</li>
          <li>Dataset & Parameter specifications</li>
          <li>Performance comparison table (ranked)</li>
          <li>Statistical analysis (mean, std dev, CV)</li>
          <li>Convergence analysis with stagnation detection</li>
          <li>Detailed per-algorithm breakdown</li>
          <li>Conclusions & recommendations</li>
          <li>Academic references</li>
        </ul>
      </div>
    </div>
  );
}
