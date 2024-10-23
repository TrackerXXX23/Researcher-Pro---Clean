import type { AnalysisResult } from './aiAnalysisService';
import type { ResearchData } from '@/utils/dataProcessing';

interface ReportSection {
  title: string;
  content: string[];
}

interface Report {
  id: string;
  title: string;
  summary: string;
  sections: ReportSection[];
  recommendations: string[];
  timestamp: Date;
}

export async function generateDailyReport(
  data: ResearchData[],
  analysisResults: AnalysisResult[]
): Promise<Report> {
  // Simulate report generation delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const industries = [...new Set(data.map(d => d.metadata?.industry))].filter(Boolean);
  const regions = [...new Set(data.map(d => d.metadata?.region))].filter(Boolean);

  const insights = analysisResults.flatMap(r => r.insights);
  const recommendations = analysisResults.flatMap(r => r.recommendations);
  const risks = analysisResults.flatMap(r => r.risks);

  return {
    id: Date.now().toString(),
    title: `Market Analysis Report - ${new Date().toLocaleDateString()}`,
    summary: `Comprehensive analysis of ${industries.join(', ')} industries across ${regions.join(', ')} regions.`,
    sections: [
      {
        title: 'Key Insights',
        content: [...new Set(insights)]
      },
      {
        title: 'Market Risks',
        content: [...new Set(risks)]
      },
      {
        title: 'Industry Trends',
        content: data.map(d => 
          `${d.metadata?.industry}: ${d.content}`
        )
      },
      {
        title: 'Regional Analysis',
        content: regions.map(region =>
          `${region}: ${data.filter(d => d.metadata?.region === region).length} data points analyzed`
        )
      }
    ],
    recommendations: [...new Set(recommendations)],
    timestamp: new Date()
  };
}

export async function formatReportForExport(report: Report, format: 'pdf' | 'csv'): Promise<string> {
  // Simulate export formatting delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (format === 'pdf') {
    return `
      # ${report.title}
      Generated: ${report.timestamp.toLocaleString()}

      ## Summary
      ${report.summary}

      ${report.sections.map(section => `
        ## ${section.title}
        ${section.content.map(item => `- ${item}`).join('\n')}
      `).join('\n')}

      ## Recommendations
      ${report.recommendations.map(rec => `- ${rec}`).join('\n')}
    `;
  } else {
    // CSV format
    return `Title,${report.title}
Date,${report.timestamp.toLocaleString()}
Summary,${report.summary}
${report.sections.map(section => 
      `${section.title},${section.content.join(';')}`
    ).join('\n')}
Recommendations,${report.recommendations.join(';')}`;
  }
}
