import React from 'react';
import { useTranslation } from 'react-i18next';

const STATUS_STYLES = {
  // Job Statuses
  open: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  booked: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-stone-100 text-stone-700 border-stone-300',
  cancelled: 'bg-red-50 text-red-700 border-red-200',

  // Booking Statuses
  pending: 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse',
  countered: 'bg-purple-50 text-purple-700 border-purple-200',
  accepted: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  rejected: 'bg-red-50 text-red-700 border-red-200'
};

export default function StatusBadge({ status }) {
  const { t } = useTranslation();
  const normalizedStatus = status?.toLowerCase() || 'open';
  const style = STATUS_STYLES[normalizedStatus] || 'bg-stone-50 text-stone-700 border-stone-200';
  const label = t(`status.${normalizedStatus}`, normalizedStatus.toUpperCase());

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${style}`}>
      {label}
    </span>
  );
}
