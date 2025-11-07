import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Match, MatchSortByType, PlayerPerformance } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import MatchForm from '../components/MatchForm';
import MatchList from '../components/MatchList';
import MatchListControls from '../components/MatchListControls';
import PostMatchModal from '../components/modals/PostMatchModal';
import { parseLocalDate } from '../utils/analytics';

const RecorderPage: React.FC = () => {
  const { theme } = useTheme();
  // FIX: Destructured `playerProfile` and new league properties.
  const { matches, addMatch, updateMatch, deleteMatch, updateMatchPlayers, addAIInteraction, isShareMode, playerProfile, availableTournaments } = useData();
  
  const [error, setError] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992);
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [lastAddedMatch, setLastAddedMatch] = useState<Match | null>(null);

  const [resultFilter, setResultFilter] = useState<'ALL' | 'VICTORIA' | 'DERROTA' | 'EMPATE'>('ALL');
  const [tournamentFilter, setTournamentFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<MatchSortByType>('date_desc');

  const allPlayers = useMemo(() => {
    const players = new Set<string>();
    matches.forEach(match => {
      match.myTeamPlayers?.forEach(p => {
        // FIX: Used `playerProfile.name` to correctly filter out the main player.
        if (p && p.name.trim() && p.name.toLowerCase() !== (playerProfile.name || '').toLowerCase()) {
          players.add(p.name.trim());
        }
      });
      match.opponentPlayers?.forEach(p => {
        if (p && p.name.trim()) {
          players.add(p.name.trim());
        }
      });
    });
    return Array.from(players).sort();
  }, [matches, playerProfile.name]);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const filteredAndSortedMatches = useMemo(() => {
    let processedMatches = [...matches];
    if (resultFilter !== 'ALL') {
      processedMatches = processedMatches.filter(m => m.result === resultFilter);
    }
    if (tournamentFilter !== 'ALL') {
        processedMatches = processedMatches.filter(m => m.tournament === tournamentFilter);
    }
    processedMatches.sort((a, b) => {
      switch (sortBy) {
        case 'goals_desc': return b.myGoals - a.myGoals;
        case 'goals_asc': return a.myGoals - b.myGoals;
        case 'assists_desc': return b.myAssists - a.myAssists;
        case 'assists_asc': return a.myAssists - b.myAssists;
        case 'date_asc': return parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime();
        case 'date_desc': default: return parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime();
      }
    });
    return processedMatches;
  }, [matches, resultFilter, sortBy, tournamentFilter]);

  const handleAddMatch = (newMatchData: Omit<Match, 'id'>) => {
    const newMatch = addMatch(newMatchData);
    setLastAddedMatch(newMatch);
  };
  
  const handleUpdateMatch = (updatedMatch: Match) => {
    updateMatch(updatedMatch);
    setEditingMatchId(null);
  };

  const handleDeleteMatch = (matchId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este partido? Esta acción no se puede deshacer.")) {
      deleteMatch(matchId);
    }
  };
  
  const handleStartEdit = (matchId: string) => {
    setEditingMatchId(matchId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleCancelEdit = () => {
    setEditingMatchId(null);
  };

  const handleCloseModal = () => {
    setLastAddedMatch(null);
  };

  const commonStyles = {
    sectionTitle: {
      fontSize: theme.typography.fontSize.large,
      fontWeight: 700,
      color: theme.colors.primaryText,
      marginBottom: theme.spacing.large,
      borderLeft: `4px solid ${theme.colors.accent1}`,
      paddingLeft: theme.spacing.medium,
    },
    errorText: {
      color: theme.colors.loss,
      textAlign: 'center' as const,
      backgroundColor: `${theme.colors.loss}1A`,
      padding: theme.spacing.medium,
      borderRadius: theme.borderRadius.medium,
    },
    controlsContainer: { marginBottom: theme.spacing.large },
  };

  if (isShareMode) {
    const styles: { [key: string]: React.CSSProperties } = {
      mainContent: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: `${theme.spacing.extraLarge} ${theme.spacing.medium}`,
      },
      ...commonStyles
    };

    return (
      <main style={styles.mainContent}>
        <div>
          {error && <p style={styles.errorText} role="alert">{error}</p>}
          <h2 style={styles.sectionTitle}>Historial de partidos</h2>
          <div style={styles.controlsContainer}>
            <MatchListControls
              resultFilter={resultFilter}
              setResultFilter={setResultFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              isDesktop={isDesktop}
              availableTournaments={availableTournaments}
              tournamentFilter={tournamentFilter}
              setTournamentFilter={setTournamentFilter}
            />
          </div>
          <MatchList 
            matches={filteredAndSortedMatches} 
            allMatches={matches}
            allPlayers={allPlayers}
            sortBy={sortBy}
            isReadOnly={true}
          />
        </div>
      </main>
    );
  }

  // Normal mode
  const styles: { [key: string]: React.CSSProperties } = {
    mainContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: `${theme.spacing.extraLarge} ${theme.spacing.medium}`,
      display: 'grid',
      gap: theme.spacing.extraLarge,
      gridTemplateColumns: isDesktop ? '380px 1fr' : '1fr',
    },
    formContainer: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.large,
      borderRadius: theme.borderRadius.large,
      boxShadow: theme.shadows.large,
      border: `1px solid ${theme.colors.border}`,
      alignSelf: 'start',
      transition: 'background-color 0.3s, border-color 0.3s',
      ...(isDesktop && {
        position: 'sticky' as 'sticky',
        top: `calc(65px + ${theme.spacing.extraLarge})`,
      }),
    },
    listContainer: {},
    ...commonStyles,
  };

  const matchToEdit = editingMatchId ? matches.find(m => m.id === editingMatchId) ?? null : null;
  const formTitle = matchToEdit ? "Editar partido" : "Registrar partido";

  return (
    <>
      <main style={styles.mainContent}>
        <div style={styles.formContainer}>
          <h2 style={styles.sectionTitle}>{formTitle}</h2>
          <MatchForm 
            onAddMatch={handleAddMatch}
            onUpdateMatch={handleUpdateMatch}
            onCancelEdit={handleCancelEdit}
            matchToEdit={matchToEdit}
          />
        </div>
        <div style={styles.listContainer}>
          {error && <p style={styles.errorText} role="alert">{error}</p>}
          <h2 style={styles.sectionTitle}>Historial de partidos</h2>
          <div style={styles.controlsContainer}>
            <MatchListControls
              resultFilter={resultFilter}
              setResultFilter={setResultFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              isDesktop={isDesktop}
              availableTournaments={availableTournaments}
              tournamentFilter={tournamentFilter}
              setTournamentFilter={setTournamentFilter}
            />
          </div>
          <MatchList 
            matches={filteredAndSortedMatches} 
            allMatches={matches}
            allPlayers={allPlayers}
            onDeleteMatch={handleDeleteMatch}
            onEditMatch={handleStartEdit}
            onUpdateMatchPlayers={updateMatchPlayers}
            sortBy={sortBy}
            isReadOnly={isShareMode}
          />
        </div>
      </main>
      {!isShareMode && lastAddedMatch && (
        <PostMatchModal match={lastAddedMatch} matches={matches} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default RecorderPage;