'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Shield, Bell, Check, Save } from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import { AdminSettings } from '@/types/admin';
import styles from './Settings.module.css';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    adminApi.getSettings().then(setSettings);
  }, []);

  if (!settings) {
    return <div style={{ color: '#8a8594', padding: '2rem' }}>Loading citadel parameters...</div>;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);

    try {
      const updated = await adminApi.updateSettings(settings);
      setSettings(updated);
      setSuccessMsg('Citadel configuration parameters securely updated in memory node.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headingWrapper}>
        <h2 className={styles.pageHeading}>CITADEL CONFIGURATION & SETTINGS</h2>
        <p className={styles.pageSub}>Adjust inventory alerts, currency formatting, dispatch limits, and security thresholds.</p>
      </div>

      {successMsg && (
        <div className={styles.successBanner}>
          <Check size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Store Parameters */}
        <div className={styles.settingsCard}>
          <div className={styles.cardTitle}>
            <Settings size={16} color="#e71d36" />
            <span>COMMERCE & INVENTORY SPECIFICATION</span>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>CITADEL STORE NAME</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>OFFICIAL CONCIERGE EMAIL</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>PRIMARY CURRENCY</label>
              <input
                type="text"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>LOW INVENTORY ALERT THRESHOLD</label>
              <input
                type="number"
                min={1}
                max={50}
                value={settings.lowStockThreshold}
                onChange={(e) => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) })}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>GST / VAT TAX RATE (%)</label>
              <input
                type="number"
                min={0}
                max={40}
                value={settings.taxRate}
                onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>FREE COMPLIMENTARY DISPATCH THRESHOLD (₹)</label>
              <input
                type="number"
                min={0}
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                className={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className={styles.settingsCard}>
          <div className={styles.cardTitle}>
            <Bell size={16} color="#e71d36" />
            <span>DISPATCH & INVENTORY ALERTS</span>
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleMeta}>
              <span className={styles.toggleTitle}>Order Notification Dispatches</span>
              <span className={styles.toggleDesc}>
                Trigger real-time notifications to the citadel administrative desk upon order placement.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.orderNotificationEmail}
              onChange={(e) => setSettings({ ...settings, orderNotificationEmail: e.target.checked })}
              className={styles.checkbox}
            />
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleMeta}>
              <span className={styles.toggleTitle}>Low Stock Telemetry Warnings</span>
              <span className={styles.toggleDesc}>
                Flag archive pieces that reach the minimum critical reserve threshold.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.inventoryAlerts}
              onChange={(e) => setSettings({ ...settings, inventoryAlerts: e.target.checked })}
              className={styles.checkbox}
            />
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleMeta}>
              <span className={styles.toggleTitle}>Citadel Maintenance Mode</span>
              <span className={styles.toggleDesc}>
                Restrict customer store browsing during critical collection drop overhauls.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              className={styles.checkbox}
            />
          </div>
        </div>

        {/* Security & Webhook Parameters */}
        <div className={styles.settingsCard}>
          <div className={styles.cardTitle}>
            <Shield size={16} color="#e71d36" />
            <span>SECURITY CIPHERS & API HOOKS</span>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>SESSION TIMEOUT (MINUTES)</label>
              <input
                type="number"
                min={15}
                max={720}
                value={settings.sessionTimeoutMinutes}
                onChange={(e) => setSettings({ ...settings, sessionTimeoutMinutes: Number(e.target.value) })}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>CORS ALLOWED ORIGINS</label>
              <input
                type="text"
                value={settings.corsAllowedOrigins}
                onChange={(e) => setSettings({ ...settings, corsAllowedOrigins: e.target.value })}
                className={styles.input}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>ORDER DISPATCH WEBHOOK URL</label>
              <input
                type="url"
                value={settings.webhookUrl || ''}
                onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                placeholder="https://api.demonstore.luxury/webhooks/orders"
                className={styles.input}
              />
            </div>
          </div>
        </div>

        <button type="submit" disabled={isSaving} className={styles.saveBtn}>
          <Save size={15} />
          <span>{isSaving ? 'UPDATING CITADEL PARAMETERS...' : 'SAVE CONFIGURATION'}</span>
        </button>
      </form>
    </div>
  );
}
