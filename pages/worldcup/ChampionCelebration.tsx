import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Confetti from '../../components/effects/Confetti';

interface ChampionCelebrationProps {
  onNextCampaign: () => void;
}

const ChampionCelebration: React.FC<ChampionCelebrationProps> = ({ onNextCampaign }) => {
  const { theme } = useTheme();

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 65px)',
      textAlign: 'center',
      padding: theme.spacing.large,
      animation: 'fadeIn 1s ease-out',
    },
    trophyContainer: {
      animation: 'trophyBounce 2s ease-in-out infinite',
      marginBottom: theme.spacing.large,
    },
    title: {
      fontSize: '3rem',
      fontWeight: 900,
      margin: 0,
      color: '#FFD700',
      textShadow: '0 0 10px #FFD700, 0 0 20px #FFD700, 0 0 30px #000',
    },
    subtitle: {
      fontSize: '1.2rem',
      color: theme.colors.primaryText,
      margin: `${theme.spacing.small} 0 ${theme.spacing.extraLarge} 0`,
    },
    button: {
      padding: `${theme.spacing.medium} ${theme.spacing.extraLarge}`,
      borderRadius: theme.borderRadius.medium,
      fontSize: theme.typography.fontSize.large,
      fontWeight: 'bold',
      cursor: 'pointer',
      backgroundColor: theme.colors.accent1,
      color: theme.colors.textOnAccent,
      border: 'none',
      transition: 'transform 0.2s',
    },
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes trophyBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
      <Confetti />
      <div style={styles.container}>
        <div style={styles.trophyContainer}>
          <img src="https://www.dropbox.com/scl/fi/txx8gvxq8a0n836rn1gyd/worldcup.png?rlkey=smih2pzoqxirfmj5fio0xl3yv&st=og5k70oi&raw=1" alt="Trofeo de la Copa del Mundo" style={{ width: '195px', height: 'auto' }} />
        </div>
        <h1 style={styles.title}>¡CAMPEÓN DEL MUNDO!</h1>
        <p style={styles.subtitle}>Has conquistado la gloria. La copa es tuya.</p>
        <button
          style={styles.button}
          onClick={onNextCampaign}
        >
          Defender el Título
        </button>
      </div>
    </>
  );
};

export default ChampionCelebration;