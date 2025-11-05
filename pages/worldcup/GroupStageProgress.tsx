import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import type { WorldCupProgress } from '../../types';
import Card from '../../components/common/Card';

interface GroupStageProgressProps {
  progress: WorldCupProgress['groupStage'];
  status: 'current' | 'completed' | 'locked';
}

const GroupStageProgress: React.FC<GroupStageProgressProps> = ({ progress, status }) => {
  const { theme } = useTheme();

  let message = '';
  if (status === 'current') {
    const remainingMatches = 3 - progress.matchesPlayed;
    const pointsNeeded = 4 - progress.points;
    if (remainingMatches > 0) {
      if (pointsNeeded > 0) {
        message = `Necesitas ${pointsNeeded} punto${pointsNeeded > 1 ? 's' : ''} en ${remainingMatches} partido${remainingMatches > 1 ? 's' : ''}.`;
      } else {
        message = `¡Ya estás clasificado!`;
      }
    }
  } else if (status === 'completed') {
    message = `¡Clasificado con ${progress.points} puntos!`;
  }

  const getCardStyle = (): React.CSSProperties => {
      const baseStyle: React.CSSProperties = { 
          width: '100%', maxWidth: '350px', textAlign: 'center', transition: 'all 0.3s ease' 
      };
      switch(status) {
          case 'completed':
              return { ...baseStyle, border: `2px solid ${theme.colors.win}`, opacity: 0.7 };
          case 'current':
              return { ...baseStyle, border: `2px solid ${theme.colors.accent2}`, transform: 'scale(1.05)' };
          case 'locked':
              return { ...baseStyle, opacity: 0.5 };
      }
  };

  const styles: { [key: string]: React.CSSProperties } = {
    title: { margin: `0 0 ${theme.spacing.small} 0`, fontSize: theme.typography.fontSize.large, fontWeight: 700 },
    statsContainer: { display: 'flex', justifyContent: 'space-around', margin: `${theme.spacing.medium} 0` },
    statItem: { display: 'flex', flexDirection: 'column' },
    statValue: { fontSize: '1.5rem', fontWeight: 700 },
    statLabel: { fontSize: '0.8rem', color: theme.colors.secondaryText },
    message: { fontSize: '0.9rem', color: theme.colors.secondaryText, fontStyle: 'italic', minHeight: '1.2em' }
  };

  return (
    <Card style={getCardStyle()}>
      <h3 style={styles.title}>Fase de Grupos</h3>
      <div style={styles.statsContainer}>
        <div style={styles.statItem}>
          <span style={styles.statValue}>{progress.matchesPlayed} / 3</span>
          <span style={styles.statLabel}>Partidos</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statValue}>{progress.points}</span>
          <span style={styles.statLabel}>Puntos</span>
        </div>
      </div>
      <p style={styles.message}>{message}</p>
    </Card>
  );
};

export default GroupStageProgress;
