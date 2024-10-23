import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const ReportPage: React.FC = () => {
  const router = useRouter();
  const { processId } = router.query;
  const [reportContent, setReportContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!processId) return;

      try {
        setLoading(true);
        const response = await axios.get(`/api/get-report?processId=${processId}`);
        setReportContent(response.data);
      } catch (error) {
        console.error('Error fetching report:', error);
        setError('Failed to fetch the report. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [processId]);

  if (loading) return <div>Loading report...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!reportContent) return <div>No report content available.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Report for Process {processId}</h1>
      <div className="bg-white shadow rounded-lg p-4" dangerouslySetInnerHTML={{ __html: reportContent }} />
    </div>
  );
};

export default ReportPage;
