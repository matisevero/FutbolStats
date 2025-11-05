import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Match, TeammateStats, OpponentStats } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { UsersIcon } from '../components/icons/UsersIcon';
import AutocompleteInput from '../components/AutocompleteInput';
import PlayerDuelModal from '../components/modals/PlayerDuelModal';
import { InfoIcon } from '../components/icons/InfoIcon';
import PlayerCompareModal from '../components/modals/PlayerCompareModal';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../components/icons/ChevronRightIcon';
import ShareViewModal from '../components/modals/ShareViewModal';
import { ShareIcon } from '../components/icons/ShareIcon';
import { parseLocalDate } from '../utils/analytics';
import SegmentedControl from '../components/common/SegmentedControl';

type TeammateSortKey = keyof TeammateStats;
type OpponentSortKey = keyof OpponentStats;

interface PlayerHistoricalStats {
    name: string;
    matchesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    points: number;
    winRate: number;
    efectividad: number;
    goals: number;
    assists: number;
}
type PlayerSortKey = keyof PlayerHistoricalStats;


const InsightList: React.FC<{
  title: string;
  description: string;
  players: (TeammateStats | OpponentStats)[];
  color: string;
  onPlayerClick: (playerName: string) => void;
}> = ({ title, description, players, color, onPlayerClick }) => {
    const { theme } = useTheme();

    const getRankIndicator = (change: 'up' | 'down' | 'same' | 'new') => {
        const style = { fontWeight: 'bold', display: 'inline-block', width: '12px', textAlign: 'center' as 'center' };
        switch (change) {
            case 'up': return <span style={{ ...style, color: theme.colors.win }}>▲</span>;
            case 'down': return <span style={{ ...style, color: theme.colors.loss }}>▼</span>;
            case 'same': return <span style={{ ...style, color: theme.colors.secondaryText }}>—</span>;
            case 'new': return <span style={{ ...style, color: theme.colors.draw }}>●</span>;
            default: return <span style={style}></span>;
        }
    };
    
    const getPodiumStyle = (index: number): React.CSSProperties => {
        if (index === 0) return { fontWeight: 900, fontSize: '1.1rem' };
        if (index === 1) return { fontWeight: 700, fontSize: '1.05rem' };
        if (index === 2) return { fontWeight: 700, fontSize: '1.0rem' };
        return {};
    };

    const styles = {
        insightCard: {
            backgroundColor: theme.colors.background,
            padding: theme.spacing.medium,
            borderRadius: theme.borderRadius.medium,
            border: `1px solid ${theme.colors.border}`,
            display: 'flex',
            flexDirection: 'column' as 'column',
            gap: theme.spacing.small,
            width: '100%',
        },
        insightTitle: {
            margin: 0,
            fontSize: theme.typography.fontSize.medium,
            fontWeight: 700,
            color: color,
            paddingBottom: theme.spacing.small,
            borderBottom: `1px solid ${theme.colors.border}`,
        },
        insightDescription: {
            margin: `-${theme.spacing.small} 0 ${theme.spacing.small} 0`,
            fontSize: theme.typography.fontSize.extraSmall,
            color: theme.colors.secondaryText,
            fontStyle: 'italic',
        },
        insightList: {
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column' as 'column',
            gap: theme.spacing.small,
        },
        insightListItem: {
            background: 'none', border: 'none', width: '100%',
            padding: `${theme.spacing.extraSmall} ${theme.spacing.small}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: theme.typography.fontSize.small, color: theme.colors.primaryText,
            textAlign: 'left' as 'left',
            borderRadius: theme.borderRadius.small,
            transition: 'background-color 0.2s',
            cursor: 'pointer',
        },
        playerRankInfo: {
            display: 'flex', alignItems: 'center', gap: theme.spacing.medium,
        },
        rankText: {
            width: '28px', textAlign: 'center' as 'center',
        },
        playerName: {
            whiteSpace: 'nowrap' as 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        },
        winRateBadge: {
            color: theme.colors.secondaryText,
            fontSize: '0.75rem',
            fontWeight: 500,
            flexShrink: 0,
        },
        insightScore: {
            fontWeight: 600, padding: `2px 6px`,
            borderRadius: theme.borderRadius.small, fontSize: '0.75rem',
        },
    };
    
    if (players.length === 0) {
        return (
            <div style={styles.insightCard}>
                 <h4 style={styles.insightTitle}>{title}</h4>
                 <p style={styles.insightDescription}>{description}</p>
                 <div style={{...styles.insightList, padding: theme.spacing.medium, color: theme.colors.secondaryText, fontStyle: 'italic', textAlign: 'center'}}>
                    -
                 </div>
            </div>
        )
    };
    return (
        <div style={styles.insightCard}>
            <h4 style={styles.insightTitle}>{title}</h4>
            <p style={styles.insightDescription}>{description}</p>
            <div style={styles.insightList}>
                {players.map((p, index) => {
                    const podiumStyle = getPodiumStyle(index);
                    return (
                        <button key={p.name} style={styles.insightListItem} onClick={() => onPlayerClick(p.name)} className="table-row">
                            <div style={styles.playerRankInfo}>
                               {getRankIndicator(p.rankChange)}
                               <span style={{...styles.rankText, ...podiumStyle}}>
                                 {index + 1}.
                               </span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0, padding: `0 ${theme.spacing.small}` }}>
                                <span style={{ ...styles.playerName, ...podiumStyle }}>{p.name}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.medium }}>
                                <span style={styles.winRateBadge}>{p.winRate.toFixed(0)}% V</span>
                                <span style={{ ...styles.insightScore, backgroundColor: `${color}25`, color: color }}>
                                    {p.impactScore.toFixed(2)}
                                </span>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};


const DuelsPage: React.FC = () => {
  const { theme } = useTheme();
  const { matches, addAIInteraction, isShareMode, playerProfile } = useData();
  const [activeTab, setActiveTab] = useState<'teammates' | 'opponents' | 'players'>('teammates');
  
  const [filteredByPlayer, setFilteredByPlayer] = useState<string | null>(null);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  const [teammateSort, setTeammateSort] = useState<{ key: TeammateSortKey; order: 'asc' | 'desc' }>({ key: 'matchesPlayed', order: 'desc' });
  const [opponentSort, setOpponentSort] = useState<{ key: OpponentSortKey; order: 'asc' | 'desc' }>({ key: 'matchesPlayed', order: 'desc' });
  const [playerSort, setPlayerSort] = useState<{ key: PlayerSortKey; order: 'asc' | 'desc' }>({ key: 'matchesPlayed', order: 'desc' });

  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCompareHovered, setIsCompareHovered] = useState(false);
  const [isShareHovered, setIsShareHovered] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  const touchThreshold = 50;

  const hasPlayerData = useMemo(() =>
    matches.some(m => (m.myTeamPlayers && m.myTeamPlayers.length > 0) || (m.opponentPlayers && m.opponentPlayers.length > 0)),
  [matches]);

  const allDuelPlayers = useMemo(() => {
    const players = new Set<string>();
    matches.forEach(match => {
        match.myTeamPlayers?.forEach(p => { if (p && p.name.trim() && p.name.toLowerCase() !== playerProfile.name?.toLowerCase()) players.add(p.name.trim()); });
        match.opponentPlayers?.forEach(p => { if (p && p.name.trim()) players.add(p.name.trim()); });
    });
    return Array.from(players).sort();
  }, [matches, playerProfile.name]);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    if (isShareMode) {
        const urlParams = new URLSearchParams(window.location.search);
        const player = urlParams.get('player');
        if (player) {
            setFilteredByPlayer(player);
        }
    }
  }, [isShareMode]);

  useEffect(() => {
    const checkScrollable = () => {
      const el = scrollContainerRef.current;
      if (el) setIsScrollable(el.scrollWidth > el.clientWidth + 1);
    };
    const timeoutId = setTimeout(checkScrollable, 100);
    window.addEventListener('resize', checkScrollable);
    return () => { clearTimeout(timeoutId); window.removeEventListener('resize', checkScrollable); };
  }, [activeTab]);

  const { teammates, opponents, insights, players } = useMemo(() => {
    const calculateStatsForMatches = (matchList: Match[]) => {
        const CONFIDENCE_FACTOR = 5; // Number of "ghost" matches to add for Bayesian averaging
        const TEAMMATE_WIN_SCORE = 3, TEAMMATE_DRAW_SCORE = 1, TEAMMATE_LOSS_SCORE = -1;
        const MY_GOAL_WITH_TEAMMATE_SCORE = 1.5, MY_ASSIST_WITH_TEAMMATE_SCORE = 1;
        const OPPONENT_WIN_SCORE = 3, OPPONENT_DRAW_SCORE = 1, OPPONENT_LOSS_SCORE = -2;
        const MY_GOAL_AGAINST_OPPONENT_SCORE = 1.5, MY_ASSIST_AGAINST_OPPONENT_SCORE = 1;
        const GOAL_DIFFERENCE_SCORE = 0.25;
        const TEAMMATE_GOAL_SCORE = 0.75;
        const TEAMMATE_ASSIST_SCORE = 0.5;
        const OPPONENT_GOAL_SCORE = -0.75;
        const OPPONENT_ASSIST_SCORE = -0.5;
        
        const teammateData: Record<string, { matches: number; wins: number; draws: number; losses: number; goals: number; assists: number; totalImpactScore: number; ownGoals: number; ownAssists: number }> = {};
        const opponentData: Record<string, { matches: number; wins: number; draws: number; losses: number; myGoals: number; myAssists: number; totalImpactScore: number; ownGoals: number; ownAssists: number }> = {};

        matchList.forEach(match => {
            match.myTeamPlayers?.forEach(player => {
                if (player.name.toLowerCase() === playerProfile.name?.toLowerCase() || !player.name.trim()) return;
                if (!teammateData[player.name]) teammateData[player.name] = { matches: 0, wins: 0, draws: 0, losses: 0, goals: 0, assists: 0, totalImpactScore: 0, ownGoals: 0, ownAssists: 0 };
                const data = teammateData[player.name];
                data.matches++;
                if (match.result === 'VICTORIA') data.wins++; else if (match.result === 'EMPATE') data.draws++; else data.losses++;
                data.goals += match.myGoals; data.assists += match.myAssists;
                data.ownGoals += player.goals;
                data.ownAssists += player.assists;
                let matchScore = 0;
                if (match.result === 'VICTORIA') matchScore += TEAMMATE_WIN_SCORE; else if (match.result === 'EMPATE') matchScore += TEAMMATE_DRAW_SCORE; else matchScore += TEAMMATE_LOSS_SCORE;
                matchScore += match.myGoals * MY_GOAL_WITH_TEAMMATE_SCORE;
                matchScore += match.myAssists * MY_ASSIST_WITH_TEAMMATE_SCORE;
                matchScore += (match.goalDifference || 0) * GOAL_DIFFERENCE_SCORE;
                matchScore += player.goals * TEAMMATE_GOAL_SCORE;
                matchScore += player.assists * TEAMMATE_ASSIST_SCORE;
                data.totalImpactScore += matchScore;
            });
            match.opponentPlayers?.forEach(player => {
                if (!player.name.trim()) return;
                if (!opponentData[player.name]) opponentData[player.name] = { matches: 0, wins: 0, draws: 0, losses: 0, myGoals: 0, myAssists: 0, totalImpactScore: 0, ownGoals: 0, ownAssists: 0 };
                const data = opponentData[player.name];
                data.matches++;
                if (match.result === 'VICTORIA') data.wins++; else if (match.result === 'EMPATE') data.draws++; else data.losses++;
                data.myGoals += match.myGoals; data.myAssists += match.myAssists;
                data.ownGoals += player.goals;
                data.ownAssists += player.assists;
                let matchScore = 0;
                if (match.result === 'VICTORIA') matchScore += OPPONENT_WIN_SCORE; else if (match.result === 'EMPATE') matchScore += OPPONENT_DRAW_SCORE; else matchScore += OPPONENT_LOSS_SCORE;
                matchScore += match.myGoals * MY_GOAL_AGAINST_OPPONENT_SCORE;
                matchScore += match.myAssists * MY_ASSIST_AGAINST_OPPONENT_SCORE;
                matchScore += (match.goalDifference || 0) * GOAL_DIFFERENCE_SCORE;
                matchScore += player.goals * OPPONENT_GOAL_SCORE;
                matchScore += player.assists * OPPONENT_ASSIST_SCORE;
                data.totalImpactScore += matchScore;
            });
        });

        const finalTeammates: Omit<TeammateStats, 'rankChange'>[] = Object.entries(teammateData).map(([name, data]) => ({ name, matchesPlayed: data.matches, winRate: data.matches > 0 ? (data.wins / data.matches) * 100 : 0, totalGoals: data.goals, totalAssists: data.assists, gpm: data.matches > 0 ? data.goals / data.matches : 0, apm: data.matches > 0 ? data.assists / data.matches : 0, record: { wins: data.wins, draws: data.draws, losses: data.losses }, totalContributions: data.goals + data.assists, contributionsPerMatch: data.matches > 0 ? (data.goals + data.assists) / data.matches : 0, impactScore: data.matches > 0 ? data.totalImpactScore / (data.matches + CONFIDENCE_FACTOR) : 0, ownGoals: data.ownGoals, ownAssists: data.ownAssists }));
        const finalOpponents: Omit<OpponentStats, 'rankChange'>[] = Object.entries(opponentData).map(([name, data]) => ({ name, matchesPlayed: data.matches, winRate: data.matches > 0 ? (data.wins / data.matches) * 100 : 0, record: { wins: data.wins, draws: data.draws, losses: data.losses }, myTotalContributions: data.myGoals + data.myAssists, myContributionsPerMatch: data.matches > 0 ? (data.myGoals + data.myAssists) / data.matches : 0, impactScore: data.matches > 0 ? data.totalImpactScore / (data.matches + CONFIDENCE_FACTOR) : 0, ownGoals: data.ownGoals, ownAssists: data.ownAssists }));
        return { teammates: finalTeammates, opponents: finalOpponents };
    };
    
    const allStats = calculateStatsForMatches(matches);
    let previousStats: ReturnType<typeof calculateStatsForMatches> | null = null;
    if (matches.length > 1) {
        const sortedMatchesByDate = [...matches].sort((a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime());
        previousStats = calculateStatsForMatches(sortedMatchesByDate.slice(1));
    }

    const augmentWithRankChange = <T extends { name: string; impactScore: number }>(currentItems: T[], previousItems: T[] | null): (T & { rankChange: 'up' | 'down' | 'same' | 'new' })[] => {
        const sortedCurrent = [...currentItems].sort((a, b) => b.impactScore - a.impactScore);
        const sortedPrevious = previousItems ? [...previousItems].sort((a, b) => b.impactScore - a.impactScore) : [];
        const prevRankMap = new Map<string, number>();
        sortedPrevious.forEach((p, i) => prevRankMap.set(p.name, i));
        return sortedCurrent.map((item, i) => {
            const prevRank = prevRankMap.get(item.name);
            let rankChange: 'up' | 'down' | 'same' | 'new' = 'same';
            if (prevRank === undefined) rankChange = 'new';
            else if (i < prevRank) rankChange = 'up';
            else if (i > prevRank) rankChange = 'down';
            return { ...item, rankChange };
        });
    };
    
    const allTeammatesWithRank = augmentWithRankChange(allStats.teammates, previousStats?.teammates || []);
    const allOpponentsWithRank = augmentWithRankChange(allStats.opponents, previousStats?.opponents || []);
    
    const allInsights = {
        bestPartners: allTeammatesWithRank.slice(0, 10),
        worstPartners: [...allTeammatesWithRank].sort((a, b) => a.impactScore - b.impactScore).slice(0, 10),
        favoriteRivals: allOpponentsWithRank.slice(0, 10),
        nemesisRivals: [...allOpponentsWithRank].sort((a, b) => a.impactScore - b.impactScore).slice(0, 10),
    };

    const historicalPlayerData: Record<string, { matchesPlayed: number; wins: number; draws: number; losses: number; goals: number; assists: number; }> = {};
    const allPlayersSet = new Set<string>();
    matches.forEach(match => {
        match.myTeamPlayers?.forEach(p => { if (p && p.name.trim() && p.name.toLowerCase() !== playerProfile.name?.toLowerCase()) allPlayersSet.add(p.name.trim()); });
        match.opponentPlayers?.forEach(p => { if (p && p.name.trim()) allPlayersSet.add(p.name.trim()); });
    });

    allPlayersSet.forEach(player => {
        historicalPlayerData[player] = { matchesPlayed: 0, wins: 0, draws: 0, losses: 0, goals: 0, assists: 0 };
        matches.forEach(match => {
            const playerOnMyTeam = match.myTeamPlayers?.find(p => p.name === player);
            const playerOnOpponentTeam = match.opponentPlayers?.find(p => p.name === player);

            if (playerOnMyTeam) {
                historicalPlayerData[player].matchesPlayed++;
                if (match.result === 'VICTORIA') historicalPlayerData[player].wins++;
                else if (match.result === 'EMPATE') historicalPlayerData[player].draws++;
                else historicalPlayerData[player].losses++;
                historicalPlayerData[player].goals += playerOnMyTeam.goals;
                historicalPlayerData[player].assists += playerOnMyTeam.assists;
            } else if (playerOnOpponentTeam) {
                historicalPlayerData[player].matchesPlayed++;
                if (match.result === 'VICTORIA') historicalPlayerData[player].losses++;
                else if (match.result === 'EMPATE') historicalPlayerData[player].draws++;
                else historicalPlayerData[player].wins++;
                historicalPlayerData[player].goals += playerOnOpponentTeam.goals;
                historicalPlayerData[player].assists += playerOnOpponentTeam.assists;
            }
        });
    });

    let finalPlayers: PlayerHistoricalStats[] = Object.entries(historicalPlayerData).map(([name, data]) => {
        const points = data.wins * 3 + data.draws;
        return {
            name, ...data, points,
            winRate: data.matchesPlayed > 0 ? (data.wins / data.matchesPlayed) * 100 : 0,
            efectividad: data.matchesPlayed > 0 ? (points / (data.matchesPlayed * 3)) * 100 : 0,
        };
    });

    if (filteredByPlayer) {
        return {
            teammates: allTeammatesWithRank.filter(p => p.name === filteredByPlayer),
            opponents: allOpponentsWithRank.filter(p => p.name === filteredByPlayer),
            players: finalPlayers.filter(p => p.name === filteredByPlayer),
            insights: {
                bestPartners: allInsights.bestPartners.filter(p => p.name === filteredByPlayer),
                worstPartners: allInsights.worstPartners.filter(p => p.name === filteredByPlayer),
                favoriteRivals: allInsights.favoriteRivals.filter(p => p.name === filteredByPlayer),
                nemesisRivals: allInsights.nemesisRivals.filter(p => p.name === filteredByPlayer),
            }
        };
    }
    
    return { teammates: allTeammatesWithRank, opponents: allOpponentsWithRank, insights: allInsights, players: finalPlayers };
  }, [matches, filteredByPlayer, playerProfile.name]);

  const insightSlides = useMemo(() => [
    { id: 'bestPartners', title: "😎 Mejores Socios", description: "Compañeros con los que tienes mejor rendimiento y resultados.", players: insights.bestPartners, color: theme.colors.win },
    { id: 'favoriteRivals', title: "⚔️ Rivales Favoritos", description: "Rivales contra los que obtienes mejores resultados.", players: insights.favoriteRivals, color: theme.colors.accent1 },
    { id: 'worstPartners', title: "😤 Socios Complejos", description: "Compañeros con los que te cuesta más conseguir buenos resultados.", players: insights.worstPartners, color: theme.colors.draw },
    { id: 'nemesisRivals', title: "👻 Némesis", description: "Rivales que representan tus desafíos más difíciles.", players: insights.nemesisRivals, color: theme.colors.loss },
  ], [insights, theme.colors]);

  const handleNextInsight = () => {
      setCurrentInsightIndex(prev => (prev + 1) % insightSlides.length);
  };
  const handlePrevInsight = () => {
      setCurrentInsightIndex(prev => (prev - 1 + insightSlides.length) % insightSlides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchDeltaX(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    setTouchDeltaX(currentX - touchStartX);
  };

  const handleTouchEnd = () => {
    if (Math.abs(touchDeltaX) > touchThreshold) {
      if (touchDeltaX < 0) {
        handleNextInsight();
      } else {
        handlePrevInsight();
      }
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
  };

  const sortedTeammates = useMemo(() => {
    return [...teammates].sort((a, b) => {
        const key = teammateSort.key, order = teammateSort.order;
        if (key === 'name') {
            const comparison = a.name.localeCompare(b.name);
            return order === 'asc' ? comparison : -comparison;
        }
        if (key === 'record') {
            const pointsA = a.record.wins * 3 + a.record.draws, pointsB = b.record.wins * 3 + b.record.draws;
            if (pointsA < pointsB) return order === 'asc' ? -1 : 1; if (pointsA > pointsB) return order === 'asc' ? 1 : -1;
        } else {
            const valA = a[key as keyof Omit<TeammateStats, 'record'>], valB = b[key as keyof Omit<TeammateStats, 'record'>];
            if (typeof valA === 'number' && typeof valB === 'number') {
               if (valA < valB) return order === 'asc' ? -1 : 1; if (valA > valB) return order === 'asc' ? 1 : -1;
            }
        }
        return b.matchesPlayed - a.matchesPlayed;
    });
  }, [teammates, teammateSort]);

  const sortedOpponents = useMemo(() => {
    return [...opponents].sort((a, b) => {
        const key = opponentSort.key, order = opponentSort.order;
        if (key === 'name') {
            const comparison = a.name.localeCompare(b.name);
            return order === 'asc' ? comparison : -comparison;
        }
        if (key === 'record') {
            const pointsA = a.record.wins * 3 + a.record.draws, pointsB = b.record.wins * 3 + b.record.draws;
            if (pointsA < pointsB) return order === 'asc' ? -1 : 1; if (pointsA > pointsB) return order === 'asc' ? 1 : -1;
        } else {
            const valA = a[key as keyof Omit<OpponentStats, 'record'>], valB = b[key as keyof Omit<OpponentStats, 'record'>];
             if (typeof valA === 'number' && typeof valB === 'number') {
               if (valA < valB) return order === 'asc' ? -1 : 1; if (valA > valB) return order === 'asc' ? 1 : -1;
            }
        }
        return b.matchesPlayed - a.matchesPlayed;
    });
  }, [opponents, opponentSort]);
  
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
        const key = playerSort.key, order = playerSort.order;
        const valA = a[key], valB = b[key];
        if (key === 'name') return order === 'asc' ? (valA as string).localeCompare(valB as string) : (valB as string).localeCompare(valA as string);
        if (typeof valA === 'number' && typeof valB === 'number') {
           if (valA < valB) return order === 'asc' ? -1 : 1;
           if (valA > valB) return order === 'asc' ? 1 : -1;
        }
        return b.matchesPlayed - a.matchesPlayed;
    });
  }, [players, playerSort]);
  
  const handleSort = (type: 'teammates' | 'opponents' | 'players', key: TeammateSortKey | OpponentSortKey | PlayerSortKey) => {
    if (type === 'teammates') setTeammateSort(prev => ({ key: key as TeammateSortKey, order: prev.key === key && prev.order === 'desc' ? 'asc' : 'desc' }));
    else if (type === 'opponents') setOpponentSort(prev => ({ key: key as OpponentSortKey, order: prev.key === key && prev.order === 'desc' ? 'asc' : 'desc' }));
    else setPlayerSort(prev => ({ key: key as PlayerSortKey, order: prev.key === key && prev.order === 'desc' ? 'asc' : 'desc' }));
  };

  const handleGlobalSearchChange = (value: string) => {
    setGlobalSearchTerm(value);
    const matchedPlayer = allDuelPlayers.find(p => p.toLowerCase() === value.toLowerCase());
    if (matchedPlayer) {
        setFilteredByPlayer(matchedPlayer);
        setGlobalSearchTerm('');
    }
  }

  const clearPlayerFilter = () => {
      setFilteredByPlayer(null);
      setGlobalSearchTerm('');
  };

  const handlePlayerClick = (playerName: string) => {
    setSelectedPlayer(playerName);
  };

  const handleCloseModal = () => {
    setSelectedPlayer(null);
  };
  
  const getPodiumStyle = (index: number): React.CSSProperties => {
    if (index === 0) return { fontWeight: 'bold', fontSize: '1.1rem' };
    if (index === 1) return { fontWeight: 'bold', fontSize: '1.05rem' };
    if (index === 2) return { fontWeight: 'bold', fontSize: '1rem' };
    return {};
  };

  const styles: { [key: string]: React.CSSProperties } = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: `${theme.spacing.extraLarge} ${theme.spacing.medium}`, display: 'flex', flexDirection: 'column', gap: theme.spacing.extraLarge },
    header: {
      display: 'flex',
      justifyContent: isDesktop ? 'space-between' : 'center',
      alignItems: isDesktop ? 'center' : 'flex-start',
      gap: '1rem',
      flexDirection: isDesktop ? 'row' : 'column',
    },
    headerActions: {
      display: 'flex',
      gap: theme.spacing.medium,
      alignItems: 'center',
      flexDirection: isDesktop ? 'row' : 'column',
      width: isDesktop ? 'auto' : '100%',
    },
    pageTitle: { fontSize: theme.typography.fontSize.extraLarge, fontWeight: 700, color: theme.colors.primaryText, margin: 0, borderLeft: `4px solid ${theme.colors.accent1}`, paddingLeft: theme.spacing.medium },
    contentWrapper: {
        display: isDesktop ? 'grid' : 'flex',
        flexDirection: 'column',
        gridTemplateColumns: 'minmax(400px, 35%) 1fr',
        gap: theme.spacing.large,
        alignItems: 'start',
    },
    leftColumn: {
        position: isDesktop ? 'sticky' : 'static',
        top: `calc(65px + ${theme.spacing.extraLarge})`, // 65px header + page padding
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.large,
    },
    rightColumn: {},
    card: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.large, boxShadow: theme.shadows.medium, border: `1px solid ${theme.colors.border}`, padding: theme.spacing.large },
    searchContainer: { position: 'relative', width: '100%', maxWidth: '400px' },
    compareButton: {
      background: isCompareHovered ? theme.colors.accent1 : 'transparent',
      color: isCompareHovered ? theme.colors.textOnAccent : theme.colors.accent1,
      border: `1px solid ${theme.colors.accent1}`,
      padding: '0.6rem 0.8rem',
      borderRadius: theme.borderRadius.medium,
      cursor: 'pointer',
      fontWeight: 600,
      width: '100%',
      fontSize: theme.typography.fontSize.medium,
      height: '42px',
      whiteSpace: 'nowrap',
      transition: 'background-color 0.2s, color 0.2s',
    },
    shareButton: {
        background: isShareHovered ? theme.colors.accent2 : 'transparent',
        color: isShareHovered ? theme.colors.textOnAccent : theme.colors.accent2,
        border: `1px solid ${theme.colors.accent2}`,
        padding: `${theme.spacing.small} ${theme.spacing.medium}`,
        borderRadius: theme.borderRadius.medium,
        cursor: 'pointer',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.small,
        transition: 'background-color 0.2s, color 0.2s',
        alignSelf: 'center',
    },
    tabContainer: { display: 'flex', marginBottom: theme.spacing.medium },
    scrollWrapper: { position: 'relative' },
    tableContainer: { overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' },
    fadeOverlay: { position: 'absolute', top: 0, right: 0, width: '60px', height: '100%', background: `linear-gradient(to left, ${theme.colors.surface}, transparent)`, pointerEvents: 'none' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: `${theme.spacing.small} ${theme.spacing.medium}`, textAlign: 'left', fontSize: theme.typography.fontSize.small, color: theme.colors.secondaryText, fontWeight: 600, borderBottom: `2px solid ${theme.colors.borderStrong}`, cursor: 'pointer', whiteSpace: 'nowrap' },
    tr: { transition: 'background-color 0.2s' },
    td: { padding: `${theme.spacing.medium}`, fontSize: theme.typography.fontSize.small, color: theme.colors.primaryText, borderBottom: `1px solid ${theme.colors.border}`, whiteSpace: 'nowrap' },
    stickyColumn: {
      position: 'sticky',
      left: 0,
      backgroundColor: theme.colors.surface,
      borderRight: `1px solid ${theme.colors.borderStrong}`,
    },
    clickableCell: { cursor: 'pointer' },
    noDataContainer: { textAlign: 'center', padding: `${theme.spacing.extraLarge} ${theme.spacing.medium}`, color: theme.colors.secondaryText, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.large, border: `1px solid ${theme.colors.border}` },
    noDataIcon: { marginBottom: theme.spacing.medium },
    noDataText: { margin: 0 },
    filterBanner: { backgroundColor: theme.colors.surface, padding: theme.spacing.medium, borderRadius: theme.borderRadius.medium, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${theme.colors.accent2}` },
    clearFilterButton: { background: 'none', border: `1px solid ${theme.colors.borderStrong}`, color: theme.colors.secondaryText, padding: `${theme.spacing.extraSmall} ${theme.spacing.small}`, borderRadius: theme.borderRadius.small, cursor: 'pointer' },
    thContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
    },
    carouselContainer: { position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto' },
    carouselSlider: { display: 'flex', transition: 'transform 0.5s ease-in-out' },
    carouselSlide: { flex: '0 0 100%', boxSizing: 'border-box', padding: '0 0.5rem' },
    navButton: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: `${theme.colors.surface}80`, border: `1px solid ${theme.colors.border}`, borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 },
    prevButton: { left: '-20px' },
    nextButton: { right: '-20px' },
    dotsContainer: { display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' },
    dot: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: theme.colors.border, cursor: 'pointer', transition: 'background-color 0.3s' },
    activeDot: { backgroundColor: theme.colors.accent1 },
  };
  
  const getSortIndicator = (key: any, currentSort: any) => currentSort.key !== key ? ' ' : (currentSort.order === 'desc' ? '↓' : '↑');

  const Th: React.FC<{
    sortKey: TeammateSortKey | OpponentSortKey | PlayerSortKey;
    sortConfig: { key: any; order: 'asc' | 'desc' };
    onSort: () => void;
    children: React.ReactNode;
    style?: React.CSSProperties;
    hasTooltip?: boolean;
    tooltipText?: string;
  }> = ({ sortKey, sortConfig, onSort, children, style, hasTooltip, tooltipText }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <th style={{...styles.th, ...style}} onClick={onSort}>
            <div style={styles.thContent}>
              <span>{children}</span>
              <span>{getSortIndicator(sortKey, sortConfig)}</span>
              {hasTooltip && (
                <div 
                    style={{position: 'relative', display: 'flex', alignItems: 'center'}}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <InfoIcon size={14}/>
                    {isHovered && (
                        <div style={{
                            position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                            width: '220px', padding: '0.5rem', backgroundColor: theme.colors.background,
                            border: `1px solid ${theme.colors.borderStrong}`, borderRadius: '6px',
                            boxShadow: theme.shadows.medium, zIndex: 10,
                            fontSize: '0.75rem', color: theme.colors.primaryText,
                        }}>
                            {tooltipText}
                        </div>
                    )}
                </div>
              )}
            </div>
        </th>
    );
  };
  
  const tabOptions = [
    { label: 'Compañeros', value: 'teammates' },
    { label: 'Rivales', value: 'opponents' },
    { label: 'Jugadores', value: 'players' },
  ];

  const mainContent = (
    <>
      <div style={styles.carouselContainer}>
        <div
          style={{ overflow: 'hidden' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
            <div style={{...styles.carouselSlider, transform: `translateX(-${currentInsightIndex * 100}%)`}}>
                {insightSlides.map((slide) => (
                    <div key={slide.id} style={styles.carouselSlide}>
                        <InsightList 
                            title={slide.title}
                            description={slide.description}
                            players={slide.players}
                            color={slide.color}
                            onPlayerClick={handlePlayerClick}
                        />
                    </div>
                ))}
            </div>
        </div>
        {isDesktop && (
          <>
            <button onClick={handlePrevInsight} style={{...styles.navButton, ...styles.prevButton}} aria-label="Anterior">
                <ChevronLeftIcon color={theme.colors.primaryText} />
            </button>
            <button onClick={handleNextInsight} style={{...styles.navButton, ...styles.nextButton}} aria-label="Siguiente">
                <ChevronRightIcon color={theme.colors.primaryText} />
            </button>
          </>
        )}
        <div style={styles.dotsContainer}>
            {insightSlides.map((_, index) => (
                <div 
                    key={index}
                    style={index === currentInsightIndex ? {...styles.dot, ...styles.activeDot} : styles.dot}
                    onClick={() => setCurrentInsightIndex(index)}
                    aria-label={`Ir a la diapositiva ${index + 1}`}
                />
            ))}
        </div>
      </div>
      {!isShareMode && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={() => setIsCompareModalOpen(true)} 
                style={styles.compareButton}
                onMouseEnter={() => setIsCompareHovered(true)}
                onMouseLeave={() => setIsCompareHovered(false)}
              >
                  Comparar Jugadores
              </button>
          </div>
      )}
    </>
  );

  return (
    <>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; } 
        .table-row:hover { background-color: ${theme.colors.background}; }
        .table-row:hover .sticky-column { background-color: ${theme.colors.background}; }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-down { animation: fadeInDown 0.3s ease-out forwards; }
      `}</style>
      <main style={styles.container}>
          <div style={styles.header}>
            <h2 style={styles.pageTitle}>Análisis de duelos</h2>
            <div style={styles.headerActions}>
                <div style={styles.searchContainer}>
                    <AutocompleteInput
                        value={globalSearchTerm}
                        onChange={handleGlobalSearchChange}
                        suggestions={allDuelPlayers}
                        placeholder="Buscar y filtrar por jugador..."
                    />
                </div>
                {!isShareMode && (
                    <button 
                        style={styles.shareButton} 
                        onClick={() => setIsShareModalOpen(true)}
                        onMouseEnter={() => setIsShareHovered(true)}
                        onMouseLeave={() => setIsShareHovered(false)}
                    >
                        <ShareIcon />
                        <span>Compartir Vista</span>
                    </button>
                )}
            </div>
          </div>
          
          {filteredByPlayer && (
            <div style={styles.filterBanner}>
                <span>Mostrando informe de: <strong>{filteredByPlayer}</strong></span>
                <button onClick={clearPlayerFilter} style={styles.clearFilterButton}>Limpiar filtro</button>
            </div>
          )}

          {!hasPlayerData ? (
              <div style={styles.noDataContainer}><div style={styles.noDataIcon}><UsersIcon size={40} /></div><p style={styles.noDataText}>Añade jugadores a tus partidos para ver el análisis.</p></div>
          ) : isDesktop ? (
            <div style={styles.contentWrapper}>
                <div style={styles.leftColumn}>{mainContent}</div>
                <div style={styles.rightColumn}>
                    <div style={styles.card}>
                        <div style={styles.tabContainer}>
                          <SegmentedControl 
                            options={tabOptions}
                            selectedValue={activeTab}
                            onSelect={(value) => setActiveTab(value as 'teammates' | 'opponents' | 'players')}
                          />
                        </div>
                        <div style={styles.scrollWrapper}>
                            <div style={styles.tableContainer} ref={scrollContainerRef} className="no-scrollbar">
                                {activeTab === 'teammates' && (<table style={styles.table}><thead><tr><Th style={styles.stickyColumn} sortKey="name" sortConfig={teammateSort} onSort={() => handleSort('teammates', 'name')}>Nombre</Th><Th sortKey="record" sortConfig={teammateSort} onSort={() => handleSort('teammates', 'record')}>Récord</Th><Th sortKey="impactScore" sortConfig={teammateSort} onSort={() => handleSort('teammates', 'impactScore')} hasTooltip tooltipText="Mide el impacto general de este compañero. Considera los resultados del equipo, tus goles/asistencias, y también los goles/asistencias que este jugador aporta.">Índice</Th><Th sortKey="matchesPlayed" sortConfig={teammateSort} onSort={() => handleSort('teammates', 'matchesPlayed')}>PJ</Th><Th sortKey="winRate" sortConfig={teammateSort} onSort={() => handleSort('teammates', 'winRate')}>% Vic.</Th><Th sortKey="contributionsPerMatch" sortConfig={teammateSort} onSort={() => handleSort('teammates', 'contributionsPerMatch')}>G+A/P</Th></tr></thead><tbody>{sortedTeammates.map((p, index) => (<tr key={p.name} style={styles.tr} className="table-row"><td style={{...styles.td, ...styles.clickableCell, ...getPodiumStyle(index), ...styles.stickyColumn}} className="sticky-column" onClick={() => handlePlayerClick(p.name)}>{p.name}</td><td style={styles.td}>{`${p.record.wins}-${p.record.draws}-${p.record.losses}`}</td><td style={{...styles.td, textAlign: 'center', fontWeight: 'bold', color: p.impactScore > 0 ? theme.colors.win : p.impactScore < 0 ? theme.colors.loss : theme.colors.primaryText}}>{p.impactScore.toFixed(2)}</td><td style={{...styles.td, textAlign: 'center'}}>{p.matchesPlayed}</td><td style={{...styles.td, textAlign: 'center'}}>{p.winRate.toFixed(1)}%</td><td style={{...styles.td, textAlign: 'center'}}>{p.contributionsPerMatch.toFixed(2)}</td></tr>))}</tbody></table>)}
                                {activeTab === 'opponents' && (<table style={styles.table}><thead><tr><Th style={styles.stickyColumn} sortKey="name" sortConfig={opponentSort} onSort={() => handleSort('opponents', 'name')}>Nombre</Th><Th sortKey="record" sortConfig={opponentSort} onSort={() => handleSort('opponents', 'record')}>Récord</Th><Th sortKey="impactScore" sortConfig={opponentSort} onSort={() => handleSort('opponents', 'impactScore')} hasTooltip tooltipText="Mide tu rendimiento contra este rival. Considera los resultados del equipo, tus goles/asistencias, y también el impacto de los goles/asistencias de este jugador en tu contra.">Índice</Th><Th sortKey="matchesPlayed" sortConfig={opponentSort} onSort={() => handleSort('opponents', 'matchesPlayed')}>PJ</Th><Th sortKey="winRate" sortConfig={opponentSort} onSort={() => handleSort('opponents', 'winRate')}>% Vic.</Th><Th sortKey="myContributionsPerMatch" sortConfig={opponentSort} onSort={() => handleSort('opponents', 'myContributionsPerMatch')}>Mis G+A/P</Th></tr></thead><tbody>{sortedOpponents.map((p, index) => (<tr key={p.name} style={styles.tr} className="table-row"><td style={{...styles.td, ...styles.clickableCell, ...getPodiumStyle(index), ...styles.stickyColumn}} className="sticky-column" onClick={() => handlePlayerClick(p.name)}>{p.name}</td><td style={styles.td}>{`${p.record.wins}-${p.record.draws}-${p.record.losses}`}</td><td style={{...styles.td, textAlign: 'center', fontWeight: 'bold', color: p.impactScore > 0 ? theme.colors.win : p.impactScore < 0 ? theme.colors.loss : theme.colors.primaryText}}>{p.impactScore.toFixed(2)}</td><td style={{...styles.td, textAlign: 'center'}}>{p.matchesPlayed}</td><td style={{...styles.td, textAlign: 'center'}}>{p.winRate.toFixed(1)}%</td><td style={{...styles.td, textAlign: 'center'}}>{p.myContributionsPerMatch.toFixed(2)}</td></tr>))}</tbody></table>)}
                                {activeTab === 'players' && (<table style={styles.table}><thead><tr><Th style={styles.stickyColumn} sortKey="name" sortConfig={playerSort} onSort={() => handleSort('players', 'name')}>Jugador</Th><Th sortKey="matchesPlayed" sortConfig={playerSort} onSort={() => handleSort('players', 'matchesPlayed')}>PJ</Th><Th sortKey="wins" sortConfig={playerSort} onSort={() => handleSort('players', 'wins')}>V</Th><Th sortKey="draws" sortConfig={playerSort} onSort={() => handleSort('players', 'draws')}>E</Th><Th sortKey="losses" sortConfig={playerSort} onSort={() => handleSort('players', 'losses')}>D</Th><Th sortKey="points" sortConfig={playerSort} onSort={() => handleSort('players', 'points')}>Pts</Th><Th sortKey="goals" sortConfig={playerSort} onSort={() => handleSort('players', 'goals')}>G</Th><Th sortKey="assists" sortConfig={playerSort} onSort={() => handleSort('players', 'assists')}>A</Th><Th sortKey="efectividad" sortConfig={playerSort} onSort={() => handleSort('players', 'efectividad')}>Efect.</Th><Th sortKey="winRate" sortConfig={playerSort} onSort={() => handleSort('players', 'winRate')}>% Vic.</Th></tr></thead><tbody>{sortedPlayers.map((p, index) => (<tr key={p.name} style={styles.tr} className="table-row"><td style={{...styles.td, ...styles.clickableCell, ...getPodiumStyle(index), ...styles.stickyColumn}} className="sticky-column" onClick={() => handlePlayerClick(p.name)}>{p.name}</td><td style={{...styles.td, textAlign: 'center'}}>{p.matchesPlayed}</td><td style={{...styles.td, textAlign: 'center'}}>{p.wins}</td><td style={{...styles.td, textAlign: 'center'}}>{p.draws}</td><td style={{...styles.td, textAlign: 'center'}}>{p.losses}</td><td style={{...styles.td, textAlign: 'center', fontWeight: 'bold'}}>{p.points}</td><td style={{...styles.td, textAlign: 'center'}}>{p.goals}</td><td style={{...styles.td, textAlign: 'center'}}>{p.assists}</td><td style={{...styles.td, textAlign: 'center', fontWeight: 'bold'}}>{p.efectividad.toFixed(1)}%</td><td style={{...styles.td, textAlign: 'center'}}>{p.winRate.toFixed(1)}%</td></tr>))}</tbody></table>)}
                            </div>{isScrollable && <div style={styles.fadeOverlay} />}
                        </div>
                    </div>
                </div>
            </div>
          ) : (
            <>
                {mainContent}
                <div style={styles.card}>
                    <div style={styles.tabContainer}>
                      <SegmentedControl 
                        options={tabOptions}
                        selectedValue={activeTab}
                        onSelect={(value) => setActiveTab(value as 'teammates' | 'opponents' | 'players')}
                      />
                    </div>
                    <div style={styles.scrollWrapper}>
                        <div style={styles.tableContainer} ref={scrollContainerRef} className="no-scrollbar">
                            {activeTab === 'teammates' && (<table style={styles.table}><thead><tr><Th style={styles.stickyColumn} sortKey="name" sortConfig={teammateSort} onSort={() => handleSort('teammates', 'name')}>Nombre</Th><Th sortKey="record" sortConfig={teammateSort} onSort={() => handleSort('teammates', 'record')}>Récord</Th><Th sortKey="impactScore" sortConfig={teammateSort} onSort={() => handleSort('teammates', 'impactScore')} hasTooltip tooltipText="Mide el impacto general de este compañero. Considera los resultados del equipo, tus goles/asistencias, y también los goles/asistencias que este jugador aporta.">Índice</Th><Th sortKey="matchesPlayed" sortConfig={teammateSort} onSort={() => handleSort('teammates', 'matchesPlayed')}>PJ</Th><Th sortKey="winRate" sortConfig={teammateSort} onSort={() => handleSort('teammates', 'winRate')}>% Vic.</Th><Th sortKey="contributionsPerMatch" sortConfig={teammateSort} onSort={() => handleSort('teammates', 'contributionsPerMatch')}>G+A/P</Th></tr></thead><tbody>{sortedTeammates.map((p, index) => (<tr key={p.name} style={styles.tr} className="table-row"><td style={{...styles.td, ...styles.clickableCell, ...getPodiumStyle(index), ...styles.stickyColumn}} className="sticky-column" onClick={() => handlePlayerClick(p.name)}>{p.name}</td><td style={styles.td}>{`${p.record.wins}-${p.record.draws}-${p.record.losses}`}</td><td style={{...styles.td, textAlign: 'center', fontWeight: 'bold', color: p.impactScore > 0 ? theme.colors.win : p.impactScore < 0 ? theme.colors.loss : theme.colors.primaryText}}>{p.impactScore.toFixed(2)}</td><td style={{...styles.td, textAlign: 'center'}}>{p.matchesPlayed}</td><td style={{...styles.td, textAlign: 'center'}}>{p.winRate.toFixed(1)}%</td><td style={{...styles.td, textAlign: 'center'}}>{p.contributionsPerMatch.toFixed(2)}</td></tr>))}</tbody></table>)}
                            {activeTab === 'opponents' && (<table style={styles.table}><thead><tr><Th style={styles.stickyColumn} sortKey="name" sortConfig={opponentSort} onSort={() => handleSort('opponents', 'name')}>Nombre</Th><Th sortKey="record" sortConfig={opponentSort} onSort={() => handleSort('opponents', 'record')}>Récord</Th><Th sortKey="impactScore" sortConfig={opponentSort} onSort={() => handleSort('opponents', 'impactScore')} hasTooltip tooltipText="Mide tu rendimiento contra este rival. Considera los resultados del equipo, tus goles/asistencias, y también el impacto de los goles/asistencias de este jugador en tu contra.">Índice</Th><Th sortKey="matchesPlayed" sortConfig={opponentSort} onSort={() => handleSort('opponents', 'matchesPlayed')}>PJ</Th><Th sortKey="winRate" sortConfig={opponentSort} onSort={() => handleSort('opponents', 'winRate')}>% Vic.</Th><Th sortKey="myContributionsPerMatch" sortConfig={opponentSort} onSort={() => handleSort('opponents', 'myContributionsPerMatch')}>Mis G+A/P</Th></tr></thead><tbody>{sortedOpponents.map((p, index) => (<tr key={p.name} style={styles.tr} className="table-row"><td style={{...styles.td, ...styles.clickableCell, ...getPodiumStyle(index), ...styles.stickyColumn}} className="sticky-column" onClick={() => handlePlayerClick(p.name)}>{p.name}</td><td style={styles.td}>{`${p.record.wins}-${p.record.draws}-${p.record.losses}`}</td><td style={{...styles.td, textAlign: 'center', fontWeight: 'bold', color: p.impactScore > 0 ? theme.colors.win : p.impactScore < 0 ? theme.colors.loss : theme.colors.primaryText}}>{p.impactScore.toFixed(2)}</td><td style={{...styles.td, textAlign: 'center'}}>{p.matchesPlayed}</td><td style={{...styles.td, textAlign: 'center'}}>{p.winRate.toFixed(1)}%</td><td style={{...styles.td, textAlign: 'center'}}>{p.myContributionsPerMatch.toFixed(2)}</td></tr>))}</tbody></table>)}
                            {activeTab === 'players' && (<table style={styles.table}><thead><tr><Th style={styles.stickyColumn} sortKey="name" sortConfig={playerSort} onSort={() => handleSort('players', 'name')}>Jugador</Th><Th sortKey="matchesPlayed" sortConfig={playerSort} onSort={() => handleSort('players', 'matchesPlayed')}>PJ</Th><Th sortKey="wins" sortConfig={playerSort} onSort={() => handleSort('players', 'wins')}>V</Th><Th sortKey="draws" sortConfig={playerSort} onSort={() => handleSort('players', 'draws')}>E</Th><Th sortKey="losses" sortConfig={playerSort} onSort={() => handleSort('players', 'losses')}>D</Th><Th sortKey="points" sortConfig={playerSort} onSort={() => handleSort('players', 'points')}>Pts</Th><Th sortKey="goals" sortConfig={playerSort} onSort={() => handleSort('players', 'goals')}>G</Th><Th sortKey="assists" sortConfig={playerSort} onSort={() => handleSort('players', 'assists')}>A</Th><Th sortKey="efectividad" sortConfig={playerSort} onSort={() => handleSort('players', 'efectividad')}>Efect.</Th><Th sortKey="winRate" sortConfig={playerSort} onSort={() => handleSort('players', 'winRate')}>% Vic.</Th></tr></thead><tbody>{sortedPlayers.map((p, index) => (<tr key={p.name} style={styles.tr} className="table-row"><td style={{...styles.td, ...styles.clickableCell, ...getPodiumStyle(index), ...styles.stickyColumn}} className="sticky-column" onClick={() => handlePlayerClick(p.name)}>{p.name}</td><td style={{...styles.td, textAlign: 'center'}}>{p.matchesPlayed}</td><td style={{...styles.td, textAlign: 'center'}}>{p.wins}</td><td style={{...styles.td, textAlign: 'center'}}>{p.draws}</td><td style={{...styles.td, textAlign: 'center'}}>{p.losses}</td><td style={{...styles.td, textAlign: 'center', fontWeight: 'bold'}}>{p.points}</td><td style={{...styles.td, textAlign: 'center'}}>{p.goals}</td><td style={{...styles.td, textAlign: 'center'}}>{p.assists}</td><td style={{...styles.td, textAlign: 'center', fontWeight: 'bold'}}>{p.efectividad.toFixed(1)}%</td><td style={{...styles.td, textAlign: 'center'}}>{p.winRate.toFixed(1)}%</td></tr>))}</tbody></table>)}
                        </div>
                        {isScrollable && <div style={styles.fadeOverlay} />}
                    </div>
                </div>
            </>
          )}
      </main>
      
      {selectedPlayer && (
        <PlayerDuelModal
          isOpen={!!selectedPlayer}
          onClose={handleCloseModal}
          playerName={selectedPlayer}
          allMatches={matches}
        />
      )}
      
      <PlayerCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        allPlayers={allDuelPlayers}
        allMatches={matches}
      />

      <ShareViewModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        page='duels'
        filters={filteredByPlayer ? { player: filteredByPlayer } : {}}
      />
    </>
  );
};

export default DuelsPage;
