import React from 'react';
import { Crown, Sparkles, X, Play, Award, Flame, RefreshCw } from 'lucide-react';
import mrJooThroneImage from '../assets/images/mr_joo_throne.jpg';
import mrJooEmblemImage from '../assets/images/mr_joo_emblem.jpg';

interface MasterShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'intro' | 'outro' | 'streamer_break';
  score?: number;
  streak?: number;
  totalAnswered?: number;
  onStartGame?: () => void;
}

export const MasterShowcaseModal: React.FC<MasterShowcaseModalProps> = ({
  isOpen,
  onClose,
  mode,
  score = 0,
  streak = 0,
  totalAnswered = 0,
  onStartGame,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300 select-none overflow-y-auto">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-slate-900 via-stone-950 to-black border border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.9)] text-center text-white my-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {mode === 'intro' ? (
          /* ====================================================
             1. INTRO SCREEN (MRJOOWORLD)
             ==================================================== */
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-400/50 px-4 py-1.5 rounded-full text-xs font-bold text-amber-300">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="font-cinzel tracking-wider font-black">MRJOOWORLD</span>
            </div>

            {/* MR JOO Throne Image Showcase */}
            <div className="relative mx-auto w-full max-w-sm h-72 rounded-2xl overflow-hidden border border-amber-500/40 shadow-2xl">
              <img
                src={mrJooThroneImage}
                alt="MR JOO"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                <div className="text-xl font-black text-amber-300 font-cinzel">
                  MRJOOWORLD
                </div>
                <div className="text-xs text-stone-300 mt-0.5 font-light">
                  صرح السيادة والمعرفة والتحدي الملكي 3D
                </div>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={() => {
                if (onStartGame) onStartGame();
                onClose();
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:brightness-110 text-slate-950 font-black text-base shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2 transform active:scale-98 transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>دخول التحدي ❯</span>
            </button>
          </div>
        ) : mode === 'outro' ? (
          /* ====================================================
             2. OUTRO SCREEN
             ==================================================== */
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-400/50 px-4 py-1.5 rounded-full text-xs font-bold text-amber-300">
              <Award className="w-4 h-4 text-amber-400" />
              <span>نتيجة التحدي • MRJOOWORLD</span>
            </div>

            {/* Avatar Showcase */}
            <div className="relative mx-auto w-36 h-36 rounded-full overflow-hidden border-2 border-amber-400 shadow-xl">
              <img
                src={mrJooThroneImage}
                alt="MR JOO"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <h2 className="text-xl font-bold text-amber-300">
              اكتملت الجولة بنجاح
            </h2>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-3 bg-stone-900/80 border border-white/10 rounded-2xl p-3.5">
              <div>
                <div className="text-[11px] text-stone-400">النقاط</div>
                <div className="text-lg font-black text-amber-400 font-mono mt-0.5">
                  {score}
                </div>
              </div>
              <div className="border-x border-stone-800">
                <div className="text-[11px] text-stone-400">أطول سلسلة</div>
                <div className="text-lg font-black text-emerald-400 font-mono mt-0.5 flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 text-orange-400" />
                  {streak}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-stone-400">الأسئلة</div>
                <div className="text-lg font-black text-cyan-400 font-mono mt-0.5">
                  {totalAnswered}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (onStartGame) onStartGame();
                onClose();
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-all hover:brightness-110"
            >
              <RefreshCw className="w-4 h-4" />
              <span>جولة جديدة</span>
            </button>
          </div>
        ) : (
          /* ====================================================
             3. MRJOOWORLD ASTRAL SHOWCASE
             ==================================================== */
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-cyan-950/70 border border-cyan-400/50 px-4 py-1.5 rounded-full text-xs font-bold text-cyan-300">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>MRJOOWORLD • الأفق النجمي</span>
            </div>

            <div className="relative mx-auto w-56 h-80 rounded-2xl overflow-hidden border-2 border-cyan-500/60 shadow-2xl">
              <img
                src={mrJooEmblemImage}
                alt="MR JOO Emblem"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <p className="text-xs text-stone-300">
              المرحلة العُليا: هالة المجد الكونية وتاج السيادة الفضي في MRJOOWORLD
            </p>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs shadow-md transition-all"
            >
              متابعة التحدي ❯
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
