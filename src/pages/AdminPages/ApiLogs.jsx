import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Activity, Database } from 'lucide-react';
import DataTable from '../../ui-components/DataTable';
import { format } from 'date-fns';
import apiRequest from '../../utils/apiRequest';

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
  const [pageCount, setPageCount] = useState(0);
  const [{ pageIndex, pageSize }, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const token = useSelector((state) => state.auth.userToken);
  const userHash = useSelector((state) => state?.auth?.userInfo?.profile?.client?.[0]?.hash);

  const pagination = useMemo(() => ({ pageIndex, pageSize }), [pageIndex, pageSize]);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!token || !userHash) {
        setError("Authentication details are missing.");
        setLoading(false);
        return;
      }
      setLoading(true);
       try {
        const response = await apiRequest('get', `/user/fetch-logs?page=${pageIndex}`, null, token, { 'x-auth-token': userHash });
        setLogs(response.data.logs || []);
        setPageCount(response.data.totalPages || 0);
      } catch (err) {
        setError(err.message);
        setLogs([]);
        setPageCount(0);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [token, userHash, pageIndex, pageSize]);

  const sortedLogs = useMemo(() => {
    if (!logs) return [];
    return [...logs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [logs]);

  const columns = useMemo(() => [
    { header: 'Method', accessorKey: 'method', cell: ({ getValue }) => <MethodBadge method={getValue()} /> },
    { header: 'Status', accessorKey: 'status', cell: ({ getValue }) => <StatusBadge status={getValue()} /> },
    { header: 'Path', accessorKey: 'path', cell: ({ getValue }) => <div className="truncate max-w-xs">{getValue()}</div> },
    { header: 'IP Address', accessorKey: 'ip', cell: ({ getValue }) => getValue() },
    { header: 'Date', accessorKey: 'createdAt', cell: ({ getValue }) => format(new Date(getValue()), "MMM dd, yyyy 'at' hh:mm a") },
  ], []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-6 bg-card border border-border rounded-xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 p-3 sm:p-4 bg-accent/10 text-accent rounded-xl">
            <Activity className="h-7 w-7 sm:h-8 sm:w-8" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">API Logs</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">A detailed record of your recent API requests.</p>
          </div>
        </div>
      </div>
      
      <DataTable
        columns={columns}
        data={sortedLogs}
        isLoading={loading}
        error={error}
        icon={Database}
        title="Request History"
        subtitle="Search and filter through all your API calls."
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
      />
    </div>
  );
}