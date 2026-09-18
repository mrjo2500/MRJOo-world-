import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Users, Sparkles } from 'lucide-react';
import { AudienceVote } from '../types';

interface AudienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  vote: AudienceVote | null;
  options: [string, string, string, string];
}

export const AudienceModal: React.FC<AudienceModalProps> = ({
  isOpen,
  onClose,
  vote,
  options,
}) => {
  if (!isOpen || !vote) return null;

  const letters = ['A', 'B', 'C', 'D'];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-md bg-gradient-to-b from-neutral-900 to-black border border-cyan-500/40 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] relative text-center"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base sm:text-lg font-bold text-white">استطلاع رأي جمهور MR JOO</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-neutral-300 mb-5">
            قام 100 خبير ومتابع في مدرجات الاستوديو بالتصويت لاختيار الإجابة الأرجح:
          </p>

          {/* Voting Bars */}
          <div className="space-y-3.5 mb-6 text-right">
            {vote.percentages.map((percent, idx) => {
              const letter = letters[idx];
              const text = options[idx];
              const isHighest = percent === Math.max(...vote.percentages);

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                    <span className="flex items-center gap-1.5 text-white">
                      <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 flex items-center justify-center font-cinzel text-[11px]">
                        {letter}
                      </span>
                      <span className="truncate max-w-[200px]">{text}</span>
                    </span>
                    <span className={isHighest ? 'text-emerald-400 font-extrabold' : 'text-cyan-300'}>
                      %{percent} {isHighest && '👑'}
                    </span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.15, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        isHighest
                          ? 'bg-gradient-to-r from-cyan-500 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]'
                          : 'bg-gradient-to-r from-blue-600 to-cyan-500'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-sm transition-colors shadow-lg cursor-pointer"
          >
            شكراً للجمهور، العودة للسؤال
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
