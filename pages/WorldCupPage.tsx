import React, { useMemo, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import GroupStageProgress from './worldcup/GroupStageProgress';
import StageItem from './worldcup/StageItem';
import ChampionCelebration from './worldcup/ChampionCelebration';
import type { WorldCupStage } from '../types';
import { StarIcon } from '../components/icons/StarIcon';
import { ChevronIcon } from '../components/icons/ChevronIcon';

const WorldCupPage: React.FC = () => {
  const { theme } = useTheme();
  const { worldCupProgress, matches, clearChampionCampaign, worldCupHistory } = useData();
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  const stageOrder: (WorldCupStage | 'eliminated_group')[] = ['eliminated_group', 'group', 'round_of_16', 'quarter_finals', 'semi_finals', 'final'];

  const stageLabels: Record<WorldCupStage | 'eliminated_group', string> = {
      'eliminated_group': 'Fase de Grupos (Eliminado)',
      'group': 'Fase de Grupos (Clasificado)',
      'round_of_16': 'Octavos de Final',
      'quarter_finals': 'Cuartos de Final',
      'semi_finals': 'Semifinal',
      'final': 'Final'
  };

  const bestStageReached = useMemo(() => {
      if (!worldCupHistory || worldCupHistory.length === 0) return null;
      const bestStageIndex = Math.max(...worldCupHistory.map(h => stageOrder.indexOf(h.finalStage)));
      return stageOrder[bestStageIndex];
  }, [worldCupHistory]);


  const styles: { [key: string]: React.CSSProperties } = {
    container: { maxWidth: '800px', margin: '0 auto', padding: `${theme.spacing.extraLarge} ${theme.spacing.medium}`, display: 'flex', flexDirection: 'column', gap: theme.spacing.large },
    pageTitle: { fontSize: theme.typography.fontSize.extraLarge, fontWeight: 700, color: theme.colors.primaryText, margin: 0, borderLeft: `4px solid ${theme.colors.accent1}`, paddingLeft: theme.spacing.medium },
    noDataContainer: { textAlign: 'center', padding: `${theme.spacing.extraLarge} ${theme.spacing.medium}`, color: theme.colors.secondaryText, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.large, border: `1px solid ${theme.colors.border}` },
    bracketContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: theme.spacing.small },
    connector: { width: '2px', height: theme.spacing.medium, backgroundColor: theme.colors.borderStrong },
    historyContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.large,
        border: `1px solid ${theme.colors.border}`,
        marginTop: theme.spacing.extraLarge,
    },
    historyHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.medium,
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        width: '100%',
        textAlign: 'left',
    },
    historyTitle: {
        fontSize: theme.typography.fontSize.large,
        fontWeight: 600,
        color: theme.colors.primaryText,
        margin: 0,
    },
    historyContent: {
        padding: `0 ${theme.spacing.medium} ${theme.spacing.medium}`,
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.small,
        animation: 'fadeInDown 0.3s ease-out',
    },
    historyItem: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.medium,
        padding: theme.spacing.medium,
        border: `1px solid ${theme.colors.borderStrong}`,
    },
    historyItemHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.small,
    },
    campaignNumber: {
        fontWeight: 700,
        color: theme.colors.primaryText,
    },
    historyItemBody: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.extraSmall,
    },
    historyText: {
        fontSize: theme.typography.fontSize.small,
        color: theme.colors.secondaryText,
        margin: 0,
    },
    noHistoryText: {
        fontSize: theme.typography.fontSize.small,
        color: theme.colors.secondaryText,
        fontStyle: 'italic',
        textAlign: 'center',
        padding: theme.spacing.medium,
    }
  };

  if (matches.length === 0) {
    return (
        <main style={styles.container}>
            <h2 style={styles.pageTitle}>Modo Mundial</h2>
            <div style={styles.noDataContainer}>
                <img src="https://www.dropbox.com/scl/fi/txx8gvxq8a0n836rn1gyd/worldcup.png?rlkey=smih2pzoqxirfmj5fio0xl3yv&st=og5k70oi&raw=1" alt="Trofeo de la Copa del Mundo" style={{ width: '60px', height: 'auto', marginBottom: theme.spacing.medium }} />
                <p style={{ marginTop: theme.spacing.medium }}>Registra tu primer partido para empezar tu campaña en la Copa del Mundo.</p>
            </div>
        </main>
    );
  }

  const progress = worldCupProgress || {
    campaignNumber: 1,
    currentStage: 'group',
    startDate: null,
    groupStage: { matchesPlayed: 0, points: 0 },
    completedStages: [],
  };
  
  if (progress.championOfCampaign) {
    return <ChampionCelebration onNextCampaign={clearChampionCampaign} />;
  }

  const stages: { id: WorldCupStage; label: string }[] = [
    { id: 'group', label: 'Fase de Grupos' },
    { id: 'round_of_16', label: 'Octavos de Final' },
    { id: 'quarter_finals', label: 'Cuartos de Final' },
    { id: 'semi_finals', label: 'Semifinal' },
    { id: 'final', label: 'Final' },
  ];

  const getStatus = (stageId: WorldCupStage) => {
    if (progress.completedStages.includes(stageId)) return 'completed';
    if (progress.currentStage === stageId) return 'current';
    return 'locked';
  };

  return (
    <>
      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <main style={styles.container}>
        <h2 style={styles.pageTitle}>Campaña Mundial #{progress.campaignNumber}</h2>
        <div style={styles.bracketContainer}>
          {stages.map((stage, index) => (
            <React.Fragment key={stage.id}>
              {stage.id === 'group' ? (
                <GroupStageProgress
                  progress={progress.groupStage}
                  status={getStatus(stage.id)}
                />
              ) : (
                <StageItem
                  label={stage.label}
                  status={getStatus(stage.id)}
                />
              )}
              {index < stages.length - 1 && <div style={styles.connector}></div>}
            </React.Fragment>
          ))}
           <div style={{ marginTop: theme.spacing.large }}>
              <img src="https://www.dropbox.com/scl/fi/txx8gvxq8a0n836rn1gyd/worldcup.png?rlkey=smih2pzoqxirfmj5fio0xl3yv&st=og5k70oi&raw=1" alt="Trofeo de la Copa del Mundo" style={{ width: '104px', height: 'auto' }} />
          </div>
        </div>
        
        <div style={styles.historyContainer}>
            <button style={styles.historyHeader} onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}>
                <h3 style={styles.historyTitle}>Historial de Campañas</h3>
                <ChevronIcon isExpanded={isHistoryExpanded} />
            </button>
            {isHistoryExpanded && (
                <div style={styles.historyContent}>
                    {worldCupHistory.length > 0 ? (
                        [...worldCupHistory].sort((a,b) => b.campaignNumber - a.campaignNumber).map(campaign => {
                            const isBest = campaign.finalStage === bestStageReached;
                            return (
                                <div key={campaign.campaignNumber} style={{...styles.historyItem, border: isBest ? `1px solid ${theme.colors.accent1}` : `1px solid ${theme.colors.borderStrong}`}}>
                                    <div style={styles.historyItemHeader}>
                                        <span style={styles.campaignNumber}>Mundial #{campaign.campaignNumber}</span>
                                        {isBest && <StarIcon />}
                                    </div>
                                    <div style={styles.historyItemBody}>
                                        <p style={styles.historyText}><strong>Etapa alcanzada:</strong> {stageLabels[campaign.finalStage]}</p>
                                        <p style={styles.historyText}><strong>Período:</strong> {campaign.startDate} al {campaign.endDate}</p>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <p style={styles.noHistoryText}>No hay campañas completadas en el historial.</p>
                    )}
                </div>
            )}
        </div>
      </main>
    </>
  );
};

export default WorldCupPage;