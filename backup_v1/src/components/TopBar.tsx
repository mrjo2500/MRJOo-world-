import React from 'react';
import { Volume2, VolumeX, Flame, Trophy, HelpCircle, Users, FastForward, Sparkles, SlidersHorizontal, Layers } from 'lucide-react';
import { RealmTheme, GameStats } from '../types';

interface TopBarProps {
  currentTheme: RealmTheme;
  stats: GameStats;
  musicEnabled: boolean;
  onToggleMusic: () => void;
  onOpenAudioSettings: () => void;
  onOpenHistorySettings: () => void;
  onOpenThemeSelector: () => void;
  onUseFiftyFifty: () => void;
  onUseAudience: () => void;
  onUseHint: () => void;
  onUseSkip: () => void;
  isAnswered: boolean;
  hintRevealed: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTheme,
  stats,
  musicEnabled,
  onToggleMusic,
  onOpenAudioSettings,
  onOpenHistorySettings,
  onOpenThemeSelector,
  onUseFiftyFifty,
  onUseAudience,
  onUseHint,
  onUseSkip,
  isAnswered,
  hintRevealed,
}) => {
  return (
    <header className="w-full max-w-5xl mx-auto px-2 py-1.5 sm:px-4 sm:py-2.5 z-30 relative">
      <div className="backdrop-blur-xl bg-black/80 border border-amber-500/30 rounded-2xl px-2.5 py-1.5 sm:px-4 sm:py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.7)] flex items-center justify-between gap-1.5 sm:gap-3">
        
        {/* Left: Branding & Realm Switcher */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenThemeSelector}
            className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 transition-all text-xs font-bold text-amber-300 shadow-sm"
            title="تغيير العالم والصرح 3D"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{currentTheme.name}</span>
            <span className="sm:hidden text-[11px]">العوالم</span>
          </button>

          {/* Music Toggle */}
          <button
            onClick={onToggleMusic}
            className={`p-1.5 rounded-xl border border-white/10 transition-colors ${
              musicEnabled ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20' : 'text-neutral-400 bg-white/5 hover:bg-white/10'
            }`}
            title={musicEnabled ? 'كتم الموسيقى' : 'تشغيل الموسيقى الملكية'}
          >
            {musicEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Center: Score & Streak */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Score Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-400/40 text-amber-300">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs sm:text-sm font-black tracking-wide">{stats.score.toLocaleString('ar-EG')}</span>
            <span className="hidden sm:inline text-xs font-semibold">نقطة</span>
          </div>

          {/* Streak Flame */}
          <div className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-orange-500/15 border border-orange-400/30 text-orange-300">
            <Flame className={`w-3.5 h-3.5 text-orange-400 ${stats.streak > 1 ? 'animate-bounce' : ''}`} />
            <span className="text-xs font-black">{stats.streak}</span>
          </div>
        </div>

        {/* Right: Lifelines & Settings */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* 50:50 Lifeline */}
          <button
            onClick={onUseFiftyFifty}
            disabled={stats.usedLifelines.fiftyFifty || isAnswered}
            className={`px-2 py-1 rounded-xl text-[11px] sm:text-xs font-black transition-all border ${
              stats.usedLifelines.fiftyFifty || isAnswered
                ? 'opacity-30 bg-neutral-800 border-neutral-700 text-neutral-500 cursor-not-allowed'
                : 'bg-indigo-600/30 border-indigo-400/50 text-indigo-200 hover:bg-indigo-600/50 active:scale-95 shadow-sm'
            }`}
            title="حذف إجابتين"
          >
            50:50
          </button>

          {/* Audience Vote */}
          <button
            onClick={onUseAudience}
            disabled={stats.usedLifelines.audience || isAnswered}
            className={`p-1.5 sm:px-2 sm:py-1 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 ${
              stats.usedLifelines.audience || isAnswered
                ? 'opacity-30 bg-neutral-800 border-neutral-700 text-neutral-500 cursor-not-allowed'
                : 'bg-cyan-600/30 border-cyan-400/50 text-cyan-200 hover:bg-cyan-600/50 active:scale-95 shadow-sm'
            }`}
            title="رأي الجمهور"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">الجمهور</span>
          </button>

          {/* AI Hint */}
          <button
            onClick={onUseHint}
            disabled={stats.usedLifelines.hint || isAnswered || hintRevealed}
            className={`p-1.5 sm:px-2 sm:py-1 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 ${
              stats.usedLifelines.hint || isAnswered || hintRevealed
                ? 'opacity-30 bg-neutral-800 border-neutral-700 text-neutral-500 cursor-not-allowed'
                : 'bg-emerald-600/30 border-emerald-400/50 text-emerald-200 hover:bg-emerald-600/50 active:scale-95 shadow-sm'
            }`}
            title="تلميح ذكي"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden md:inline text-[11px]">تلميح</span>
          </button>

          {/* Skip Question */}
          <button
            onClick={onUseSkip}
            disabled={stats.usedLifelines.skip || isAnswered}
            className={`p-1.5 sm:px-2 sm:py-1 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 ${
              stats.usedLifelines.skip || isAnswered
                ? 'opacity-30 bg-neutral-800 border-neutral-700 text-neutral-500 cursor-not-allowed'
                : 'bg-purple-600/30 border-purple-400/50 text-purple-200 hover:bg-purple-600/50 active:scale-95 shadow-sm'
            }`}
            title="تخطي السؤال الحالي"
          >
            <FastForward className="w-3.5 h-3.5 text-purple-300" />
            <span className="hidden md:inline text-[11px]">تخطي</span>
          </button>

          {/* Settings Modal Toggle */}
          <button
            onClick={onOpenHistorySettings}
            className="p-1.5 sm:p-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-all shadow-sm"
            title="إعدادات الأسئلة، منع التكرار لـ 24 ساعة، والإحصائيات"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
};
