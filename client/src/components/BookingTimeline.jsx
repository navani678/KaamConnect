import React from 'react';
import { CheckCircle2, Clock, XCircle, ArrowRight, User, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function BookingTimeline({ booking }) {
  const { t } = useTranslation();
  const status = booking.status?.toLowerCase() || 'pending';
  const history = booking.negotiation || [];

  const steps = [
    { key: 'pending', label: 'Requested' },
    { key: 'countered', label: 'Negotiating' },
    { key: 'accepted', label: 'Confirmed' },
    { key: 'completed', label: 'Completed' }
  ];

  const getStepIndex = (st) => {
    switch (st) {
      case 'pending': return 0;
      case 'countered': return 1;
      case 'accepted': return 2;
      case 'completed': return 3;
      case 'rejected':
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="space-y-6">
      {/* Progress Bar Steps */}
      {status !== 'rejected' && status !== 'cancelled' ? (
        <div className="flex items-center justify-between relative px-2">
          <div className="absolute left-6 right-6 top-4 -translate-y-1/2 h-1 bg-stone-200 -z-0">
            <div
              className="h-full bg-amber-500 transition-all duration-500"
              style={{
                width: `${(Math.max(0, currentIndex) / (steps.length - 1)) * 100}%`
              }}
            ></div>
          </div>

          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={step.key} className="flex flex-col items-center z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                    isCompleted
                      ? 'bg-amber-500 border-amber-500 text-stone-950 shadow'
                      : 'bg-white border-stone-300 text-stone-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`text-[11px] font-semibold mt-1.5 ${
                    isCurrent ? 'text-amber-800 font-bold' : isCompleted ? 'text-stone-800' : 'text-stone-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-3 bg-red-50 rounded-xl border border-red-200 flex items-center gap-2 text-red-700 text-xs font-semibold">
          <XCircle className="w-4 h-4" />
          <span>This booking was {status}. {booking.rejectionReason && `Reason: ${booking.rejectionReason}`}</span>
        </div>
      )}

      {/* Negotiation & Price History Log */}
      {history.length > 0 && (
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3">
          <div className="text-xs font-bold text-stone-700 uppercase tracking-wider">
            Negotiation & Price History
          </div>

          <div className="space-y-2.5">
            {history.map((entry, i) => (
              <div
                key={i}
                className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    entry.by === 'worker' ? 'bg-blue-100 text-blue-900' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {entry.by === 'worker' ? 'W' : 'C'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 capitalize">
                        {entry.by === 'worker' ? 'Worker Proposal' : 'Customer Offer'}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {entry.at ? new Date(entry.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    {entry.message && (
                      <p className="text-stone-600 mt-1 italic">
                        "{entry.message}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-stone-900 text-sm">
                    ₹{entry.price?.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-stone-400 font-medium">Proposed</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
