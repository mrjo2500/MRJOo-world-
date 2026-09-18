import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sliders, 
  Palette, 
  Music, 
  Image as ImageIcon, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  Upload, 
  Monitor, 
  Volume2, 
  VolumeX, 
  Check, 
  Crown,
  Eye,
  Trash2
} from 'lucide-react';
import { RealmTheme, Category, Difficulty, AudioSettings, MusicTrackId } from '../types';
import { REALM_THEMES } from '../data/themes';
import { audio } from '../utils/audioManager';
import mrJooThroneDefault from '../assets/images/mr_joo_throne.jpg';
import mrJooEmblemDefault from '../assets/images/mr_joo_emblem.jpg';

interface MasterControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: RealmTheme;
  onSelectTheme: (theme: RealmTheme) => void;
  autoThemeChange: boolean;
  onToggleAutoTheme: (val: boolean) => void;
  audioSettings: AudioSettings;
  onUpdateAudioSettings: (newSettings: Partial<AudioSettings>) => void;
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
  customThronePhoto: string | null;
  customEmblemPhoto: string | null;
  onUpdateCustomPhotos: (type: 'throne' | 'emblem', dataUrl: string | null) => void;
  isLowSpecMode: boolean;
  onToggleLowSpecMode: (val: boolean) => void;
}

export const MasterControlModal: React.FC<MasterControlModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  autoThemeChange,
  onToggleAutoTheme,
  audioSettings,
  onUpdateAudioSettings,
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
  customThronePhoto,
  customEmblemPhoto,
  onUpdateCustomPhotos,
  isLowSpecMode,
  onToggleLowSpecMode,
}) => {
  const [activeTab, setActiveTab] = useState<'visuals' | 'audio' | 'photos' | 'questions' | 'performance'>('visuals');

  if (!isOpen) return null;

  const tracks: { id: MusicTrackId; name: string; desc: string }[] = [
    {
      id: 'royal_battle',
      name: 'حماس المعركة الملكية (Royal Battle Pulse)',
      desc: 'إيقاع إلكتروني بطولي حماسي، سنث وطبول ملحمية',
    },
    {
      id: 'grand_heartbeat',
      name: 'نبض المسابقة الكبرى (Game Show Tension)',
      desc: 'نبضات قلب متسارعة وتوتر تشويقي يحبس الأنفاس',
    },
    {
      id: 'mythic_mystery',
      name: 'غموض التحدي الأسطوري (Mythic Mystery)',
      desc: 'ألحان سحرية عميقة تثير الفضول والتفكير الاستراتيجي',
    },
    {
      id: 'glory_anthem',
      name: 'نشيد الانتصار والمجد (Anthem of Glory)',
      desc: 'مارش وأبواق النصر والملوك للاحتفال بالإنجازات',
    },
  ];

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'throne' | 'emblem') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onUpdateCustomPhotos(type, dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md select-none text-right">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="w-full max-w-2xl bg-gradient-to-b from-slate-900 via-neutral-950 to-black border border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_60px_rgba(0,0,0,0.9)] relative flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                  <span>لوحة التحكم الشاملة للصرح الملكي</span>
                  <Crown className="w-4 h-4 text-amber-400" />
                </h3>
                <p className="text-[11px] text-amber-300/80 font-mono">
                  Master Settings • MRJOOWORLD System
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-1 overflow-x-auto py-2.5 px-1 border-b border-white/5 scrollbar-none shrink-0">
            <button
              onClick={() => setActiveTab('visuals')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'visuals'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-neutral-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>كتالوج الألوان والعوالم</span>
            </button>

            <button
              onClick={() => setActiveTab('photos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'photos'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-neutral-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>إدارة وتخصيص الصور</span>
            </button>

            <button
              onClick={() => setActiveTab('audio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'audio'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-neutral-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>الموسيقى والأصوات</span>
            </button>

            <button
              onClick={() => setActiveTab('questions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'questions'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-neutral-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>منع التكرار والتوقيت</span>
            </button>

            <button
              onClick={() => setActiveTab('performance')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'performance'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-neutral-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>التوافق والشاشات</span>
            </button>
          </div>

          {/* Tab Contents Area */}
          <div className="flex-1 overflow-y-auto py-3 pr-1 space-y-4 text-xs sm:text-sm">
            
            {/* 1. VISUALS & AUTO THEME CATALOG */}
            {activeTab === 'visuals' && (
              <div className="space-y-4">
                {/* Automatic Color Shift Toggle */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-cyan-500/15 border border-amber-400/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white text-sm">تبديل ألوان العالم تدريجياً وتلقائياً</div>
                      <div className="text-[11px] text-neutral-300">
                        يغير درجات وأجواء الصرح ثلاثي الأبعاد كل 10 أسئلة بنعومة وسحر بدون إحساس بالانقطاع
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleAutoTheme(!autoThemeChange)}
                    className={`w-12 h-7 rounded-full transition-colors relative p-1 shrink-0 ${
                      autoThemeChange ? 'bg-amber-500' : 'bg-neutral-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        autoThemeChange ? 'translate-x-0' : '-translate-x-5'
                      }`}
                    />
                  </button>
                </div>

                {/* Themes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {REALM_THEMES.map((theme) => {
                    const isSelected = currentTheme.id === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => {
                          audio.playHover();
                          onSelectTheme(theme);
                        }}
                        className={`group relative rounded-2xl overflow-hidden border-2 text-right transition-all p-2.5 flex flex-col gap-2 ${
                          isSelected
                            ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                            : 'border-white/10 bg-white/5 hover:border-white/30'
                        }`}
                      >
                        <div className="w-full h-24 rounded-xl overflow-hidden relative">
                          <img
                            src={theme.image}
                            alt={theme.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          {isSelected && (
                            <div className="absolute top-2 left-2 p-1 rounded-full bg-amber-500 text-black">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                          <div className="absolute bottom-1.5 right-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/70 border border-white/20 text-white">
                              {theme.colorName}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs sm:text-sm group-hover:text-amber-300">
                            {theme.name}
                          </h4>
                          <p className="text-[11px] text-neutral-400 line-clamp-1">{theme.tagline}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. PHOTOS CUSTOMIZATION & UPLOAD */}
            {activeTab === 'photos' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-neutral-300 leading-relaxed">
                  يمكنك استبدال صور الصرح الملكي بصورك الأصلية مباشرة، أو استعادة الصور الأصلية الفخمة بضغطة واحدة:
                </div>

                {/* Throne Photo */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-amber-400 font-bold">صورة الصرح والعرش الرئيسي (Throne)</span>
                    <span className="text-[10px] text-neutral-400">تظهر في صرح 3D والافتتاحية</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-amber-400 shrink-0">
                      <img
                        src={customThronePhoto || mrJooThroneDefault}
                        alt="Throne"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="cursor-pointer flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>رفع صورة جديدة من جهازك</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'throne')}
                        />
                      </label>
                      {customThronePhoto && (
                        <button
                          onClick={() => onUpdateCustomPhotos('throne', null)}
                          className="text-[11px] text-rose-400 hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>استعادة الصورة الأصلية الافتراضية</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Emblem Photo */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-cyan-400 font-bold">صورة الهالة النجمية والمحراب (Emblem)</span>
                    <span className="text-[10px] text-neutral-400">المرحلة العُليا والأفق النجمي</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-cyan-400 shrink-0">
                      <img
                        src={customEmblemPhoto || mrJooEmblemDefault}
                        alt="Emblem"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="cursor-pointer flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>رفع صورة جديدة من جهازك</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'emblem')}
                        />
                      </label>
                      {customEmblemPhoto && (
                        <button
                          onClick={() => onUpdateCustomPhotos('emblem', null)}
                          className="text-[11px] text-rose-400 hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>استعادة الصورة الأصلية الافتراضية</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. AUDIO SETTINGS */}
            {activeTab === 'audio' && (
              <div className="space-y-4">
                {/* Music Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <Music className="w-5 h-5 text-amber-400" />
                    <div>
                      <div className="font-bold text-white">الموسيقى الخلفية (عالم MR JOO فقط)</div>
                      <div className="text-[11px] text-neutral-400">تتوقف تلقائياً في عالم يوسف تكرماً واحتراماً للقرآن</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const nextVal = !audioSettings.musicEnabled;
                      onUpdateAudioSettings({ musicEnabled: nextVal });
                      if (nextVal) audio.startMusic();
                      else audio.stopMusic();
                    }}
                    className={`w-12 h-7 rounded-full transition-colors relative p-1 ${
                      audioSettings.musicEnabled ? 'bg-amber-500' : 'bg-neutral-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        audioSettings.musicEnabled ? 'translate-x-0' : '-translate-x-5'
                      }`}
                    />
                  </button>
                </div>

                {/* SFX Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="font-bold text-white">المؤثرات الصوتية وتصفيق الفوز</div>
                      <div className="text-[11px] text-neutral-400">أصوات الأزرار وتصفيق الإجابة الصحيحة</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onUpdateAudioSettings({ sfxEnabled: !audioSettings.sfxEnabled })}
                    className={`w-12 h-7 rounded-full transition-colors relative p-1 ${
                      audioSettings.sfxEnabled ? 'bg-emerald-500' : 'bg-neutral-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        audioSettings.sfxEnabled ? 'translate-x-0' : '-translate-x-5'
                      }`}
                    />
                  </button>
                </div>

                {/* Track Selector */}
                <div className="space-y-2">
                  <label className="font-bold text-neutral-300 text-xs block">
                    المقطوعة الموسيقية في عالم MR JOO:
                  </label>
                  {tracks.map((t) => {
                    const isSel = audioSettings.currentTrack === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          onUpdateAudioSettings({ currentTrack: t.id });
                          audio.setSettings({ ...audioSettings, currentTrack: t.id });
                        }}
                        className={`w-full text-right p-3 rounded-xl border transition-all ${
                          isSel
                            ? 'border-amber-400 bg-amber-500/20 text-amber-200 font-bold'
                            : 'border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{t.name}</span>
                          {isSel && <span className="text-[10px] text-amber-400 font-black">● قيد التشغيل</span>}
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">{t.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. QUESTIONS DEDUPLICATION & TIMER */}
            {activeTab === 'questions' && (
              <div className="space-y-4">
                {/* 24h toggle */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">منع تكرار أي سؤال لمدة 24 ساعة</div>
                      <div className="text-[11px] text-neutral-300">
                        حفظ الأسئلة المستهلكة في الذاكرة لضمان تجدد دائم ({historyCount} سؤال محفوظ)
                      </div>
                    </div>
                    <button
                      onClick={() => onTogglePrevent24h(!prevent24h)}
                      className={`w-12 h-7 rounded-full transition-colors relative p-1 shrink-0 ${
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

                  {/* Clear history */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-[11px] text-neutral-400">تصفير سجل الأسئلة لبدء دورة جديدة</span>
                    <button
                      onClick={onClearHistory}
                      className="px-2.5 py-1 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/30 text-xs font-bold transition-colors"
                    >
                      مسح الذاكرة
                    </button>
                  </div>
                </div>

                {/* Category & Difficulty */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-neutral-300 text-xs block mb-1.5">المجال المعرفي:</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => onSelectCategory(e.target.value as Category)}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-white/20 text-white font-bold text-xs"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-neutral-300 text-xs block mb-1.5">مستوى الصعوبة:</label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => onSelectDifficulty(e.target.value as Difficulty)}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-white/20 text-white font-bold text-xs"
                    >
                      {difficulties.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* General Timer */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <div>
                    <div className="font-bold text-white">عداد الوقت (30 ثانية في عالم MR JOO)</div>
                    <div className="text-[11px] text-neutral-400">
                      ملاحظة: عداد الوقت معطل تلقائياً في عالم يوسف لتأمل القرآن بخشوع وبلا توتر
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleTimer(!timerEnabled)}
                    className={`w-12 h-7 rounded-full transition-colors relative p-1 ${
                      timerEnabled ? 'bg-amber-500' : 'bg-neutral-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        timerEnabled ? 'translate-x-0' : '-translate-x-5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* 5. PERFORMANCE & SCREEN COMPATIBILITY */}
            {activeTab === 'performance' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Monitor className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">وضع التوافق للشاشات والمتوسطة (Adaptive HD)</div>
                      <div className="text-[11px] text-neutral-300">
                        يضبط جودة الرسوميات وتنعيم الحواف تلقائياً لتعمل بسلاسة فائقة 60fps على الهواتف والشاشات وأجهزة الكمبيوتر
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleLowSpecMode(!isLowSpecMode)}
                    className={`w-12 h-7 rounded-full transition-colors relative p-1 shrink-0 ${
                      isLowSpecMode ? 'bg-emerald-500' : 'bg-neutral-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        isLowSpecMode ? 'translate-x-0' : '-translate-x-5'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-neutral-300 space-y-2 text-xs leading-relaxed">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>مواصفات التوافق الذكي المدمجة:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-neutral-400 pr-1">
                    <li>متجاوبة بنسبة 100% مع شاشات الهواتف (iPhone 11 وجميع مقاسات الهواتف).</li>
                    <li>دعم شاشات التلفاز الكبيرة وأجهزة الكمبيوتر (Full HD / 4K / UltraWide).</li>
                    <li>مستشعر إمالة الهاتف التفاعلي (Gyroscope 3D Tilt) مع دوران تلقائي سلس.</li>
                    <li>ضغط وتكيف الذاكرة العشوائية لحماية الأجهزة من التهنيج أو استهلاك البطارية.</li>
                  </ul>
                </div>
              </div>
            )}

          </div>

          {/* Footer Save Button */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between shrink-0">
            <span className="text-[11px] text-neutral-400">جميع الإعدادات يتم حفظها تلقائياً على جهازك</span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all shadow-md"
            >
              حفظ وإغلاق
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
