import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FootballIcon } from '../components/icons/FootballIcon';

interface OnboardingPageProps {
  onComplete: (name: string, type: 'fresh' | 'demo') => void;
}

const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [isFreshHovered, setIsFreshHovered] = useState(false);
  const [isDemoHovered, setIsDemoHovered] = useState(false);

  const handleStartFresh = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onComplete(name.trim(), 'fresh');
    }
  };

  const handleStartWithDemo = () => {
    const finalName = name.trim() || 'Mati';
    onComplete(finalName, 'demo');
  };

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: theme.colors.backgroundGradient,
      padding: theme.spacing.large,
      textAlign: 'center',
      color: theme.colors.primaryText,
      fontFamily: theme.typography.fontFamily,
      animation: 'fadeIn 1s ease-out'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 900,
      margin: `${theme.spacing.medium} 0 ${theme.spacing.small} 0`,
    },
    aiText: {
        background: `linear-gradient(90deg, ${theme.colors.accent1}, ${theme.colors.accent2})`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    subtitle: {
      fontSize: theme.typography.fontSize.large,
      color: theme.colors.secondaryText,
      maxWidth: '400px',
      margin: `0 auto ${theme.spacing.extraLarge} auto`,
      lineHeight: 1.6,
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing.large,
      width: '100%',
      maxWidth: '350px',
    },
    label: {
      fontSize: theme.typography.fontSize.medium,
      fontWeight: 600,
      marginBottom: `-${theme.spacing.small}`,
    },
    input: {
      width: '100%',
      padding: theme.spacing.medium,
      backgroundColor: theme.colors.surface,
      border: `1px solid ${theme.colors.borderStrong}`,
      borderRadius: theme.borderRadius.medium,
      color: theme.colors.primaryText,
      fontSize: theme.typography.fontSize.large,
      textAlign: 'center',
      outline: 'none',
    },
    button: {
      padding: `${theme.spacing.medium} ${theme.spacing.large}`,
      borderRadius: theme.borderRadius.medium,
      fontSize: theme.typography.fontSize.medium,
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.2s, color 0.2s, border 0.2s',
    },
    orSeparator: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.medium,
        color: theme.colors.secondaryText,
        margin: `${theme.spacing.small} 0`,
    },
    line: {
        flex: 1,
        height: '1px',
        backgroundColor: theme.colors.border,
    }
  };

  const freshButtonStyle: React.CSSProperties = {
    ...styles.button,
    backgroundColor: isFreshHovered ? theme.colors.accent1 : 'transparent',
    color: isFreshHovered ? theme.colors.textOnAccent : theme.colors.accent1,
    border: `1px solid ${theme.colors.accent1}`,
  };
  
  const demoButtonStyle: React.CSSProperties = {
    ...styles.button,
    backgroundColor: isDemoHovered ? theme.colors.accent2 : 'transparent',
    color: isDemoHovered ? theme.colors.textOnAccent : theme.colors.accent2,
    border: `1px solid ${theme.colors.accent2}`,
  };

  return (
    <>
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <div style={styles.container}>
        <FootballIcon size={64} color={theme.colors.accent1} />
        <h1 style={styles.title}>Fútbol<span style={styles.aiText}>Stats</span></h1>
        <p style={styles.subtitle}>Tu centro de mando de fútbol personal. Registra partidos y analiza tu rendimiento.</p>

        <form onSubmit={handleStartFresh} style={styles.form}>
          <label htmlFor="playerName" style={styles.label}>¿Cuál es tu nombre de jugador?</label>
          <input
            id="playerName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
            placeholder="Ej: Leo Messi"
            required
            autoFocus
          />
          <button
            type="submit"
            style={freshButtonStyle}
            onMouseEnter={() => setIsFreshHovered(true)}
            onMouseLeave={() => setIsFreshHovered(false)}
          >
            Empezar desde Cero
          </button>
          <div style={styles.orSeparator}>
            <div style={styles.line}></div>
            <span>o</span>
            <div style={styles.line}></div>
          </div>
          <button
            type="button"
            onClick={handleStartWithDemo}
            style={demoButtonStyle}
            onMouseEnter={() => setIsDemoHovered(true)}
            onMouseLeave={() => setIsDemoHovered(false)}
          >
            Cargar Datos de Ejemplo
          </button>
        </form>
      </div>
    </>
  );
};

export default OnboardingPage;