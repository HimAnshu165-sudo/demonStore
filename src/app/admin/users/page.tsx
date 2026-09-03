'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Search, RefreshCw, Eye, Shield, UserX, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import { AdminUser, UserRole, UserStatus } from '@/types/admin';
import { TableSkeleton } from '@/components/admin/AdminSkeletons';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminErrorState } from '@/components/admin/AdminErrorState';
import { UserDetailsModal } from '@/components/admin/modals/UserDetailsModal';
import styles from './Users.module.css';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal inspection
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const res = await adminApi.getUsers({
        page: currentPage,
        limit: 8,
        search: searchQuery,
        role: roleFilter,
        status: statusFilter,
      });

      setUsers(res.data);
      setTotalUsers(res.total);
      setTotalPages(res.totalPages);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to retrieve disciple registry';
      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentPage, searchQuery, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateRole = async (id: string, role: UserRole) => {
    await adminApi.updateUserRole(id, role);
    fetchUsers(true);
  };

  const handleUpdateStatus = async (id: string, status: UserStatus) => {
    await adminApi.updateUserStatus(id, status);
    fetchUsers(true);
  };

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return styles.roleAdmin;
      case 'moderator':
        return styles.roleModerator;
      default:
        return styles.roleCustomer;
    }
  };

  const getStatusBadgeClass = (status: UserStatus) => {
    switch (status) {
      case 'active':
        return styles.statusActive;
      case 'suspended':
        return styles.statusSuspended;
      default:
        return styles.statusPending;
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Controls: Search, Filters, Refresh */}
      <div className={styles.controlsBar}>
        <div className={styles.searchWrapper}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search disciples by name, email, or rank..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filtersGroup}>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as UserRole | 'all');
              setCurrentPage(1);
            }}
            className={styles.select}
          >
            <option value="all">All Roles</option>
            <option value="customer">Customer</option>
            <option value="admin">Supreme Administrator</option>
            <option value="moderator">Moderator</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as UserStatus | 'all');
              setCurrentPage(1);
            }}
            className={styles.select}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>

          <button
            onClick={() => fetchUsers(true)}
            disabled={isRefreshing}
            className={styles.refreshBtn}
            title="Refresh directory"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span>SYNC</span>
          </button>
        </div>
      </div>

      {/* Main Table or Loading/Empty States */}
      {isLoading ? (
        <TableSkeleton rows={7} columns={7} />
      ) : error ? (
        <AdminErrorState message={error} onRetry={() => fetchUsers()} isRetrying={isRefreshing} />
      ) : users.length === 0 ? (
        <AdminEmptyState
          title="NO DISCIPLES FOUND"
          description="No user records matched your current query or filter criteria."
          kanji="無人"
          actionLabel="RESET FILTERS"
          onAction={() => {
            setSearchQuery('');
            setRoleFilter('all');
            setStatusFilter('all');
          }}
        />
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.usersTable}>
              <thead>
                <tr>
                  <th>DISCIPLE</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                  <th>STATUS</th>
                  <th>REGISTRATION</th>
                  <th>PRESENCE</th>
                  <th>ORDERS</th>
                  <th>TOTAL SPENT</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className={styles.userCell}>
                        <Image
                          src={u.avatar || '/assets/castle/01-entrance.png'}
                          alt={u.name}
                          width={36}
                          height={36}
                          className={styles.userAvatar}
                        />
                        <div>
                          <div className={styles.userName}>{u.name}</div>
                          <div className={styles.userTitle}>{u.japaneseTitle || 'Disciple'}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ color: '#b5b0c0' }}>{u.email}</td>

                    <td>
                      <span className={`${styles.roleBadge} ${getRoleBadgeClass(u.role)}`}>
                        {u.role === 'admin' ? 'Administrator' : u.role}
                      </span>
                    </td>

                    <td>
                      <span className={`${styles.statusBadge} ${getStatusBadgeClass(u.status)}`}>
                        {u.status}
                      </span>
                    </td>

                    <td style={{ color: '#8a8594', fontSize: '0.74rem' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    <td>
                      <div className={styles.presenceBeacon}>
                        <span
                          className={`${styles.presenceDot} ${u.isOnline ? styles.dotOnline : styles.dotOffline}`}
                        />
                        <span style={{ color: u.isOnline ? '#2ecc71' : '#8a8594' }}>
                          {u.isOnline ? 'Online' : u.lastSeen || 'Offline'}
                        </span>
                      </div>
                    </td>

                    <td style={{ fontWeight: 600 }}>{u.ordersCount}</td>

                    <td style={{ color: '#ffffff', fontFamily: 'Cinzel, serif', fontWeight: 600 }}>
                      ₹{u.totalSpent.toLocaleString('en-IN')}
                    </td>

                    <td>
                      <div className={styles.actionsCell}>
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setIsModalOpen(true);
                          }}
                          className={styles.inspectBtn}
                          title="Inspect disciple file"
                        >
                          <Eye size={12} />
                          <span>DETAILS</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className={styles.paginationBar}>
            <div>
              Showing {users.length} of {totalUsers} registered disciples
            </div>

            <div className={styles.pageControls}>
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={styles.pageBtn}
              >
                <ChevronLeft size={14} />
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={styles.pageBtn}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        onUpdateRole={handleUpdateRole}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
