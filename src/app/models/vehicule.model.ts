export type Carburant = 'ESSENCE' | 'DIESEL' | 'ELECTRIQUE' | 'HYBRIDE';
export type BoiteVitesse = 'MANUELLE' | 'AUTOMATIQUE';
export type StatutVehicule = 'DISPONIBLE' | 'LOUE' | 'MAINTENANCE';

export interface Vehicule {
  id?: number;
  immatriculation: string;
  marque: string;
  modele: string;
  annee: number;
  couleur?: string;
  carburant: Carburant;
  boite: BoiteVitesse;
  nbPlaces: number;
  kilometrage: number;
  prixJournalier: number;
  statut: StatutVehicule;
  imageUrl?: string;
}
