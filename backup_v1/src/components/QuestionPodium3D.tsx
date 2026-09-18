import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, CheckCircle2, XCircle, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';
import { Question, RealmTheme } from '../types';
import { audio } from '../utils/audioManager';

interface QuestionPodium3DProps {
  question: Question;
  theme: RealmTheme;
  selectedIndex: number | null;
  isLockedIn: boolean;
  isAnswered: boolean;
  isCorrect: boolean | null;
  eliminatedIndices: number[];
  hintRevealed: boolean;
  onSelectOption: (index: number) => void;
  onNextQuestion: () => void;
  questionNumber: number;
  timeLeft: number;
  timerActive: boolean;
}

export const QuestionPodium3D: React.FC<QuestionPodium3DProps> = ({
  question,
  theme,
  selectedIndex,
  isLockedIn,
  isAnswered,
  isCorrect,
  eliminatedIndices,
  hintRevealed,
  onSelectOption,
  onNextQuestion,
  questionNumber,
  timeLeft,
  timerActive,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // 3D Parallax Tilt calculation based on cursor coordinates
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;
    // Calculate tilt: -8 to +8 degrees
    const tiltX = -(mouseY / (rect.height / 2)) * 6;
    const tiltY = (mouseX / (rect.width / 2)) * 6;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-2 perspective-1400 select-none"
    >
      <motion.div
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          scale: isHovered ? 1.01 : 1.0,
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 25 }}
        className="transform-style-3d relative flex flex-col items-center"
      >
        {/* Top Floating Crown Emblem & World Title */}
        <div className="relative -mb-4 z-20 flex flex-col items-center">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="flex items-center gap-2 px-5 py-2 rounded-full border border-amber-400/50 bg-gradient-to-r from-black/90 via-stone-900/95 to-black/90 shadow-[0_0_25px_rgba(251,191,36,0.35)] backdrop-blur-md"
          >
            <Crown className="w-5 h-5 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            <span className="font-cinzel text-base sm:text-lg font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 drop-shadow-[0_2px_10px_rgba(251,191,36,0.4)]">
              MR JOO WORLD
            </span>
            <Crown className="w-5 h-5 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
          </motion.div>
        </div>

        {/* Question Box (Beveled 3D Podium) */}
        <div className="w-full relative z-10">
          <div
            className={`w-full rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 text-center backdrop-blur-xl border-2 transition-all duration-500 relative overflow-hidden bg-gradient-to-b ${theme.podiumGradient} ${theme.neonBorder}`}
            style={{
              boxShadow: `0 15px 45px -10px ${theme.neonGlow}, inset 0 1px 2px rgba(255,255,255,0.25)`,
              transform: 'translateZ(30px)',
            }}
          >
            {/* Glossy Reflection overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            
            {/* Top Info Strip: Category & Timer */}
            <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4 text-xs sm:text-sm font-semibold text-white/75 relative z-10">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-black/50 border border-white/15 text-white/90">
                  سؤال رقم #{questionNumber}
                </span>
                <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/15 text-amber-300">
                  {question.category}
                </span>
              </div>

              {/* Timer Pill */}
              {timerActive && (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-mono font-bold transition-all ${
                    timeLeft <= 5
                      ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                      : 'bg-black/50 border-white/20 text-white/90'
                  }`}
                >
                  <span>⏱</span>
                  <span>{timeLeft} ثانية</span>
                </div>
              )}
            </div>

            {/* Question Text */}
            <h2
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-white leading-relaxed tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] relative z-10"
              style={{ textShadow: '0 0 12px rgba(255,255,255,0.2)' }}
            >
              {question.question}
            </h2>

            {/* AI Hint Box if active */}
            {hintRevealed && question.hint && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>تلميح المستشار الملكي:</strong> {question.hint}</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* 4 Answer Options (A, B, C, D) in 2x2 Grid Matching User Images */}
        <div
          className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6 z-10"
          style={{ transform: 'translateZ(45px)' }}
        >
          {question.options.map((optionText, idx) => {
            const letter = optionLetters[idx];
            const isSelected = selectedIndex === idx;
            const isEliminated = eliminatedIndices.includes(idx);
            const isCorrectOption = question.correctIndex === idx;

            // Determine option card styling
            let cardStateClass = theme.optionBaseClass;
            let badgeClass = theme.badgeBg;
            let iconElement = null;

            if (isAnswered) {
              if (isCorrectOption) {
                cardStateClass = theme.optionCorrectClass;
                badgeClass = 'bg-emerald-800 border-emerald-300 text-white';
                iconElement = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 animate-bounce" />;
              } else if (isSelected && !isCorrect) {
                cardStateClass = theme.optionWrongClass;
                badgeClass = 'bg-rose-900 border-rose-300 text-white';
                iconElement = <XCircle className="w-5 h-5 text-rose-400 shrink-0 animate-pulse" />;
              } else {
                cardStateClass = 'opacity-40 border-neutral-700 bg-neutral-950/40 text-neutral-400 cursor-not-allowed';
              }
            } else if (isLockedIn && isSelected) {
              cardStateClass = theme.optionSelectedClass;
              badgeClass = 'bg-amber-600 border-amber-300 text-white animate-pulse';
            } else if (isEliminated) {
              cardStateClass = 'opacity-20 border-transparent bg-black/40 text-transparent cursor-not-allowed line-through';
            }

            return (
              <motion.button
                key={idx}
                disabled={isAnswered || isLockedIn || isEliminated}
                onClick={() => {
                  if (isAnswered || isLockedIn || isEliminated) return;
                  audio.playHover();
                  onSelectOption(idx);
                }}
                onMouseEnter={() => {
                  if (!isAnswered && !isLockedIn && !isEliminated) {
                    audio.playHover();
                  }
                }}
                whileHover={
                  !isAnswered && !isLockedIn && !isEliminated
                    ? { scale: 1.02, y: -2 }
                    : {}
                }
                whileTap={
                  !isAnswered && !isLockedIn && !isEliminated
                    ? { scale: 0.98 }
                    : {}
                }
                className={`group relative rounded-xl sm:rounded-2xl p-3.5 sm:p-4 md:p-5 border-2 transition-all duration-300 flex items-center justify-between text-right backdrop-blur-md overflow-hidden ${cardStateClass} ${
                  !isAnswered && !isEliminated ? theme.optionHoverClass : ''
                }`}
                style={{
                  clipPath: 'polygon(12px 0%, calc(100% - 12px) 0%, 100% 50%, calc(100% - 12px) 100%, 12px 100%, 0% 50%)',
                }}
              >
                {/* Subtle light sweep reflection */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                {/* Right side (RTL): Letter Badge (A, B, C, D) */}
                <div className="flex items-center gap-3 relative z-10 w-full">
                  <div
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 flex items-center justify-center font-cinzel font-black text-sm sm:text-base shadow-md shrink-0 transition-transform group-hover:scale-110 ${badgeClass}`}
                  >
                    {letter}
                  </div>

                  {/* Option Text */}
                  <span
                    className={`text-sm sm:text-base md:text-lg font-bold leading-snug flex-1 ${
                      isEliminated ? 'line-through' : ''
                    }`}
                  >
                    {isEliminated ? '--- محذوف ---' : optionText}
                  </span>
                </div>

                {/* Left status icon (Correct/Wrong) */}
                {iconElement && <div className="ml-2 relative z-10">{iconElement}</div>}
              </motion.button>
            );
          })}
        </div>

        {/* Post-Answer Explanation Banner & Next Question CTA */}
        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full mt-5 z-20"
              style={{ transform: 'translateZ(50px)' }}
            >
              <div
                className={`p-4 sm:p-5 rounded-2xl border-2 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  isCorrect
                    ? 'bg-emerald-950/80 border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.4)]'
                    : 'bg-rose-950/80 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.4)]'
                }`}
              >
                <div className="text-right flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {isCorrect ? (
                      <span className="font-extrabold text-emerald-300 flex items-center gap-1.5 text-base sm:text-lg">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        إجابة صحيحة ومبهرة! +100 نقطة
                      </span>
                    ) : (
                      <span className="font-extrabold text-rose-300 flex items-center gap-1.5 text-base sm:text-lg">
                        <XCircle className="w-5 h-5 text-rose-400" />
                        للأسف إجابة غير صحيحة!
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                    <strong>المعلومة الذهبية:</strong> {question.explanation}
                  </p>
                </div>

                {/* Next Question Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    audio.playHover();
                    onNextQuestion();
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-sm sm:text-base flex items-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.8)] border border-yellow-200 shrink-0 cursor-pointer animate-pulse"
                >
                  <span>السؤال التالي</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
