"use client";

import { useState, useEffect } from 'react';

export function usePwaInstall() {
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPromptEvent(event);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const promptInstall = () => {
    if (installPromptEvent) {
      installPromptEvent.prompt();
      return installPromptEvent.userChoice;
    }
    return Promise.reject('No install prompt available');
  };

  return {
    isInstallAvailable: !!installPromptEvent,
    promptInstall,
  };
}