import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { CreditCard, Database } from 'lucide-react';
import CountUp from "react-countup"; // Import CountUp
import apiRequest from '../../utils/apiRequest';
import DataTable from '../../ui-components/DataTable';
import { format } from 'date-fns';

const StatusBadge = ({ status }) => {
  const isActive = status.toLowerCase() === 'active';
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
      <span className={`font-medium ${isActive ? 'text-green-700' : 'text-muted-foreground'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  );
};

export default function SubscriptionHistory() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = useSelector((state) => state.auth.userToken);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setError("Authentication token not found.");
        setLoading(false);
        return;
      }
      try {
        const response = await apiRequest('get', '/user/profile', null, token);
        setProfile(response.data.profile);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch profile data.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const sortedSubscriptions = useMemo(() => {
    if (!profile?.subscription) {
      return [];
    }
    return [...profile.subscription].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [profile]);

  const columns = useMemo(() => [
    { header: 'Transaction ID', accessorKey: 'id', cell: ({ row }) => <div className="truncate max-w-xs">{row.original.payload?.invoice || `INV-${row.original.id}`}</div> },
    { header: 'Amount', accessorKey: 'price', cell: ({ getValue }) => `$${getValue().toFixed(2)}` },
    { header: 'Status', accessorKey: 'status', cell: ({ getValue }) => <StatusBadge status={getValue()} /> },
    { header: 'Date', accessorKey: 'createdAt', cell: ({ getValue }) => format(new Date(getValue()), "MMM dd, yyyy") },
  ], []);

  const clientData = profile?.client?.[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-4 sm:p-6 bg-card border border-border rounded-xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 p-3 sm:p-4 bg-accent/10 text-accent rounded-xl">
            <CreditCard className="h-7 w-7 sm:h-8 sm:w-8" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Billing History</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Review your past subscriptions and payments.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full md:flex md:w-auto md:gap-6">
          <div className="text-left md:text-right">
            <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">Remaining</p>
            <p className="text-xl sm:text-2xl font-bold text-accent">
              {/* Use CountUp for Remaining Credits */}
              <CountUp end={clientData?.remainingCredits || 0} duration={1.5} separator="," />
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Credits</p>
            <p className="text-xl sm:text-2xl font-bold text-accent">
              {/* Use CountUp for Total Credits */}
              <CountUp end={clientData?.totalCredits || 0} duration={1.5} separator="," />
            </p>
          </div>
        </div>
      </div>
      
      <DataTable
        columns={columns}
        data={sortedSubscriptions}
        isLoading={loading}
        error={error}
        icon={Database}
        title="Transactions"
        subtitle="A list of all your past payments."
      />
    </div>
  );
}