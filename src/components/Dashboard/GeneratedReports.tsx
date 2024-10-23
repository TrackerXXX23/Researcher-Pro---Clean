'use client';

import React from 'react';

interface Report {
  id: string;
  title: string;
  date: string;
  status: 'Completed' | 'In Progress' | 'Draft';
}

export const GeneratedReports: React.FC = () => {
  const [reports] = React.useState<Report[]>([
    {
      id: '1',
      title: 'Q4 Financial Analysis',
      date: '2024-03-15',
      status: 'Completed'
    },
    {
      id: '2',
      title: 'Market Trend Report',
      date: '2024-03-10',
      status: 'In Progress'
    },
    {
      id: '3',
      title: 'Competitor Analysis',
      date: '2024-03-05',
      status: 'Completed'
    },
    {
      id: '4',
      title: 'Industry Forecast 2025',
      date: '2024-03-01',
      status: 'Draft'
    }
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="section-header">Generated Reports</div>
        <button>Save as Template</button>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report.id} className="report-item">
            <div className="report-title">{report.title}</div>
            <div className="report-date">{report.date}</div>
            <div className={`status-badge ${report.status.toLowerCase().replace(' ', '-')}`}>
              {report.status}
            </div>
            <div className="report-actions">
              <button className="action-button">Export PDF</button>
              <button className="action-button">Export CSV</button>
              <button className="action-button">Share</button>
              <button className="action-button">Annotate</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeneratedReports;
