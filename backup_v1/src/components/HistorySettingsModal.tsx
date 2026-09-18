import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, ShieldCheck, Trash2, Sliders, Zap, BookOpen } from 'lucide-react';
import { Category, Difficulty } from '../types';
import { audio } from '../utils/audioManager';

interface HistorySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  prevent24h: boolean;
  onTogglePrevent24h: (val: boolean) => void;
  preventSessionRepeat: boolean;
  onTogglePreventSessionRepeat: (val: boolean) => void;
  historyCount: number;
  sessionAnsweredCount: number;
  onClearHistory: () => void;
  selectedCategory: Category;
  onSelectCategory: (cat: Category) => void;
  selectedDifficulty: Difficulty;
  onSelectDifficulty: (diff: Difficulty) => void;
  timerEnabled: boolean;
  onToggleTimer: (val: boolean) => void;
}

export const HistorySettingsModal: React.FC<HistorySettingsModalProps> = ({
  isOpen,
  onClose,
  prevent24h,
  onTogglePrevent24h,
  preventSessionRepeat,
  onTogglePreventSessionRepeat,
  historyCount,
  sessionAnsweredCount,
  onClearHistory,
  selectedCategory,
  onSelectCategory,
  selectedDifficulty,
  onSelectDifficulty,
  timerEnabled,
  onToggleTimer,
}) => {
  if (!isOpen) return null;

  const categories: { id: Category; label: string }[] = [
    { id: 'all', label: 'جميع المجالات المتنوعة' },
    { id: 'تاريخ وحضارات', label: 'تاريخ وحضارات' },
    { id: 'علوم وتكنولوجيا', label: 'علوم وتكنولوجيا' },
    { id: 'جغرافيا ودول', label: 'جغرافيا ودول' },
    { id: 'إسلاميات', label: 'إسلاميات' },
    { id: 'سينما وفنون', label: 'سينما وفنون وموسيقى' },
    { id: 'رياضة وأبطال', label: 'رياضة وأبطال' },
    { id: 'ألغاز وذكاء', label: 'ألغاز وذكاء' },
    { id: 'عالم الطبيعة والحيوان', label: 'عالم الطبيعة والحيوان' },
  ];

  const difficulties: { id: Difficulty; label: string }[] = [
    { id: 'all', label: 'متنوع الصعوبة' },
    { id: 'easy', label: 'سهل (بداية سريعة)' },
    { id: 'medium', label: 'متوسط (تحدٍ متوازن)' },
    { id: 'hard', label: 'صعب (للعباقرة والخبراء)' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-xl bg-gradient-to-b from-neutral-900 to-black border border-white/20 rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg sm:text-xl font-bold text-white">إعدادات الأسئلة اللانهائية وعدم التكرار</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-5">
            {/* Deduplication 24h & Session */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm sm:text-base">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span>نظام الذكاء الاصطناعي لمنع تكرار الأسئلة</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                يقوم محرك اللعبة بتوليد أسئلة جديدة تلقائياً وحفظ الأسئلة السابقة لمنع ظهور أي سؤال مرتين.
              </p>

              {/* 24 Hour Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white">منع تكرار أي سؤال خلال 24 ساعة</div>
                  <div className="text-[11px] text-neutral-400">حفظ وحجب الأسئلة المجابة لليوم بالكامل</div>
                </div>
                <button
                  onClick={() => onTogglePrevent24h(!prevent24h)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    prevent24h ? 'bg-amber-500' : 'bg-neutral-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      prevent24h ? 'translate-x-0' : '-translate-x-5'
                    }`}
                  />
                </button>
              </div>

              {/* Session Deduplication Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white">عدم تكرار أي سؤال طوال الجلسة الحالية</div>
                  <div className="text-[11px] text-neutral-400">تتابع لا نهائي لأسئلة فريدة وجديدة تماماً</div>
                </div>
                <button
                  onClick={() => onTogglePreventSessionRepeat(!preventSessionRepeat)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    preventSessionRepeat ? 'bg-amber-500' : 'bg-neutral-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      preventSessionRepeat ? 'translate-x-0' : '-translate-x-5'
                    }`}
                  />
                </button>
              </div>

              {/* Stats & Clear Button */}
              <div className="pt-2 flex items-center justify-between text-xs text-neutral-300">
                <span>سجل الأسئلة المسجلة: <strong>{historyCount} سؤالاً</strong></span>
                <button
                  onClick={() => {
                    audio.playHover();
                    onClearHistory();
                  }}
                  className="flex items-center gap-1 text-rose-400 hover:text-rose-300 text-xs font-semibold px-2 py-1 rounded-lg bg-rose-950/40 border border-rose-500/30 hover:bg-rose-900/40 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>مسح السجل للبدء من جديد</span>
                </button>
              </div>
            </div>

            {/* Timer Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-cyan-400" />
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white">توقيت الإجابة (30 ثانية لكل سؤال)</div>
                  <div className="text-[11px] text-neutral-400">يمكنك إيقاف التوقيت للعب بهدوء بدون ضغط الوقت</div>
                </div>
              </div>
              <button
                onClick={() => onToggleTimer(!timerEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  timerEnabled ? 'bg-cyan-500' : 'bg-neutral-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    timerEnabled ? 'translate-x-0' : '-translate-x-5'
                  }`}
                />
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-2">
                اختر مجال الأسئلة المطلوب:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      audio.playHover();
                      onSelectCategory(cat.id);
                    }}
                    className={`p-2 rounded-xl text-xs font-semibold text-right border transition-all truncate ${
                      selectedCategory === cat.id
                        ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                        : 'border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-2">
                مستوى الصعوبة:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {difficulties.map((diff) => (
                  <button
                    key={diff.id}
                    onClick={() => {
                      audio.playHover();
                      onSelectDifficulty(diff.id);
                    }}
                    className={`p-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                      selectedDifficulty === diff.id
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                        : 'border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10'
                    }`}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
