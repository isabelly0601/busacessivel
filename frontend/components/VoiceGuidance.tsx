'use client';

import { useEffect, useState } from 'react';

interface VoiceGuidanceProps {
  text: string;
  enabled?: boolean;
}

export default function VoiceGuidance({ text, enabled = true }: VoiceGuidanceProps) {
  const [voiced, setVoiced] = useState(false);

  useEffect(() => {
    if (!enabled || voiced) return;

    const speak = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.1; // Friendly tone
      
      window.speechSynthesis.speak(utterance);
      setVoiced(true);
    };

    // Small delay to ensure client-side hydration and user focus
    const timer = setTimeout(speak, 1500);

    return () => clearTimeout(timer);
  }, [text, enabled, voiced]);

  return null; // This component is invisible
}
