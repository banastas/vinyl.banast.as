import React from 'react';
import { Vinyl, VinylStats } from '../types/Vinyl';
import { Disc3, DollarSign, TrendingUp, TrendingDown, Award, Calendar, Package } from 'lucide-react';

interface VinylDashboardProps {
  stats: VinylStats;
  onVinylClick?: (vinyl: Vinyl) => void;
  onArtistClick?: (artist: string) => void;
}

export const VinylDashboard: React.FC<VinylDashboardProps> = ({ stats, onVinylClick, onArtistClick }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  const totalGainLoss = stats.totalCurrentValue - stats.totalPurchaseValue;
  const totalGainLossPercentage = stats.totalPurchaseValue > 0
    ? ((totalGainLoss / stats.totalPurchaseValue) * 100)
    : 0;

  const statsCards = [
    {
      title: 'Total Records',
      value: stats.totalRecords.toLocaleString(),
      icon: Disc3,
      color: 'text-tron-cyan',
      bgColor: 'bg-tron-cyan/10',
      borderColor: 'border-tron-cyan/30',
    },
    {
      title: 'Collection Value',
      value: formatCurrency(stats.totalCurrentValue),
      subtitle: `Invested: ${formatCurrency(stats.totalPurchaseValue)}`,
      icon: DollarSign,
      color: 'text-tron-orange',
      bgColor: 'bg-tron-orange/10',
      borderColor: 'border-tron-orange/30',
    },
    {
      title: 'Total Gain/Loss',
      value: formatCurrency(totalGainLoss),
      subtitle: formatPercentage(totalGainLossPercentage),
      icon: totalGainLoss >= 0 ? TrendingUp : TrendingDown,
      color: totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400',
      bgColor: totalGainLoss >= 0 ? 'bg-green-400/10' : 'bg-red-400/10',
      borderColor: totalGainLoss >= 0 ? 'border-green-400/30' : 'border-red-400/30',
    },
    {
      title: 'Average Value',
      value: formatCurrency(stats.totalCurrentValue / (stats.totalRecords || 1)),
      subtitle: `Per record`,
      icon: Award,
      color: 'text-tron-pink',
      bgColor: 'bg-tron-pink/10',
      borderColor: 'border-tron-pink/30',
    },
  ];

  const conditionStats = [
    { label: 'Mint', count: stats.mintRecords, color: 'bg-green-500' },
    { label: 'Near Mint', count: stats.nearMintRecords, color: 'bg-blue-500' },
    { label: 'Very Good+', count: stats.veryGoodPlusRecords, color: 'bg-tron-cyan' },
    { label: 'Very Good', count: stats.veryGoodRecords, color: 'bg-yellow-500' },
    { label: 'Other', count: stats.totalRecords - stats.mintRecords - stats.nearMintRecords - stats.veryGoodPlusRecords - stats.veryGoodRecords, color: 'bg-gray-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, index) => (
          <div
            key={index}
            className={`bg-tron-bg-lighter/80 backdrop-blur-sm rounded-lg p-6 border ${card.borderColor} hover:border-opacity-60 transition-all shadow-lg`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-tron-text-dim uppercase tracking-wide">
                {card.title}
              </h3>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <div className={`text-3xl font-bold ${card.color} mb-1`}>
              {card.value}
            </div>
            {card.subtitle && (
              <div className="text-sm text-tron-text-secondary">
                {card.subtitle}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Top Performers */}
      {(stats.highestValuedRecord || stats.biggestGainer || stats.biggestLoser) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {stats.highestValuedRecord && (
            <div className="bg-tron-bg-lighter/80 backdrop-blur-sm rounded-lg p-6 border border-tron-orange/30">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-tron-orange" />
                <h3 className="text-sm font-medium text-tron-text-dim uppercase">Highest Value</h3>
              </div>
              <button
                onClick={() => onArtistClick?.(stats.highestValuedRecord!.artist)}
                className="text-tron-cyan font-medium mb-1 hover:text-tron-orange transition-colors text-left w-full"
              >
                {stats.highestValuedRecord.artist}
              </button>
              <button
                onClick={() => onVinylClick?.(stats.highestValuedRecord!)}
                className="text-white text-sm mb-2 hover:text-tron-cyan transition-colors text-left w-full"
              >
                {stats.highestValuedRecord.title}
              </button>
              <div className="text-2xl font-bold text-tron-orange">
                {formatCurrency(stats.highestValuedRecord.estimatedValue || 0)}
              </div>
            </div>
          )}

          {stats.biggestGainer && (
            <div className="bg-tron-bg-lighter/80 backdrop-blur-sm rounded-lg p-6 border border-green-400/30">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <h3 className="text-sm font-medium text-tron-text-dim uppercase">Biggest Gainer</h3>
              </div>
              <button
                onClick={() => onArtistClick?.(stats.biggestGainer!.artist)}
                className="text-tron-cyan font-medium mb-1 hover:text-tron-orange transition-colors text-left w-full"
              >
                {stats.biggestGainer.artist}
              </button>
              <button
                onClick={() => onVinylClick?.(stats.biggestGainer!)}
                className="text-white text-sm mb-2 hover:text-tron-cyan transition-colors text-left w-full"
              >
                {stats.biggestGainer.title}
              </button>
              <div className="text-2xl font-bold text-green-400">
                +{formatCurrency(stats.biggestGainer.gainLoss || 0)}
              </div>
            </div>
          )}

          {stats.biggestLoser && stats.biggestLoser.gainLoss && stats.biggestLoser.gainLoss < 0 && (
            <div className="bg-tron-bg-lighter/80 backdrop-blur-sm rounded-lg p-6 border border-red-400/30">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="w-5 h-5 text-red-400" />
                <h3 className="text-sm font-medium text-tron-text-dim uppercase">Biggest Loser</h3>
              </div>
              <button
                onClick={() => onArtistClick?.(stats.biggestLoser!.artist)}
                className="text-tron-cyan font-medium mb-1 hover:text-tron-orange transition-colors text-left w-full"
              >
                {stats.biggestLoser.artist}
              </button>
              <button
                onClick={() => onVinylClick?.(stats.biggestLoser!)}
                className="text-white text-sm mb-2 hover:text-tron-cyan transition-colors text-left w-full"
              >
                {stats.biggestLoser.title}
              </button>
              <div className="text-2xl font-bold text-red-400">
                {formatCurrency(stats.biggestLoser.gainLoss)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Condition Breakdown */}
      <div className="bg-tron-bg-lighter/80 backdrop-blur-sm rounded-lg p-6 border border-tron-border">
        <div className="flex items-center gap-2 mb-6">
          <Package className="w-5 h-5 text-tron-cyan" />
          <h3 className="text-lg font-medium text-white">Condition Breakdown</h3>
        </div>
        <div className="space-y-3">
          {conditionStats.map((condition, index) => (
            condition.count > 0 && (
              <div key={index} className="flex items-center gap-4">
                <div className="w-24 text-sm text-tron-text-secondary">{condition.label}</div>
                <div className="flex-1 h-6 bg-tron-bg rounded-full overflow-hidden">
                  <div
                    className={`h-full ${condition.color} transition-all duration-500`}
                    style={{ width: `${(condition.count / stats.totalRecords) * 100}%` }}
                  />
                </div>
                <div className="w-16 text-right text-sm text-tron-text-primary font-medium">
                  {condition.count}
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-tron-bg-lighter/80 backdrop-blur-sm rounded-lg p-4 border border-tron-border text-center">
          <div className="text-2xl font-bold text-tron-cyan mb-1">{stats.uniqueArtists}</div>
          <div className="text-xs text-tron-text-dim uppercase">Artists</div>
        </div>
        <div className="bg-tron-bg-lighter/80 backdrop-blur-sm rounded-lg p-4 border border-tron-border text-center">
          <div className="text-2xl font-bold text-tron-cyan mb-1">{stats.uniqueLabels}</div>
          <div className="text-xs text-tron-text-dim uppercase">Labels</div>
        </div>
        <div className="bg-tron-bg-lighter/80 backdrop-blur-sm rounded-lg p-4 border border-tron-border text-center">
          <div className="text-2xl font-bold text-tron-cyan mb-1">{stats.uniqueGenres}</div>
          <div className="text-xs text-tron-text-dim uppercase">Genres</div>
        </div>
        <div className="bg-tron-bg-lighter/80 backdrop-blur-sm rounded-lg p-4 border border-tron-border text-center">
          <div className="text-2xl font-bold text-tron-cyan mb-1">
            {stats.recordsWithCurrentValue}
          </div>
          <div className="text-xs text-tron-text-dim uppercase">With Pricing</div>
        </div>
      </div>
    </div>
  );
};
