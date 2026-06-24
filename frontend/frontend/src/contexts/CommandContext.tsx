import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface Command {
  id: string;
  title: string;
  description?: string;
  icon?: React.ElementType;
  action: () => void;
  category: 'Navigation' | 'Actions' | 'Payroll' | 'Resources' | 'System';
  shortcut?: string[];
}

interface CommandContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  query: string;
  setQuery: (query: string) => void;
  commands: Command[];
  registerCommand: (command: Command) => () => void;
}

const CommandContext = createContext<CommandContextType | undefined>(undefined);

export const CommandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [commands, setCommands] = useState<Command[]>([]);

  const registerCommand = useCallback((command: Command) => {
    setCommands(prev => {
      if (prev.find(c => c.id === command.id)) return prev;
      return [...prev, command];
    });
    return () => {
      setCommands(prev => prev.filter(c => c.id !== command.id));
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <CommandContext.Provider value={{ isOpen, setIsOpen, query, setQuery, commands, registerCommand }}>
      {children}
    </CommandContext.Provider>
  );
};

export const useCommand = () => {
  const context = useContext(CommandContext);
  if (!context) throw new Error('useCommand must be used within CommandProvider');
  return context;
};
