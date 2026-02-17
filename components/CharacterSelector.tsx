import React from 'react';
import { Character } from '../types';

interface CharacterSelectorProps {
  characters: Character[];
  selectedCharacterId: string | null;
  onSelect: (characterId: string) => void;
}

// This component is now a placeholder as character selection is removed.
// Kuromi is the fixed main character.
const CharacterSelector: React.FC<CharacterSelectorProps> = ({
  characters,
  selectedCharacterId,
  onSelect,
}) => {
  return null; // Render nothing
};

export default CharacterSelector;