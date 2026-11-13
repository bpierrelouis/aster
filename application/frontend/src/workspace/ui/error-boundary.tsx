/* Isolement d'une fonctionnalité complémentaire : une erreur de rendu de son contenu affiche fallback, sans arrêter le reste de l'espace. */
import { Component } from 'react';
import type { ReactNode } from 'react';

export class ErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) { console.error('Affichage :', error.message); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
