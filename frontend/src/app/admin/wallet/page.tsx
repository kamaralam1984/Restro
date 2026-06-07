'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

const GOLD = '#D4AF37';
const DARK_GOLD = '#B8960C';
const BG = '#0a0a0a';
const CARD_BG = '#111111';
const CARD_BG2 = '#161616';
const BORDER = '#2a2a2a';
const TEXT = '#e5e5e5';
const TEXT_DIM = '#888888';
const RED = '#e53e3e';
const GREEN = '#38a169';
const BLUE = '#3182ce';
const PURPLE = '#805ad5';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CustomerWallet {
  _id: string;
  userId: { _id: string; name: string; email: string };
  balance: number;
  totalCredited: number;
  totalDebited: number;
  lastTransaction?: string;
}

interface Transaction {
  _id: string;
  userId: { _id: string; name: string; email: string };
  type: 'credit' | 'debit';
  amount: number;
  source: 'cashback' | 'refund' | 'referral' | 'gift' | 'topup' | 'order_payment' | 'admin_adjustment';
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}

interface ReferralCodeItem {
  _id: string;
  userId: { _id: string; name: string; email: string };
  code: string;
  usageCount: number;
  maxUsage: number;
  rewardPerReferral: number;
  isActive: boolean;
  totalEarned: number;
}

interface ReferralStats {
  totalCodes: number;
  totalReferrals: number;
  totalRewardPaid: number;
  programEnabled: boolean;
  defaultReward: number;
  defaultMaxUsage: number;
}

interface TopReferrer {
  userId: { _id: string; name: string; email: string };
  referralCount: number;
  totalEarned: number;
}

interface AddCreditForm {
  amount: string;
  description: string;
  source: 'cashback' | 'gift' | 'admin_adjustment';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch { return iso; }
}

function fmtINR(amount: number) {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const SOURCE_COLORS: Record<string, string> = {
  cashback: GOLD,
  refund: RED,
  referral: BLUE,
  gift: PURPLE,
  topup: GREEN,
  order_payment: '#e67e22',
  admin_adjustment: '#718096',
};

const SOURCE_LABELS: Record<string, string> = {
  cashback: 'Cashback',
  refund: 'Refund',
  referral: 'Referral',
  gift: 'Gift',
  topup: 'Topup',
  order_payment: 'Order Payment',
  admin_adjustment: 'Admin Adj.',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{
      background: CARD_BG,
      border: `1px solid ${BORDER}`,
      borderRadius: 12,
      padding: '20px 24px',
      flex: 1,
      minWidth: 160,
    }}>
      <div style={{ color: TEXT_DIM, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ color: GOLD, fontSize: 24, fontWeight: 700 }}>{value}</div>
      {sub && <div style={{ color: TEXT_DIM, fontSize: 12, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span style={{
      display: 'inline-block',
      background: color + '22',
      color,
      border: `1px solid ${color}44`,
      borderRadius: 6,
      padding: '2px 10px',
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }}>
      {text}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WalletAdminPage() {
  const [activeTab, setActiveTab] = useState<'wallets' | 'transactions' | 'referral'>('wallets');

  // Wallets tab state
  const [wallets, setWallets] = useState<CustomerWallet[]>([]);
  const [walletsLoading, setWalletsLoading] = useState(true);
  const [walletsError, setWalletsError] = useState('');
  const [walletSearch, setWalletSearch] = useState('');
  const [addCreditTarget, setAddCreditTarget] = useState<CustomerWallet | null>(null);
  const [addCreditForm, setAddCreditForm] = useState<AddCreditForm>({ amount: '', description: '', source: 'cashback' });
  const [addCreditSaving, setAddCreditSaving] = useState(false);
  const [addCreditError, setAddCreditError] = useState('');
  const [bulkCashbackLoading, setBulkCashbackLoading] = useState(false);

  // Transactions tab state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [txError, setTxError] = useState('');
  const [txFilterType, setTxFilterType] = useState('');
  const [txFilterSource, setTxFilterSource] = useState('');
  const [txFilterFrom, setTxFilterFrom] = useState('');
  const [txFilterTo, setTxFilterTo] = useState('');
  const [txPage, setTxPage] = useState(1);
  const [txTotal, setTxTotal] = useState(0);
  const [txTotalCredits, setTxTotalCredits] = useState(0);
  const [txTotalDebits, setTxTotalDebits] = useState(0);

  // Referral tab state
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    totalCodes: 0,
    totalReferrals: 0,
    totalRewardPaid: 0,
    programEnabled: true,
    defaultReward: 50,
    defaultMaxUsage: -1,
  });
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([]);
  const [referralCodes, setReferralCodes] = useState<ReferralCodeItem[]>([]);
  const [referralLoading, setReferralLoading] = useState(true);
  const [referralError, setReferralError] = useState('');
  const [referralSettingsSaving, setReferralSettingsSaving] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') ?? '' : '';

  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  // ── Fetch wallets ────────────────────────────────────────────────────────────
  const fetchWallets = useCallback(async () => {
    setWalletsLoading(true);
    setWalletsError('');
    try {
      const res = await fetch(`${API_BASE}/api/wallet/admin/all`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) {
        setWallets(data.wallets ?? []);
      } else {
        setWalletsError(data.error ?? 'Failed to load wallets');
      }
    } catch {
      setWalletsError('Network error — could not reach server');
    } finally {
      setWalletsLoading(false);
    }
  }, [token]);

  // ── Fetch transactions ───────────────────────────────────────────────────────
  const fetchTransactions = useCallback(async () => {
    setTxLoading(true);
    setTxError('');
    try {
      const params = new URLSearchParams({ page: String(txPage), limit: '30' });
      if (txFilterType) params.set('type', txFilterType);
      if (txFilterSource) params.set('source', txFilterSource);
      if (txFilterFrom) params.set('from', txFilterFrom);
      if (txFilterTo) params.set('to', txFilterTo);

      const res = await fetch(`${API_BASE}/api/wallet/admin/transactions?${params}`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) {
        setTransactions(data.transactions ?? []);
        setTxTotal(data.pagination?.total ?? 0);
        setTxTotalCredits(data.summary?.totalCredits ?? 0);
        setTxTotalDebits(data.summary?.totalDebits ?? 0);
      } else {
        setTxError(data.error ?? 'Failed to load transactions');
      }
    } catch {
      setTxError('Network error — could not reach server');
    } finally {
      setTxLoading(false);
    }
  }, [token, txPage, txFilterType, txFilterSource, txFilterFrom, txFilterTo]);

  // ── Fetch referral data ──────────────────────────────────────────────────────
  const fetchReferralData = useCallback(async () => {
    setReferralLoading(true);
    setReferralError('');
    try {
      const res = await fetch(`${API_BASE}/api/wallet/admin/referral/stats`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) {
        setReferralStats(prev => ({ ...prev, ...data.stats }));
        setTopReferrers(data.topReferrers ?? []);
        setReferralCodes(data.codes ?? []);
      } else {
        setReferralError(data.error ?? 'Failed to load referral data');
      }
    } catch {
      setReferralError('Network error — could not reach server');
    } finally {
      setReferralLoading(false);
    }
  }, [token]);

  useEffect(() => { if (activeTab === 'wallets') fetchWallets(); }, [activeTab, fetchWallets]);
  useEffect(() => { if (activeTab === 'transactions') fetchTransactions(); }, [activeTab, fetchTransactions]);
  useEffect(() => { if (activeTab === 'referral') fetchReferralData(); }, [activeTab, fetchReferralData]);

  // ── Add credits ──────────────────────────────────────────────────────────────
  async function handleAddCredit() {
    if (!addCreditTarget) return;
    const amount = parseFloat(addCreditForm.amount);
    if (!amount || amount <= 0) return setAddCreditError('Enter a valid amount');
    if (!addCreditForm.description.trim()) return setAddCreditError('Description is required');

    setAddCreditSaving(true);
    setAddCreditError('');
    try {
      const res = await fetch(`${API_BASE}/api/wallet/topup`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          userId: addCreditTarget.userId._id,
          amount,
          description: addCreditForm.description,
          source: addCreditForm.source,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAddCreditTarget(null);
        fetchWallets();
      } else {
        setAddCreditError(data.error ?? 'Failed to add credits');
      }
    } catch {
      setAddCreditError('Network error');
    } finally {
      setAddCreditSaving(false);
    }
  }

  // ── Bulk cashback ─────────────────────────────────────────────────────────────
  async function handleBulkCashback() {
    setBulkCashbackLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/wallet/admin/bulk-cashback`, {
        method: 'POST',
        headers: authHeaders,
      });
      const data = await res.json();
      if (res.ok) {
        fetchWallets();
        alert(`Cashback given to ${data.count ?? 0} customers`);
      } else {
        alert(data.error ?? 'Failed to give cashback');
      }
    } catch {
      alert('Network error');
    } finally {
      setBulkCashbackLoading(false);
    }
  }

  // ── Referral settings save ────────────────────────────────────────────────────
  async function handleSaveReferralSettings() {
    setReferralSettingsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/wallet/admin/referral/settings`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          programEnabled: referralStats.programEnabled,
          defaultReward: referralStats.defaultReward,
          defaultMaxUsage: referralStats.defaultMaxUsage,
        }),
      });
      const data = await res.json();
      if (!res.ok) alert(data.error ?? 'Failed to save settings');
      else alert('Settings saved successfully');
    } catch {
      alert('Network error');
    } finally {
      setReferralSettingsSaving(false);
    }
  }

  // ── Filtered wallets ──────────────────────────────────────────────────────────
  const filteredWallets = wallets.filter(w => {
    const q = walletSearch.toLowerCase();
    if (!q) return true;
    return (
      w.userId.name.toLowerCase().includes(q) ||
      w.userId.email.toLowerCase().includes(q)
    );
  });

  const totalWalletBalance = wallets.reduce((s, w) => s + w.balance, 0);
  const totalCredited = wallets.reduce((s, w) => s + (w.totalCredited ?? 0), 0);
  const totalDebited = wallets.reduce((s, w) => s + (w.totalDebited ?? 0), 0);

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TEXT, fontFamily: "'Inter', sans-serif", padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: `linear-gradient(135deg, ${GOLD}, ${DARK_GOLD})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>
            💰
          </div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: TEXT }}>
            Wallet Management
          </h1>
        </div>
        <p style={{ margin: 0, color: TEXT_DIM, fontSize: 14 }}>
          Manage customer wallets, transactions, and referral programs
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: `1px solid ${BORDER}`, paddingBottom: 0 }}>
        {(['wallets', 'transactions', 'referral'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              color: activeTab === tab ? GOLD : TEXT_DIM,
              borderBottom: activeTab === tab ? `2px solid ${GOLD}` : '2px solid transparent',
              marginBottom: -1,
              transition: 'all 0.2s',
              textTransform: 'capitalize',
            }}
          >
            {tab === 'wallets' ? 'Customer Wallets' : tab === 'transactions' ? 'Transactions' : 'Referral Program'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ══ TAB 1: Customer Wallets ══ */}
        {activeTab === 'wallets' && (
          <motion.div key="wallets" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

            {/* Summary cards */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
              <StatCard label="Total Customers" value={String(wallets.length)} />
              <StatCard label="Total Wallet Balance" value={fmtINR(totalWalletBalance)} />
              <StatCard label="Total Credited" value={fmtINR(totalCredited)} />
              <StatCard label="Total Debited" value={fmtINR(totalDebited)} />
            </div>

            {/* Search + actions */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                value={walletSearch}
                onChange={e => setWalletSearch(e.target.value)}
                placeholder="Search by name or email..."
                style={{
                  flex: 1, minWidth: 240, background: CARD_BG, border: `1px solid ${BORDER}`,
                  borderRadius: 8, padding: '10px 14px', color: TEXT, fontSize: 14, outline: 'none',
                }}
              />
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleBulkCashback}
                disabled={bulkCashbackLoading}
                style={{
                  background: `linear-gradient(135deg, ${GOLD}, ${DARK_GOLD})`,
                  border: 'none', borderRadius: 8, padding: '10px 20px',
                  color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  opacity: bulkCashbackLoading ? 0.6 : 1,
                }}
              >
                {bulkCashbackLoading ? 'Processing...' : '+ Bulk Cashback (Today)'}
              </motion.button>
            </div>

            {/* Error */}
            {walletsError && (
              <div style={{ background: '#2d1a1a', border: `1px solid ${RED}`, borderRadius: 8, padding: '12px 16px', color: RED, marginBottom: 16, fontSize: 14 }}>
                {walletsError}
              </div>
            )}

            {/* Wallets table */}
            {walletsLoading ? (
              <div style={{ textAlign: 'center', padding: 60, color: TEXT_DIM }}>Loading wallets...</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                      {['Customer', 'Email', 'Balance', 'Total Credited', 'Total Debited', 'Last Transaction', 'Action'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: TEXT_DIM, fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWallets.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: TEXT_DIM }}>
                          {walletSearch ? 'No customers match your search' : 'No wallet data found'}
                        </td>
                      </tr>
                    ) : filteredWallets.map((w, i) => (
                      <motion.tr
                        key={w._id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? 'transparent' : CARD_BG2 }}
                      >
                        <td style={{ padding: '12px 14px', fontWeight: 600 }}>{w.userId.name}</td>
                        <td style={{ padding: '12px 14px', color: TEXT_DIM }}>{w.userId.email}</td>
                        <td style={{ padding: '12px 14px', color: GOLD, fontWeight: 700 }}>{fmtINR(w.balance)}</td>
                        <td style={{ padding: '12px 14px', color: GREEN }}>{fmtINR(w.totalCredited ?? 0)}</td>
                        <td style={{ padding: '12px 14px', color: RED }}>{fmtINR(w.totalDebited ?? 0)}</td>
                        <td style={{ padding: '12px 14px', color: TEXT_DIM, fontSize: 12 }}>
                          {w.lastTransaction ? fmtDate(w.lastTransaction) : '—'}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setAddCreditTarget(w);
                              setAddCreditForm({ amount: '', description: '', source: 'cashback' });
                              setAddCreditError('');
                            }}
                            style={{
                              background: 'transparent', border: `1px solid ${GOLD}`, borderRadius: 6,
                              padding: '5px 14px', color: GOLD, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            }}
                          >
                            + Add Credits
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* ══ TAB 2: Transactions ══ */}
        {activeTab === 'transactions' && (
          <motion.div key="transactions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

            {/* Summary */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
              <StatCard label="Total Transactions" value={String(txTotal)} />
              <StatCard label="Total Credits" value={fmtINR(txTotalCredits)} sub="Money added to wallets" />
              <StatCard label="Total Debits" value={fmtINR(txTotalDebits)} sub="Money spent from wallets" />
              <StatCard label="Net Flow" value={fmtINR(txTotalCredits - txTotalDebits)} />
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                value={txFilterType}
                onChange={e => { setTxFilterType(e.target.value); setTxPage(1); }}
                style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '9px 12px', color: TEXT, fontSize: 13, cursor: 'pointer' }}
              >
                <option value="">All Types</option>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
              </select>
              <select
                value={txFilterSource}
                onChange={e => { setTxFilterSource(e.target.value); setTxPage(1); }}
                style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '9px 12px', color: TEXT, fontSize: 13, cursor: 'pointer' }}
              >
                <option value="">All Sources</option>
                <option value="cashback">Cashback</option>
                <option value="refund">Refund</option>
                <option value="referral">Referral</option>
                <option value="gift">Gift</option>
                <option value="topup">Topup</option>
                <option value="order_payment">Order Payment</option>
                <option value="admin_adjustment">Admin Adjustment</option>
              </select>
              <input
                type="date" value={txFilterFrom}
                onChange={e => { setTxFilterFrom(e.target.value); setTxPage(1); }}
                style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '9px 12px', color: TEXT, fontSize: 13 }}
              />
              <span style={{ color: TEXT_DIM, fontSize: 13 }}>to</span>
              <input
                type="date" value={txFilterTo}
                onChange={e => { setTxFilterTo(e.target.value); setTxPage(1); }}
                style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '9px 12px', color: TEXT, fontSize: 13 }}
              />
              {(txFilterType || txFilterSource || txFilterFrom || txFilterTo) && (
                <button
                  onClick={() => { setTxFilterType(''); setTxFilterSource(''); setTxFilterFrom(''); setTxFilterTo(''); setTxPage(1); }}
                  style={{ background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '9px 14px', color: TEXT_DIM, fontSize: 12, cursor: 'pointer' }}
                >
                  Clear Filters
                </button>
              )}
            </div>

            {txError && (
              <div style={{ background: '#2d1a1a', border: `1px solid ${RED}`, borderRadius: 8, padding: '12px 16px', color: RED, marginBottom: 16, fontSize: 14 }}>
                {txError}
              </div>
            )}

            {txLoading ? (
              <div style={{ textAlign: 'center', padding: 60, color: TEXT_DIM }}>Loading transactions...</div>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                        {['Customer', 'Type', 'Amount', 'Source', 'Description', 'Balance After', 'Date'].map(h => (
                          <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: TEXT_DIM, fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: TEXT_DIM }}>
                            No transactions found
                          </td>
                        </tr>
                      ) : transactions.map((tx, i) => (
                        <motion.tr
                          key={tx._id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.02 }}
                          style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? 'transparent' : CARD_BG2 }}
                        >
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 600 }}>{tx.userId?.name ?? '—'}</div>
                            <div style={{ color: TEXT_DIM, fontSize: 12 }}>{tx.userId?.email ?? ''}</div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <Badge text={tx.type} color={tx.type === 'credit' ? GREEN : RED} />
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: tx.type === 'credit' ? GREEN : RED }}>
                            {tx.type === 'credit' ? '+' : '-'}{fmtINR(tx.amount)}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <Badge text={SOURCE_LABELS[tx.source] ?? tx.source} color={SOURCE_COLORS[tx.source] ?? TEXT_DIM} />
                          </td>
                          <td style={{ padding: '12px 14px', color: TEXT_DIM, maxWidth: 220 }}>
                            <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {tx.description}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', color: GOLD }}>{fmtINR(tx.balanceAfter)}</td>
                          <td style={{ padding: '12px 14px', color: TEXT_DIM, fontSize: 12 }}>{fmt(tx.createdAt)}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {txTotal > 30 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'center', alignItems: 'center' }}>
                    <button
                      onClick={() => setTxPage(p => Math.max(1, p - 1))}
                      disabled={txPage === 1}
                      style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '6px 14px', color: TEXT, cursor: 'pointer', opacity: txPage === 1 ? 0.4 : 1 }}
                    >
                      Prev
                    </button>
                    <span style={{ color: TEXT_DIM, fontSize: 13 }}>Page {txPage} of {Math.ceil(txTotal / 30)}</span>
                    <button
                      onClick={() => setTxPage(p => p + 1)}
                      disabled={txPage >= Math.ceil(txTotal / 30)}
                      style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '6px 14px', color: TEXT, cursor: 'pointer', opacity: txPage >= Math.ceil(txTotal / 30) ? 0.4 : 1 }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* ══ TAB 3: Referral Program ══ */}
        {activeTab === 'referral' && (
          <motion.div key="referral" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

            {referralError && (
              <div style={{ background: '#2d1a1a', border: `1px solid ${RED}`, borderRadius: 8, padding: '12px 16px', color: RED, marginBottom: 20, fontSize: 14 }}>
                {referralError}
              </div>
            )}

            {referralLoading ? (
              <div style={{ textAlign: 'center', padding: 60, color: TEXT_DIM }}>Loading referral data...</div>
            ) : (
              <>
                {/* Stats */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
                  <StatCard label="Total Codes Generated" value={String(referralStats.totalCodes)} />
                  <StatCard label="Total Referrals" value={String(referralStats.totalReferrals)} />
                  <StatCard label="Total Reward Paid" value={fmtINR(referralStats.totalRewardPaid)} />
                </div>

                {/* Program settings */}
                <div style={{
                  background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12,
                  padding: 24, marginBottom: 28,
                }}>
                  <h3 style={{ margin: '0 0 20px', color: GOLD, fontSize: 16, fontWeight: 700 }}>
                    Program Settings
                  </h3>

                  {/* Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                    <span style={{ color: TEXT, fontSize: 14, fontWeight: 600, minWidth: 180 }}>Referral Program</span>
                    <div
                      onClick={() => setReferralStats(prev => ({ ...prev, programEnabled: !prev.programEnabled }))}
                      style={{
                        width: 48, height: 26, borderRadius: 13, cursor: 'pointer', position: 'relative',
                        background: referralStats.programEnabled ? GOLD : BORDER,
                        transition: 'background 0.25s',
                      }}
                    >
                      <motion.div
                        animate={{ x: referralStats.programEnabled ? 24 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        style={{
                          position: 'absolute', top: 3, width: 20, height: 20,
                          borderRadius: '50%', background: '#fff',
                        }}
                      />
                    </div>
                    <span style={{ color: referralStats.programEnabled ? GREEN : TEXT_DIM, fontSize: 13, fontWeight: 600 }}>
                      {referralStats.programEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
                    <div>
                      <label style={{ color: TEXT_DIM, fontSize: 12, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Reward Per Referral (₹)
                      </label>
                      <input
                        type="number" min="0" value={referralStats.defaultReward}
                        onChange={e => setReferralStats(prev => ({ ...prev, defaultReward: parseFloat(e.target.value) || 0 }))}
                        style={{
                          background: BG, border: `1px solid ${BORDER}`, borderRadius: 8,
                          padding: '10px 14px', color: GOLD, fontSize: 16, fontWeight: 700, width: 140, outline: 'none',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ color: TEXT_DIM, fontSize: 12, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Max Usage Per Code (-1 = Unlimited)
                      </label>
                      <input
                        type="number" min="-1" value={referralStats.defaultMaxUsage}
                        onChange={e => setReferralStats(prev => ({ ...prev, defaultMaxUsage: parseInt(e.target.value) ?? -1 }))}
                        style={{
                          background: BG, border: `1px solid ${BORDER}`, borderRadius: 8,
                          padding: '10px 14px', color: TEXT, fontSize: 16, fontWeight: 700, width: 140, outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={handleSaveReferralSettings}
                    disabled={referralSettingsSaving}
                    style={{
                      background: `linear-gradient(135deg, ${GOLD}, ${DARK_GOLD})`,
                      border: 'none', borderRadius: 8, padding: '10px 24px',
                      color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                      opacity: referralSettingsSaving ? 0.6 : 1,
                    }}
                  >
                    {referralSettingsSaving ? 'Saving...' : 'Save Settings'}
                  </motion.button>
                </div>

                {/* Top referrers */}
                <div style={{ marginBottom: 28 }}>
                  <h3 style={{ margin: '0 0 16px', color: TEXT, fontSize: 16, fontWeight: 700 }}>
                    Top Referrers
                  </h3>
                  {topReferrers.length === 0 ? (
                    <div style={{ color: TEXT_DIM, fontSize: 14, padding: '20px 0' }}>No referrals yet</div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                            {['#', 'Name', 'Email', 'Referrals', 'Total Earned'].map(h => (
                              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: TEXT_DIM, fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {topReferrers.map((r, i) => (
                            <motion.tr
                              key={r.userId._id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? 'transparent' : CARD_BG2 }}
                            >
                              <td style={{ padding: '12px 14px' }}>
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                  width: 28, height: 28, borderRadius: '50%',
                                  background: i < 3 ? `${GOLD}22` : CARD_BG,
                                  color: i < 3 ? GOLD : TEXT_DIM,
                                  fontWeight: 700, fontSize: 13,
                                }}>
                                  {i + 1}
                                </span>
                              </td>
                              <td style={{ padding: '12px 14px', fontWeight: 600 }}>{r.userId.name}</td>
                              <td style={{ padding: '12px 14px', color: TEXT_DIM }}>{r.userId.email}</td>
                              <td style={{ padding: '12px 14px' }}>
                                <Badge text={String(r.referralCount)} color={BLUE} />
                              </td>
                              <td style={{ padding: '12px 14px', color: GOLD, fontWeight: 700 }}>{fmtINR(r.totalEarned)}</td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* All Referral Codes */}
                <div>
                  <h3 style={{ margin: '0 0 16px', color: TEXT, fontSize: 16, fontWeight: 700 }}>
                    All Referral Codes
                  </h3>
                  {referralCodes.length === 0 ? (
                    <div style={{ color: TEXT_DIM, fontSize: 14, padding: '20px 0' }}>No codes generated yet</div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                            {['Code', 'Owner', 'Usage / Max', 'Reward', 'Total Earned', 'Status'].map(h => (
                              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: TEXT_DIM, fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {referralCodes.map((rc, i) => (
                            <motion.tr
                              key={rc._id}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.03 }}
                              style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? 'transparent' : CARD_BG2 }}
                            >
                              <td style={{ padding: '12px 14px' }}>
                                <span style={{
                                  fontFamily: 'monospace', fontSize: 14, fontWeight: 700,
                                  background: `${GOLD}15`, color: GOLD,
                                  padding: '3px 10px', borderRadius: 6,
                                  border: `1px solid ${GOLD}33`,
                                }}>
                                  {rc.code}
                                </span>
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                <div style={{ fontWeight: 600 }}>{rc.userId.name}</div>
                                <div style={{ color: TEXT_DIM, fontSize: 12 }}>{rc.userId.email}</div>
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                <span style={{ color: TEXT }}>{rc.usageCount}</span>
                                <span style={{ color: TEXT_DIM }}> / </span>
                                <span style={{ color: TEXT_DIM }}>{rc.maxUsage === -1 ? '∞' : rc.maxUsage}</span>
                              </td>
                              <td style={{ padding: '12px 14px', color: GOLD }}>{fmtINR(rc.rewardPerReferral)}</td>
                              <td style={{ padding: '12px 14px', color: GREEN, fontWeight: 600 }}>{fmtINR(rc.totalEarned ?? 0)}</td>
                              <td style={{ padding: '12px 14px' }}>
                                <Badge text={rc.isActive ? 'Active' : 'Inactive'} color={rc.isActive ? GREEN : TEXT_DIM} />
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ Add Credits Modal ══ */}
      <AnimatePresence>
        {addCreditTarget && (
          <motion.div
            key="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000, padding: 20,
            }}
            onClick={e => { if (e.target === e.currentTarget) setAddCreditTarget(null); }}
          >
            <motion.div
              key="modal-box"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              style={{
                background: CARD_BG, border: `1px solid ${BORDER}`,
                borderRadius: 16, padding: 32, width: '100%', maxWidth: 440,
                boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px ${GOLD}22`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: TEXT }}>Add Credits</h3>
                <button
                  onClick={() => setAddCreditTarget(null)}
                  style={{ background: 'none', border: 'none', color: TEXT_DIM, fontSize: 20, cursor: 'pointer', lineHeight: 1 }}
                >
                  ×
                </button>
              </div>

              {/* Customer info */}
              <div style={{
                background: BG, border: `1px solid ${BORDER}`, borderRadius: 10,
                padding: '12px 16px', marginBottom: 20,
              }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{addCreditTarget.userId.name}</div>
                <div style={{ color: TEXT_DIM, fontSize: 13 }}>{addCreditTarget.userId.email}</div>
                <div style={{ marginTop: 6, color: GOLD, fontWeight: 700, fontSize: 16 }}>
                  Current Balance: {fmtINR(addCreditTarget.balance)}
                </div>
              </div>

              {/* Amount */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: TEXT_DIM, fontSize: 12, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Amount (₹)
                </label>
                <input
                  type="number" min="1" placeholder="0.00"
                  value={addCreditForm.amount}
                  onChange={e => setAddCreditForm(f => ({ ...f, amount: e.target.value }))}
                  style={{
                    width: '100%', background: BG, border: `1px solid ${BORDER}`,
                    borderRadius: 8, padding: '11px 14px', color: GOLD, fontSize: 18,
                    fontWeight: 700, outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Source */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: TEXT_DIM, fontSize: 12, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Credit Type
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(['cashback', 'gift', 'admin_adjustment'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setAddCreditForm(f => ({ ...f, source: s }))}
                      style={{
                        padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                        border: `1px solid ${addCreditForm.source === s ? SOURCE_COLORS[s] : BORDER}`,
                        background: addCreditForm.source === s ? `${SOURCE_COLORS[s]}22` : 'transparent',
                        color: addCreditForm.source === s ? SOURCE_COLORS[s] : TEXT_DIM,
                        transition: 'all 0.15s',
                      }}
                    >
                      {SOURCE_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ color: TEXT_DIM, fontSize: 12, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Description
                </label>
                <input
                  placeholder="e.g. Festival cashback, Birthday gift..."
                  value={addCreditForm.description}
                  onChange={e => setAddCreditForm(f => ({ ...f, description: e.target.value }))}
                  style={{
                    width: '100%', background: BG, border: `1px solid ${BORDER}`,
                    borderRadius: 8, padding: '11px 14px', color: TEXT, fontSize: 14,
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              {addCreditError && (
                <div style={{ background: '#2d1a1a', border: `1px solid ${RED}33`, borderRadius: 8, padding: '10px 14px', color: RED, fontSize: 13, marginBottom: 16 }}>
                  {addCreditError}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setAddCreditTarget(null)}
                  style={{
                    flex: 1, background: 'transparent', border: `1px solid ${BORDER}`,
                    borderRadius: 8, padding: '11px', color: TEXT_DIM, fontSize: 14, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleAddCredit}
                  disabled={addCreditSaving}
                  style={{
                    flex: 2, background: `linear-gradient(135deg, ${GOLD}, ${DARK_GOLD})`,
                    border: 'none', borderRadius: 8, padding: '11px',
                    color: '#000', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    opacity: addCreditSaving ? 0.6 : 1,
                  }}
                >
                  {addCreditSaving ? 'Adding...' : `Add Credits →`}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
