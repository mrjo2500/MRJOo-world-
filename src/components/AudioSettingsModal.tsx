import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Volume2, Music, Sparkles, Play, Users } from 'lucide-react';
import { AudioSettings, MusicTrackId } from '../types';
import { audio } from '../utils/audioManager';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AudioSettings;
  onUpdateSettings: (newSettings: Partial<AudioSettings>) => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const tracks: { id: MusicTrackId; name: string; desc: string }[] = [
    {
      id: 'royal_battle',
      name: 'حماس المعركة الملكية (Royal Battle Pulse)',
      desc: 'إيقاع إلكتروني بطولي حماسي، نغمات سنث وقرع طبول ملحمي',
    },
    {
      id: 'grand_heartbeat',
      name: 'نبض المسابقة الكبرى (Game Show Tension)',
      desc: 'نبضات قلب متسارعة، وتوتر تشويقي يحبس الأنفاس مثل برامج المسابقات الكبرى',
    },
    {
      id: 'mythic_mystery',
      name: 'غموض التحدي الأسطوري (Mythic Mystery)',
      desc: 'ألحان سحرية عميقة تثير الفضول والتفكير الاستراتيجي في قاعة العرش',
    },
    {
      id: 'glory_anthem',
      name: 'نشيد الانتصار والمجد (Anthem of Glory)',
      desc: 'أبواق ومارش النصر والملوك للاحتفال بالإنجازات وسلاسل الفوز',
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-lg bg-gradient-to-b from-neutral-900 to-black border border-white/20 rounded-3xl p-5 sm:p-6 shadow-2xl relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg sm:text-xl font-bold text-white">إعدادات الموسيقى وهتاف الجمهور</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-5">
            {/* Music Master Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <Music className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="font-bold text-sm sm:text-base text-white">الموسيقى الخلفية الحماسية</div>
                  <div className="text-xs text-neutral-400">تشغيل موسيقى التحدي التفاعلية</div>
                </div>
              </div>
              <button
                onClick={() => {
                  const nextVal = !settings.musicEnabled;
                  onUpdateSettings({ musicEnabled: nextVal });
                  if (nextVal) audio.startMusic();
                  else audio.stopMusic();
                }}
                className={`w-12 h-7 rounded-full transition-colors relative p-1 ${
                  settings.musicEnabled ? 'bg-amber-500' : 'bg-neutral-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.musicEnabled ? 'translate-x-0' : '-translate-x-5'
                  }`}
                />
              </button>
            </div>

            {/* SFX & Crowd Cheering Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="font-bold text-sm sm:text-base text-white">هتاف الجمهور والمؤثرات الصوتية</div>
                  <div className="text-xs text-neutral-400">تصفيق وصيحات الجمهور عند الإجابة الصحيحة</div>
                </div>
              </div>
              <button
                onClick={() => {
                  onUpdateSettings({ sfxEnabled: !settings.sfxEnabled });
                }}
                className={`w-12 h-7 rounded-full transition-colors relative p-1 ${
                  settings.sfxEnabled ? 'bg-emerald-500' : 'bg-neutral-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.sfxEnabled ? 'translate-x-0' : '-translate-x-5'
                  }`}
                />
              </button>
            </div>

            {/* Track Selector */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2.5">
                اختر المقطوعة الموسيقية المفضلة:
              </label>
              <div className="space-y-2">
                {tracks.map((t) => {
                  const isSelected = settings.currentTrack === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        onUpdateSettings({ currentTrack: t.id });
                        audio.setSettings({ ...settings, currentTrack: t.id });
                      }}
                      className={`w-full text-right p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/15 text-amber-200'
                          : 'border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="font-bold text-sm flex items-center justify-between">
                        <span>{t.name}</span>
                        {isSelected && <span className="text-xs text-amber-400 font-black">● قيد التشغيل</span>}
                      </div>
                      <div className="text-xs text-neutral-400 mt-0.5">{t.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Test Crowd Cheer and SFX buttons */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
              <div className="text-xs font-bold text-emerald-300 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>تجربة أصوات الجمهور المباشرة:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => audio.playCrowdCheer(3.0)}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>هتاف وتصفيق الجمهور 👏</span>
                </button>
                <button
                  onClick={() => audio.playCorrect()}
                  className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>نغمة الإجابة الصحيحة ✨</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
