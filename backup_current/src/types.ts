export type Difficulty = 'easy' | 'medium' | 'hard' | 'all';

export type Category = 
  | 'all'
  | 'ثقافة عامة'
  | 'علوم وتكنولوجيا'
  | 'تاريخ وحضارات'
  | 'جغرافيا ودول'
  | 'إسلاميات'
  | 'سينما وفنون'
  | 'رياضة وأبطال'
  | 'ألغاز وذكاء'
  | 'عالم الطبيعة والحيوان';

export interface Question {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number; // 0, 1, 2, 3
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
}

export interface RealmTheme {
  id: 'purple_shadow' | 'royal_azure' | 'emerald_forest' | 'celestial_sky' | 'cyber_grass' | 'magician_tarot' | string;
  name: string;
  tagline: string;
  image: string;
  colorName: string;
  crownColor: string;
  neonBorder: string;
  neonGlow: string;
  podiumGradient: string;
  badgeBg: string;
  optionBaseClass: string;
  optionHoverClass: string;
  optionSelectedClass: string;
  optionCorrectClass: string;
  optionWrongClass: string;
  accentHex: string;
}

export type MusicTrackId = 'royal_battle' | 'mythic_mystery' | 'grand_heartbeat' | 'glory_anthem';

export interface AudioSettings {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume: number; // 0 to 1
  sfxVolume: number;   // 0 to 1
  currentTrack: MusicTrackId;
}

export interface GameStats {
  score: number;
  streak: number;
  bestStreak: number;
  totalAnswered: number;
  totalCorrect: number;
  pointsEarned: number;
  usedLifelines: {
    fiftyFifty: boolean;
    audience: boolean;
    skip: boolean;
    hint: boolean;
  };
}

export interface AudienceVote {
  percentages: [number, number, number, number];
}
