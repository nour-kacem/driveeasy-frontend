export type CategorieClient = 'STANDARD' | 'FIDELE' | 'VIP';

export interface Client {
  id?: number;
  cin: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  email: string;
  telephone: string;
  adresse: string;
  numeroPermis: string;
  dateExpirationPermis: string;
  categorieClient: CategorieClient;
  dateInscription?: string;
  activeRental?: boolean;
}

export interface EligibiliteResponse {
  eligible: boolean;
  raison: string;
}
