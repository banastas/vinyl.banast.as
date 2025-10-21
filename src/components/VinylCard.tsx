import React from 'react';
import { Vinyl } from '../types/Vinyl';
import { Disc3, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { ResponsiveImage } from './ResponsiveImage';
import { cleanArtistName } from '../utils/artistNameCleaner';

interface VinylCardProps {
  vinyl: Vinyl;
  onClick: () => void;
  onArtistClick?: (artist: string) => void;
}

export const VinylCard: React.FC<VinylCardProps> = ({ vinyl, onClick, onArtistClick }) => {
  const gainLoss = vinyl.gainLoss || 0;
  const hasGainLoss = vinyl.gainLoss !== undefined && vinyl.purchasePrice !== undefined;
  const cleanedArtist = cleanArtistName(vinyl.artist);

  const handleArtistClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (onArtistClick) {
      onArtistClick(vinyl.artist);
    }
  };

  return (
    <div
      onClick={onClick}
      className="group relative bg-tron-bg-lighter/50 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-tron-cyan/20 transition-all duration-300 cursor-pointer border border-tron-border/50 hover:border-tron-cyan/50"
    >
      {/* Cover Image */}
      <div className="relative aspect-square overflow-hidden bg-tron-bg">
        {vinyl.coverImageUrl ? (
          <ResponsiveImage
            src={vinyl.coverImageUrl}
            alt={`${vinyl.artist} - ${vinyl.title}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <Disc3 className="w-16 h-16 text-gray-600" />
          </div>
        )}

        {/* Condition Badge Overlay */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <div className="bg-black/70 backdrop-blur-sm rounded px-2 py-1 text-xs font-medium text-white">
            {vinyl.mediaCondition}
          </div>
          {vinyl.colorVariant && (
            <div className="bg-tron-pink/90 backdrop-blur-sm rounded px-2 py-1 text-xs font-medium text-white">
              Colored
            </div>
          )}
        </div>

        {/* Price Change Indicator */}
        {hasGainLoss && (
          <div className={`absolute top-2 left-2 ${
            gainLoss > 0 ? 'bg-green-500/90' : gainLoss < 0 ? 'bg-red-500/90' : 'bg-gray-500/90'
          } backdrop-blur-sm rounded px-2 py-1 flex items-center gap-1`}>
            {gainLoss > 0 ? (
              <TrendingUp className="w-3 h-3 text-white" />
            ) : gainLoss < 0 ? (
              <TrendingDown className="w-3 h-3 text-white" />
            ) : null}
            <span className="text-xs font-medium text-white">
              {gainLoss > 0 ? '+' : ''}${gainLoss.toFixed(0)}
            </span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-3">
        {/* Artist Name */}
        <button
          onClick={handleArtistClick}
          className="text-xs text-tron-cyan font-medium mb-1 truncate hover:text-tron-orange transition-colors w-full text-left"
        >
          {cleanedArtist}
        </button>

        {/* Album Title */}
        <div className="text-sm font-bold text-white mb-2 line-clamp-2 min-h-[2.5rem]">
          {vinyl.title}
        </div>

        {/* Details Row */}
        <div className="flex items-center justify-between text-xs text-tron-text-dim mb-2">
          <span>{vinyl.releaseYear}</span>
          <span>{vinyl.format[0]}</span>
        </div>

        {/* Price Info */}
        <div className="flex items-center justify-between pt-2 border-t border-tron-border">
          {vinyl.purchasePrice !== undefined && (
            <div className="text-xs text-tron-text-dim">
              Paid: ${vinyl.purchasePrice.toFixed(0)}
            </div>
          )}
          {vinyl.estimatedValue !== undefined && (
            <div className="flex items-center gap-1 text-xs font-medium text-green-400">
              <DollarSign className="w-3 h-3" />
              <span>${vinyl.estimatedValue.toFixed(0)}</span>
            </div>
          )}
        </div>

        {/* Label */}
        {vinyl.label && (
          <div className="text-xs text-tron-text-dim mt-2 truncate">
            {vinyl.label}
          </div>
        )}
      </div>
    </div>
  );
};
