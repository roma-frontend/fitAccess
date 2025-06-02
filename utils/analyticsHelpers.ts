export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ru-RU').format(num);
};

export const formatPercent = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const getGrowthColor = (growth: number): string => {
  if (growth > 0) return 'text-green-600';
  if (growth < 0) return 'text-red-600';
  return 'text-gray-600';
};

export const getGrowthIcon = (growth: number): string => {
  if (growth > 0) return '↗️';
  if (growth < 0) return '↘️';
  return '➡️';
};

export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

export const getStatusColor = (status: 'good' | 'warning' | 'danger'): string => {
  switch (status) {
    case 'good':
      return 'text-green-600 bg-green-50';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50';
    case 'danger':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};
