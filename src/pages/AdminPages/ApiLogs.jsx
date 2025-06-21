import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Activity, Database } from 'lucide-react';
import apiRequest from '../../utils/apiRequest';
import DataTable from '../../ui-components/DataTable';
import { format } from 'date-fns';

const MethodBadge = ({ method }) => {
  const colors = {
    GET: 'bg-sky-100 text-sky-700',
    POST: 'bg-green-100 text-green-700',
    PUT: 'bg-amber-100 text-amber-700',
    DELETE: 'bg-red-100 text-red-700',
    PATCH: 'bg-purple-100 text-purple-700',
  };
  return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${colors[method] || 'bg-gray-100 text-gray-700'}`}>{method}</span>;
};

const StatusBadge = ({ status }) => {
  let colorClass = 'bg-gray-100 text-gray-700';
  if (status >= 200 && status < 300) colorClass = 'bg-green-100 text-green-700';
  else if (status >= 400 && status < 500) colorClass = 'bg-amber-100 text-amber-700';
  else if (status >= 500) colorClass = 'bg-red-100 text-red-700';
  
  return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${colorClass}`}>{status || 'N/A'}</span>;
};

export default function ApiLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = useSelector((state) => state.auth.userToken);
  const userHash = useSelector((state) => state?.auth?.userInfo?.profile?.client?.[0]?.hash);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!token || !userHash) {
        setError("Authentication details are missing.");
        setLoading(false);
        return;
      }
       try {
        const response = await fetch("https://salesdriver.co:8089/api/user/fetch-logs", {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-auth-token': userHash
          }
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
          throw new Error(errorData.message || 'Failed to fetch logs');
        }
        setLogs(response.data.logs || []);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch API logs.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [token, userHash]);

  const columns = useMemo(() => [
    { header: 'Method', accessorKey: 'method', cell: ({ getValue }) => <MethodBadge method={getValue()} /> },
    { header: 'Status', accessorKey: 'status', cell: ({ getValue }) => <StatusBadge status={getValue()} /> },
    { header: 'Path', accessorKey: 'path', cell: ({ getValue }) => getValue() },
    { header: 'IP Address', accessorKey: 'ip', cell: ({ getValue }) => getValue() },
    { header: 'Date', accessorKey: 'createdAt', cell: ({ getValue }) => format(new Date(getValue()), "MMM dd, yyyy 'at' hh:mm a") },
  ], []);

  const totalErrors = useMemo(() => {
    return logs.filter(log => log.status >= 400).length;
  }, [logs]);

  return (
    <div className="p-4 sm:p-6 space-y-8">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 bg-card border border-border rounded-2xl shadow-lg">
        <div className="flex items-center gap-5">
          <div className="flex-shrink-0 p-4 bg-accent/10 text-accent rounded-2xl">
            <Activity className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">API Logs</h1>
            <p className="text-base text-muted-foreground mt-1">A detailed record of your recent API requests.</p>
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center gap-6 w-full md:w-auto">
          <div className="flex-1 text-left md:text-right">
            <p className="text-sm text-nowrap font-semibold text-muted-foreground uppercase tracking-wider">Total Requests</p>
            <p className="text-2xl font-bold text-accent">{logs.length.toLocaleString()}</p>
          </div>
          <div className="flex-1 text-left md:text-right">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Errors</p>
            <p className="text-2xl font-bold text-accent">{totalErrors.toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      <DataTable
        columns={columns}
        data={logs}
        isLoading={loading}
        error={error}
        icon={Database}
        title="Request History"
        subtitle="Search and filter through all your API calls."
      />
    </div>
  );
}