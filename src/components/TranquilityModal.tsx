import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, X } from 'lucide-react';
import { TranquilityMessage } from '../data/tranquilityMessages';

interface TranquilityFloatingButtonProps {
  isVisible: boolean;
  onOpenMessage: () => void;
  unreadCount?: number;
}

export const TranquilityFloatingButton: React.FC<TranquilityFloatingButtonProps> = ({
  isVisible,
  onOpenMessage,
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ x: 60, opacity: 0, scale: 0.8 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 60, opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', damping: 20, stiffness: 260 }}
      className="fixed bottom-24 right-3 sm:right-5 z-40 select-none"
    >
      <button
        onClick={onOpenMessage}
        className="group relative flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-950/90 via-slate-950/95 to-amber-950/90 border-2 border-rose-400/60 shadow-[0_8px_30px_rgba(244,63,94,0.4)] backdrop-blur-xl text-white hover:scale-105 active:scale-95 transition-all"
        title="رسالة طمأنينة وراحة قلب 🌸"
      >
        {/* Pulsing ring indicator */}
        <span className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-400 opacity-40 blur-xs group-hover:opacity-80 animate-pulse transition duration-500" />

        <div className="relative flex items-center gap-2 z-10">
          <div className="relative w-8 h-8 rounded-full bg-rose-500/20 border border-rose-400/50 flex items-center justify-center text-lg shadow-inner">
            <span className="animate-bounce">🌸</span>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-400 animate-ping" />
          </div>

          <div className="flex flex-col text-right leading-tight">
            <span className="text-[10px] text-rose-300 font-bold">رسالة اطمئنان</span>
            <span className="text-xs font-black text-amber-200">افتح رسالتك 🤍</span>
          </div>
        </div>
      </button>
    </motion.div>
  );
};

interface TranquilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: TranquilityMessage | null;
  onNextMessage: () => void;
}

export const TranquilityModal: React.FC<TranquilityModalProps> = ({
  isOpen,
  onClose,
  message,
  onNextMessage,
}) => {
  if (!message) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm bg-gradient-to-b from-rose-950/80 via-slate-950 to-black border-2 border-rose-400/50 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(244,63,94,0.35)] text-center text-white select-none z-10"
          >
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Rose Blossom Emblem */}
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-tr from-rose-600 via-pink-400 to-amber-200 p-0.5 shadow-[0_0_25px_rgba(244,63,94,0.6)] flex items-center justify-center mb-4">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                <span className="text-3xl">🌸</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-400/40 text-rose-300 text-xs font-bold mb-3">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span>{message.source || 'رسالة سكينة وراحة بال'}</span>
            </div>

            {/* Message Body */}
            <div className="p-5 rounded-2xl bg-white/[0.04] border border-rose-400/30 my-3 shadow-inner">
              <p className="text-lg sm:text-xl font-black text-rose-100 leading-relaxed font-cairo">
                {message.text}
              </p>
            </div>

            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              « حين يشعر الإنسان بالتعب، تكفيه كلمة صادقة تطمئن قلبه وتذكره بأن الله معه »
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={onNextMessage}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white font-black text-xs sm:text-sm hover:brightness-110 active:scale-98 transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>رسالة راحة أخرى 🌸</span>
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs sm:text-sm font-bold transition-all"
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
