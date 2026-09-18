/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { REALM_THEMES } from './data/themes';
import { INITIAL_QUESTION_BANK } from './data/questionBank';
import {
  Question,
  RealmTheme,
  AudioSettings,
  GameStats,
  AudienceVote,
  Category,
  Difficulty,
} from './types';
import { audio } from './utils/audioManager';
import { TopBar } from './components/TopBar';
import { QuestionPodium3D } from './components/QuestionPodium3D';
import { BackgroundAmbient3D } from './components/BackgroundAmbient3D';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { AudioSettingsModal } from './components/AudioSettingsModal';
import { AudienceModal } from './components/AudienceModal';
import { HistorySettingsModal } from './components/HistorySettingsModal';
import { VirtualWorld3D } from './components/VirtualWorld3D';
import { MasterShowcaseModal } from './components/MasterShowcaseModal';
import { SponsorAdBanner } from './components/SponsorAdBanner';
import { Loader2, Sparkles, Trophy, Globe, Layers, Crown, Footprints } from 'lucide-react';

const STORAGE_HISTORY_KEY = 'mr_joo_question_history_v2';
const STORAGE_STATS_KEY = 'mr_joo_player_stats_v2';

export default function App() {
  // Themes
  const [currentTheme, setCurrentTheme] = useState<RealmTheme>(REALM_THEMES[0]);

  // Audio Settings
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    musicEnabled: true,
    sfxEnabled: true,
    musicVolume: 0.5,
    sfxVolume: 0.8,
    currentTrack: 'royal_battle',
  });

  // Game Stats
  const [stats, setStats] = useState<GameStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STATS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      score: 0,
      streak: 0,
      bestStreak: 0,
      totalAnswered: 0,
      totalCorrect: 0,
      pointsEarned: 0,
      usedLifelines: {
        fiftyFifty: false,
        audience: false,
        skip: false,
        hint: false,
      },
    };
  });

  // Anti-Repetition Settings (24h & Session)
  const [prevent24h, setPrevent24h] = useState(true);
  const [preventSessionRepeat, setPreventSessionRepeat] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('all');
  const [timerEnabled, setTimerEnabled] = useState(true);

  // Question State
  const [questionQueue, setQuestionQueue] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [isFetchingAi, setIsFetchingAi] = useState(false);

  // Interaction State for Active Question
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isLockedIn, setIsLockedIn] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [eliminatedIndices, setEliminatedIndices] = useState<number[]>([]);
  const [hintRevealed, setHintRevealed] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState(30);

  // Modals
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [audienceVote, setAudienceVote] = useState<AudienceVote | null>(null);
  const [isAudienceModalOpen, setIsAudienceModalOpen] = useState(false);

  // 3D Virtual World vs Classic Arena Mode
  const [viewMode, setViewMode] = useState<'3d_virtual_world' | 'classic_podium'>('3d_virtual_world');
  const [masterModal, setMasterModal] = useState<{
    isOpen: boolean;
    mode: 'intro' | 'outro' | 'streamer_break';
  }>({
    isOpen: false,
    mode: 'intro',
  });

  // Deduplication History (Map of question text -> timestamp)
  const historyMapRef = useRef<Record<string, number>>({});
  const sessionQuestionIdsRef = useRef<Set<string>>(new Set());

  // Load History from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_HISTORY_KEY);
      if (stored) {
        historyMapRef.current = JSON.parse(stored);
      }
    } catch {}
  }, []);

  // Sync Stats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_STATS_KEY, JSON.stringify(stats));
    } catch {}
  }, [stats]);

  // Sync Audio Settings to Audio Manager
  useEffect(() => {
    audio.setSettings(audioSettings);
  }, [audioSettings]);

  // Check if a question is eligible under anti-repetition rules
  const isQuestionEligible = useCallback(
    (q: Question) => {
      // 1. Session Deduplication Check
      if (preventSessionRepeat && sessionQuestionIdsRef.current.has(q.id)) {
        return false;
      }
      // 2. 24-Hour Deduplication Check
      if (prevent24h) {
        const lastAnswered = historyMapRef.current[q.question];
        if (lastAnswered && Date.now() - lastAnswered < 24 * 60 * 60 * 1000) {
          return false;
        }
      }
      // 3. Category Filter
      if (selectedCategory !== 'all' && q.category !== selectedCategory) {
        return false;
      }
      // 4. Difficulty Filter
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) {
        return false;
      }
      return true;
    },
    [preventSessionRepeat, prevent24h, selectedCategory, selectedDifficulty]
  );

  // Background AI Question Fetcher using Gemini endpoint
  const fetchAiQuestions = useCallback(async () => {
    if (isFetchingAi) return;
    setIsFetchingAi(true);

    try {
      const recentQuestions = Object.keys(historyMapRef.current).slice(-25);
      const res = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          excludeQuestions: recentQuestions,
          category: selectedCategory,
          difficulty: selectedDifficulty,
          count: 5,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
          const freshQuestions: Question[] = data.questions.filter((q: Question) => isQuestionEligible(q));
          if (freshQuestions.length > 0) {
            setQuestionQueue((prev) => [...prev, ...freshQuestions]);
          }
        }
      }
    } catch (err) {
      console.log('[Question Service] Fallback to local question bank:', err instanceof Error ? err.message : err);
    } finally {
      setIsFetchingAi(false);
    }
  }, [isFetchingAi, selectedCategory, selectedDifficulty, isQuestionEligible]);

  // Pick Next Question
  const pickNextQuestion = useCallback(() => {
    // Reset interaction state
    setSelectedIndex(null);
    setIsLockedIn(false);
    setIsAnswered(false);
    setIsCorrect(null);
    setEliminatedIndices([]);
    setHintRevealed(false);
    setTimeLeft(30);

    // Try to get from queue first
    let nextQ: Question | null = null;
    const remainingQueue = [...questionQueue];

    while (remainingQueue.length > 0) {
      const candidate = remainingQueue.shift()!;
      if (isQuestionEligible(candidate)) {
        nextQ = candidate;
        setQuestionQueue(remainingQueue);
        break;
      }
    }

    // If not found in queue, pick from initial question bank
    if (!nextQ) {
      const eligibleLocal = INITIAL_QUESTION_BANK.filter((q) => isQuestionEligible(q));
      if (eligibleLocal.length > 0) {
        nextQ = eligibleLocal[Math.floor(Math.random() * eligibleLocal.length)];
      } else {
        // If all 24h questions exhausted, pick the least recently answered
        const allCandidates = INITIAL_QUESTION_BANK.filter(
          (q) => selectedCategory === 'all' || q.category === selectedCategory
        );
        nextQ = allCandidates[Math.floor(Math.random() * allCandidates.length)] || INITIAL_QUESTION_BANK[0];
      }
    }

    if (nextQ) {
      sessionQuestionIdsRef.current.add(nextQ.id);
      setCurrentQuestion(nextQ);
    }

    // Proactively replenish queue with AI if buffer is running low
    if (remainingQueue.length < 3) {
      fetchAiQuestions();
    }
  }, [questionQueue, isQuestionEligible, selectedCategory, fetchAiQuestions]);

  // Initial Question Setup
  useEffect(() => {
    if (!currentQuestion) {
      pickNextQuestion();
    }
  }, [currentQuestion, pickNextQuestion]);

  // Timer Tick
  useEffect(() => {
    if (!timerEnabled || isAnswered || !currentQuestion) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Time's up: treat as wrong
          handleTimeUp();
          return 0;
        }
        if (prev <= 6 && audioSettings.sfxEnabled) {
          audio.playTick(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerEnabled, isAnswered, currentQuestion, audioSettings.sfxEnabled]);

  const handleTimeUp = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setIsCorrect(false);
    audio.playWrong();
    setStats((prev) => ({
      ...prev,
      streak: 0,
      totalAnswered: prev.totalAnswered + 1,
    }));
  };

  // Option Selected Handler
  const handleSelectOption = (index: number) => {
    if (isAnswered || isLockedIn || !currentQuestion) return;
    setSelectedIndex(index);
    setIsLockedIn(true);
    audio.playLockIn();

    // Dramatic lock-in suspense delay (0.8s) like real TV game shows!
    setTimeout(() => {
      const correct = index === currentQuestion.correctIndex;
      setIsAnswered(true);
      setIsCorrect(correct);

      // Save question text in deduplication history
      const now = Date.now();
      historyMapRef.current[currentQuestion.question] = now;
      try {
        localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(historyMapRef.current));
      } catch {}

      if (correct) {
        // Correct answer sound and stadium crowd cheer!
        audio.playCorrect();

        // Confetti burst
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: [currentTheme.accentHex, '#ffd700', '#ffffff', '#10b981'],
        });

        // Update stats
        setStats((prev) => {
          const newStreak = prev.streak + 1;
          const streakMultiplier = newStreak >= 5 ? 2.5 : newStreak >= 3 ? 1.5 : 1;
          const earned = Math.round(100 * streakMultiplier);

          if (newStreak >= 5 && newStreak % 5 === 0) {
            audio.playVictoryFanfare();
          }

          return {
            ...prev,
            score: prev.score + earned,
            streak: newStreak,
            bestStreak: Math.max(prev.bestStreak, newStreak),
            totalAnswered: prev.totalAnswered + 1,
            totalCorrect: prev.totalCorrect + 1,
            pointsEarned: prev.pointsEarned + earned,
          };
        });
      } else {
        audio.playWrong();
        setStats((prev) => ({
          ...prev,
          streak: 0,
          totalAnswered: prev.totalAnswered + 1,
        }));
      }
    }, 800);
  };

  // Next Question Button Handler
  const handleNextQuestion = () => {
    setQuestionNumber((prev) => prev + 1);
    pickNextQuestion();
  };

  /* ================== LIFELINES ================== */

  // 1. 50:50 Lifeline
  const handleUseFiftyFifty = () => {
    if (stats.usedLifelines.fiftyFifty || isAnswered || !currentQuestion) return;
    audio.playLifeline();

    const correctIdx = currentQuestion.correctIndex;
    const wrongIndices = [0, 1, 2, 3].filter((i) => i !== correctIdx);
    // Shuffle and pick 2 wrong ones to eliminate
    const shuffledWrong = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);

    setEliminatedIndices(shuffledWrong);
    setStats((prev) => ({
      ...prev,
      usedLifelines: { ...prev.usedLifelines, fiftyFifty: true },
    }));
  };

  // 2. Audience Vote Lifeline
  const handleUseAudience = () => {
    if (stats.usedLifelines.audience || isAnswered || !currentQuestion) return;
    audio.playLifeline();

    const correct = currentQuestion.correctIndex;
    // Distribute 100 points, giving the correct answer 65-80%
    const correctPercent = Math.floor(Math.random() * 16) + 65;
    let remainder = 100 - correctPercent;

    const p: [number, number, number, number] = [0, 0, 0, 0];
    p[correct] = correctPercent;

    const wrongIndexes = [0, 1, 2, 3].filter((i) => i !== correct);
    const split1 = Math.floor(Math.random() * (remainder - 10)) + 5;
    remainder -= split1;
    const split2 = Math.floor(Math.random() * (remainder - 4)) + 2;
    const split3 = remainder - split2;

    p[wrongIndexes[0]] = split1;
    p[wrongIndexes[1]] = split2;
    p[wrongIndexes[2]] = split3;

    setAudienceVote({ percentages: p });
    setIsAudienceModalOpen(true);
    setStats((prev) => ({
      ...prev,
      usedLifelines: { ...prev.usedLifelines, audience: true },
    }));
  };

  // 3. AI Hint Lifeline
  const handleUseHint = () => {
    if (stats.usedLifelines.hint || isAnswered || hintRevealed) return;
    audio.playLifeline();
    setHintRevealed(true);
    setStats((prev) => ({
      ...prev,
      usedLifelines: { ...prev.usedLifelines, hint: true },
    }));
  };

  // 4. Skip Question Lifeline
  const handleUseSkip = () => {
    if (stats.usedLifelines.skip || isAnswered) return;
    audio.playLifeline();
    setStats((prev) => ({
      ...prev,
      usedLifelines: { ...prev.usedLifelines, skip: true },
    }));
    pickNextQuestion();
  };

  // Clear History
  const handleClearHistory = () => {
    historyMapRef.current = {};
    sessionQuestionIdsRef.current.clear();
    try {
      localStorage.removeItem(STORAGE_HISTORY_KEY);
    } catch {}
    alert('تم مسح سجل الأسئلة بنجاح! يمكنك الآن تجربة الأسئلة بالكامل من البداية.');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden text-white">
      {/* 3D Dynamic Ambient Canvas & Background */}
      <BackgroundAmbient3D theme={currentTheme} />

      {/* Top Bar with Scores, Audio, and Lifelines */}
      <TopBar
        currentTheme={currentTheme}
        stats={stats}
        musicEnabled={audioSettings.musicEnabled}
        onToggleMusic={() => {
          const nextVal = !audioSettings.musicEnabled;
          setAudioSettings((prev) => ({ ...prev, musicEnabled: nextVal }));
          if (nextVal) audio.startMusic();
          else audio.stopMusic();
        }}
        onOpenAudioSettings={() => setIsAudioModalOpen(true)}
        onOpenHistorySettings={() => setIsHistoryModalOpen(true)}
        onOpenThemeSelector={() => setIsThemeModalOpen(true)}
        onUseFiftyFifty={handleUseFiftyFifty}
        onUseAudience={handleUseAudience}
        onUseHint={handleUseHint}
        onUseSkip={handleUseSkip}
        isAnswered={isAnswered}
        hintRevealed={hintRevealed}
      />

      {/* Mode Switcher */}
      <div className="w-full max-w-5xl mx-auto px-4 pt-2 relative z-20 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-xl p-1 rounded-2xl border border-amber-500/30 shadow-lg">
          <button
            onClick={() => {
              setViewMode('3d_virtual_world');
              audio.playClick();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === '3d_virtual_world'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>عالم MR JOO</span>
          </button>
          <button
            onClick={() => {
              setViewMode('classic_podium');
              audio.playClick();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'classic_podium'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>المنصة الكلاسيكية</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMasterModal({ isOpen: true, mode: 'outro' });
              audio.playClick();
            }}
            className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            title="ملخص الإنجاز"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">لوحة الشرف</span>
          </button>
        </div>
      </div>

      {/* Main 3D Question Arena */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full py-2 sm:py-4 px-2 sm:px-4">
        {currentQuestion ? (
          viewMode === '3d_virtual_world' ? (
            <div className="w-full max-w-5xl">
              <VirtualWorld3D
                currentQuestion={currentQuestion}
                selectedOption={selectedIndex}
                isAnswered={isAnswered}
                isCorrect={isCorrect}
                onSelectOption={handleSelectOption}
                onNextQuestion={handleNextQuestion}
                onPlaySound={(type) => {
                  if (type === 'button_click') audio.playClick();
                }}
                questionNumber={questionNumber}
                totalCorrect={stats.totalCorrect}
              />
            </div>
          ) : (
            <QuestionPodium3D
              question={currentQuestion}
              theme={currentTheme}
              selectedIndex={selectedIndex}
              isLockedIn={isLockedIn}
              isAnswered={isAnswered}
              isCorrect={isCorrect}
              eliminatedIndices={eliminatedIndices}
              hintRevealed={hintRevealed}
              onSelectOption={handleSelectOption}
              onNextQuestion={handleNextQuestion}
              questionNumber={questionNumber}
              timeLeft={timeLeft}
              timerActive={timerEnabled && !isAnswered}
            />
          )
        ) : (
          <div className="flex flex-col items-center gap-3 p-8 rounded-3xl bg-black/60 border border-white/20 backdrop-blur-xl">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-sm sm:text-base font-bold text-white">جارٍ تحضير السؤال الأسطوري من MR JOO...</p>
          </div>
        )}
      </main>

      {/* Non-Intrusive Sponsored & Ad Banner */}
      <SponsorAdBanner />

      {/* Bottom Footer Status Bar */}
      <footer className="w-full max-w-5xl mx-auto px-4 py-2.5 relative z-10 text-center text-xs text-white/60 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>الأسئلة اللانهائية نشطة {isFetchingAi ? '(جارٍ توليد دفعة جديدة...)' : ''}</span>
        </div>
        <div className="flex items-center gap-3 font-cinzel">
          <span className="tracking-wider font-bold text-amber-300/90">MRJOOWORLD © 2026</span>
          <span className="text-amber-400 font-bold">{currentTheme.name}</span>
        </div>
      </footer>

      {/* Theme Selector Modal */}
      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={(t) => setCurrentTheme(t)}
      />

      {/* Audio Settings Modal */}
      <AudioSettingsModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        settings={audioSettings}
        onUpdateSettings={(newVals) => setAudioSettings((prev) => ({ ...prev, ...newVals }))}
      />

      {/* Audience Vote Modal */}
      {currentQuestion && (
        <AudienceModal
          isOpen={isAudienceModalOpen}
          onClose={() => setIsAudienceModalOpen(false)}
          vote={audienceVote}
          options={currentQuestion.options}
        />
      )}

      {/* History & Anti-Repetition Settings Modal */}
      <HistorySettingsModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        prevent24h={prevent24h}
        onTogglePrevent24h={setPrevent24h}
        preventSessionRepeat={preventSessionRepeat}
        onTogglePreventSessionRepeat={setPreventSessionRepeat}
        historyCount={Object.keys(historyMapRef.current).length}
        sessionAnsweredCount={sessionQuestionIdsRef.current.size}
        onClearHistory={handleClearHistory}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedDifficulty={selectedDifficulty}
        onSelectDifficulty={setSelectedDifficulty}
        timerEnabled={timerEnabled}
        onToggleTimer={setTimerEnabled}
      />

      {/* Master Intro / Outro / Streamer Break Showcase Modal */}
      <MasterShowcaseModal
        isOpen={masterModal.isOpen}
        onClose={() => setMasterModal((prev) => ({ ...prev, isOpen: false }))}
        mode={masterModal.mode}
        score={stats.score}
        streak={stats.streak}
        totalAnswered={stats.totalAnswered}
        onStartGame={() => {
          setViewMode('3d_virtual_world');
        }}
      />
    </div>
  );
}
