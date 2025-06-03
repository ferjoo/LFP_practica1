import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Token } from '../lexer';

const initialText = `Jugador: "PokeEvee"{
  "venusaur"[planta] := (
    [salud]=12;
    [ataque]=11;
    [defensa]=15;
  )

  "dragonite"[dragon] := (
    [salud]=10;
    [ataque]=15;
    [defensa]=14;
  )

  "butterfree"[bicho] := (
    [salud]=14;
    [ataque]=10;
    [defensa]=15;
  )

  "snorlax"[normal] := (
    [salud]=15;
    [ataque]=12;
    [defensa]=14;
  )

  "machamp"[lucha] := (
    [salud]=14;
    [ataque]=13;
    [defensa]=11;
  )

  "victreebel"[planta] := (
    [salud]=15;
    [ataque]=14;
    [defensa]=14;
  )

  "flareon"[fuego] := (
    [salud]=12;
    [ataque]=15;
    [defensa]=14;
  )
}`;

interface AppContextType {
  editorText: string;
  setEditorText: (text: string) => void;
  tokens: Token[];
  setTokens: (tokens: Token[]) => void;
  errors: Token[];
  setErrors: (errors: Token[]) => void;
  clearEditor: () => void;
  analyzed: boolean;
  setAnalyzed: (analyzed: boolean) => void;
  resetToEmpty: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [editorText, setEditorText] = useState(initialText);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [errors, setErrors] = useState<Token[]>([]);
  const [analyzed, setAnalyzed] = useState(false);

  const clearEditor = () => {
    setEditorText(initialText);
    setTokens([]);
    setErrors([]);
    setAnalyzed(false);
  };

  const resetToEmpty = () => {
    setEditorText('');
    setTokens([]);
    setErrors([]);
    setAnalyzed(false);
  };

  return (
    <AppContext.Provider value={{
      editorText,
      setEditorText,
      tokens,
      setTokens,
      errors,
      setErrors,
      clearEditor,
      analyzed,
      setAnalyzed,
      resetToEmpty
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 