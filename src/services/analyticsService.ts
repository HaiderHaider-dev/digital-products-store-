import { getStoredOrders, clearStoredOrders, OrderRecord } from './emailService';

export interface VisitorMetrics {
  totalVisitors: number;
  todayVisitors: number;
  liveActiveVisitors: number;
  countryBreakdown: { country: string; flag: string; percent: number; orders: number }[];
}

export interface SalesSummary {
  totalRevenue: number;
  todayRevenue: number;
  totalOrders: number;
  todayOrders: number;
  averageOrderValue: number;
  orders: OrderRecord[];
}

/**
 * Helper to identify if the current browser belongs to Haider/Admin.
 */
export function isOwnerDevice(): boolean {
  try {
    return (
      localStorage.getItem('v_store_admin_device') === 'true' ||
      window.location.search.includes('admin=haiderali') ||
      window.location.hostname === 'localhost'
    );
  } catch {
    return false;
  }
}

/**
 * Registers current device as Admin / Store Owner device to exclude testing visits.
 */
export function markAsOwnerDevice(): void {
  try {
    localStorage.setItem('v_store_admin_device', 'true');
  } catch (err) {
    console.error('Failed to mark owner device:', err);
  }
}

/**
 * Real Visitor Tracking System.
 * EXCLUDES Haider / Store Owner testing visits!
 */
export function trackVisitorSession(): VisitorMetrics {
  const isAdmin = isOwnerDevice();

  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem('v_store_analytics_real');
    let data = stored ? JSON.parse(stored) : { date: todayStr, totalVisitors: 0, todayVisitors: 0, liveActive: 0 };

    // DO NOT count Haider / Admin testing visits
    if (!isAdmin) {
      if (data.date !== todayStr) {
        data.date = todayStr;
        data.todayVisitors = 1;
        data.totalVisitors = (data.totalVisitors || 0) + 1;
        data.liveActive = 1;
      } else {
        data.todayVisitors += 1;
        data.totalVisitors += 1;
        data.liveActive = Math.max(1, data.liveActive + 1);
      }
      localStorage.setItem('v_store_analytics_real', JSON.stringify(data));
    }

    // Build real country breakdown from stored orders
    const orders = getStoredOrders().filter((o) => !o.isAdminTest);
    const countryMap: Record<string, { flag: string; count: number }> = {};

    orders.forEach((o) => {
      // Basic country detection fallback based on email domain or default
      let country = 'Australia';
      let flag = '🇦🇺';

      if (o.userEmail.endsWith('.us') || o.userEmail.endsWith('.com')) {
        country = 'United States';
        flag = '🇺🇸';
      } else if (o.userEmail.endsWith('.uk') || o.userEmail.endsWith('.co.uk')) {
        country = 'United Kingdom';
        flag = '🇬🇧';
      } else if (o.userEmail.endsWith('.de')) {
        country = 'Germany';
        flag = '🇩🇪';
      } else if (o.userEmail.endsWith('.pk')) {
        country = 'Pakistan';
        flag = '🇵🇰';
      }

      if (!countryMap[country]) {
        countryMap[country] = { flag, count: 0 };
      }
      countryMap[country].count += 1;
    });

    const totalOrderCount = orders.length;
    const countryBreakdown = Object.entries(countryMap).map(([country, info]) => ({
      country,
      flag: info.flag,
      orders: info.count,
      percent: totalOrderCount > 0 ? Math.round((info.count / totalOrderCount) * 100) : 0,
    }));

    return {
      totalVisitors: data.totalVisitors || 0,
      todayVisitors: data.todayVisitors || 0,
      liveActiveVisitors: data.liveActive || 0,
      countryBreakdown,
    };
  } catch {
    return {
      totalVisitors: 0,
      todayVisitors: 0,
      liveActiveVisitors: 0,
      countryBreakdown: [],
    };
  }
}

/**
 * Calculates 100% REAL sales summary from actual non-test customer orders.
 */
export function getSalesSummary(includeTestOrders: boolean = false): SalesSummary {
  const allOrders = getStoredOrders();
  const orders = includeTestOrders ? allOrders : allOrders.filter((o) => !o.isAdminTest);
  const todayStr = new Date().toLocaleDateString();

  let totalRevenue = 0;
  let todayRevenue = 0;
  let todayOrders = 0;

  orders.forEach((ord) => {
    totalRevenue += ord.price;
    if (ord.timestamp.includes(todayStr)) {
      todayRevenue += ord.price;
      todayOrders += 1;
    }
  });

  const totalOrdersCount = orders.length;
  const aov = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

  return {
    totalRevenue,
    todayRevenue,
    totalOrders: totalOrdersCount,
    todayOrders,
    averageOrderValue: Number(aov.toFixed(2)),
    orders,
  };
}

/**
 * Resets all test analytics data to $0.00 and 0 visitors.
 */
export function resetAllAnalytics(): void {
  try {
    clearStoredOrders();
    localStorage.removeItem('v_store_analytics_real');
    localStorage.removeItem('v_store_analytics');
  } catch (err) {
    console.error('Failed to reset analytics data:', err);
  }
}

/**
 * Exports sales data to CSV format.
 */
export function exportSalesToCSV(orders: OrderRecord[]): void {
  if (orders.length === 0) return;

  const headers = ['Order ID', 'Buyer Email', 'Product', 'Price ($)', 'Wise Ref ID', 'PIN', 'Timestamp', 'Is Admin Test'];
  const rows = orders.map((o) => [
    o.id,
    o.userEmail,
    `"${o.productTitle}"`,
    o.price,
    o.wiseRefId,
    o.generatedPin,
    `"${o.timestamp}"`,
    o.isAdminTest ? 'YES' : 'NO',
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Real_Store_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
