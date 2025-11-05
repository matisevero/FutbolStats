import React, { useRef, useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { ChevronIcon } from '../components/icons/ChevronIcon';
import ShareViewModal from '../components/modals/ShareViewModal';
import { ShareIcon } from '../components/icons/ShareIcon';
import { PlayerProfileData } from '../types';
import { UsersIcon } from '../components/icons/UsersIcon';

declare global {
  interface AIStudio {
    getAppUrl?: () => Promise<string>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const SettingsPage: React.FC = () => {
  const { theme } = useTheme();
  const { 
      matches,
      importCsvData,
      importJsonData,
      setCurrentPage, resetApp, playerProfile, updatePlayerProfile
  } = useData();
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  
  const [expandedSection, setExpandedSection] = useState<string | null>('profile');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  const [localProfile, setLocalProfile] = useState<PlayerProfileData>(playerProfile);
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'copied' | 'error'>('idle');


  useEffect(() => {
    setLocalProfile(playerProfile);
  }, [playerProfile]);
  
  const handleProfileChange = (field: keyof PlayerProfileData, value: any) => {
      setLocalProfile(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              handleProfileChange('photo', reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSaveProfile = () => {
      updatePlayerProfile(localProfile);
      alert("Perfil guardado con éxito.");
  };

  const [hoveredButtons, setHoveredButtons] = useState<Record<string, boolean>>({});
  const handleHover = (id: string, isHovered: boolean) => {
    setHoveredButtons(prev => ({ ...prev, [id]: isHovered }));
  };

  const handleExport = () => {
    const dataToExport = { matches, playerProfile };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `futbolstats-data-${playerProfile.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleExportCSV = () => {
    if (matches.length === 0) {
        alert("No hay partidos para exportar.");
        return;
    }

    const headers = [
        "Fecha", "Resultado", "Mis Goles", "Mis Asistencias",
        "Mi Equipo", "Equipo Rival"
    ];
    
    const toCsvRow = (data: (string | number)[]) => {
        return data.map(value => {
            const str = String(value ?? '');
            if (str.search(/("|,|\n)/g) >= 0) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        }).join(',');
    };

    const rows = matches.map(match => {
        const myTeam = (match.myTeamPlayers || []).map(p => p.name).join('; ');
        const opponentTeam = (match.opponentPlayers || []).map(p => p.name).join('; ');

        return toCsvRow([
            match.date,
            match.result,
            match.myGoals,
            match.myAssists,
            myTeam,
            opponentTeam
        ]);
    });

    const csvString = '\uFEFF' + [toCsvRow(headers), ...rows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `futbolstats-partidos-${playerProfile.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportJsonClick = () => {
    jsonInputRef.current?.click();
  };

  const handleImportCsvClick = () => {
    csvInputRef.current?.click();
  };

  const handleJsonFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        importJsonData(text);
        alert("¡Datos importados con éxito!");
        setCurrentPage('recorder');
      } catch (error) {
        alert(`Error al importar: ${error instanceof Error ? error.message : 'Error desconocido.'}`);
      } finally {
        if(jsonInputRef.current) jsonInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };
  
  const handleCsvFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result as string;
            importCsvData(text);
            alert("¡Datos CSV importados con éxito!");
            setCurrentPage('recorder');
        } catch (error) {
            alert(`Error al importar CSV: ${error instanceof Error ? error.message : 'Formato de archivo inválido.'}`);
        } finally {
            if (csvInputRef.current) csvInputRef.current.value = '';
        }
    };
    reader.readAsText(file);
  };
  
  const handleResetData = () => {
    if (window.confirm("¿ESTÁS SEGURO? Esta acción borrará TODOS tus datos (partidos, metas, logros) de forma permanente y te llevará de vuelta a la pantalla de inicio. Esta acción no se puede deshacer.")) {
        resetApp();
    }
  };

    const handleInvite = async () => {
    const shareTitle = 'Únete a FútbolStats';
    const shareText = `¡Ey! Estoy usando FútbolStats para registrar mis partidos y analizar mi rendimiento. ¡Deberías probarla!`;
    
    let appUrl = '';
    if (window.aistudio && typeof window.aistudio.getAppUrl === 'function') {
      try { appUrl = await window.aistudio.getAppUrl(); } 
      catch (apiError) { console.error('window.aistudio.getAppUrl() failed:', apiError); }
    }
    if (!appUrl) {
      appUrl = window.location.origin + window.location.pathname;
    }

    const shareData = {
      title: shareTitle,
      text: shareText,
      url: appUrl,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareText} ${appUrl}`);
        setInviteStatus('copied');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error al compartir:', error);
        setInviteStatus('error');
      }
    }
  };
  
  useEffect(() => {
    if (inviteStatus !== 'idle') {
      const timer = setTimeout(() => setInviteStatus('idle'), 3000);
      return () => clearTimeout(timer);
    }
  }, [inviteStatus]);
  
  const styles: { [key: string]: React.CSSProperties } = {
    container: { maxWidth: '800px', margin: '0 auto', padding: `${theme.spacing.extraLarge} ${theme.spacing.medium}`, display: 'flex', flexDirection: 'column', gap: theme.spacing.large },
    pageTitle: {
      fontSize: theme.typography.fontSize.extraLarge, fontWeight: 700, color: theme.colors.primaryText,
      margin: 0, borderLeft: `4px solid ${theme.colors.accent2}`, paddingLeft: theme.spacing.medium,
    },
    sectionContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.large,
        boxShadow: theme.shadows.medium,
        border: `1px solid ${theme.colors.border}`,
        display: 'flex',
        flexDirection: 'column',
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: `${theme.spacing.medium} ${theme.spacing.large}`,
        cursor: 'pointer',
    },
    sectionTitle: {
        fontSize: theme.typography.fontSize.large,
        fontWeight: 600,
        color: theme.colors.primaryText,
        margin: 0,
    },
    sectionContent: {
        padding: `0 ${theme.spacing.large} ${theme.spacing.large}`,
        borderTop: `1px solid ${theme.colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.medium,
    },
    description: { color: theme.colors.secondaryText, fontSize: theme.typography.fontSize.small, lineHeight: 1.6, margin: 0 },
    button: {
      padding: `${theme.spacing.medium} ${theme.spacing.large}`,
      border: 'none', borderRadius: theme.borderRadius.medium, fontSize: theme.typography.fontSize.medium,
      fontWeight: 'bold', cursor: 'pointer', textAlign: 'center', display: 'flex',
      alignItems: 'center', justifyContent: 'center', gap: theme.spacing.medium,
      transition: 'background-color 0.2s, color 0.2s, border 0.2s'
    },
    warning: {
        fontSize: theme.typography.fontSize.extraSmall, color: theme.colors.loss,
        backgroundColor: `${theme.colors.loss}1A`, padding: theme.spacing.small,
        borderRadius: theme.borderRadius.small, fontWeight: 'bold'
    },
    csvInfo: {
        backgroundColor: theme.colors.background,
        padding: theme.spacing.medium,
        borderRadius: theme.borderRadius.medium,
        border: `1px solid ${theme.colors.border}`,
    },
    csvInfoTitle: {
        margin: `0 0 ${theme.spacing.small} 0`,
        fontSize: '0.9rem',
        fontWeight: 600,
    },
    csvList: {
        margin: 0,
        paddingLeft: '1.5rem',
        fontSize: '0.8rem',
        color: theme.colors.secondaryText,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    },
    profileForm: { display: 'flex', flexDirection: 'column', gap: theme.spacing.medium },
    profileRow: { display: 'grid', gridTemplateColumns: '120px 1fr', gap: theme.spacing.large, alignItems: 'center' },
    profilePhotoContainer: { width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', cursor: 'pointer', backgroundColor: theme.colors.background },
    profilePhoto: { width: '100%', height: '100%', objectFit: 'cover' },
    fieldGroup: { display: 'flex', flexDirection: 'column', gap: theme.spacing.small },
    label: { fontSize: theme.typography.fontSize.small, color: theme.colors.secondaryText, fontWeight: 500 },
    input: { width: '100%', padding: theme.spacing.medium, backgroundColor: theme.colors.background, border: `1px solid ${theme.colors.borderStrong}`, borderRadius: theme.borderRadius.medium, color: theme.colors.primaryText, fontSize: theme.typography.fontSize.medium },
    nonEditable: { backgroundColor: theme.colors.border, color: theme.colors.secondaryText, cursor: 'not-allowed' }
  };
  
  const getSecondaryButtonStyle = (color: string, isHovered: boolean): React.CSSProperties => ({
    backgroundColor: isHovered ? `${color}20` : 'transparent',
    color: color,
    border: `1px solid ${color}`,
  });

  const getPrimaryButtonStyle = (color: string, isHovered: boolean): React.CSSProperties => ({
    backgroundColor: color,
    color: theme.colors.textOnAccent,
    border: `1px solid ${color}`,
    filter: isHovered ? 'brightness(0.9)' : 'brightness(1)',
  });

  const handleToggleSection = (sectionId: string) => {
    setExpandedSection(prev => prev === sectionId ? null : sectionId);
  };
  
  return (
    <>
      <style>{`
          @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
      `}</style>
      <main style={styles.container}>
        <h2 style={styles.pageTitle}>Ajustes y Datos</h2>
        
        <div style={styles.sectionContainer}>
            <div style={styles.sectionHeader} onClick={() => handleToggleSection('profile')}>
                <h3 style={styles.sectionTitle}>Perfil de Jugador</h3>
                <ChevronIcon isExpanded={expandedSection === 'profile'} />
            </div>
            {expandedSection === 'profile' && (
                <div style={{...styles.sectionContent, animation: 'fadeInDown 0.3s ease-out'}}>
                    <div style={styles.profileForm}>
                        <div style={styles.profileRow}>
                            <div style={styles.profilePhotoContainer} onClick={() => photoInputRef.current?.click()}>
                                <img src={localProfile.photo || `https://ui-avatars.com/api/?name=${localProfile.name}&background=random`} alt="Foto de perfil" style={styles.profilePhoto} />
                                <input type="file" ref={photoInputRef} onChange={handlePhotoUpload} accept="image/*" style={{ display: 'none' }} />
                            </div>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Nombre del Jugador</label>
                                <input type="text" value={localProfile.name} style={{...styles.input, ...styles.nonEditable}} disabled />
                            </div>
                        </div>
                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.medium }}>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Fecha de Nacimiento</label>
                                <input type="date" value={localProfile.dob || ''} onChange={e => handleProfileChange('dob', e.target.value)} style={styles.input} />
                            </div>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Equipo Favorito</label>
                                <input type="text" value={localProfile.favoriteTeam || ''} onChange={e => handleProfileChange('favoriteTeam', e.target.value)} style={styles.input} placeholder="Ej: Real Madrid" />
                            </div>
                         </div>
                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.medium }}>
                             <div style={styles.fieldGroup}>
                                <label style={styles.label}>Peso (kg)</label>
                                <input type="number" value={localProfile.weight || ''} onChange={e => handleProfileChange('weight', parseFloat(e.target.value))} style={styles.input} placeholder="Ej: 75" />
                            </div>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Altura (cm)</label>
                                <input type="number" value={localProfile.height || ''} onChange={e => handleProfileChange('height', parseFloat(e.target.value))} style={styles.input} placeholder="Ej: 180" />
                            </div>
                         </div>
                        <button 
                            onClick={handleSaveProfile}
                            style={{...styles.button, ...getPrimaryButtonStyle(theme.colors.accent1, hoveredButtons['saveProfile']), alignSelf: 'flex-end'}}
                            onMouseEnter={() => handleHover('saveProfile', true)}
                            onMouseLeave={() => handleHover('saveProfile', false)}
                        >
                            Guardar Cambios
                        </button>
                    </div>
                </div>
            )}
        </div>

        <div style={styles.sectionContainer}>
            <div style={styles.sectionHeader} onClick={() => handleToggleSection('community')}>
                <h3 style={styles.sectionTitle}>Comunidad</h3>
                <ChevronIcon isExpanded={expandedSection === 'community'} />
            </div>
            {expandedSection === 'community' && (
                <div style={{...styles.sectionContent, animation: 'fadeInDown 0.3s ease-out'}}>
                    <p style={styles.description}>
                        ¡Ayuda a crecer la comunidad! Invita a tus amigos a registrar sus partidos y comparar estadísticas.
                    </p>
                    <button
                        style={{...styles.button, ...getSecondaryButtonStyle(theme.colors.accent2, hoveredButtons['invite'])}}
                        onClick={handleInvite}
                        onMouseEnter={() => handleHover('invite', true)}
                        onMouseLeave={() => handleHover('invite', false)}
                    >
                        <UsersIcon />
                        {inviteStatus === 'copied' ? '¡Enlace copiado!' : 'Invitar a un amigo'}
                    </button>
                </div>
            )}
        </div>

        <div style={styles.sectionContainer}>
            <div style={styles.sectionHeader} onClick={() => handleToggleSection('share')}>
                <h3 style={styles.sectionTitle}>Modo Compartir</h3>
                <ChevronIcon isExpanded={expandedSection === 'share'} />
            </div>
            {expandedSection === 'share' && (
                <div style={{...styles.sectionContent, animation: 'fadeInDown 0.3s ease-out'}}>
                    <p style={styles.description}>
                        Genera un enlace único para compartir una vista de solo lectura de tus estadísticas. Ideal para mostrar tus logros a amigos o entrenadores.
                    </p>
                    <button
                        style={{...styles.button, ...getSecondaryButtonStyle(theme.colors.accent2, hoveredButtons['share'])}}
                        onClick={() => setIsShareModalOpen(true)}
                        onMouseEnter={() => handleHover('share', true)}
                        onMouseLeave={() => handleHover('share', false)}
                    >
                        <ShareIcon />
                        Compartir Vista Principal
                    </button>
                </div>
            )}
        </div>

        <div style={styles.sectionContainer}>
            <div style={styles.sectionHeader} onClick={() => handleToggleSection('data')}>
                <h3 style={styles.sectionTitle}>Gestión de datos (Local)</h3>
                <ChevronIcon isExpanded={expandedSection === 'data'} />
            </div>
            {expandedSection === 'data' && (
                <div style={{...styles.sectionContent, animation: 'fadeInDown 0.3s ease-out'}}>
                    <p style={styles.description}>
                        Exporta un archivo con todos tus datos como copia de seguridad o para transferirlo a otro dispositivo.
                    </p>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.medium}}>
                        <button 
                            onClick={handleExport}
                            style={{...styles.button, ...getSecondaryButtonStyle(theme.colors.accent1, hoveredButtons['exportJson'])}}
                            onMouseEnter={() => handleHover('exportJson', true)}
                            onMouseLeave={() => handleHover('exportJson', false)}
                        >
                            Exportar (JSON)
                        </button>
                        <button 
                            onClick={handleExportCSV}
                            style={{...styles.button, ...getSecondaryButtonStyle(theme.colors.accent2, hoveredButtons['exportCsv'])}}
                            onMouseEnter={() => handleHover('exportCsv', true)}
                            onMouseLeave={() => handleHover('exportCsv', false)}
                        >
                            Exportar (CSV)
                        </button>
                    </div>
                    <hr style={{width: '100%', border: 'none', borderTop: `1px solid ${theme.colors.border}`}}/>
                    <p style={styles.description}>
                        Importa un archivo para restaurar tus datos.
                    </p>
                    <p style={styles.warning}>
                        ¡Atención! La importación reemplazará todos los datos guardados actualmente.
                    </p>
                    <input type="file" ref={jsonInputRef} onChange={handleJsonFileChange} accept=".json" style={{ display: 'none' }} />
                    <input type="file" ref={csvInputRef} onChange={handleCsvFileChange} accept=".csv, text/csv" style={{ display: 'none' }} />
                    
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.medium}}>
                        <button 
                            onClick={handleImportJsonClick}
                            style={{...styles.button, ...getSecondaryButtonStyle(theme.colors.accent1, hoveredButtons['importJson'])}}
                            onMouseEnter={() => handleHover('importJson', true)}
                            onMouseLeave={() => handleHover('importJson', false)}
                        >
                            Importar (JSON)
                        </button>
                        <button 
                            onClick={handleImportCsvClick}
                            style={{...styles.button, ...getSecondaryButtonStyle(theme.colors.accent2, hoveredButtons['importCsv'])}}
                            onMouseEnter={() => handleHover('importCsv', true)}
                            onMouseLeave={() => handleHover('importCsv', false)}
                        >
                            Importar (CSV)
                        </button>
                    </div>
                    <div style={styles.csvInfo}>
                        <h4 style={styles.csvInfoTitle}>Formato de CSV Requerido</h4>
                        <ul style={styles.csvList}>
                            <li><code>Fecha</code>: en formato AAAA-MM-DD.</li>
                            <li><code>Resultado</code>: una de las opciones: VICTORIA, DERROTA, EMPATE.</li>
                            <li><code>Mis Goles</code>: un número.</li>
                            <li><code>Mis Asistencias</code>: un número.</li>
                            <li><code>Mi Equipo</code>: nombres separados por punto y coma (ej: "Juan; Pedro").</li>
                            <li><code>Equipo Rival</code>: nombres separados por punto y coma.</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>

        <div style={styles.sectionContainer}>
            <div style={styles.sectionHeader} onClick={() => handleToggleSection('danger')}>
                <h3 style={styles.sectionTitle}>Zona de Peligro</h3>
                <ChevronIcon isExpanded={expandedSection === 'danger'} />
            </div>
            {expandedSection === 'danger' && (
                <div style={{...styles.sectionContent, animation: 'fadeInDown 0.3s ease-out'}}>
                    <p style={styles.description}>
                        Borra todos los datos de la aplicación y comienza desde cero. Esta acción no se puede deshacer.
                    </p>
                    <button 
                        onClick={handleResetData}
                        style={{...styles.button, ...getSecondaryButtonStyle(theme.colors.loss, hoveredButtons['reset'])}}
                        onMouseEnter={() => handleHover('reset', true)}
                        onMouseLeave={() => handleHover('reset', false)}
                    >
                        Restablecer todos los datos
                    </button>
                </div>
            )}
        </div>

        <div style={{ textAlign: 'center', color: theme.colors.secondaryText, fontSize: theme.typography.fontSize.small, marginTop: theme.spacing.large }}>
            Versión 1.0.0
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

export default SettingsPage;