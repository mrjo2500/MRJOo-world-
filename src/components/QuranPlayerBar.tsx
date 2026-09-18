import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, Volume2, VolumeX, BookOpen } from 'lucide-react';
import { audio } from '../utils/audioManager';

interface QuranPlayerBarProps {
  onExitYoussefWorld?: () => void;
}

const SURAHS = [
  { num: 12, name: 'سورة يوسف' },
  { num: 1, name: 'سورة الفاتحة' },
  { num: 18, name: 'سورة الكهف' },
  { num: 36, name: 'سورة يس' },
  { num: 55, name: 'سورة الرحمن' },
  { num: 67, name: 'سورة الملك' },
];

export const QuranPlayerBar: React.FC<QuranPlayerBarProps> = ({ onExitYoussefWorld }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSurahIdx, setCurrentSurahIdx] = useState(0);

  const togglePlay = () => {
    if (isPlaying) {
      audio.pauseQuran();
      setIsPlaying(false);
    } else {
      audio.resumeQuran();
      setIsPlaying(true);
    }
  };

  const handleNextSurah = () => {
    const next = (currentSurahIdx + 1) % SURAHS.length;
    setCurrentSurahIdx(next);
    audio.playQuran(next);
    setIsPlaying(true);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-2 py-1 select-none z-20">
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-xl border border-teal-500/30 shadow-[0_4px_20px_rgba(13,148,136,0.25)] text-xs">
        
        {/* Reciter Info */}
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shrink-0" />
          <div className="text-right truncate">
            <span className="font-bold text-teal-200 block truncate">
              {SURAHS[currentSurahIdx].name} • هزاع البلوشي
            </span>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={togglePlay}
            className="w-7 h-7 rounded-full bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-400/40 flex items-center justify-center transition-all"
            title={isPlaying ? 'إيقاف التلاوة مؤقتاً' : 'متابعة التلاوة'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          <button
            onClick={handleNextSurah}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center transition-all"
            title="السورة التالية"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
