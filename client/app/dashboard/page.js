'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Users, UserCheck, UserX, Clock, ArrowUpRight, Loader2, RefreshCw, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/dashboard/summary');
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboardData();
    }
  }, [authLoading, user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
      </div>
    );
  }

  const present = data?.todayAttendance?.present ?? 0;
  const absent = data?.todayAttendance?.absent ?? 0;
  const onLeave = data?.todayAttendance?.onLeave ?? 0;
  const attendanceTotal = present + absent + onLeave;

  const getDonutSlices = () => {
    if (attendanceTotal === 0) return [];
    const radius = 40;
    const circumference = 2 * Math.PI * radius;

    let accumulatedAngle = 0;
    const items = [
      { label: 'Present', count: present, color: '#10b981' },
      { label: 'Absent', count: absent, color: '#f43f5e' },
      { label: 'On Leave', count: onLeave, color: '#f59e0b' }
    ];

    return items.map(item => {
      const percentage = item.count / attendanceTotal;
      const strokeDasharray = `${percentage * circumference} ${circumference}`;
      const strokeDashoffset = -accumulatedAngle * circumference;
      accumulatedAngle += percentage;
      return { ...item, strokeDasharray, strokeDashoffset, percentage: Math.round(percentage * 100) };
    });
  };

  const donutSlices = getDonutSlices();

  const maxDeptCount = data?.departmentHeadcount?.reduce((max, d) => Math.max(max, d.count), 0) || 1;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-100">Workforce Analytics</h1>
            <p className="text-xs text-zinc-400 mt-1">Real-time breakdown of employee metrics & attendance distribution</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <Link
              href="/employees"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-950 rounded-lg text-xs font-medium hover:bg-zinc-200 transition"
            >
              <span>Manage Directory</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-zinc-900 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        {loading && !data ? (
          <div className="py-20 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[11px] font-medium uppercase tracking-wider">Total Workforce</span>
                  <Users className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="text-3xl font-bold tracking-tight text-zinc-100">
                  {data?.totalEmployees ?? 0}
                </div>
                <p className="text-[11px] text-zinc-500">Registered personnel</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-400">Present Today</span>
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-bold tracking-tight text-emerald-400">
                  {present}
                </div>
                <p className="text-[11px] text-zinc-500">Active check-ins</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-rose-400">Absent Today</span>
                  <UserX className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-3xl font-bold tracking-tight text-rose-400">
                  {absent}
                </div>
                <p className="text-[11px] text-zinc-500">Unrecorded attendance</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-amber-400">On Leave</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-bold tracking-tight text-amber-400">
                  {onLeave}
                </div>
                <p className="text-[11px] text-zinc-500">Approved absence</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                  <div className="flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-zinc-400" />
                    <h2 className="text-sm font-semibold text-zinc-100">Today's Attendance Ratio</h2>
                  </div>
                  <span className="text-xs font-mono text-zinc-500">
                    {attendanceTotal} total logged
                  </span>
                </div>

                {attendanceTotal === 0 ? (
                  <div className="py-16 text-center text-xs text-zinc-500">
                    No attendance recorded for today yet.
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="#18181b"
                          strokeWidth="12"
                        />
                        {donutSlices.map((slice, idx) => (
                          <circle
                            key={idx}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            stroke={slice.color}
                            strokeWidth="12"
                            strokeDasharray={slice.strokeDasharray}
                            strokeDashoffset={slice.strokeDashoffset}
                            className="transition-all duration-700 ease-out"
                          />
                        ))}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-zinc-100">{present}</span>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Present</span>
                      </div>
                    </div>

                    <div className="space-y-3 w-full sm:w-auto">
                      {donutSlices.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between sm:justify-start gap-4 text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: item.color }}
                            ></span>
                            <span className="text-zinc-300 font-medium">{item.label}</span>
                          </div>
                          <span className="font-mono text-zinc-400">
                            {item.count} ({item.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-zinc-400" />
                    <h2 className="text-sm font-semibold text-zinc-100">Department Distribution</h2>
                  </div>
                  <span className="text-xs font-mono text-zinc-500">
                    {data?.departmentHeadcount?.length ?? 0} Departments
                  </span>
                </div>

                {!data?.departmentHeadcount?.length ? (
                  <div className="py-16 text-center text-xs text-zinc-500">
                    No department data available yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.departmentHeadcount.map((item) => {
                      const barWidth = Math.round((item.count / maxDeptCount) * 100);
                      return (
                        <div key={item.department} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-zinc-200">{item.department}</span>
                            <span className="text-zinc-400 font-mono">
                              {item.count} {item.count === 1 ? 'member' : 'members'}
                            </span>
                          </div>
                          <div className="w-full bg-zinc-950 border border-zinc-800/80 rounded-md h-3 overflow-hidden p-0.5">
                            <div
                              className="bg-zinc-100 h-full rounded-xs transition-all duration-500"
                              style={{ width: `${barWidth}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
