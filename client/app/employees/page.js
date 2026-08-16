'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import Navbar from '@/components/Navbar';
import {
  Users, Plus, Search, Filter, X, Edit2, Trash2,
  AlertCircle, Loader2, Calendar, Phone, Mail, CheckCircle, ShieldAlert
} from 'lucide-react';

export default function EmployeesPage() {
  const { user, loading: authLoading } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchName, setSearchName] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    department: '',
    designation: '',
    email: '',
    phone: '',
    dateOfJoining: '',
    status: 'Active'
  });

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (searchName.trim()) params.append('name', searchName.trim());
      if (filterDept) params.append('department', filterDept);
      if (filterStatus) params.append('status', filterStatus);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const res = await apiFetch(`/employees${queryString}`);
      if (res.success) {
        setEmployees(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch employee list');
    } finally {
      setLoading(false);
    }
  }, [searchName, filterDept, filterStatus]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchEmployees();
    }
  }, [authLoading, user, fetchEmployees]);

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      employeeId: '',
      department: '',
      designation: '',
      email: '',
      phone: '',
      dateOfJoining: new Date().toISOString().split('T')[0],
      status: 'Active'
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name || '',
      employeeId: emp.employeeId || '',
      department: emp.department || '',
      designation: emp.designation || '',
      email: emp.email || '',
      phone: emp.phone || '',
      dateOfJoining: emp.dateOfJoining ? new Date(emp.dateOfJoining).toISOString().split('T')[0] : '',
      status: emp.status || 'Active'
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setIsSubmitting(true);

    try {
      let res;
      if (editingEmployee) {
        res = await apiFetch(`/employees/${editingEmployee._id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        res = await apiFetch('/employees', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }

      if (res.success) {
        setIsModalOpen(false);
        fetchEmployees();
      }
    } catch (err) {
      setModalError(err.message || 'Failed to save employee data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setIsSubmitting(true);
    try {
      const res = await apiFetch(`/employees/${id}`, {
        method: 'DELETE'
      });
      if (res.success) {
        setDeleteConfirmId(null);
        fetchEmployees();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearFilters = () => {
    setSearchName('');
    setFilterDept('');
    setFilterStatus('');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
      </div>
    );
  }

  const departments = Array.from(new Set(employees.map(e => e.department).filter(Boolean)));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-100">Employee Directory</h1>
            <p className="text-xs text-zinc-400 mt-1">Manage personnel records, departments, and statuses</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-zinc-100 text-zinc-950 rounded-lg text-xs font-medium hover:bg-zinc-200 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition"
              />
            </div>

            <div className="relative">
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-zinc-500 transition appearance-none"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-zinc-500 transition appearance-none"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>

            {(searchName || filterDept || filterStatus) && (
              <button
                onClick={handleClearFilters}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-100 rounded-lg text-xs font-medium transition"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-zinc-900 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
            </div>
          ) : employees.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-zinc-300">No employees found</p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                {searchName || filterDept || filterStatus
                  ? 'Try adjusting your search query or clear filters to view all employee records.'
                  : 'Start by registering your first employee in the dashboard directory.'}
              </p>
              {!searchName && !filterDept && !filterStatus && (
                <button
                  onClick={handleOpenAddModal}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-950 rounded-lg text-xs font-medium hover:bg-zinc-200 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Employee</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950/60 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Designation</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Joined</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {employees.map((emp) => (
                    <tr key={emp._id} className="hover:bg-zinc-800/30 transition">
                      <td className="py-3 px-4 font-medium text-zinc-100 whitespace-nowrap">
                        {emp.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-400 whitespace-nowrap">
                        {emp.employeeId}
                      </td>
                      <td className="py-3 px-4 text-zinc-300 whitespace-nowrap">
                        {emp.department}
                      </td>
                      <td className="py-3 px-4 text-zinc-400 whitespace-nowrap">
                        {emp.designation}
                      </td>
                      <td className="py-3 px-4 text-zinc-400 space-y-0.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-zinc-300">
                          <Mail className="w-3 h-3 text-zinc-500" />
                          <span>{emp.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-zinc-500">
                          <Phone className="w-3 h-3 text-zinc-500" />
                          <span>{emp.phone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-zinc-400 font-mono whitespace-nowrap">
                        {emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                            emp.status === 'Active'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                              : emp.status === 'On Leave'
                              ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                              : 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                          }`}
                        >
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditModal(emp)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition"
                          title="Edit Employee"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(emp._id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-semibold text-zinc-100">
                {editingEmployee ? 'Edit Employee Profile' : 'Add New Employee'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-100 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-lg bg-zinc-950 border border-rose-500/30 text-rose-400 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-zinc-500"
                    placeholder="Jane Doe"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Employee ID</label>
                  <input
                    type="text"
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-zinc-500 uppercase font-mono"
                    placeholder="EMP001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-zinc-500"
                    placeholder="Engineering"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-zinc-500"
                    placeholder="Frontend Engineer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-zinc-500"
                    placeholder="jane@company.com"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-zinc-500"
                    placeholder="+1 555-0199"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Date of Joining</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfJoining}
                    onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-zinc-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 hover:text-zinc-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-zinc-100 text-zinc-950 rounded-lg font-medium hover:bg-zinc-200 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingEmployee ? 'Update Record' : 'Create Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-semibold text-zinc-100">Confirm Employee Deletion</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Are you sure you want to delete this employee? All associated attendance records will also be permanently removed.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-300 hover:text-zinc-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isSubmitting}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
