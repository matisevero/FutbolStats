import React, { useState, useEffect } from 'react';
import type { Match } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import AutocompleteInput from './AutocompleteInput';

interface MatchFormProps {
  onAddMatch: (match: Omit<Match, 'id'>) => void;
  onUpdateMatch: (match: Match) => void;
  onCancelEdit: () => void;
  matchToEdit: Match | null;
}

const resultAbbreviations: Record<'VICTORIA' | 'DERROTA' | 'EMPATE', string> = {
  VICTORIA: 'V',
  DERROTA: 'D',
  EMPATE: 'E',
};

const getLocalDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const MatchForm: React.FC<MatchFormProps> = ({ onAddMatch, onUpdateMatch, onCancelEdit, matchToEdit }) => {
  const { theme } = useTheme();
  const [result, setResult] = useState<'VICTORIA' | 'DERROTA' | 'EMPATE'>('VICTORIA');
  const [myGoals, setMyGoals] = useState(0);
  const [myAssists, setMyAssists] = useState(0);
  const [goalDifference, setGoalDifference] = useState(1);
  const [date, setDate] = useState(getLocalDateString());
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitHovered, setIsSubmitHovered] = useState(false);
  const [isCancelHovered, setIsCancelHovered] = useState(false);

  const isEditMode = !!matchToEdit;

  useEffect(() => {
    if (matchToEdit) {
      setResult(matchToEdit.result);
      setMyGoals(matchToEdit.myGoals);
      setMyAssists(matchToEdit.myAssists);
      setDate(matchToEdit.date);
      setGoalDifference(matchToEdit.goalDifference ?? 0);
      setNotes(matchToEdit.notes || '');
      setShowNotes(!!matchToEdit.notes);
    }
  }, [matchToEdit]);
  
  useEffect(() => {
    if (!isEditMode) {
      if (result === 'EMPATE') {
        setGoalDifference(0);
      } else if (result === 'VICTORIA' && goalDifference <= 0) {
        setGoalDifference(1);
      } else if (result === 'DERROTA' && goalDifference <= 0) {
        setGoalDifference(1);
      }
    }
  }, [result, isEditMode, goalDifference]);
  
  const resetForm = () => {
    setResult('VICTORIA');
    setMyGoals(0);
    setMyAssists(0);
    setGoalDifference(1);
    setNotes('');
    setDate(getLocalDateString());
    setShowNotes(false);
    setError('');
  };

  const handleGoalDifferenceChange = (amount: number) => {
    setGoalDifference(current => Math.max(0, current + amount));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    let finalGoalDifference = goalDifference;
    if (result === 'VICTORIA' && goalDifference <= 0) {
      setError('La diferencia de gol debe ser positiva para una victoria.');
      return;
    }
    if (result === 'DERROTA') {
      if (goalDifference <= 0) {
        setError('La diferencia de gol debe ser positiva para una derrota.');
        return;
      }
      finalGoalDifference = -goalDifference;
    }
    if (result === 'EMPATE') {
      finalGoalDifference = 0;
    }

    const matchData = {
      result,
      myGoals,
      myAssists,
      date,
      goalDifference: finalGoalDifference,
      notes,
    };

    if (isEditMode) {
      onUpdateMatch({
        ...matchToEdit,
        ...matchData
      });
    } else {
       onAddMatch(matchData);
      resetForm();
    }
  };

  const handleCancel = () => {
    onCancelEdit();
    resetForm();
  };

  const resultOptions: ('VICTORIA' | 'EMPATE' | 'DERROTA')[] = ['VICTORIA', 'EMPATE', 'DERROTA'];
  
  const styles: { [key: string]: React.CSSProperties } = {
    form: { display: 'flex', flexDirection: 'column', gap: theme.spacing.large },
    twoFieldsContainer: { display: 'flex', alignItems: 'flex-end', gap: theme.spacing.medium },
    input: {
      width: '100%', padding: theme.spacing.medium, backgroundColor: theme.colors.background,
      border: `1px solid ${theme.colors.borderStrong}`, borderRadius: theme.borderRadius.medium, 
      color: theme.colors.primaryText, fontSize: theme.typography.fontSize.medium, outline: 'none', 
      transition: 'border-color 0.2s, background-color 0.2s',
    },
    stepper: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: theme.colors.background, border: `1px solid ${theme.colors.borderStrong}`,
      borderRadius: theme.borderRadius.medium, padding: `0 ${theme.spacing.small}`,
      height: '48px', boxSizing: 'border-box'
    },
    stepperButton: {
      background: 'none', border: 'none', color: theme.colors.primaryText,
      fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer',
      padding: `${theme.spacing.small} ${theme.spacing.medium}`,
      lineHeight: 1,
    },
    stepperValue: {
      fontSize: '1.25rem', fontWeight: 600, color: theme.colors.primaryText,
      minWidth: '30px', textAlign: 'center'
    },
    fieldGroup: { display: 'flex', flexDirection: 'column', gap: theme.spacing.small, flex: 1, },
    label: { fontSize: theme.typography.fontSize.small, color: theme.colors.secondaryText, fontWeight: 500, paddingLeft: '0.25rem', },
    radioGroup: { display: 'flex', borderRadius: theme.borderRadius.medium, border: `1px solid ${theme.colors.borderStrong}`, overflow: 'hidden' },
    radioLabel: {
      flex: 1, textAlign: 'center', padding: theme.spacing.medium, cursor: 'pointer',
      backgroundColor: 'transparent', color: theme.colors.secondaryText,
      transition: 'background-color 0.2s, color 0.2s', fontWeight: 600,
    },
    radioInput: { display: 'none' },
    textarea: { resize: 'vertical', minHeight: '80px', fontFamily: theme.typography.fontFamily },
    toggleNotesButton: {
      background: 'none', border: `1px dashed ${theme.colors.borderStrong}`, color: theme.colors.secondaryText,
      padding: theme.spacing.small, fontSize: theme.typography.fontSize.small,
      borderRadius: theme.borderRadius.medium, cursor: 'pointer', textAlign: 'center',
      transition: 'background-color 0.2s, color 0.2s', width: '100%',
      height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    buttonGroup: { display: 'flex', gap: theme.spacing.medium, marginTop: theme.spacing.small },
    submitButton: {
      flex: 1, padding: `${theme.spacing.medium} ${theme.spacing.large}`,
      borderRadius: theme.borderRadius.medium, fontSize: theme.typography.fontSize.medium,
      fontWeight: 'bold', cursor: 'pointer', transition: 'filter 0.2s',
      backgroundColor: theme.colors.accent1,
      color: theme.colors.textOnAccent,
      border: 'none',
    },
    cancelButton: { 
      flex: 1, padding: `${theme.spacing.medium} ${theme.spacing.large}`,
      borderRadius: theme.borderRadius.medium, fontSize: theme.typography.fontSize.medium,
      fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s',
      backgroundColor: 'transparent',
      color: theme.colors.secondaryText,
      border: `1px solid ${theme.colors.borderStrong}`,
    },
    errorText: { color: theme.colors.loss, fontSize: theme.typography.fontSize.small, textAlign: 'center' }
  };

  const getResultRadioStyle = (option: 'VICTORIA' | 'EMPATE' | 'DERROTA'): React.CSSProperties => {
    if (result !== option) return {};
    
    switch (option) {
      case 'VICTORIA': return { backgroundColor: theme.colors.win, color: theme.colors.textOnAccent };
      case 'EMPATE': return { backgroundColor: theme.colors.draw, color: theme.colors.textOnAccent };
      case 'DERROTA': return { backgroundColor: theme.colors.loss, color: theme.colors.textOnAccent };
      default: return {};
    }
  };
  
  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {error && <p style={styles.errorText}>{error}</p>}
      
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Fecha</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={styles.input} />
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Resultado</label>
        <div style={styles.radioGroup}>
          {resultOptions.map((option) => (
            <label key={option} style={{...styles.radioLabel, ...getResultRadioStyle(option)}}>
              <input type="radio" name="result" value={option} checked={result === option} onChange={() => setResult(option)} style={styles.radioInput} />
              {resultAbbreviations[option]}
            </label>
          ))}
        </div>
      </div>

      <div style={styles.twoFieldsContainer}>
         <div style={styles.fieldGroup}>
           <label style={styles.label}>Goles</label>
           <div style={styles.stepper}>
             <button type="button" onClick={() => setMyGoals(g => Math.max(0, g - 1))} style={styles.stepperButton} aria-label="Reducir goles">-</button>
             <span style={styles.stepperValue}>{myGoals}</span>
             <button type="button" onClick={() => setMyGoals(g => g + 1)} style={styles.stepperButton} aria-label="Aumentar goles">+</button>
           </div>
        </div>
        <div style={styles.fieldGroup}>
           <label style={styles.label}>Asistencias</label>
           <div style={styles.stepper}>
             <button type="button" onClick={() => setMyAssists(a => Math.max(0, a - 1))} style={styles.stepperButton} aria-label="Reducir asistencias">-</button>
             <span style={styles.stepperValue}>{myAssists}</span>
             <button type="button" onClick={() => setMyAssists(a => a + 1)} style={styles.stepperButton} aria-label="Aumentar asistencias">+</button>
           </div>
        </div>
      </div>

      <div style={styles.twoFieldsContainer}>
        <div style={{...styles.fieldGroup, flex: 2}}>
           <label style={styles.label}>Dif. Gol</label>
           <div style={styles.stepper}>
             <button type="button" onClick={() => handleGoalDifferenceChange(-1)} style={styles.stepperButton} aria-label="Reducir diferencia de gol" disabled={result === 'EMPATE'}>-</button>
             <span style={styles.stepperValue}>{result === 'EMPATE' ? 0 : goalDifference}</span>
             <button type="button" onClick={() => handleGoalDifferenceChange(1)} style={styles.stepperButton} aria-label="Aumentar diferencia de gol" disabled={result === 'EMPATE'}>+</button>
           </div>
        </div>
        {!showNotes && (
          <div style={{...styles.fieldGroup, flex: 3}}>
            <label style={{...styles.label, opacity: 0}}>Notas</label>
            <button type="button" onClick={() => setShowNotes(true)} style={styles.toggleNotesButton}>
              + Añadir notas
            </button>
          </div>
        )}
      </div>

      {showNotes && (
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Notas del partido (Opcional)</label>
          <textarea placeholder="Ej: Jugadores clave, momentos emocionantes..." value={notes} onChange={(e) => setNotes(e.target.value)} style={{...styles.input, ...styles.textarea}} rows={3} />
        </div>
      )}

      <div style={styles.buttonGroup}>
        {isEditMode && (
           <button 
              type="button" 
              onClick={handleCancel} 
              style={{...styles.cancelButton, backgroundColor: isCancelHovered ? theme.colors.border : 'transparent'}}
              onMouseEnter={() => setIsCancelHovered(true)}
              onMouseLeave={() => setIsCancelHovered(false)}
            >
              Cancelar
           </button>
        )}
        <button 
            type="submit" 
            style={{...styles.submitButton, filter: isSubmitHovered ? 'brightness(0.9)' : 'brightness(1)'}}
            onMouseEnter={() => setIsSubmitHovered(true)}
            onMouseLeave={() => setIsSubmitHovered(false)}
        >
          {isEditMode ? 'Actualizar partido' : 'Añadir partido'}
        </button>
      </div>
    </form>
  );
};

export default MatchForm;
