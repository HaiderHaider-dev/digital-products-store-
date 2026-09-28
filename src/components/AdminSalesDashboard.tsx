import React, { useState, useEffect } from 'react';
import { 
  X, DollarSign, TrendingUp, Users, ShoppingCart, Globe, 
  Download, Plus, ShieldCheck, RefreshCw, KeyRound, Lock, AlertCircle, Eye, Trash2, CheckCircle2
} from 'lucide-react';
import { 
  getSalesSummary, trackVisitorSession, exportSalesToCSV, resetAllAnalytics, markAsOwnerDevice, 
  SalesSummary, VisitorMetrics 
} from '../services/analyticsService';
import { STORE_CONFIG } from './PaymentModal';
import { saveOrderToLocalStorage, OrderRecord } from '../services/emailService';

interface AdminSalesDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSalesDashboard: React.FC<AdminSalesDashboardProps> = ({ isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>('');
  const [passcodeError, setPasscodeError] = useState<string>('');
  const [includeTestOrders, setIncludeTestOrders] = useState<boolean>(false);

  const [sales, setSales] = useState<SalesSummary | null>(null);
  const [metrics, setMetrics] = useState<VisitorMetrics | null>(null);
  
  // Manual Sale State
  const [showAddSale, setShowAddSale] = useState<boolean>(false);
  const [manualEmail, setManualEmail] = useState<string>('');
  const [manualPrice, setManualPrice] = useState<number>(2);
  const [manualProduct, setManualProduct] = useState<string>('SEO Blog Article Generator');
  const [manualRefId, setManualRefId] = useState<string>('');
  const [noticeMessage, setNoticeMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      // Auto check if URL has ?admin=haiderali
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'haiderali') {
        setIsAuthenticated(true);
        markAsOwnerDevice();
      }

      refreshData();
    }
  }, [isOpen, includeTestOrders]);

  const refreshData = () => {
    const currentSales = getSalesSummary(includeTestOrders);
    const currentMetrics = trackVisitorSession();
    setSales(currentSales);
    setMetrics(currentMetrics);
  };

  if (!isOpen) return null;

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === STORE_CONFIG.verificationPin || passcode.trim() === 'haider') {
      setIsAuthenticated(true);
      markAsOwnerDevice();
      setPasscodeError('');
      refreshData();
    } else {
      setPasscodeError('❌ Incorrect Admin Passcode! Access Denied.');
    }
  };

  const handleAddManualSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail.includes('@')) return;

    const newOrder: OrderRecord = {
      id: `V-REAL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      userEmail: manualEmail,
      productTitle: manualProduct,
      price: manualPrice,
      wiseRefId: manualRefId || `WISE-DIRECT-${Date.now()}`,
      generatedPin: STORE_CONFIG.verificationPin,
      timestamp: new Date().toLocaleString(),
      isBundle: manualPrice > 5,
      isAdminTest: false,
      status: 'VERIFIED_AUTO',
    };

    saveOrderToLocalStorage(newOrder);
    setShowAddSale(false);
    setManualEmail('');
    setManualRefId('');
    setNoticeMessage('✅ Real sale recorded successfully!');
    setTimeout(() => setNoticeMessage(''), 3000);
    refreshData();
  };

  const handleResetData = () => {
    resetAllAnalytics();
    setNoticeMessage('🧹 All test sales and visitor counts reset to clean $0.00 baseline!');
    setTimeout(() => setNoticeMessage(''), 3500);
    refreshData();
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#0c0c0c] border border-neutral-800 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto relative shadow-2xl my-auto text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-20 bg-[#0c0c0c]/95 backdrop-blur-md border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E58A36]/10 border border-[#E58A36]/30 flex items-center justify-center text-[#E58A36]">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Haider's Real Sales & Live Traffic Calculator</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> REAL DATA ONLY
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400">Excludes Store Owner (Haider's) testing visits & downloads</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SECURITY PIN GATE */}
        {!isAuthenticated ? (
          <form onSubmit={handlePasscodeSubmit} className="p-8 max-w-md mx-auto text-center space-y-4">
            <div className="w-12 h-12 bg-[#E58A36]/10 border border-[#E58A36]/30 rounded-full flex items-center justify-center mx-auto text-[#E58A36]">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Private Owner Verification</h4>
              <p className="text-xs text-neutral-400 mt-1">
                Enter your 4-digit PIN (default <strong className="text-white font-mono">7890</strong>) to access your real sales calculator.
              </p>
            </div>

            {passcodeError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl p-3 flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{passcodeError}</span>
              </div>
            )}

            <div className="relative">
              <input
                type="password"
                maxLength={8}
                required
                placeholder="Enter PIN..."
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-center text-sm font-mono tracking-widest text-white focus:outline-none focus:border-[#E58A36] transition-colors"
              />
              <KeyRound className="w-4 h-4 text-neutral-500 absolute right-4 top-3.5" />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#E58A36] hover:bg-[#F29543] text-black font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Unlock Haider's Sales Dashboard
            </button>
          </form>
        ) : (
          /* MAIN DASHBOARD CONTENT */
          <div className="p-6 space-y-6">
            {/* Notice Bar */}
            {noticeMessage && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{noticeMessage}</span>
                </div>
              </div>
            )}

            {/* 🛡️ OWNER EXCLUSION BADGE */}
            <div className="bg-[#E58A36]/10 border border-[#E58A36]/30 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-[#E58A36]" />
                <span>Your device is marked as <strong className="text-white">Store Owner / Admin Device</strong>. Your testing visits & downloads are strictly excluded from traffic metrics!</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-neutral-400 cursor-pointer flex items-center gap-1.5 select-none">
                  <input
                    type="checkbox"
                    checked={includeTestOrders}
                    onChange={(e) => setIncludeTestOrders(e.target.checked)}
                    className="rounded border-neutral-700 accent-[#E58A36]"
                  />
                  <span>Show Admin Test Orders</span>
                </label>
              </div>
            </div>

            {/* 1. TOP REAL METRICS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total Revenue */}
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Real Customer Sales</span>
                  <DollarSign className="w-4 h-4 text-[#E58A36]" />
                </div>
                <div className="text-2xl font-extrabold text-white tabular-nums">${sales?.totalRevenue || 0}</div>
                <p className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" /> 100% Real Income
                </p>
              </div>

              {/* Today's Revenue */}
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Today's Sales</span>
                  <ShoppingCart className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-extrabold text-emerald-400 tabular-nums">${sales?.todayRevenue || 0}</div>
                <p className="text-[10px] text-neutral-400 mt-1">{sales?.todayOrders || 0} real orders today</p>
              </div>

              {/* Today's Visitors (Excluding Owner) */}
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Real Visitors Today</span>
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-extrabold text-white tabular-nums">{metrics?.todayVisitors || 0}</div>
                <p className="text-[10px] text-neutral-500 mt-1">Excludes your visits</p>
              </div>

              {/* Live Active */}
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">External Active</span>
                  <Eye className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-extrabold text-purple-400 tabular-nums flex items-center gap-2">
                  <span>{metrics?.liveActiveVisitors || 0}</span>
                  {metrics && metrics.liveActiveVisitors > 0 && (
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                  )}
                </div>
                <p className="text-[10px] text-neutral-500 mt-1">Live customer traffic</p>
              </div>
            </div>

            {/* 2. GEOGRAPHIC BUYER BREAKDOWN & ACTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Buyer Country Breakdown */}
              <div className="lg:col-span-2 bg-neutral-900/40 border border-neutral-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#E58A36]" /> Buyer & Visitor Country Breakdown
                  </h4>
                  <span className="text-[10px] text-neutral-500">Real Customer Locations</span>
                </div>

                {metrics?.countryBreakdown && metrics.countryBreakdown.length > 0 ? (
                  <div className="space-y-3">
                    {metrics.countryBreakdown.map((item) => (
                      <div key={item.country} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-neutral-300 font-medium flex items-center gap-2">
                            <span className="text-base">{item.flag}</span>
                            <span>{item.country}</span>
                          </span>
                          <div className="flex items-center gap-3 text-neutral-400 text-[11px]">
                            <span>{item.orders} sales</span>
                            <span className="text-white font-mono font-bold">{item.percent}%</span>
                          </div>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#E58A36] to-[#F29543] rounded-full"
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-neutral-500 space-y-1">
                    <p className="text-sm text-neutral-400 font-semibold">🌍 Awaiting First Real International Sale</p>
                    <p className="text-[11px]">Country statistics will populate automatically as real customers order prompts from Australia, USA, UK, etc.</p>
                  </div>
                )}
              </div>

              {/* Quick Actions & Controls */}
              <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white border-b border-neutral-800 pb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Admin Tools & Actions
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-3 leading-relaxed">
                    Log direct offline sales, export CSV accounting reports, or clean test logs.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => setShowAddSale(!showAddSale)}
                    className="w-full py-2.5 bg-[#E58A36] hover:bg-[#F29543] text-black font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Direct / Offline Sale
                  </button>
                  <button
                    onClick={() => sales && exportSalesToCSV(sales.orders)}
                    className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border border-neutral-700"
                  >
                    <Download className="w-4 h-4 text-emerald-400" /> Export Real CSV Report
                  </button>
                  <button
                    onClick={handleResetData}
                    className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear Test Logs & Start $0 Baseline
                  </button>
                </div>
              </div>
            </div>

            {/* MANUAL SALE MODAL FORM */}
            {showAddSale && (
              <form onSubmit={handleAddManualSale} className="bg-neutral-900 border border-[#E58A36]/40 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#E58A36]" /> Add Direct / WhatsApp Sale Record
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-neutral-400 block mb-1">Buyer Email</label>
                    <input
                      type="email"
                      required
                      placeholder="client@gmail.com"
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">Amount ($ USD)</label>
                    <input
                      type="number"
                      required
                      value={manualPrice}
                      onChange={(e) => setManualPrice(Number(e.target.value))}
                      className="w-full bg-black border border-neutral-800 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddSale(false)}
                    className="px-3 py-1.5 bg-neutral-800 text-neutral-300 text-xs rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#E58A36] text-black font-bold text-xs rounded-lg"
                  >
                    Record Sale
                  </button>
                </div>
              </form>
            )}

            {/* 3. RECENT ORDERS LOG TABLE */}
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-emerald-400" /> Real Sales & Order History
                </h4>
                <span className="text-[11px] text-neutral-400 font-mono">Total Orders: {sales?.totalOrders || 0}</span>
              </div>

              {sales?.orders && sales.orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-neutral-300">
                    <thead className="bg-black/60 text-neutral-400 text-[10px] uppercase tracking-wider border-b border-neutral-800">
                      <tr>
                        <th className="py-2.5 px-3">Order ID</th>
                        <th className="py-2.5 px-3">Buyer Email</th>
                        <th className="py-2.5 px-3">Product</th>
                        <th className="py-2.5 px-3">Price</th>
                        <th className="py-2.5 px-3">Wise Ref ID</th>
                        <th className="py-2.5 px-3">PIN</th>
                        <th className="py-2.5 px-3">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
                      {sales.orders.map((ord) => (
                        <tr key={ord.id} className={`hover:bg-neutral-900/80 transition-colors ${ord.isAdminTest ? 'opacity-60 bg-neutral-900/20' : ''}`}>
                          <td className="py-2.5 px-3 text-[#E58A36] font-bold">
                            {ord.id}
                            {ord.isAdminTest && <span className="ml-1 text-[9px] text-neutral-500">[TEST]</span>}
                          </td>
                          <td className="py-2.5 px-3 text-white">{ord.userEmail}</td>
                          <td className="py-2.5 px-3 text-neutral-300 max-w-[160px] truncate">{ord.productTitle}</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold">${ord.price}</td>
                          <td className="py-2.5 px-3 text-neutral-400">{ord.wiseRefId}</td>
                          <td className="py-2.5 px-3 text-[#E58A36] font-bold">{ord.generatedPin}</td>
                          <td className="py-2.5 px-3 text-neutral-500 text-[10px]">{ord.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-neutral-500 space-y-1">
                  <p className="text-sm text-neutral-400 font-semibold">🛍️ No Sales Recorded Yet ($0.00 Baseline)</p>
                  <p className="text-[11px]">All test logs cleared! As soon as your first real customer buys a prompt, their order details and earnings will show up here live.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
