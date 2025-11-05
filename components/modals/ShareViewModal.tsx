import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import pako from 'pako';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { CloseIcon } from '../icons/CloseIcon';
import { LinkIcon } from '../icons/LinkIcon';
import { Loader } from '../Loader';
import { ShareIcon } from '../icons/ShareIcon';

interface ShareViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  page: string;
  filters?: Record<string, any>;
}

const ShareViewModal: React.FC<ShareViewModalProps> = ({ isOpen, onClose, page, filters }) => {
  const { theme } = useTheme();
  const { matches, goals, customAchievements, aiInteractions, playerProfile } = useData();
  const [status, setStatus] = useState<'idle' | 'generating' | 'copied' | 'error'>('idle');
  const [shareUrl, setShareUrl] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const handleGenerateLink = async () => {
    setStatus('generating');
    try {
      const allData = { matches, goals, customAchievements, aiInteractions, playerProfile };
      const jsonString = JSON.stringify(allData);
      const compressed = pako.deflate(jsonString);
      
      let binaryString = '';
      for (let i = 0; i < compressed.length; i++) {
          binaryString += String.fromCharCode(compressed[i]);
      }

      const base64String = btoa(binaryString);
      const safeBase64 = encodeURIComponent(base64String);
      
      let appUrl = '';
      if (window.aistudio && typeof window.aistudio.getAppUrl === 'function') {
        try { appUrl = await window.aistudio.getAppUrl(); } 
        catch (apiError) { console.error('window.aistudio.getAppUrl() failed:', apiError); }
      }
      if (!appUrl) {
        appUrl = window.location.origin + window.location.pathname;
      }

      const url = new URL(appUrl);
      url.searchParams.set('share', 'true');
      url.searchParams.set('view', page);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== 'all') {
                url.searchParams.set(key, String(value));
            }
        });
      }
      
      url.searchParams.set('data', safeBase64);
  
      await navigator.clipboard.writeText(url.toString());
      setShareUrl(url.toString());
      setStatus('copied');
    } catch (err) {
      console.error('Failed to create shareable link:', err);
      setStatus('error');
    }
  };

  if (!isOpen) return null;

  const getButtonText = () => {
    switch (status) {
        case 'generating': return 'Generando...';
        case 'copied': return '¡Enlace copiado!';
        case 'error': return 'Error al copiar';
        default: return 'Generar y copiar enlace';
    }
  };

  const styles: { [key: string]: React.CSSProperties } = {
    backdrop: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 2000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: theme.spacing.medium, animation: 'fadeIn 0.3s ease',
    },
    modal: {
      backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.large,
      boxShadow: theme.shadows.large, width: '100%', maxWidth: '500px',
      display: 'flex', flexDirection: 'column', animation: 'scaleUp 0.3s ease',
      border: `1px solid ${theme.colors.border}`,
    },
    header: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: `${theme.spacing.medium} ${theme.spacing.large}`,
      borderBottom: `1px solid ${theme.colors.border}`,
    },
    title: { margin: 0, fontSize: theme.typography.fontSize.large, fontWeight: 700, color: theme.colors.primaryText },
    content: {
      padding: theme.spacing.large, display: 'flex', flexDirection: 'column',
      gap: theme.spacing.medium, textAlign: 'center',
    },
    description: { color: theme.colors.secondaryText, fontSize: theme.typography.fontSize.small, lineHeight: 1.6, margin: 0 },
    button: {
      padding: `${theme.spacing.medium} ${theme.spacing.large}`,
      borderRadius: theme.borderRadius.medium, fontSize: theme.typography.fontSize.medium,
      fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center',
      justifyContent: 'center', gap: theme.spacing.medium,
      transition: 'background-color 0.2s, color 0.2s, border 0.2s',
      backgroundColor: isHovered ? theme.colors.accent1 : 'transparent',
      color: isHovered ? theme.colors.textOnAccent : theme.colors.accent1,
      border: `1px solid ${theme.colors.accent1}`,
    },
    copiedMessage: { color: theme.colors.win, fontWeight: 600, fontSize: theme.typography.fontSize.small }
  };

  const modalJSX = (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); } }
      `}</style>
      <div style={styles.backdrop} onClick={onClose}>
        <div style={styles.modal} onClick={e => e.stopPropagation()}>
          <header style={styles.header}>
            <h2 style={styles.title}>Compartir Vista</h2>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={onClose}><CloseIcon color={theme.colors.primaryText} /></button>
          </header>
          <div style={styles.content}>
            <LinkIcon size={48} color={theme.colors.accent1} style={{ margin: '0 auto' }} />
            <p style={styles.description}>
              Esto generará un enlace único que contiene una instantánea de solo lectura de todos tus datos. Cualquiera que abra este enlace verá tu panel tal como lo ves ahora.
            </p>
            <button 
                style={styles.button} 
                onClick={handleGenerateLink} 
                disabled={status === 'generating'}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {status === 'generating' ? <Loader /> : <ShareIcon />}
                {getButtonText()}
            </button>
            {status === 'copied' && <p style={styles.copiedMessage}>El enlace se ha copiado a tu portapapeles.</p>}
            {status === 'error' && <p style={{ ...styles.copiedMessage, color: theme.colors.loss }}>No se pudo generar el enlace.</p>}
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalJSX, document.body);
};

export default ShareViewModal;