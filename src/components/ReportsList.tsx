'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Report {
  processId: string;
  startTime: string;
  status: string;
}

const ReportsList: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [filterDate, setFilterDate] = useState<string>('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reports');
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to fetch reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const groupReportsByDate = (reports: Report[]) => {
    const grouped = reports.reduce((acc, report) => {
      const date = new Date(report.startTime).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(report);
      return acc;
    }, {} as Record<string, Report[]>);

    return Object.entries(grouped).sort(([dateA], [dateB]) => {
      return sortOrder === 'desc'
        ? new Date(dateB).getTime() - new Date(dateA).getTime()
        : new Date(dateA).getTime() - new Date(dateB).getTime();
    });
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };

  const toggleReportSelection = (processId: string) => {
    setSelectedReports(prev =>
      prev.includes(processId)
        ? prev.filter(id => id !== processId)
        : [...prev, processId]
    );
  };

  const toggleAllReportsForDate = (date: string, dateReports: Report[]) => {
    const allSelected = dateReports.every(report => selectedReports.includes(report.processId));
    if (allSelected) {
      setSelectedReports(prev => prev.filter(id => !dateReports.some(report => report.processId === id)));
    } else {
      setSelectedReports(prev => [...new Set([...prev, ...dateReports.map(report => report.processId)])]);
    }
  };

  const deleteSelectedReports = async () => {
    try {
      await axios.post('/api/delete-reports', { reportIds: selectedReports });
      fetchReports();
      setSelectedReports([]);
    } catch (error) {
      console.error('Error deleting reports:', error);
      setError('Failed to delete reports. Please try again.');
    }
  };

  if (loading) return <div className="text-center p-4">Loading reports...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  if (reports.length === 0) return <div className="text-center p-4">No reports available.</div>;

  const groupedReports = groupReportsByDate(reports);
  const filteredGroupedReports = filterDate
    ? groupedReports.filter(([date]) => date === filterDate)
    : groupedReports;

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Past Reports</h2>
        <div>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="mr-2 p-2 border rounded"
          />
          <button
            onClick={toggleSortOrder}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
          >
            Sort {sortOrder === 'desc' ? '↑' : '↓'}
          </button>
          <button
            onClick={deleteSelectedReports}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            disabled={selectedReports.length === 0}
          >
            Delete Selected
          </button>
        </div>
      </div>
      {filteredGroupedReports.map(([date, dateReports]) => (
        <div key={date} className="mb-6">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={dateReports.every(report => selectedReports.includes(report.processId))}
              onChange={() => toggleAllReportsForDate(date, dateReports)}
              className="mr-2"
            />
            <h3 className="text-xl font-semibold">{date}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dateReports.map((report) => (
              <div key={report.processId} className="border rounded-lg p-4 hover:shadow-md transition-shadow flex items-center">
                <input
                  type="checkbox"
                  checked={selectedReports.includes(report.processId)}
                  onChange={() => toggleReportSelection(report.processId)}
                  className="mr-4"
                />
                <div>
                  <Link href={`/report/${report.processId}`} className="text-blue-600 hover:text-blue-800">
                    <h4 className="font-bold">Report {report.processId}</h4>
                  </Link>
                  <p className="text-sm text-gray-500">
                    {new Date(report.startTime).toLocaleTimeString()}
                  </p>
                  <p className={`text-sm ${report.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}`}>
                    Status: {report.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReportsList;
