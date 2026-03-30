'use client';

import type { LucideIcon } from 'lucide-react';
import { HeadphonesIcon, MapPin } from 'lucide-react';

import { Overlay } from '../ui/overlay';

export type NotificationDetail = {
  Icon: LucideIcon;
  iconClass: string;
  bgClass: string;
  glowClass: string;
  category: string;
  categoryClass: string;
  timestamp: string;
  title: string;
  fullBody: string;
  location: string | null;
  details: { label: string; value: string; mono?: boolean }[];
  primaryAction: string;
  primaryDanger: boolean;
  secondaryAction: string;
};

type NotificationDetailOverlayProps = {
  onClose: () => void;
  notification: NotificationDetail;
};

export function NotificationDetailOverlay({ onClose, notification }: NotificationDetailOverlayProps) {
  const {
    Icon,
    iconClass,
    bgClass,
    glowClass,
    category,
    categoryClass,
    timestamp,
    title,
    fullBody,
    location,
    details,
    primaryAction,
    primaryDanger,
    secondaryAction,
  } = notification;

  return (
    <Overlay title="Alert Details" onClose={onClose}>
      <div className="px-6 py-8 space-y-6">

        {/* Header card */}
        <div className="bg-bg-1 border border-line rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${categoryClass}`}>
              {category}
            </span>
            <span className="text-[11px] text-ink-disabled font-medium">{timestamp}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-ink-0 tracking-tight leading-tight">{title}</h2>
          <p className="text-sm text-ink-1 leading-relaxed">{fullBody}</p>
        </div>

        {/* Visual accent */}
        <div className="relative h-40 rounded-xl overflow-hidden bg-bg-1 border border-line flex items-center justify-center">
          {/* Glow blob */}
          <div className={`absolute inset-0 ${glowClass} opacity-20 blur-[60px]`} />
          {/* Icon */}
          <div className={`relative size-20 rounded-2xl ${bgClass} flex items-center justify-center border border-line`}>
            <Icon size={36} className={iconClass} />
          </div>
          {/* Location tag */}
          {location && (
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-card/80 backdrop-blur-sm border border-line rounded-lg px-3 py-1.5">
              <MapPin size={12} className="text-brand shrink-0" />
              <span className="text-[11px] font-bold text-ink-0 uppercase tracking-wider">{location}</span>
            </div>
          )}
        </div>

        {/* Details grid */}
        <div className="bg-bg-1 rounded-xl overflow-hidden divide-y divide-line border border-line">
          {details.map(({ label, value, mono }) => (
            <div key={label} className="px-5 py-4 flex items-center justify-between hover:bg-card transition-colors">
              <span className="text-[11px] font-bold text-ink-disabled uppercase tracking-wider">{label}</span>
              <span className={`text-sm font-semibold text-ink-0 text-right ${mono ? 'font-mono text-xs' : ''}`}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            type="button"
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
              primaryDanger
                ? 'bg-danger text-white shadow-[0_4px_20px_rgba(239,68,68,0.25)] hover:opacity-90'
                : 'bg-brand text-white shadow-soft hover:opacity-90'
            }`}
          >
            {primaryAction}
          </button>
          <button
            type="button"
            className="w-full py-4 rounded-xl font-bold text-ink-0 bg-bg-1 border border-line hover:bg-card transition-all active:scale-[0.98]"
          >
            {secondaryAction}
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            className="flex items-center gap-1.5 text-[11px] font-bold text-ink-disabled hover:text-brand transition-colors"
          >
            <HeadphonesIcon size={13} />
            Report an issue
          </button>
        </div>

      </div>
    </Overlay>
  );
}
