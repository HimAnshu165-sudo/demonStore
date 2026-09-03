'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Plus, Edit3, Trash2, Star, X, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SavedAddress } from '@/types/admin';
import shared from '../shared.module.css';
import styles from './Addresses.module.css';

function loadAddresses(userId: string): SavedAddress[] {
  try {
    const raw = localStorage.getItem(`demonstore_addresses_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAddresses(userId: string, addresses: SavedAddress[]) {
  localStorage.setItem(`demonstore_addresses_${userId}`, JSON.stringify(addresses));
}

const EMPTY_FORM: Omit<SavedAddress, 'id' | 'isDefault'> = {
  label: '',
  fullName: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
};

export default function AddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const load = useCallback(() => {
    if (user) setAddresses(loadAddresses(user.id));
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const persist = (updated: SavedAddress[]) => {
    if (!user) return;
    setAddresses(updated);
    saveAddresses(user.id, updated);
  };

  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (addr: SavedAddress) => {
    setForm({
      label: addr.label,
      fullName: addr.fullName,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
    });
    setEditingId(addr.id);
    setFormError(null);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.fullName.trim() || !form.street.trim() || !form.city.trim() || !form.postalCode.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }
    setFormError(null);

    if (editingId) {
      // Update existing
      persist(addresses.map((a) => a.id === editingId ? { ...a, ...form } : a));
    } else {
      // Add new
      const newAddr: SavedAddress = {
        ...form,
        id: `addr_${Date.now()}`,
        isDefault: addresses.length === 0, // first address is auto-default
      };
      persist([...addresses, newAddr]);
    }
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    // If deleted was default, make first remaining default
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true;
    }
    persist(updated);
    setDeleteConfirm(null);
  };

  const setDefault = (id: string) => {
    persist(addresses.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  return (
    <div>
      <div className={shared.pageHeader}>
        <div className={shared.pageTagline}>
          <span className={shared.taglineDot} />
          INFINITY CASTLE // DELIVERY REGISTRY
        </div>
        <h1 className={shared.pageTitle}>SAVED ADDRESSES</h1>
        <p className={shared.pageSubtitle}>Manage your delivery locations for the Citadel.</p>
      </div>

      {/* Add button */}
      <div className={styles.topBar}>
        <button className={shared.btnPrimary} onClick={openAdd}>
          <Plus size={13} />
          ADD ADDRESS
        </button>
      </div>

      {/* Address form modal */}
      {showForm && (
        <div className={styles.formOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.formPanel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.formPanelHeader}>
              <span>{editingId ? 'EDIT ADDRESS' : 'NEW ADDRESS'}</span>
              <button onClick={() => setShowForm(false)} className={styles.closeBtn}><X size={16} /></button>
            </div>

            {formError && (
              <div className={shared.errorBanner}>
                <AlertCircle size={14} />
                {formError}
              </div>
            )}

            <div className={shared.formGrid}>
              <div className={shared.formGroup}>
                <label className={shared.label}>LABEL (e.g. HOME, OFFICE)</label>
                <input
                  className={shared.input}
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  placeholder="HOME"
                />
              </div>
              <div className={shared.formGroup}>
                <label className={shared.label}>FULL NAME *</label>
                <input
                  className={shared.input}
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  placeholder="Tanjiro Kamado"
                  required
                />
              </div>
              <div className={shared.formGroup}>
                <label className={shared.label}>PHONE</label>
                <input
                  className={shared.input}
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 XXXXX XXXXX"
                  type="tel"
                />
              </div>
              <div className={`${shared.formGroup} ${shared.formGroupFull}`}>
                <label className={shared.label}>STREET ADDRESS *</label>
                <input
                  className={shared.input}
                  value={form.street}
                  onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
                  placeholder="123 Castle Road"
                  required
                />
              </div>
              <div className={shared.formGroup}>
                <label className={shared.label}>CITY *</label>
                <input
                  className={shared.input}
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  placeholder="Mumbai"
                  required
                />
              </div>
              <div className={shared.formGroup}>
                <label className={shared.label}>STATE</label>
                <input
                  className={shared.input}
                  value={form.state}
                  onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                  placeholder="Maharashtra"
                />
              </div>
              <div className={shared.formGroup}>
                <label className={shared.label}>POSTAL CODE *</label>
                <input
                  className={shared.input}
                  value={form.postalCode}
                  onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
                  placeholder="400001"
                  required
                />
              </div>
              <div className={shared.formGroup}>
                <label className={shared.label}>COUNTRY</label>
                <input
                  className={shared.input}
                  value={form.country}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                  placeholder="India"
                />
              </div>
            </div>

            <div className={styles.formActions}>
              <button className={shared.btnPrimary} onClick={handleSave}>
                <Save size={13} />
                {editingId ? 'UPDATE ADDRESS' : 'SAVE ADDRESS'}
              </button>
              <button className={shared.btnSecondary} onClick={() => setShowForm(false)}>
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {addresses.length === 0 && !showForm && (
        <div className={shared.emptyState}>
          <div className={shared.emptyIcon}><MapPin size={48} /></div>
          <h2 className={shared.emptyTitle}>NO SAVED ADDRESSES</h2>
          <p className={shared.emptySubtitle}>
            Save your delivery locations for faster checkout through the Citadel.
          </p>
          <button className={shared.btnPrimary} onClick={openAdd}>
            <Plus size={13} />
            ADD YOUR FIRST ADDRESS
          </button>
        </div>
      )}

      {/* Address cards */}
      <div className={styles.addressGrid}>
        {addresses.map((addr) => (
          <div key={addr.id} className={`${styles.addressCard} ${addr.isDefault ? styles.addressCardDefault : ''}`}>
            {addr.isDefault && (
              <div className={styles.defaultBadge}>
                <Star size={10} fill="currentColor" />
                DEFAULT
              </div>
            )}

            {addr.label && (
              <div className={styles.addrLabel}>{addr.label}</div>
            )}
            <div className={styles.addrName}>{addr.fullName}</div>
            <div className={styles.addrLines}>
              {addr.street}<br />
              {addr.city}{addr.state ? `, ${addr.state}` : ''} — {addr.postalCode}<br />
              {addr.country}
              {addr.phone && <><br />{addr.phone}</>}
            </div>

            <div className={styles.addrActions}>
              {!addr.isDefault && (
                <button
                  className={`${shared.btnSecondary} ${styles.addrBtn}`}
                  onClick={() => setDefault(addr.id)}
                  title="Set as default"
                >
                  <Star size={12} />
                  SET DEFAULT
                </button>
              )}
              <button
                className={`${shared.btnSecondary} ${styles.addrBtn}`}
                onClick={() => openEdit(addr)}
              >
                <Edit3 size={12} />
                EDIT
              </button>
              {deleteConfirm === addr.id ? (
                <button
                  className={`${shared.btnDanger} ${styles.addrBtn}`}
                  onClick={() => handleDelete(addr.id)}
                >
                  CONFIRM DELETE
                </button>
              ) : (
                <button
                  className={`${shared.btnDanger} ${styles.addrBtn}`}
                  onClick={() => setDeleteConfirm(addr.id)}
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
