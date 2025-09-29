// CHANGELOG: Implemented debounced search for performance, a responsive card layout, and improved UX with safer user role management.
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminService } from '../utils/adminService';
import { User, Shield, Search, Loader, AlertTriangle, ChevronLeft, ChevronRight, CheckCircle, XCircle, MoreHorizontal, UserCheck, UserX } from 'lucide-react';

// --- CUSTOM HOOK ---

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// --- SUB-COMPONENTS ---

const FilterBar = memo(({ filters, onFilterChange }) => (
  <div className="flex flex-col md:flex-row gap-4">
    <div className="relative flex-grow">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
      <input
        type="text"
        name="search"
        placeholder="Search by name or email..."
        value={filters.search}
        onChange={onFilterChange}
        className="w-full pl-11 pr-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        aria-label="Search users"
      />
    </div>
    <select
      name="role"
      value={filters.role}
      onChange={onFilterChange}
      className="bg-gray-700/50 border border-gray-600 rounded-lg text-white px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      aria-label="Filter by role"
    >
      <option value="">All Roles</option>
      <option value="user">User</option>
      <option value="admin">Admin</option>
    </select>
  </div>
));

const Pagination = memo(({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-between items-center mt-6 text-sm text-gray-400">
            <p>Page <span className="font-semibold text-white">{currentPage}</span> of <span className="font-semibold text-white">{totalPages}</span></p>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 bg-gray-700/60 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                    aria-label="Go to previous page"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 bg-gray-700/60 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                    aria-label="Go to next page"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
});

const UserTableRow = memo(({ user, onRoleChange }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);

  const handleRoleSelect = (newRole) => {
    if (user.role !== newRole) {
        if (window.confirm(`Are you sure you want to change ${user.name}'s role to ${newRole}?`)) {
            onRoleChange(user._id, newRole);
        }
    }
    setMenuOpen(false);
  };
  
  return (
    <tr className="border-b border-gray-700/50 last:border-b-0 hover:bg-gray-700/20 transition-colors">
      <td className="p-4 align-middle">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-blue-300 font-bold">
                {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
                <div className="font-medium text-white">{user.name}</div>
                <div className="text-sm text-gray-400">{user.email}</div>
            </div>
        </div>
      </td>
      <td className="p-4 align-middle">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
        }`}>
            {user.role === 'admin' ? <Shield className="h-3 w-3 mr-1.5" /> : <User className="h-3 w-3 mr-1.5" />}
            {user.role}
        </span>
      </td>
      <td className="p-4 align-middle text-center">
        {user.is_verified ? (
          <CheckCircle className="h-5 w-5 text-green-400 inline-block" title="Verified"/>
        ) : (
          <XCircle className="h-5 w-5 text-yellow-400 inline-block" title="Not Verified"/>
        )}
      </td>
      <td className="p-4 align-middle text-right relative">
        <button onClick={() => setMenuOpen(!isMenuOpen)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full">
            <MoreHorizontal className="h-5 w-5" />
        </button>
        {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-10">
                <p className="px-4 pt-3 pb-2 text-xs text-gray-400 font-semibold">Change Role</p>
                <button onClick={() => handleRoleSelect('user')} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700/50">
                    <UserCheck className="h-4 w-4 text-blue-400"/> Make User
                </button>
                <button onClick={() => handleRoleSelect('admin')} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700/50">
                    <UserX className="h-4 w-4 text-purple-400"/> Make Admin
                </button>
            </div>
        )}
      </td>
    </tr>
  );
});

// --- MAIN COMPONENT ---

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', role: '' });
  const debouncedSearch = useDebounce(filters.search, 500);

  const fetchUsers = useCallback(async (page, currentFilters) => {
    setLoading(true);
    setError('');
    try {
      const data = await adminService.getUsers(page, currentFilters);
      setUsers(data.users || []);
      setPagination({
        page: data.page,
        totalPages: data.total_pages,
      });
    } catch (err) {
      setError(`Failed to fetch users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(currentPage, { ...filters, search: debouncedSearch });
  }, [currentPage, debouncedSearch, filters.role, fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      fetchUsers(currentPage, { ...filters, search: debouncedSearch });
    } catch (err) {
      setError(`Failed to update role: ${err.message}`);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700/50">
        <h2 className="text-3xl font-bold text-white mb-6 tracking-tight">User Management</h2>
        <FilterBar filters={filters} onFilterChange={handleFilterChange} />
        {error && (
          <div className="mt-4 bg-red-500/10 text-red-300 p-3 rounded-lg flex items-center gap-3"><AlertTriangle className="h-5 w-5"/>{error}</div>
        )}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-700/50">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">User</th>
                <th className="p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Role</th>
                <th className="p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider text-center">Verified</th>
                <th className="p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center p-16"><Loader className="h-10 w-10 animate-spin text-blue-400 mx-auto" /></td></tr>
              ) : users.length > 0 ? (
                <AnimatePresence>
                    {users.map(user => (
                        <motion.tr key={user._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <UserTableRow user={user} onRoleChange={handleRoleChange} />
                        </motion.tr>
                    ))}
                </AnimatePresence>
              ) : (
                <tr><td colSpan="4" className="text-center p-16 text-gray-400">No users found matching your criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {!loading && users.length > 0 && (
            <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={setCurrentPage} />
        )}
      </div>
    </motion.div>
  );
};

export default AdminUserManagement;


