import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { Match, AIHighlight, CoachingInsight } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { generateHighlightsSummary, generateCoachingInsight } from '../services/geminiService';
import HighlightCard from '../components/HighlightCard';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { Loader } from '../components/Loader';
import Card from '../components/common/Card';
import HistoricalAnalysis from './stats/HistoricalAnalysis';
import { ChatBubbleIcon } from '../components/icons/ChatBubbleIcon';
import SeasonalComparison from './stats/SeasonalComparison';
import SummaryWidget from './stats/SummaryWidget';
import ContributionMetricsWidget from './stats/ContributionMetricsWidget';
import ActivityCalendar from './stats/ActivityCalendar';
import MomentumWidget from './stats/MomentumWidget';
import ConsistencyWidget from './stats/ConsistencyWidget';
import StreaksWidget from './stats/StreaksWidget';
import ShareViewModal from '../components/modals/ShareViewModal';
import { ShareIcon } from '../components/icons/ShareIcon';

type WidgetId = 'summary' | 'contributionMetrics' | 'streaks' | 'calendar' | 'historical' | 'seasonalComparison' | 'momentum' | 'ai';

const WIDGET_ORDER: WidgetId[] = ['summary', 'streaks', 'contributionMetrics', 'momentum', 'seasonalComparison', 'calendar', 'historical', 'ai'];

const StatsPage: React.FC = () => {
  const { theme } = useTheme();
  const { matches, addAIInteraction, isShareMode, playerProfile } = useData();
  
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1200);
  const [highlights, setHighlights] = useState<AIHighlight[]>([]);
  const [isGeneratingHighlights, setIsGeneratingHighlights] = useState(false);
  const [highlightsError, setHighlightsError] = useState<string | null>(null);

  const [coachingInsight, setCoachingInsight] = useState<CoachingInsight | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isShareHovered, setIsShareHovered] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1200);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const allPlayers = useMemo(() => {
    const players = new Set<string>();
    matches.forEach(match => {
      match.myTeamPlayers?.forEach(p => {
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
  
  const handleAnalyzePerformance = useCallback(async () => {
    setIsGeneratingHighlights(true);
    setHighlightsError(null);
    try {
      const result = await generateHighlightsSummary(matches);
      const populatedHighlights = result.map(h => ({ ...h, match: matches.find(m => m.id === h.matchId)! })).filter(h => h.match);
      setHighlights(populatedHighlights);
      addAIInteraction('highlight_analysis', populatedHighlights);
    } catch (err: any) { setHighlightsError(err.message || "Error al generar el análisis."); }
    finally { setIsGeneratingHighlights(false); }
  }, [matches, addAIInteraction]);

  const handleGetCoachingInsight = useCallback(async () => {
    setIsGeneratingInsight(true);
    setInsightError(null);
    try {
        const result = await generateCoachingInsight(matches);
        setCoachingInsight(result);
        addAIInteraction('coach_insight', result);
    } catch (err: any) { setInsightError(err.message || "Error al generar la perspectiva."); }
    finally { setIsGeneratingInsight(false); }
  }, [matches, addAIInteraction]);

  const aiWidget = (
    <Card title="Análisis con IA">
      {highlights.length === 0 && !isGeneratingHighlights && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: theme.colors.secondaryText, margin: `0 0 ${theme.spacing.large} 0`, lineHeight: 1.6 }}>Descubre tus partidos más determinantes.</p>
          {!isShareMode && (
              <button onClick={handleAnalyzePerformance} style={{ background: `linear-gradient(90deg, ${theme.colors.accent1}, ${theme.colors.accent2})`, border: 'none', color: theme.name === 'dark' ? '#121829' : '#FFFFFF', padding: `${theme.spacing.medium} ${theme.spacing.large}`, borderRadius: theme.borderRadius.medium, cursor: 'pointer', fontWeight: 700, fontSize: theme.typography.fontSize.medium, display: 'inline-flex', alignItems: 'center', gap: theme.spacing.small, transition: 'opacity 0.2s' }} disabled={matches.length < 3}>
              <SparklesIcon /> {matches.length < 3 ? 'necesitas 3 partidos' : 'Analizar'}
              </button>
          )}
        </div>
      )}
      {isGeneratingHighlights && <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', color: theme.colors.secondaryText, padding: theme.spacing.extraLarge }}><Loader /> <p>Analizando...</p></div>}
      {highlightsError && <p style={{ color: theme.colors.loss, textAlign: 'center', padding: theme.spacing.medium, backgroundColor: `${theme.colors.loss}1A`, borderRadius: theme.borderRadius.medium }}>{highlightsError}</p>}
      {highlights.length > 0 && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: theme.spacing.large }}>{highlights.map(h => <HighlightCard key={h.matchId} highlight={h} allMatches={matches} allPlayers={allPlayers} />)}</div>}

      <div style={{ borderTop: `1px solid ${theme.colors.border}`, marginTop: '1.5rem', paddingTop: '1.5rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', textAlign: 'center', color: theme.colors.secondaryText, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><ChatBubbleIcon size={20} /> Perspectiva del Entrenador</h4>
        {coachingInsight ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div><h5 style={{ margin: '0 0 0.5rem 0', color: theme.colors.win }}>📈 Tendencia positiva</h5><p style={{ margin: 0, color: theme.colors.primaryText, lineHeight: 1.6 }}>{coachingInsight.positiveTrend}</p></div>
            <div><h5 style={{ margin: '0 0 0.5rem 0', color: theme.colors.draw }}>🎯 Área de mejora</h5><p style={{ margin: 0, color: theme.colors.primaryText, lineHeight: 1.6 }}>{coachingInsight.areaForImprovement}</p></div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: theme.colors.secondaryText, margin: `0 0 ${theme.spacing.large} 0`, lineHeight: 1.6, fontSize: '0.9rem' }}>Obtén un análisis rápido de la IA.</p>
            {!isShareMode && (
              <button onClick={handleGetCoachingInsight} style={{ background: 'none', border: `1px solid ${theme.colors.borderStrong}`, color: theme.colors.primaryText, padding: `${theme.spacing.medium} ${theme.spacing.large}`, borderRadius: theme.borderRadius.medium, cursor: 'pointer', fontWeight: 700, fontSize: theme.typography.fontSize.small, display: 'inline-flex', alignItems: 'center', gap: theme.spacing.small, transition: 'background-color 0.2s' }} disabled={isGeneratingInsight || matches.length < 5}>
                  {isGeneratingInsight ? <Loader /> : <SparklesIcon />}
                  {matches.length < 5 ? 'necesitas 5 partidos' : 'Obtener perspectiva'}
              </button>
            )}
          </div>
        )}
        {isGeneratingInsight && <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', color: theme.colors.secondaryText, padding: theme.spacing.large }}><Loader /> <p>Generando...</p></div>}
        {insightError && <p style={{ color: theme.colors.loss, textAlign: 'center', padding: theme.spacing.medium, backgroundColor: `${theme.colors.loss}1A`, borderRadius: theme.borderRadius.medium }}>{insightError}</p>}
      </div>
      
      <div style={{ borderTop: `1px solid ${theme.colors.border}`, marginTop: '1.5rem', paddingTop: '1.5rem' }}>
        <ConsistencyWidget matches={matches} />
      </div>
    </Card>
  );

  const widgetComponents: Record<WidgetId, React.ReactNode> = {
    summary: <SummaryWidget matches={matches} />,
    contributionMetrics: <ContributionMetricsWidget matches={matches} />,
    streaks: <StreaksWidget matches={matches} />,
    calendar: <ActivityCalendar matches={matches} />,
    historical: <Card title="Análisis histórico"><HistoricalAnalysis matches={matches} /></Card>,
    seasonalComparison: <Card title="Comparación por temporada"><SeasonalComparison matches={matches} /></Card>,
    momentum: <MomentumWidget matches={matches} />,
    ai: aiWidget
  };

  const styles: { [key: string]: React.CSSProperties } = {
    container: { maxWidth: '1600px', margin: '0 auto', padding: `${theme.spacing.extraLarge} ${theme.spacing.medium}`, display: 'flex', flexDirection: 'column', gap: theme.spacing.large },
    pageTitle: { fontSize: theme.typography.fontSize.extraLarge, fontWeight: 700, color: theme.colors.primaryText, margin: 0, borderLeft: `4px solid ${theme.colors.accent2}`, paddingLeft: '1rem' },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1rem',
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
    },
    contentContainer: {
        overflow: 'hidden',
    },
    dashboardList: { display: 'flex', flexDirection: 'column', gap: theme.spacing.large },
    dashboardGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: theme.spacing.large,
        alignItems: 'start',
    },
    column: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.large,
    }
  };

  return (
    <>
      <main style={isDesktop ? styles.container : {...styles.container, maxWidth: '800px'}}>
        <div style={isDesktop ? styles.header : {...styles.header, flexDirection: 'column', alignItems: 'flex-start' }}>
            <h2 style={styles.pageTitle}>Dashboard de estadísticas</h2>
            {!isShareMode && (
                <button 
                    style={isDesktop ? styles.shareButton : {...styles.shareButton, alignSelf: 'center'}} 
                    onClick={() => setIsShareModalOpen(true)}
                    onMouseEnter={() => setIsShareHovered(true)}
                    onMouseLeave={() => setIsShareHovered(false)}
                >
                    <ShareIcon />
                    Compartir Vista
                </button>
            )}
        </div>
        
        <div style={styles.contentContainer}>
            <div>
                {isDesktop ? (
                    <div style={styles.dashboardGrid}>
                        <div style={styles.column}>{widgetComponents.summary}{widgetComponents.streaks}</div>
                        <div style={styles.column}>{widgetComponents.contributionMetrics}{widgetComponents.seasonalComparison}{widgetComponents.momentum}</div>
                        <div style={styles.column}>{widgetComponents.calendar}{widgetComponents.historical}{widgetComponents.ai}</div>
                    </div>
                ) : (
                <div style={styles.dashboardList}>
                    {WIDGET_ORDER.map(id => <div key={id}>{widgetComponents[id]}</div>)}
                </div>
                )}
            </div>
        </div>
      </main>
      <ShareViewModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        page='stats'
      />
    </>
  );
};

export default StatsPage;
