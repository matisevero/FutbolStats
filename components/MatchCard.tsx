import React, { useState, useMemo, useEffect } from 'react';
import type { Match, MatchSortByType, PlayerPerformance } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { ChevronIcon } from './icons/ChevronIcon';
import { TrashIcon } from './icons/TrashIcon';
import { TeamIcon } from './icons/TeamIcon';
import AutocompleteInput from './AutocompleteInput';
import MatchFormIndicator from './MatchFormIndicator';
import { ShareIcon } from './icons/ShareIcon';
import { parseLocalDate, getColorForString } from '../utils/analytics';

interface MatchCardProps {
  match: Match;
  allMatches: Match[];
  allPlayers: string[];
  onDelete?: () => void;
  onEdit?: () => void;
  onUpdateMatchPlayers?: (matchId: string, myTeamPlayers: PlayerPerformance[], opponentPlayers: PlayerPerformance[]) => void;
  isReadOnly?: boolean;
  sortBy?: MatchSortByType;
}

const resultAbbreviations: Record<'VICTORIA' | 'DERROTA' | 'EMPATE', string> = {
  VICTORIA: 'V',
  DERROTA: 'D',
  EMPATE: 'E',
};

const MatchCard: React.FC<MatchCardProps> = ({ match, allMatches, allPlayers, onDelete, onEdit, onUpdateMatchPlayers, isReadOnly = false, sortBy }) => {
  const { theme } = useTheme();
  const { playerProfile, updateMatch, availableTournaments } = useData();
  const { result, myGoals, myAssists, date, notes, tournament } = match;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingPlayers, setIsEditingPlayers] = useState(false);
  const [myTeamPlayers, setMyTeamPlayers] = useState<PlayerPerformance[]>([]);
  const [opponentPlayers, setOpponentPlayers] = useState<PlayerPerformance[]>([]);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle');
  const [tournamentInput, setTournamentInput] = useState(match.tournament || '');
  const [isEditingTournament, setIsEditingTournament] = useState(false);

  useEffect(() => {
    if (!isEditingTournament) {
        setTournamentInput(match.tournament || '');
    }
  }, [match.tournament, isEditingTournament]);

  const handleSaveTournament = () => {
    if (updateMatch) {
        const trimmedTournament = tournamentInput.trim();
        updateMatch({ ...match, tournament: trimmedTournament ? trimmedTournament : undefined });
        setIsEditingTournament(false);
    }
  };

  const handleCancelTournamentEdit = () => {
      setTournamentInput(match.tournament || '');
      setIsEditingTournament(false);
  };

  const formattedDate = useMemo(() => {
    const dateObj = parseLocalDate(date);
    return {
        day: dateObj.toLocaleDateString('es-ES', { day: '2-digit' }),
        month: dateObj.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '').toLowerCase(),
        year: dateObj.toLocaleDateString('es-ES', { year: 'numeric' }),
    };
  }, [date]);

  const matchForm = useMemo(() => {
    const sortedMatches = [...allMatches].sort((a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime());
    const currentIndex = sortedMatches.findIndex(m => m.id === match.id);
    if (currentIndex < 0) return [];
    
    const startIndex = Math.max(0, currentIndex - 5);
    const formMatches = sortedMatches.slice(startIndex, currentIndex);
    
    return formMatches.map(m => m.result);
  }, [match.id, allMatches]);

  const handleShare = async () => {
    setShareStatus('copying');
    
    const matchYear = parseLocalDate(match.date).getFullYear();
    const yearlyMatches = allMatches.filter(m => parseLocalDate(m.date).getFullYear() === matchYear);
    
    const yearlyWins = yearlyMatches.filter(m => m.result === 'VICTORIA').length;
    const yearlyDraws = yearlyMatches.filter(m => m.result === 'EMPATE').length;
    const yearlyLosses = yearlyMatches.filter(m => m.result === 'DERROTA').length;
    const yearlyGoals = yearlyMatches.reduce((sum, m) => sum + m.myGoals, 0);
    const yearlyAssists = yearlyMatches.reduce((sum, m) => sum + m.myAssists, 0);

    const resultIcons = { VICTORIA: '✅', EMPATE: '🟰', DERROTA: '❌' };
    const resultTextMap = {
      VICTORIA: 'ganado',
      DERROTA: 'perdido',
      EMPATE: 'empatado'
    };
    const resultText = resultTextMap[match.result];

    const textToCopy = `Partido ${resultText} ${resultIcons[match.result]}
⚽️ ${match.myGoals}
👟 ${match.myAssists}

Acumulado
✅ ${yearlyWins}
🟰 ${yearlyDraws}
❌ ${yearlyLosses}

⚽️ ${yearlyGoals}
👟 ${yearlyAssists}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setShareStatus('copied');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setShareStatus('error');
    } finally {
      setTimeout(() => setShareStatus('idle'), 2000);
    }
  };
  
  const getShareButtonText = () => {
    switch (shareStatus) {
      case 'copying': return 'Copiando...';
      case 'copied': return '¡Copiado!';
      case 'error': return 'Error';
      default: return 'Compartir Partido';
    }
  };


  const getResultStyle = (result: 'VICTORIA' | 'DERROTA' | 'EMPATE'): React.CSSProperties => {
    const baseStyle = styles.resultBadge;
    switch (result) {
      case 'VICTORIA':
        return { ...baseStyle, backgroundColor: `${theme.colors.win}26`, color: theme.colors.win, border: `1px solid ${theme.colors.win}80` };
      case 'DERROTA':
        return { ...baseStyle, backgroundColor: `${theme.colors.loss}26`, color: theme.colors.loss, border: `1px solid ${theme.colors.loss}80` };
      case 'EMPATE':
        return { ...baseStyle, backgroundColor: `${theme.colors.draw}33`, color: theme.colors.draw, border: `1px solid ${theme.colors.draw}80` };
    }
  };

  const getGoalDifferenceBadgeStyle = (result: 'VICTORIA' | 'DERROTA' | 'EMPATE'): React.CSSProperties => {
    const baseStyle = styles.statBadge;
    switch (result) {
      case 'VICTORIA':
        return { ...baseStyle, backgroundColor: `${theme.colors.win}26`, color: theme.colors.win };
      case 'DERROTA':
        return { ...baseStyle, backgroundColor: `${theme.colors.loss}26`, color: theme.colors.loss };
      case 'EMPATE':
        return { ...baseStyle, backgroundColor: `${theme.colors.draw}33`, color: theme.colors.draw };
    }
  };

  const handleEditPlayersClick = () => {
    const existingTeammates = match.myTeamPlayers || [];
    const initialTeammates = existingTeammates.length < 4
      ? [...existingTeammates, ...Array(4 - existingTeammates.length).fill({ name: '', goals: 0, assists: 0 })]
      : existingTeammates;
    setMyTeamPlayers(initialTeammates);

    const existingOpponents = match.opponentPlayers || [];
    const initialOpponents = existingOpponents.length < 5
      ? [...existingOpponents, ...Array(5 - existingOpponents.length).fill({ name: '', goals: 0, assists: 0 })]
      : existingOpponents;
    setOpponentPlayers(initialOpponents);
    
    setIsEditingPlayers(true);
  };

  const handleCancelEditPlayers = () => {
    setIsEditingPlayers(false);
  };
  
  const handleSavePlayers = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateMatchPlayers) {
        const finalTeammates = myTeamPlayers
            .map(p => ({ ...p, name: p.name.trim() }))
            .filter(p => p.name && p.name.toLowerCase() !== playerProfile.name.toLowerCase());
        const finalOpponents = opponentPlayers.map(p => ({ ...p, name: p.name.trim() })).filter(p => p.name);
        onUpdateMatchPlayers(match.id, finalTeammates, finalOpponents);
    }
    setIsEditingPlayers(false);
  };

  const handlePlayerInputChange = (team: 'mine' | 'opponent', index: number, field: 'name' | 'goals' | 'assists', value: string | number) => {
    const setter = team === 'mine' ? setMyTeamPlayers : setOpponentPlayers;
    setter(currentPlayers => {
        const newPlayers = [...currentPlayers];
        const updatedPlayer = { ...newPlayers[index] };

        if (field === 'name') {
            updatedPlayer.name = value as string;
        } else {
            const numValue = Number(value);
            if (!isNaN(numValue) && numValue >= 0) {
                updatedPlayer[field] = numValue;
            }
        }
        
        newPlayers[index] = updatedPlayer;
        return newPlayers;
    });
  };
  
  const handleAddPlayerInput = (team: 'mine' | 'opponent') => {
    const setter = team === 'mine' ? setMyTeamPlayers : setOpponentPlayers;
    setter(currentPlayers => [...currentPlayers, { name: '', goals: 0, assists: 0 }]);
  };

  const getBorderColorFromResult = (result: 'VICTORIA' | 'DERROTA' | 'EMPATE'): string => {
    switch (result) {
      case 'VICTORIA': return theme.colors.win;
      case 'DERROTA': return theme.colors.loss;
      case 'EMPATE': return theme.colors.draw;
    }
  };
  
  // FIX: Extracted actionButton style to be defined before `styles` to avoid reference error.
  const actionButtonStyle: React.CSSProperties = {
    background: 'transparent', fontSize: theme.typography.fontSize.extraSmall, fontWeight: 600, cursor: 'pointer',
    padding: `${theme.spacing.extraSmall} ${theme.spacing.small}`, borderRadius: theme.borderRadius.small,
    transition: 'color 0.2s, background-color 0.2s, border-color 0.2s', display: 'flex', alignItems: 'center', gap: theme.spacing.small,
  };

  const styles: { [key: string]: React.CSSProperties } = {
    card: {
      backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.large,
      boxShadow: theme.shadows.medium, transition: 'background-color 0.2s, box-shadow 0.2s, border-color 0.3s',
      border: `1px solid ${getBorderColorFromResult(result)}`,
    },
    mainInfoRow: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: `${theme.spacing.medium} ${theme.spacing.large}`,
        gap: theme.spacing.medium,
    },
    toggleRow: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: `${theme.spacing.small} ${theme.spacing.large}`,
        borderTop: `1px solid ${theme.colors.border}`,
        cursor: 'pointer',
        backgroundColor: theme.colors.background,
        borderBottomLeftRadius: isExpanded ? 0 : theme.borderRadius.large,
        borderBottomRightRadius: isExpanded ? 0 : theme.borderRadius.large,
    },
    mainInfoLeft: { display: 'flex', alignItems: 'center', gap: theme.spacing.medium, flex: 1, minWidth: 0 },
    resultBadge: {
      fontSize: theme.typography.fontSize.large, fontWeight: 700,
      borderRadius: theme.borderRadius.medium,
      width: '40px', height: '40px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    statsContainer: { display: 'flex', alignItems: 'center', gap: theme.spacing.medium },
    statBadge: {
      backgroundColor: theme.colors.background, padding: `${theme.spacing.extraSmall} ${theme.spacing.small}`, 
      borderRadius: theme.borderRadius.small, display: 'flex', alignItems: 'center', gap: theme.spacing.small,
      transition: 'opacity 0.3s ease-in-out',
    },
    statValue: { fontSize: '1.1rem', fontWeight: 700, color: theme.colors.primaryText, lineHeight: 1.1 },
    dateContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: theme.colors.secondaryText,
        lineHeight: 1.2,
        fontSize: '8pt',
        fontWeight: 600,
        flexShrink: 0,
    },
    dateDay: {
        fontSize: '1.5em',
        fontWeight: 700,
        color: theme.colors.primaryText,
    },
    dateMonth: {
        textTransform: 'uppercase',
    },
    dateYear: {
        opacity: 0.8,
    },
    cardBody: {
      padding: theme.spacing.large, paddingTop: theme.spacing.medium,
    },
    actionsContainer: {
      display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
      gap: theme.spacing.medium, marginTop: theme.spacing.large,
      flexWrap: 'wrap',
    },
    actionButton: actionButtonStyle,
    notesSection: { marginBottom: theme.spacing.large },
    sectionHeading: {
      fontSize: theme.typography.fontSize.extraSmall, fontWeight: 700, color: theme.colors.draw, textTransform: 'uppercase',
      letterSpacing: '0.05em', margin: `0 0 ${theme.spacing.small} 0`, display: 'flex', alignItems: 'center', gap: theme.spacing.small,
    },
    notesText: { fontSize: theme.typography.fontSize.small, color: theme.colors.primaryText, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' },
    shareContainer: {
      display: 'flex',
      justifyContent: 'center',
      padding: `${theme.spacing.medium} 0 0 0`,
    },
    shareButton: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.small,
        background: 'transparent',
        border: `1px solid ${theme.colors.accent2}`,
        color: theme.colors.accent2,
        padding: `${theme.spacing.small} ${theme.spacing.large}`,
        borderRadius: theme.borderRadius.medium,
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: theme.typography.fontSize.small,
        transition: 'background-color 0.2s, color 0.2s, border-color 0.2s, opacity 0.2s',
        minWidth: '130px',
        justifyContent: 'center',
    },
    playersSection: { borderTop: `1px solid ${theme.colors.border}`, paddingTop: theme.spacing.large, marginTop: theme.spacing.large },
    playersHeader: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.medium,
    },
    playersGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.large },
    playerList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: theme.spacing.small },
    playerListItem: {
        fontSize: theme.typography.fontSize.small, color: theme.colors.primaryText, backgroundColor: theme.colors.background,
        padding: `${theme.spacing.extraSmall} ${theme.spacing.small}`, borderRadius: theme.borderRadius.small,
        border: `1px solid ${theme.colors.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    playerName: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    },
    playerStatBadge: {
        backgroundColor: theme.colors.border,
        color: theme.colors.secondaryText,
        padding: '2px 6px',
        borderRadius: theme.borderRadius.small,
        fontSize: '0.7rem',
        fontWeight: 600,
        marginLeft: theme.spacing.small
    },
    highlightedPlayer: {
        fontWeight: 'bold',
        color: theme.colors.accent1,
    },
    teamHeader: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: theme.spacing.small,
    },
    addPlayerButton: {
        background: 'none',
        border: `1px dashed ${theme.colors.borderStrong}`,
        color: theme.colors.secondaryText,
        padding: theme.spacing.small,
        fontSize: theme.typography.fontSize.extraSmall,
        borderRadius: theme.borderRadius.medium,
        cursor: 'pointer',
        transition: 'background-color 0.2s, color 0.2s',
        width: '100%',
        marginTop: theme.spacing.small,
        fontWeight: 600,
    },
    teamLabel: {
        fontSize: theme.typography.fontSize.small, fontWeight: 600, color: theme.colors.secondaryText,
        margin: 0,
    },
    playerInputContainer: {
        marginBottom: theme.spacing.small,
    },
    playerInputRow: {
        display: 'flex',
        gap: theme.spacing.small,
        alignItems: 'center',
    },
    statInput: {
        width: '40px',
        padding: '0.3rem',
        textAlign: 'center' as 'center',
        backgroundColor: theme.colors.background,
        border: `1px solid ${theme.colors.borderStrong}`,
        borderRadius: theme.borderRadius.medium,
        color: theme.colors.primaryText
    },
    disabledPlayerInput: {
        width: '100%', boxSizing: 'border-box', padding: theme.spacing.small,
        backgroundColor: theme.colors.background, cursor: 'not-allowed',
        border: `1px solid ${theme.colors.borderStrong}`, borderRadius: theme.borderRadius.medium, color: theme.colors.primaryText,
        fontSize: theme.typography.fontSize.small,
        marginBottom: theme.spacing.small,
        fontWeight: 'bold'
    },
    tournamentSection: {
      borderTop: `1px solid ${theme.colors.border}`,
      paddingTop: theme.spacing.large,
      marginTop: theme.spacing.large,
    },
    tournamentDisplay: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        padding: theme.spacing.medium,
        borderRadius: theme.borderRadius.medium,
    },
    tournamentName: {
        fontWeight: 600,
        color: theme.colors.primaryText,
    },
    editTournamentButton: {
        background: 'none',
        border: `1px solid ${theme.colors.borderStrong}`,
        color: theme.colors.secondaryText,
        padding: `${theme.spacing.extraSmall} ${theme.spacing.small}`,
        borderRadius: theme.borderRadius.small,
        cursor: 'pointer',
        fontSize: theme.typography.fontSize.extraSmall,
        fontWeight: 600,
    },
    tournamentEdit: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.medium,
    },
    tournamentEditActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: theme.spacing.medium,
    },
    tournamentSaveButton: {
        ...actionButtonStyle,
        border: `1px solid ${theme.colors.win}`,
        color: theme.colors.win
    },
    tournamentCancelButton: {
        ...actionButtonStyle,
        border: `1px solid ${theme.colors.draw}`,
        color: theme.colors.secondaryText
    },
    tournamentTag: {
        backgroundColor: 'transparent',
        border: '1px solid', // color is set inline
        padding: `${theme.spacing.extraSmall} ${theme.spacing.small}`,
        borderRadius: theme.borderRadius.small,
        fontSize: theme.typography.fontSize.extraSmall,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        maxWidth: '120px',
    },
  };
  
  const resultStyle = getResultStyle(result);

  const goalsBadgeStyle: React.CSSProperties = { ...styles.statBadge };
  const assistsBadgeStyle: React.CSSProperties = { ...styles.statBadge };

  if (sortBy?.startsWith('goals')) {
    assistsBadgeStyle.opacity = 0.5;
  } else if (sortBy?.startsWith('assists')) {
    goalsBadgeStyle.opacity = 0.5;
  }
  
  const shareButtonStyle = { ...styles.shareButton };
  if (shareStatus === 'copied') {
      shareButtonStyle.backgroundColor = `${theme.colors.win}20`;
      shareButtonStyle.borderColor = theme.colors.win;
      shareButtonStyle.color = theme.colors.win;
  } else if (shareStatus === 'error') {
      shareButtonStyle.backgroundColor = `${theme.colors.loss}20`;
      shareButtonStyle.borderColor = theme.colors.loss;
      shareButtonStyle.color = theme.colors.loss;
  } else if (shareStatus === 'copying') {
      shareButtonStyle.opacity = 0.7;
  }

  const allTeamPlayers = useMemo(() => {
    const mainPlayer = { name: playerProfile.name || 'Yo', goals: match.myGoals, assists: match.myAssists };
    const otherTeammates = (match.myTeamPlayers || []).filter(p => p.name.toLowerCase() !== (playerProfile.name || '').toLowerCase());
    return [mainPlayer, ...otherTeammates];
  }, [playerProfile.name, match.myGoals, match.myAssists, match.myTeamPlayers]);

  return (
    <div style={styles.card}>
      <div style={styles.mainInfoRow}>
        <div style={styles.mainInfoLeft}>
          <span style={resultStyle}>{resultAbbreviations[result]}</span>
          <div style={styles.statsContainer}>
            <div style={goalsBadgeStyle}>
              <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>⚽️</span>
              <span style={styles.statValue}>{myGoals}</span>
            </div>
            <div style={assistsBadgeStyle}>
              <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>👟</span>
              <span style={styles.statValue}>{myAssists}</span>
            </div>
            {match.goalDifference !== undefined && (
              <div style={getGoalDifferenceBadgeStyle(result)}>
                <span style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1, opacity: 0.8 }}>+/-</span>
                <span style={{...styles.statValue, color: 'inherit'}}>
                  {match.goalDifference > 0 ? `+${match.goalDifference}` : match.goalDifference}
                </span>
              </div>
            )}
          </div>
        </div>
        <div style={styles.dateContainer}>
            <span style={styles.dateDay}>{formattedDate.day}</span>
            <span style={styles.dateMonth}>{formattedDate.month}</span>
            <span style={styles.dateYear}>{formattedDate.year}</span>
        </div>
      </div>
      <div style={styles.toggleRow} onClick={() => setIsExpanded(!isExpanded)} role="button" tabIndex={0} aria-expanded={isExpanded}>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.medium, minWidth: 0 }}>
            {tournament && <span style={{...styles.tournamentTag, borderColor: getColorForString(tournament), color: getColorForString(tournament) }} title={tournament}>{tournament}</span>}
            {matchForm.length > 0 && <MatchFormIndicator form={matchForm} />}
        </div>
        <ChevronIcon isExpanded={isExpanded} />
      </div>
      
      {isExpanded && (
        <div style={{ ...styles.cardBody, animation: 'fadeIn 0.5s ease-in-out' }}>
            {notes && (
              <div style={styles.notesSection}>
                <h4 style={styles.sectionHeading}>Notas</h4>
                <p style={styles.notesText}>{notes}</p>
              </div>
            )}
            
            {!isReadOnly && (
              <div style={styles.shareContainer}>
                  <button
                      onClick={handleShare}
                      style={shareButtonStyle}
                      disabled={shareStatus !== 'idle'}
                  >
                      <ShareIcon />
                      <span>{getShareButtonText()}</span>
                  </button>
              </div>
            )}

            {!isReadOnly && (
              <div style={styles.tournamentSection}>
                  <h4 style={styles.sectionHeading}>Torneo</h4>
                  {!isEditingTournament ? (
                      <div style={styles.tournamentDisplay}>
                          <span style={{...styles.tournamentName, fontStyle: match.tournament ? 'normal' : 'italic', color: match.tournament ? theme.colors.primaryText : theme.colors.secondaryText}}>
                              {match.tournament || 'Sin asignar'}
                          </span>
                          <button onClick={() => setIsEditingTournament(true)} style={styles.editTournamentButton}>
                              {match.tournament ? 'Editar' : 'Asignar'}
                          </button>
                      </div>
                  ) : (
                      <div style={styles.tournamentEdit}>
                          <AutocompleteInput
                              value={tournamentInput}
                              onChange={setTournamentInput}
                              suggestions={availableTournaments}
                              placeholder="Nombre del torneo"
                          />
                          <div style={styles.tournamentEditActions}>
                              <button onClick={handleCancelTournamentEdit} style={styles.tournamentCancelButton}>Cancelar</button>
                              <button onClick={handleSaveTournament} style={styles.tournamentSaveButton}>Guardar</button>
                          </div>
                      </div>
                  )}
              </div>
            )}
            
            {!isReadOnly && (
              <div style={styles.playersSection}>
                  {!isEditingPlayers ? (
                      <div>
                          <div style={styles.playersHeader}>
                              <h4 style={styles.sectionHeading}><TeamIcon /> Alineaciones</h4>
                              <button onClick={handleEditPlayersClick} style={{...styles.actionButton, border: `1px solid ${theme.colors.draw}`, color: theme.colors.secondaryText, margin: 0}}>
                                  { (match.myTeamPlayers?.length || match.opponentPlayers?.length) ? 'Editar' : '+ Añadir jugadores'}
                              </button>
                          </div>
                          {(allTeamPlayers.length > 1 || match.opponentPlayers?.length) ? (
                              <div style={styles.playersGrid}>
                                  <div>
                                      <h5 style={styles.teamLabel}>Mi equipo</h5>
                                      <ul style={styles.playerList}>
                                          {allTeamPlayers.map((player, index) => (
                                              <li key={index} style={player.name.toLowerCase() === playerProfile.name?.toLowerCase() ? {...styles.playerListItem, ...styles.highlightedPlayer} : styles.playerListItem}>
                                                <span style={styles.playerName}>{player.name}</span>
                                                <div>
                                                  {player.goals > 0 && <span style={styles.playerStatBadge}>⚽️ {player.goals}</span>}
                                                  {player.assists > 0 && <span style={styles.playerStatBadge}>👟 {player.assists}</span>}
                                                </div>
                                              </li>
                                          ))}
                                          {allTeamPlayers.length === 0 && <li style={{...styles.playerListItem, color: theme.colors.secondaryText, fontStyle: 'italic'}}>No hay jugadores</li>}
                                      </ul>
                                  </div>
                                  <div>
                                      <h5 style={styles.teamLabel}>Equipo rival</h5>
                                      <ul style={styles.playerList}>
                                          {match.opponentPlayers?.map((player, index) => (
                                            <li key={index} style={styles.playerListItem}>
                                                <span style={styles.playerName}>{player.name}</span>
                                                <div>
                                                  {player.goals > 0 && <span style={styles.playerStatBadge}>⚽️ {player.goals}</span>}
                                                  {player.assists > 0 && <span style={styles.playerStatBadge}>👟 {player.assists}</span>}
                                                </div>
                                            </li>
                                          ))}
                                          {(!match.opponentPlayers || match.opponentPlayers.length === 0) && <li style={{...styles.playerListItem, color: theme.colors.secondaryText, fontStyle: 'italic'}}>No hay jugadores</li>}
                                      </ul>
                                  </div>
                              </div>
                          ) : null}
                      </div>
                  ) : (
                      <form onSubmit={handleSavePlayers}>
                          <div style={styles.playersHeader}>
                              <h4 style={styles.sectionHeading}><TeamIcon /> Editar Alineaciones</h4>
                          </div>
                          <div style={styles.playersGrid}>
                              <div>
                                  <div style={styles.teamHeader}>
                                      <h5 style={styles.teamLabel}>Mi equipo</h5>
                                  </div>
                                  <input type="text" value={playerProfile.name || ''} disabled style={styles.disabledPlayerInput} />
                                  {myTeamPlayers.map((player, index) => (
                                    <div key={`mine-${index}`} style={styles.playerInputContainer}>
                                        <div style={styles.playerInputRow}>
                                          <div style={{flex: 1}}><AutocompleteInput placeholder={`Compañero ${index + 2}`} value={player.name} onChange={(value) => handlePlayerInputChange('mine', index, 'name', value)} suggestions={allPlayers}/></div>
                                          <input type="number" min="0" value={player.goals} onChange={e => handlePlayerInputChange('mine', index, 'goals', e.target.value)} style={styles.statInput} aria-label={`Goles de ${player.name || 'compañero'}`} />
                                          <input type="number" min="0" value={player.assists} onChange={e => handlePlayerInputChange('mine', index, 'assists', e.target.value)} style={styles.statInput} aria-label={`Asistencias de ${player.name || 'compañero'}`} />
                                        </div>
                                    </div>
                                  ))}
                                  <button type="button" onClick={() => handleAddPlayerInput('mine')} style={styles.addPlayerButton}>+ JUGADOR</button>
                              </div>
                              <div>
                                  <div style={styles.teamHeader}>
                                    <h5 style={styles.teamLabel}>Equipo rival</h5>
                                  </div>
                                  {opponentPlayers.map((player, index) => (
                                    <div key={`opponent-${index}`} style={styles.playerInputContainer}>
                                        <div style={styles.playerInputRow}>
                                            <div style={{flex: 1}}><AutocompleteInput placeholder={`Jugador ${index + 1}`} value={player.name} onChange={(value) => handlePlayerInputChange('opponent', index, 'name', value)} suggestions={allPlayers} /></div>
                                            <input type="number" min="0" value={player.goals} onChange={e => handlePlayerInputChange('opponent', index, 'goals', e.target.value)} style={styles.statInput} aria-label={`Goles de ${player.name || 'rival'}`} />
                                            <input type="number" min="0" value={player.assists} onChange={e => handlePlayerInputChange('opponent', index, 'assists', e.target.value)} style={styles.statInput} aria-label={`Asistencias de ${player.name || 'rival'}`} />
                                        </div>
                                    </div>
                                  ))}
                                  <button type="button" onClick={() => handleAddPlayerInput('opponent')} style={styles.addPlayerButton}>+ JUGADOR</button>
                              </div>
                          </div>
                          <div style={{display: 'flex', justifyContent: 'flex-end', gap: theme.spacing.medium, marginTop: theme.spacing.small}}>
                              <button type="button" onClick={handleCancelEditPlayers} style={{...styles.actionButton, border: `1px solid ${theme.colors.draw}`, color: theme.colors.secondaryText}}>Cancelar</button>
                              <button type="submit" style={{...styles.actionButton, border: `1px solid ${theme.colors.win}`, color: theme.colors.win}}>Guardar</button>
                          </div>
                      </form>
                  )}
              </div>
            )}
            
             <div style={styles.actionsContainer}>
                {!isReadOnly && (
                  <>
                    <button onClick={onEdit} style={{...styles.actionButton, border: `1px solid ${theme.colors.draw}`, color: theme.colors.secondaryText}} aria-label="Editar partido">EDITAR</button>
                    <button onClick={onDelete} style={{...styles.actionButton, border: `1px solid ${theme.colors.loss}80`, color: theme.colors.loss}} aria-label="Eliminar partido">
                      <TrashIcon />
                    </button>
                  </>
                )}
             </div>
        </div>
      )}
      <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
      `}</style>
    </div>
  );
};

export default MatchCard;