'use client';

import React, { useState, useEffect } from 'react';
import { User, Edit3, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { adminApi } from '@/services/adminApi';
import shared from '../shared.module.css';
import styles from './Profile.module.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleCancel = () => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setIsEditing(false);
    setStatus('idle');
  };

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) {
      setStatus('error');
      setStatusMsg('Name cannot be empty.');
      return;
    }

    setIsSaving(true);
    setStatus('idle');
    try {
      await adminApi.updateUser(user.id, { name: name.trim(), phone: phone.trim() });
      setStatus('success');
      setStatusMsg('Profile updated successfully.');
      setIsEditing(false);
    } catch (e: unknown) {
      setStatus('error');
      setStatusMsg(e instanceof Error ? e.message : 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  return (
    <div>
      {/* Header */}
      <div className={shared.pageHeader}>
        <div className={shared.pageTagline}>
          <span className={shared.taglineDot} />
          INFINITY CASTLE // DISCIPLE REGISTRY
        </div>
        <h1 className={shared.pageTitle}>PROFILE</h1>
        <p className={shared.pageSubtitle}>Your identity within the Infinity Castle archive.</p>
      </div>

      {/* Banners */}
      {status === 'success' && (
        <div className={shared.successBanner}>
          <CheckCircle size={15} />
          {statusMsg}
        </div>
      )}
      {status === 'error' && (
        <div className={shared.errorBanner}>
          <AlertCircle size={15} />
          {statusMsg}
        </div>
      )}

      {/* Profile Card */}
      <div className={styles.profileCard}>
        {/* Avatar + Identity Block */}
        <div className={styles.identityBlock}>
          <div className={styles.avatarCircle}>
            <User size={36} />
          </div>
          <div>
            <div className={styles.identityName}>{user?.name || '—'}</div>
            <div className={styles.identityTitle}>
              {user?.japaneseTitle || '門弟 // REGISTERED DISCIPLE'}
            </div>
            <div className={styles.identityMeta}>
              MEMBER SINCE {memberSince}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{user?.ordersCount ?? 0}</div>
            <div className={styles.statLabel}>TOTAL ORDERS</div>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <div className={styles.statValue}>
              ₹{(user?.totalSpent ?? 0).toLocaleString('en-IN')}
            </div>
            <div className={styles.statLabel}>TOTAL SPENT</div>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <div className={styles.statValue}>{user?.status?.toUpperCase() || 'ACTIVE'}</div>
            <div className={styles.statLabel}>STATUS</div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className={shared.card} style={{ marginTop: '1.5rem' }}>
        <div className={styles.formHeader}>
          <h2 className={styles.sectionTitle}>ACCOUNT DETAILS</h2>
          {!isEditing && (
            <button
              className={shared.btnSecondary}
              onClick={() => setIsEditing(true)}
            >
              <Edit3 size={13} />
              EDIT PROFILE
            </button>
          )}
        </div>

        <div className={shared.formGrid}>
          {/* Name */}
          <div className={shared.formGroup}>
            <label className={shared.label}>FULL NAME</label>
            <input
              className={`${shared.input} ${!isEditing ? shared.inputReadOnly : ''}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={!isEditing}
              placeholder="Your slayer name"
            />
          </div>

          {/* Email — always read-only */}
          <div className={shared.formGroup}>
            <label className={shared.label}>EMAIL ADDRESS</label>
            <input
              className={`${shared.input} ${shared.inputReadOnly}`}
              value={user?.email || ''}
              readOnly
              placeholder="—"
              title="Email cannot be changed"
            />
          </div>

          {/* Phone */}
          <div className={shared.formGroup}>
            <label className={shared.label}>PHONE NUMBER</label>
            <input
              className={`${shared.input} ${!isEditing ? shared.inputReadOnly : ''}`}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              readOnly={!isEditing}
              placeholder="+91 XXXXX XXXXX"
              type="tel"
            />
          </div>

          {/* Role — read-only */}
          <div className={shared.formGroup}>
            <label className={shared.label}>ACCOUNT ROLE</label>
            <input
              className={`${shared.input} ${shared.inputReadOnly}`}
              value={user?.role === 'customer' ? 'CITADEL DISCIPLE' : user?.role?.toUpperCase() || '—'}
              readOnly
            />
          </div>
        </div>

        {isEditing && (
          <div className={styles.formActions}>
            <button
              className={shared.btnPrimary}
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save size={13} />
              {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
            </button>
            <button
              className={shared.btnSecondary}
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X size={13} />
              CANCEL
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
