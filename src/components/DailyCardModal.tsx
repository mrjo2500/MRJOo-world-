import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, X, Check, Clock } from 'lucide-react';
import { DailyAdviceCard } from '../data/tranquilityMessages';

interface DailyCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: DailyAdviceCard;
  isClaimedToday: boolean;
  onClaimCard: () => void;
  nextAvailableTimeFormatted?: string;
}

export const DailyCardModal: React.FC<DailyCardModalProps> = ({
  isOpen,
  onClose,
  card,
  isClaimedToday,
  onClaimCard,
  nextAvailableTimeFormatted,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-gradient-to-b from-slate-950 via-slate-900 to-black border-2 border-amber-500/60 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(245,158,11,0.35)] text-center text-white select-none z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Golden Rose / Crown Emblem */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-0.5 shadow-[0_0_25px_rgba(245,158,11,0.6)] flex items-center justify-center mb-4">
              <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                <span className="text-3xl animate-pulse">🌸</span>
              </div>
            </div>

            {/* Header / Subtitle */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>كارت الحكمة والراحة اليومي (مرة كل ٢٤ ساعة)</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 font-cinzel mb-4">
              {card.title}
            </h2>

            {/* Card Main Quote Body */}
            <div className="relative p-5 rounded-2xl bg-white/[0.04] border border-amber-400/30 my-4 shadow-inner">
              <span className="absolute -top-3 right-5 bg-slate-900 px-2 text-amber-400 font-serif text-sm">
                رسالتك لليوم
              </span>
              <p className="text-base sm:text-lg font-bold text-amber-100 leading-relaxed font-cairo">
                {card.message}
              </p>
            </div>

            {/* Benefit / Actionable advice */}
            <div className="text-xs sm:text-sm text-slate-300 bg-black/40 p-3 rounded-xl border border-white/10 mb-5 flex items-start gap-2 text-right">
              <Heart className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{card.benefit}</span>
            </div>

            {/* Status Button / Claim */}
            {isClaimedToday ? (
              <div className="space-y-2">
                <div className="w-full py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black text-xs sm:text-sm flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>حصلت على كارتك اليوم بنجاح ✨</span>
                </div>
                {nextAvailableTimeFormatted && (
                  <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>الكارت القادم متاح {nextAvailableTimeFormatted}</span>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onClaimCard}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-sm hover:brightness-110 active:scale-98 transition-all shadow-[0_4px_25px_rgba(245,158,11,0.6)] flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-black" />
                <span>حفظ واستلام كارت اليوم 🤍</span>
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
