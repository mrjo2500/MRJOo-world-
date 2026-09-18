import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  Sparkles, 
  Sliders, 
  Heart, 
  Trophy, 
  Users, 
  HelpCircle, 
  FastForward, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  Palette,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { GameStats } from '../types';

interface FloatingWorldRibbonsProps {
  stats: GameStats;
  currentMode: 'mr_joo' | 'youssef_world';
  onSwitchToMrJoo: () => void;
  onRequestEnterYoussefWorld: () => void;
  musicEnabled: boolean;
  onToggleMusic: () => void;
  onOpenMasterSettings: () => void;
  onOpenDailyCard: () => void;
  onOpenTranquilityMessage: () => void;
  onUseFiftyFifty: () => void;
  onUseAudience: () => void;
  onUseHint: () => void;
  onUseSkip: () => void;
  isAnswered: boolean;
  hintRevealed: boolean;
}

export const FloatingWorldRibbons: React.FC<FloatingWorldRibbonsProps> = ({
  stats,
  currentMode,
  onSwitchToMrJoo,
  onRequestEnterYoussefWorld,
  musicEnabled,
  onToggleMusic,
  onOpenMasterSettings,
  onOpenDailyCard,
  onOpenTranquilityMessage,
  onUseFiftyFifty,
  onUseAudience,
  onUseHint,
  onUseSkip,
  isAnswered,
  hintRevealed,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full max-w-5xl mx-auto px-2.5 pt-2 pb-1 relative z-30 flex items-center justify-between gap-2 select-none">
      
      {/* 1. Left Side: أترك أثر طيّب (Previously "عالم يوسف", renamed exactly as requested with pure, serene styling) */}
      <button
        id="ribbon_youssef_world"
        onClick={onRequestEnterYoussefWorld}
        className={`group relative flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full backdrop-blur-xl transition-all duration-300 shadow-lg active:scale-95 border ${
          currentMode === 'youssef_world'
            ? 'bg-gradient-to-r from-red-950/95 via-rose-900/90 to-red-950/95 border-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.6)] ring-2 ring-rose-400/40'
            : 'bg-black/80 hover:bg-rose-950/50 border-rose-500/40 hover:border-rose-400 text-rose-200 shadow-md'
        }`}
        title="أترك أثر طيّب (عالم القرآن الكريم والأسئلة الإيمانية والسكينة)"
      >
        {/* Ambient Subtle Pulse */}
        <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500 opacity-25 blur-xs group-hover:opacity-75 transition duration-500 animate-pulse" />

        <div className="relative flex items-center gap-1.5 z-10">
          <div className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-400/60 flex items-center justify-center text-xs shadow-inner shrink-0">
            <span>🕊️</span>
          </div>
          <span className="text-xs sm:text-sm font-black tracking-wide text-rose-100 font-cairo">
            أترك أثر طيّب
          </span>
          {currentMode === 'youssef_world' && (
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping ml-0.5" />
          )}
        </div>
      </button>

      {/* 2. Center Score / Streak Pill (Minimal & Uncluttered) */}
      <div className="flex items-center gap-2 bg-black/80 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/15 shadow-md">
        <div className="flex items-center gap-1 text-amber-300 text-xs font-black">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>{stats.score.toLocaleString('ar-EG')}</span>
        </div>
        {stats.streak > 1 && (
          <span className="text-orange-400 text-[11px] font-bold border-r border-white/15 pr-1.5 flex items-center gap-0.5">
            🔥 {stats.streak}
          </span>
        )}
      </div>

      {/* 3. Right Side: The Hamburger Menu "三" (All Features, Daily Advice Card, Comfort Message & Settings) */}
      <div className="relative">
        <button
          id="btn_main_three_bars_menu"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full backdrop-blur-xl transition-all duration-300 shadow-lg active:scale-95 border ${
            isMenuOpen
              ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.6)]'
              : 'bg-black/85 text-amber-300 border-amber-500/50 hover:border-amber-400 hover:bg-slate-900 shadow-md'
          }`}
          title="القائمة الشاملة: كارت النصيحة اليومي، رسائل الراحة، لوحة التحكم، وسائل المساعدة"
        >
          <Menu className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          <span className="text-xs sm:text-sm font-black font-cairo hidden xs:inline">
            القائمة
          </span>
        </button>

        {/* The Mega Drawer / Popover Menu from the 3 Bars */}
        {isMenuOpen && (
          <div className="absolute top-12 left-0 z-50 w-72 sm:w-80 bg-slate-950/95 backdrop-blur-2xl border-2 border-amber-500/50 rounded-3xl p-4 shadow-[0_15px_60px_rgba(0,0,0,0.95)] animate-in fade-in zoom-in-95 duration-200 text-right select-none">
            
            {/* Header of Drawer */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>مركز MRJOOWORLD الشامل</span>
              </span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Feature 1: كارت النصيحة اليومي (مرة كل ٢٤ ساعة) */}
              <button
                onClick={() => {
                  onOpenDailyCard();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-transparent border border-amber-400/40 hover:border-amber-400 hover:bg-amber-500/25 transition-all text-white group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/30 border border-amber-400 flex items-center justify-center text-base shadow-inner">
                    🌸
                  </div>
                  <div className="flex flex-col text-right leading-tight">
                    <span className="text-xs font-black text-amber-200 group-hover:text-amber-100">
                      كارت حظك ونصيحة اليوم
                    </span>
                    <span className="text-[10px] text-slate-300">
                      رسالة خاصة بك تتجدد كل ٢٤ ساعة
                    </span>
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </button>

              {/* Feature 2: رسالة طمأنينة وراحة بال (اليوم ستفرح / فقط قل يارب) */}
              <button
                onClick={() => {
                  onOpenTranquilityMessage();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-gradient-to-r from-rose-500/20 via-pink-500/15 to-transparent border border-rose-400/40 hover:border-rose-400 hover:bg-rose-500/25 transition-all text-white group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/30 border border-rose-400 flex items-center justify-center text-base shadow-inner">
                    🤍
                  </div>
                  <div className="flex flex-col text-right leading-tight">
                    <span className="text-xs font-black text-rose-200 group-hover:text-rose-100">
                      رسائل الطمأنينة والراحة
                    </span>
                    <span className="text-[10px] text-slate-300">
                      فات كتير.. وقت اليُسر جاي اتطمن
                    </span>
                  </div>
                </div>
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
              </button>

              {/* Feature 3: لوحة التحكم الشاملة الاحترافية */}
              <button
                onClick={() => {
                  onOpenMasterSettings();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-amber-400/50 hover:bg-slate-800 transition-all text-white group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col text-right leading-tight">
                    <span className="text-xs font-black text-slate-200 group-hover:text-amber-200">
                      لوحة التحكم الشاملة
                    </span>
                    <span className="text-[10px] text-slate-400">
                      إعدادات العالم، الصور، الصوت، الأسئلة
                    </span>
                  </div>
                </div>
              </button>

              {/* Quick Audio Toggle */}
              {currentMode === 'mr_joo' && (
                <button
                  onClick={onToggleMusic}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] transition-all text-xs text-slate-300"
                >
                  <div className="flex items-center gap-2">
                    {musicEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                    <span>الموسيقى الملكية</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${musicEnabled ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-slate-500'}`}>
                    {musicEnabled ? 'مفعّلة' : 'صامت'}
                  </span>
                </button>
              )}

              {/* In-Game Lifelines Group */}
              <div className="pt-2 border-t border-white/10">
                <div className="text-[10px] text-slate-400 font-bold mb-1.5">
                  وسائل المساعدة:
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    onClick={() => {
                      onUseFiftyFifty();
                      setIsMenuOpen(false);
                    }}
                    disabled={stats.usedLifelines.fiftyFifty || isAnswered}
                    className={`p-1.5 rounded-xl text-[10px] font-black border transition-all text-center ${
                      stats.usedLifelines.fiftyFifty || isAnswered
                        ? 'opacity-30 bg-neutral-900 border-neutral-800 text-neutral-600'
                        : 'bg-indigo-600/30 border-indigo-400/50 text-indigo-200 hover:bg-indigo-600/50'
                    }`}
                  >
                    50:50
                  </button>

                  <button
                    onClick={() => {
                      onUseAudience();
                      setIsMenuOpen(false);
                    }}
                    disabled={stats.usedLifelines.audience || isAnswered}
                    className={`p-1.5 rounded-xl text-[10px] font-bold border transition-all text-center ${
                      stats.usedLifelines.audience || isAnswered
                        ? 'opacity-30 bg-neutral-900 border-neutral-800 text-neutral-600'
                        : 'bg-cyan-600/30 border-cyan-400/50 text-cyan-200 hover:bg-cyan-600/50'
                    }`}
                  >
                    الجمهور
                  </button>

                  <button
                    onClick={() => {
                      onUseHint();
                      setIsMenuOpen(false);
                    }}
                    disabled={stats.usedLifelines.hint || isAnswered || hintRevealed}
                    className={`p-1.5 rounded-xl text-[10px] font-bold border transition-all text-center ${
                      stats.usedLifelines.hint || isAnswered || hintRevealed
                        ? 'opacity-30 bg-neutral-900 border-neutral-800 text-neutral-600'
                        : 'bg-emerald-600/30 border-emerald-400/50 text-emerald-200 hover:bg-emerald-600/50'
                    }`}
                  >
                    تلميح
                  </button>

                  <button
                    onClick={() => {
                      onUseSkip();
                      setIsMenuOpen(false);
                    }}
                    disabled={stats.usedLifelines.skip || isAnswered}
                    className={`p-1.5 rounded-xl text-[10px] font-bold border transition-all text-center ${
                      stats.usedLifelines.skip || isAnswered
                        ? 'opacity-30 bg-neutral-900 border-neutral-800 text-neutral-600'
                        : 'bg-purple-600/30 border-purple-400/50 text-purple-200 hover:bg-purple-600/50'
                    }`}
                  >
                    تخطي
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </header>
  );
};
