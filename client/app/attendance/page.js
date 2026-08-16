'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { CalendarCheck, Calendar, UserCheck, Loader2, RefreshCw, CheckCircle, AlertCircle, History } from 'lucide-react';

export default function AttendancePage() {
  const { user, loading: authLoading } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Present');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const fetchEmployeeList = async () => {
      try {
        const res = await apiFetch('/employees');
        if (res.success) {
          setEmployees(res.data);
          if (res.data.length > 0) {
            setSelectedEmployeeId(res.data[0]._id);
          }
        }
      } catch (err) {
        setFeedback({ type: 'error', message: 'Failed to load employee list' });
      } finally {
        setLoadingEmployees(false);
      }
    };

    if (!authLoading && user) {
      fetchEmployeeList();
    }
  }, [authLoading, user]);

  const fetchHistory = useCallback(async (empId) => {
    if (!empId) return;
    setLoadingHistory(true);
    try {
      const res = await apiFetch(`/attendance/${empId}`);
      if (res.success) {
        setHistory(res.data);
      }
    } catch (err) {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (selectedEmployeeId) {
      fetchHistory(selectedEmployeeId);
    }
  }, [selectedEmployeeId, fetchHistory]);

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (!selectedEmployeeId || !attendanceDate || !status) {
      setFeedback({ type: 'error', message: 'Please complete all required fields.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch('/attendance', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: selectedEmployeeId,
          date: attendanceDate,
          status
        })
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Attendance marked as '${status}' for selected date.`
        });
        fetchHistory(selectedEmployeeId);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to submit attendance.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
      </div>
    );
  }

  const selectedEmployee = employees.find(e => e._id === selectedEmployeeId);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="border-b border-zinc-800/80 pb-5">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100">Attendance Tracking</h1>
          <p className="text-xs text-zinc-400 mt-1">Mark daily attendance and inspect individual employee history</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5 h-fit">
            <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-3">
              <CalendarCheck className="w-4 h-4 text-zinc-400" />
              <h2 className="text-sm font-semibold text-zinc-100">Mark Attendance</h2>
            </div>

            {feedback.message && (
              <div
                className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
                    : 'bg-rose-950/40 border-rose-800/60 text-rose-400'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            {loadingEmployees ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
              </div>
            ) : employees.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">
                No active employees found. Please create an employee profile first.
              </div>
            ) : (
              <form onSubmit={handleMarkAttendance} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                    Select Employee
                  </label>
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-zinc-500 transition"
                  >
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} ({emp.employeeId}) — {emp.department}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-zinc-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                    Attendance Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Present', 'Absent', 'On Leave'].map((st) => (
                      <button
                        type="button"
                        key={st}
                        onClick={() => setStatus(st)}
                        className={`py-2 px-2 rounded-lg border text-center font-medium transition ${
                          status === st
                            ? st === 'Present'
                              ? 'bg-emerald-950/60 border-emerald-700 text-emerald-400'
                              : st === 'Absent'
                              ? 'bg-rose-950/60 border-rose-700 text-rose-400'
                              : 'bg-amber-950/60 border-amber-700 text-amber-400'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                      Updating...
                    </>
                  ) : (
                    'Save Attendance'
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-zinc-400" />
                <h2 className="text-sm font-semibold text-zinc-100">
                  Attendance Records {selectedEmployee ? `— ${selectedEmployee.name}` : ''}
                </h2>
              </div>
              <span className="text-xs font-mono text-zinc-500">
                {history.length} {history.length === 1 ? 'record' : 'records'}
              </span>
            </div>

            {loadingHistory ? (
              <div className="py-16 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
              </div>
            ) : history.length === 0 ? (
              <div className="py-16 text-center text-xs text-zinc-500 space-y-1">
                <p>No attendance history found for this employee.</p>
                <p>Use the form on the left to record attendance for any date.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-950/60 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Recorded At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {history.map((record) => (
                      <tr key={record._id} className="hover:bg-zinc-800/30 transition">
                        <td className="py-2.5 px-4 font-mono text-zinc-200">
                          {new Date(record.date).toISOString().split('T')[0]}
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                              record.status === 'Present'
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                                : record.status === 'Absent'
                                ? 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                                : 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right text-zinc-500 font-mono text-[11px]">
                          {new Date(record.updatedAt || record.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
