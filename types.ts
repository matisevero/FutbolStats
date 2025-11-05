import type { ReactNode } from 'react';

// FIX: Moved Page type here from App.tsx to resolve a circular dependency.
export type Page = 'recorder' | 'stats' | 'duels' | 'progress' | 'social' | 'coach' | 'settings' | 'table' | 'worldcup';

// New Types for World Cup Mode
export type WorldCupStage = 'group' | 'round_of_16' | 'quarter_finals' | 'semi_finals' | 'final';

export interface WorldCupCampaignHistory {
  campaignNumber: number;
  startDate: string;
  endDate: string;
  finalStage: WorldCupStage | 'eliminated_group';
}

export interface WorldCupProgress {
  campaignNumber: number;
  currentStage: WorldCupStage;
  startDate: string | null;
  groupStage: {
    matchesPlayed: number;
    points: number;
  };
  completedStages: WorldCupStage[];
  championOfCampaign?: number; // Track which campaign was won
}
export interface PlayerPerformance {
  name: string;
  goals: number;
  assists: number;
}

export interface Match {
  id: string;
  result: 'VICTORIA' | 'DERROTA' | 'EMPATE';
  myGoals: number;
  myAssists: number;
  date: string;
  goalDifference?: number;
  notes?: string;
  myTeamPlayers?: PlayerPerformance[];
  opponentPlayers?: PlayerPerformance[];
}

export interface AIInteraction {
  id: string;
  date: string;
  type: 'match_summary' | 'highlight_analysis' | 'coach_insight' | 'consistency_analysis' | 'goal_suggestion' | 'achievement_suggestion' | 'match_headline' | 'player_comparison';
  content: any;
}

export interface AIHighlight {
  matchId: string;
  title: string;
  reason: string;
  match: Match;
}

export interface CoachingInsight {
  positiveTrend: string;
  areaForImprovement: string;
}

export type GoalMetric = 'myGoals' | 'myAssists' | 'VICTORIA' | 'longestWinStreak' | 'longestUndefeatedStreak' | 'winRate' | 'gpm' | 'undefeatedRate';

export type GoalType = 'accumulate' | 'percentage' | 'average' | 'streak' | 'peak';

export interface Goal {
  id: string;
  metric: GoalMetric;
  goalType: GoalType;
  target: number;
  title: string;
  startDate?: string;
  endDate?: string;
}

export interface AIGoalSuggestion {
  title: string;
  description: string;
  metric: GoalMetric;
  goalType: GoalType;
  target: number;
  year: number | 'all';
}

export interface AchievementTier {
  name: string;
  target: number;
  icon: ReactNode;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: (matches: Match[], historicalRecords: HistoricalRecords) => number;
  tiers: AchievementTier[];
  isSecret?: boolean;
}

export interface AchievementCondition {
  metric: 'winStreak' | 'lossStreak' | 'undefeatedStreak' | 'winlessStreak' | 'goalStreak' | 'assistStreak' | 'goalDrought' | 'assistDrought' | 'breakWinAfterLossStreak' | 'breakUndefeatedAfterWinlessStreak';
  operator: 'greater_than_or_equal_to';
  value: number;
  window: number; // Number of recent matches to check
}

export interface AIAchievementSuggestion {
  title: string;
  description: string;
  icon: string; // Emoji
  condition: AchievementCondition;
}

export interface CustomAchievement extends AIAchievementSuggestion {
  id: string;
  unlocked: boolean;
}


export type MatchSortByType = 'date_desc' | 'date_asc' | 'goals_desc' | 'goals_asc' | 'assists_desc' | 'assists_asc';

export interface TeammateStats {
  name: string;
  matchesPlayed: number;
  winRate: number;
  totalGoals: number; // My goals with them
  totalAssists: number; // My assists with them
  ownGoals: number; // Their own goals
  ownAssists: number; // Their own assists
  gpm: number;
  apm: number;
  record: { wins: number; draws: number; losses: number };
  totalContributions: number;
  contributionsPerMatch: number;
  impactScore: number;
  rankChange: 'up' | 'down' | 'same' | 'new';
}

export interface OpponentStats {
  name:string;
  matchesPlayed: number;
  winRate: number;
  record: { wins: number; draws: number; losses: number };
  myTotalContributions: number; // My G+A against them
  myContributionsPerMatch: number;
  ownGoals: number; // Their own goals
  ownAssists: number; // Their own assists
  impactScore: number;
  rankChange: 'up' | 'down' | 'same' | 'new';
}

export interface PlayerStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  progress: number;
}

export interface PlayerContextStats {
  matchesPlayed: number;
  winRate: number;
  record: { wins: number; draws: number; losses: number };
  myGoals: number;
  myAssists: number;
  gpm: number;
  apm: number;
  points: number;
  matches: Match[];
}

export interface PlayerProfileStats {
  teammateStats: PlayerContextStats | null;
  opponentStats: PlayerContextStats | null;
}

export interface HistoricalRecord {
  value: number;
  count: number;
}

export interface HistoricalRecords {
  longestWinStreak: HistoricalRecord;
  longestUndefeatedStreak: HistoricalRecord;
  longestDrawStreak: HistoricalRecord;
  longestLossStreak: HistoricalRecord;
  longestWinlessStreak: HistoricalRecord;

  longestGoalStreak: HistoricalRecord;
  longestAssistStreak: HistoricalRecord;
  longestGoalDrought: HistoricalRecord;
  longestAssistDrought: HistoricalRecord;

  bestGoalPerformance: HistoricalRecord;
  bestAssistPerformance: HistoricalRecord;
}

export enum MoraleLevel {
  MODO_D10S = 'Modo D10S',
  ESTELAR = 'Estelar',
  INSPIRADO = 'Inspirado',
  CONFIADO = 'Confiado',
  SOLIDO = 'Sólido',
  REGULAR = 'Regular',
  DUDOSO = 'Dudoso',
  BLOQUEADO = 'Bloqueado',
  EN_CAIDA_LIBRE = 'En Caída Libre',
  DESCONOCIDO = 'Desconocido',
}

export interface PlayerMorale {
  level: MoraleLevel;
  score: number;
  description: string;
  trend: 'up' | 'down' | 'same' | 'new';
  recentMatchesSummary: {
    matchesConsidered: number;
    record: string;
    goals: number;
    assists: number;
  };
}

export interface PlayerProfileData {
  photo?: string; // base64 string
  name: string;
  dob?: string; // date string YYYY-MM-DD
  weight?: number;
  height?: number;
  favoriteTeam?: string;
}