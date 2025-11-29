"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share } from 'lucide-react';

// Register the service worker
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(err => {
    console.error('Service Worker registration failed:', err);
  });
}

const PwaInstallPrompt = () => {
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [showIosInstall, setShowIosInstall] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event);
      setIsDialogOpen(true);
    };

    const isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isIos && !isStandalone) {
      setShowIosInstall(true);
      // Delay showing the prompt slightly to not be too intrusive
      setTimeout(() => setIsDialogOpen(true), 3000);
    } else {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPromptEvent) return;
    installPromptEvent.prompt();
    installPromptEvent.userChoice.then(() => {
      setInstallPromptEvent(null);
      setIsDialogOpen(false);
    });
  };

  const handleClose = () => {
    setIsDialogOpen(false);
  };

  if (!isDialogOpen) return null;

  if (showIosInstall) {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Instalar Aplicativo
            </DialogTitle>
            <DialogDescription>
              Para instalar, toque no ícone de Compartilhar <Share className="inline h-4 w-4 mx-1" /> e depois em "Adicionar à Tela de Início".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleClose}>Entendi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (installPromptEvent) {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Instalar Aplicativo
            </DialogTitle>
            <DialogDescription>
              Adicione este aplicativo à sua tela inicial para acesso rápido e fácil.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleInstallClick}>
              Instalar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
};

export default PwaInstallPrompt;