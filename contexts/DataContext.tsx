import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import pako from 'pako';
import type { Match, Goal, CustomAchievement, AIAchievementSuggestion, AIInteraction, PlayerPerformance, PlayerProfileData, WorldCupProgress, WorldCupStage, WorldCupCampaignHistory } from '../types';
// FIX: Update 'Page' type import to break circular dependency.
import type { Page } from '../types';
import { evaluateCustomAchievement } from '../utils/analytics';
import { initialData as appInitialData } from '../data/initialData';

interface DataContextType {
  matches: Match[];
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  customAchievements: CustomAchievement[];
  aiInteractions: AIInteraction[];
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  addMatch: (matchData: Omit<Match, 'id' | 'summary' | 'isGeneratingSummary'>) => Match;
  updateMatch: (match: Match) => void;
  deleteMatch: (matchId: string) => void;
  updateMatchPlayers: (matchId: string, myTeamPlayers: PlayerPerformance[], opponentPlayers: PlayerPerformance[]) => void;
  addGoal: (goalData: Omit<Goal, 'id'>) => void;
  deleteGoal: (goalId: string) => void;
  addCustomAchievement: (suggestion: AIAchievementSuggestion) => void;
  deleteCustomAchievement: (achievementId: string) => void;
  addAIInteraction: (type: AIInteraction['type'], content: any) => void;
  importCsvData: (csvString: string) => void;
  importJsonData: (jsonString: string) => void;
  setCustomAchievements: React.Dispatch<React.SetStateAction<CustomAchievement[]>>;
  setAiInteractions: React.Dispatch<React.SetStateAction<AIInteraction[]>>;
  playerProfile: PlayerProfileData;
  updatePlayerProfile: (profileData: Partial<PlayerProfileData>) => void;
  isShareMode: boolean;
  isOnboardingComplete: boolean;
  completeOnboarding: (name: string, type: 'fresh' | 'demo') => void;
  resetApp: () => void;
  worldCupProgress: WorldCupProgress | null;
  worldCupHistory: WorldCupCampaignHistory[];
  clearChampionCampaign: () => void;
  availableTournaments: string[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const urlParams = new URLSearchParams(window.location.search);
const isShareMode = urlParams.get('share') === 'true';

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [matches, setMatches] = useLocalStorage<Match[]>('footballMatches', []);
  const [goals, setGoals] = useLocalStorage<Goal[]>('footballGoals', []);
  const [customAchievements, setCustomAchievements] = useLocalStorage<CustomAchievement[]>('customAchievements', []);
  const [aiInteractions, setAiInteractions] = useLocalStorage<AIInteraction[]>('aiInteractions', []);
  const [playerProfile, setPlayerProfile] = useLocalStorage<PlayerProfileData>('playerProfile', appInitialData.playerProfile);
  const [isOnboardingComplete, setIsOnboardingComplete] = useLocalStorage<boolean>('isOnboardingComplete', false);
  const [worldCupProgress, setWorldCupProgress] = useLocalStorage<WorldCupProgress | null>('worldCupProgress', null);
  const [worldCupHistory, setWorldCupHistory] = useLocalStorage<WorldCupCampaignHistory[]>('worldCupHistory', []);
  
  const [currentPage, setCurrentPage] = useState<Page>('recorder');
  
  const availableTournaments = useMemo(() => {
    const tournaments = new Set<string>();
    matches.forEach(match => {
        if (match.tournament) {
            tournaments.add(match.tournament);
        }
    });
    return Array.from(tournaments).sort();
  }, [matches]);

  useEffect(() => {
    if (isShareMode) {
        const dataParam = urlParams.get('data');
        if (dataParam) {
            try {
                const base64String = decodeURIComponent(dataParam);
                const binaryString = atob(base64String);

                const compressed = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    compressed[i] = binaryString.charCodeAt(i);
                }

                const jsonString = pako.inflate(compressed, { to: 'string' });
                const sharedData = JSON.parse(jsonString);
                
                setMatches(sharedData.matches || []);
                setGoals(sharedData.goals || []);
                setCustomAchievements(sharedData.customAchievements || []);
                setAiInteractions(sharedData.aiInteractions || []);
                setPlayerProfile(sharedData.playerProfile || appInitialData.playerProfile);
                setIsOnboardingComplete(true);
            } catch (e) {
                console.error("Failed to parse shared data:", e);
            }
        }
    }
  }, [setMatches, setGoals, setCustomAchievements, setAiInteractions, setPlayerProfile, setIsOnboardingComplete]);

  useEffect(() => {
    if(isShareMode) return;

    const updatedAchievements = customAchievements.map(ach => {
        if (ach.unlocked) return ach;
        const isUnlockedNow = evaluateCustomAchievement(ach, matches);
        if (isUnlockedNow) return { ...ach, unlocked: true };
        return ach;
    });
    if (JSON.stringify(updatedAchievements) !== JSON.stringify(customAchievements)) {
        setCustomAchievements(updatedAchievements);
    }
  }, [matches, customAchievements, setCustomAchievements, isShareMode]);

  const addMatch = (matchData: Omit<Match, 'id' | 'summary' | 'isGeneratingSummary'>): Match => {
    const newMatch: Match = { id: Date.now().toString(), ...matchData };
    setMatches(prev => [newMatch, ...prev]);

    const initialProgress: WorldCupProgress = {
      campaignNumber: (worldCupProgress?.campaignNumber || 0) + 1,
      currentStage: 'group',
      startDate: newMatch.date,
      groupStage: { matchesPlayed: 0, points: 0 },
      completedStages: [],
    };

    const archiveAndReset = (progressToArchive: WorldCupProgress, finalStage: WorldCupStage | 'eliminated_group', endDate: string) => {
      if (progressToArchive.startDate) {
        const historyEntry: WorldCupCampaignHistory = {
          campaignNumber: progressToArchive.campaignNumber,
          startDate: progressToArchive.startDate,
          endDate: endDate,
          finalStage: finalStage,
        };
        setWorldCupHistory(prev => [...prev, historyEntry]);
      }
      return {
        ...initialProgress,
        campaignNumber: progressToArchive.campaignNumber + 1,
        startDate: null,
      };
    };

    setWorldCupProgress(prevProgress => {
      let progress = prevProgress ? { ...prevProgress } : { ...initialProgress, campaignNumber: 1 };

      if (progress.championOfCampaign) {
        return progress;
      }
      
      if (!progress.startDate) {
        progress.startDate = newMatch.date;
      }

      switch (progress.currentStage) {
        case 'group':
          progress.groupStage.matchesPlayed += 1;
          if (newMatch.result === 'VICTORIA') progress.groupStage.points += 3;
          if (newMatch.result === 'EMPATE') progress.groupStage.points += 1;

          if (progress.groupStage.matchesPlayed >= 3) {
            if (progress.groupStage.points >= 4) { // Qualified
              progress.currentStage = 'round_of_16';
              progress.completedStages.push('group');
            } else { // Eliminated
              return archiveAndReset(progress, 'eliminated_group', newMatch.date);
            }
          }
          break;
        
        case 'round_of_16':
        case 'quarter_finals':
        case 'semi_finals':
          if (newMatch.result === 'VICTORIA') {
            progress.completedStages.push(progress.currentStage);
            const stageOrder: WorldCupStage[] = ['round_of_16', 'quarter_finals', 'semi_finals', 'final'];
            const currentIndex = stageOrder.indexOf(progress.currentStage);
            progress.currentStage = stageOrder[currentIndex + 1];
          } else { // Eliminated
            return archiveAndReset(progress, progress.currentStage, newMatch.date);
          }
          break;
        
        case 'final':
           if (newMatch.result === 'VICTORIA') {
             progress.championOfCampaign = progress.campaignNumber;
             progress.completedStages.push('final');
             if (progress.startDate) {
                const historyEntry: WorldCupCampaignHistory = {
                    campaignNumber: progress.campaignNumber,
                    startDate: progress.startDate,
                    endDate: newMatch.date,
                    finalStage: 'final',
                };
                setWorldCupHistory(prev => [...prev, historyEntry]);
             }
           } else {
             return archiveAndReset(progress, 'final', newMatch.date);
           }
           break;
      }
      return progress;
    });
    
    return newMatch;
  };
  
  const clearChampionCampaign = () => {
    setWorldCupProgress(prevProgress => {
      if (!prevProgress || !prevProgress.championOfCampaign) {
        return prevProgress;
      }
      return {
        campaignNumber: prevProgress.campaignNumber + 1,
        currentStage: 'group',
        startDate: null,
        groupStage: { matchesPlayed: 0, points: 0 },
        completedStages: [],
      };
    });
  };
  
  const updateMatch = (match: Match) => {
    setMatches(prev => prev.map(m => m.id === match.id ? match : m));
  };

  const deleteMatch = (matchId: string) => {
    setMatches(prev => prev.filter(m => m.id !== matchId));
  };

  const updateMatchPlayers = (matchId: string, myTeamPlayers: PlayerPerformance[], opponentPlayers: PlayerPerformance[]) => {
    setMatches(prev => prev.map(m => 
        m.id === matchId ? { ...m, myTeamPlayers, opponentPlayers } : m
    ));
  };
  
  const addGoal = (goalData: Omit<Goal, 'id'>) => {
    const newGoal: Goal = { id: Date.now().toString(), ...goalData };
    setGoals(prev => [...prev, newGoal]);
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
  };
  
  const addCustomAchievement = (suggestion: AIAchievementSuggestion) => {
    const newAchievement: CustomAchievement = {
      id: Date.now().toString(),
      ...suggestion,
      unlocked: evaluateCustomAchievement({ id: '', ...suggestion, unlocked: false }, matches),
    };
    setCustomAchievements(prev => [...prev, newAchievement]);
  };
  
  const deleteCustomAchievement = (achievementId: string) => {
    setCustomAchievements(prev => prev.filter(ach => ach.id !== achievementId));
  };
  
  const addAIInteraction = (type: AIInteraction['type'], content: any) => {
    const newInteraction: AIInteraction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type,
      content,
    };
    setAiInteractions(prev => [newInteraction, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };
  
  const importCsvData = (csvString: string) => {
    const lines = csvString.trim().split(/\r?\n/);
    if (lines.length < 2) throw new Error("El archivo CSV está vacío o solo contiene encabezados.");

    const header = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const headerMapping: { [key: string]: number } = {};

    header.forEach((h, i) => {
      headerMapping[h.toLowerCase()] = i;
    });

    const requiredHeaders = ["fecha", "resultado", "mis goles", "mis asistencias"];
    for (const reqHeader of requiredHeaders) {
      if (headerMapping[reqHeader] === undefined) {
        throw new Error(`Falta la columna requerida en el CSV: "${reqHeader}"`);
      }
    }

    const newMatches: Omit<Match, 'id'>[] = lines.slice(1).map(line => {
      // This is a naive split, but it should work for this app's exports.
      const values = line.split(',');

      const result = values[headerMapping["resultado"]].trim().toUpperCase();
      if (result !== 'VICTORIA' && result !== 'DERROTA' && result !== 'EMPATE') {
        throw new Error(`Resultado inválido encontrado: ${result}`);
      }
      
      const getPlayers = (headerKey: string): PlayerPerformance[] => {
        const index = headerMapping[headerKey];
        if (index === undefined) return [];
        return (values[index] || "").split(';').map(name => name.trim()).filter(name => name).map(name => ({ name, goals: 0, assists: 0 }));
      };
      
      const getString = (headerKey: string): string | undefined => {
          const index = headerMapping[headerKey];
          if (index === undefined) return undefined;
          const value = values[index]?.trim();
          return value ? value : undefined;
      };

      const getNumber = (headerKey: string): number | undefined => {
          const index = headerMapping[headerKey];
          if (index === undefined) return undefined;
          const value = parseInt(values[index]?.trim(), 10);
          return isNaN(value) ? undefined : value;
      };


      return {
        date: values[headerMapping["fecha"]].trim(),
        result: result as 'VICTORIA' | 'DERROTA' | 'EMPATE',
        myGoals: parseInt(values[headerMapping["mis goles"]].trim(), 10) || 0,
        myAssists: parseInt(values[headerMapping["mis asistencias"]].trim(), 10) || 0,
        goalDifference: getNumber("dif. gol"),
        tournament: getString("torneo"),
        notes: getString("notas"),
        myTeamPlayers: getPlayers("mi equipo"),
        opponentPlayers: getPlayers("equipo rival"),
      };
    });

    const addedMatches = newMatches.map(matchData => ({ id: `${Date.now()}-${Math.random()}`, ...matchData }));
    setMatches(prev => [...addedMatches, ...prev]);
  };

  const importJsonData = (jsonString: string) => {
    const data = JSON.parse(jsonString);
    if (data.matches) {
      setMatches(data.matches);
    }
    if (data.playerProfile) {
        setPlayerProfile(data.playerProfile);
    }
    // Only import matches and profile to avoid conflicts
  };
  
  const updatePlayerProfile = (profileData: Partial<PlayerProfileData>) => {
    setPlayerProfile(prev => ({ ...prev, ...profileData }));
  };
  
  const completeOnboarding = (name: string, type: 'fresh' | 'demo') => {
    if (type === 'demo') {
        setMatches(appInitialData.matches);
        setGoals(appInitialData.goals);
        setCustomAchievements(appInitialData.customAchievements);
        setAiInteractions(appInitialData.aiInteractions);
        setPlayerProfile({ ...appInitialData.playerProfile, name });
    } else {
        setPlayerProfile({ name, photo: '', dob: '', weight: undefined, height: undefined, favoriteTeam: '' });
    }
    setIsOnboardingComplete(true);
    setCurrentPage('recorder');
  };
  
  const resetApp = () => {
    setMatches([]);
    setGoals([]);
    setCustomAchievements([]);
    setAiInteractions([]);
    setWorldCupProgress(null);
    setWorldCupHistory([]);
    setPlayerProfile({ name: 'Player' });
    setIsOnboardingComplete(false);
    // OnboardingPage will be shown on re-render
  };

  const value: DataContextType = {
    matches,
    setMatches,
    goals,
    setGoals,
    customAchievements,
    setCustomAchievements,
    aiInteractions,
    setAiInteractions,
    currentPage,
    setCurrentPage,
    addMatch,
    updateMatch,
    deleteMatch,
    updateMatchPlayers,
    addGoal,
    deleteGoal,
    addCustomAchievement,
    deleteCustomAchievement,
    addAIInteraction,
    importCsvData,
    importJsonData,
    playerProfile,
    updatePlayerProfile,
    isShareMode,
    isOnboardingComplete,
    completeOnboarding,
    resetApp,
    worldCupProgress,
    worldCupHistory,
    clearChampionCampaign,
    availableTournaments,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
