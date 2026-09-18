import React, { useEffect } from 'react';
import { audio } from '../utils/audioManager';
import { BookOpen, Volume2, Waves, Wind, ArrowLeft } from 'lucide-react';

interface YoussefWorldIntroModalProps {
  isOpen: boolean;
  onConfirmEnter: () => void;
  onCancel: () => void;
}

export const YoussefWorldIntroModal: React.FC<YoussefWorldIntroModalProps> = ({
  isOpen,
  onConfirmEnter,
  onCancel,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Play wind and serene sea breeze
      audio.playWind(3.5);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xl animate-in fade-in duration-500 select-none">
      {/* Dynamic Sea & Sky Deep Atmospheric Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-950/80 via-teal-950/70 to-blue-950/90 pointer-events-none" />

      {/* Floating Ambient Light Spots */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none animate-pulse" />

      <div className="relative w-full max-w-lg rounded-3xl bg-slate-950/90 border border-cyan-400/40 p-5 sm:p-7 shadow-[0_20px_70px_rgba(6,182,212,0.35)] text-center text-white space-y-4">
        
        {/* Sky & Ocean Icon Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-400 p-0.5 shadow-[0_0_25px_rgba(20,184,166,0.5)] flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-cyan-300 animate-pulse" />
          </div>
        </div>

        {/* The Exact Solemn Banner Requested by User */}
        <div className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-teal-950 via-cyan-950 to-blue-950 border border-cyan-400/50 shadow-inner">
          <h2 className="text-base sm:text-lg md:text-xl font-black text-cyan-200 tracking-wide font-sans">
            انتبه .. رجاء التزام الهدوء :. هنا عالم آخر
          </h2>
        </div>

        {/* Verse & Atmosphere Description */}
        <div className="space-y-2">
          <p className="text-sm font-serif text-cyan-100/90 leading-relaxed">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            مرحباً بك في <span className="text-rose-300 font-bold">عالم يوسف</span> المخصص لأسئلة القرآن الكريم وتدبر آياته العطرة، مع ختمة وتلاوة خاشعة بصوت القارئ <span className="text-cyan-300 font-bold">الشيخ هزاع البلوشي</span> (بداية بسورة يوسف).
          </p>
        </div>

        {/* Peaceful Guidelines */}
        <div className="grid grid-cols-2 gap-2 text-right p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/20 text-xs">
          <div className="flex items-center gap-1.5 text-cyan-200 font-medium">
            <Waves className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>خالٍ من أي موسيقى</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-200 font-medium">
            <Wind className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span>نبضات قلب وتأمل</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-200 font-medium">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>تلاوة الشيخ هزاع البلوشي</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-200 font-medium">
            <BookOpen className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span>أكمل الآية الكريمة</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-all"
          >
            الرجوع للرئيسية
          </button>

          <button
            onClick={() => {
              audio.stopMusic();
              audio.playQuran(0); // Surah Yusuf
              onConfirmEnter();
            }}
            className="flex-1 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(20,184,166,0.6)] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>دخول عالم يوسف والبدء</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
