import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Sparkles } from 'lucide-react';
import { REALM_THEMES } from '../data/themes';
import { RealmTheme } from '../types';
import { audio } from '../utils/audioManager';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: RealmTheme;
  onSelectTheme: (theme: RealmTheme) => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-2xl bg-gradient-to-b from-neutral-900 to-black border border-white/20 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg sm:text-xl font-bold text-white">اختر عالم MR JOO والخلفية 3D</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Themes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[70vh] overflow-y-auto pr-1">
            {REALM_THEMES.map((theme) => {
              const isSelected = currentTheme.id === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    audio.playHover();
                    onSelectTheme(theme);
                    onClose();
                  }}
                  className={`group relative rounded-2xl overflow-hidden border-2 text-right transition-all p-3 flex flex-col gap-2 ${
                    isSelected
                      ? 'border-amber-400 bg-amber-500/15 shadow-[0_0_25px_rgba(251,191,36,0.4)]'
                      : 'border-white/15 bg-white/5 hover:border-white/40 hover:bg-white/10'
                  }`}
                >
                  {/* Thumbnail Image */}
                  <div className="w-full h-32 rounded-xl overflow-hidden relative">
                    <img
                      src={theme.image}
                      alt={theme.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {isSelected && (
                      <div className="absolute top-2 left-2 p-1.5 rounded-full bg-amber-500 text-black shadow-lg">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}

                    <div className="absolute bottom-2 right-2">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-black/70 border border-white/20 text-white">
                        {theme.colorName}
                      </span>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors">
                      {theme.name}
                    </h4>
                    <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                      {theme.tagline}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-center">
            <p className="text-xs text-neutral-400">
              تتغير ألوان الإضاءة النيون والمؤثرات الصوتية والمظهر ثلاثي الأبعاد مع كل عالم!
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
