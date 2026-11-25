import { Client } from './client.model';
import { Vehicule } from './vehicule.model';

export type StatutLocation = 'RESERVEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';

export interface Location {
  id?: number;
  clientId: number;
  vehiculeId: number;
  dateDebut: string;
  dateFinPrevue: string;
  dateRetourEffectif?: string;
  kmDepart?: number;
  kmRetour?: number;
  prixJournalierApplique?: number;
  montantTotal?: number;
  penalite?: number;
  statut: StatutLocation;
  dateCreation?: string;
}

export interface LocationDetailResponse {
  location: Location;
  client?: Client;
  vehicule?: Vehicule;
}

export interface SimulationRequest {
  clientId: number;
  vehiculeId: number;
  dateDebut: string;
  dateFinPrevue: string;
}

export interface SimulationResponse {
  nbJours: number;
  prixJournalier: number;
  montantBrut: number;
  pourcentageRemise: number;
  montantRemise: number;
  montantNet: number;
}

export interface RetourRequest {
  kmRetour: number;
}

export interface StatistiquesResponse {
  totalLocations: number;
  locationsEnCours: number;
  locationsTerminees: number;
  chiffreAffairesTotal: number;
  tauxOccupation: number;
  topVehicules?: {
    vehiculeId: number;
    nombreLocations: number;
  }[];
}
