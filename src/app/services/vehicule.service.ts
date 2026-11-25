import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehicule, Carburant, StatutVehicule } from '../models/vehicule.model';

@Injectable({
  providedIn: 'root'
})
export class VehiculeService {
  private http = inject(HttpClient);
  private apiUrl = '/api/vehicules';

  getAll(carburant?: Carburant, statut?: StatutVehicule, prixMax?: number): Observable<Vehicule[]> {
    let params = new HttpParams();
    if (carburant) params = params.set('carburant', carburant);
    if (statut) params = params.set('statut', statut);
    if (prixMax) params = params.set('prixMax', prixMax.toString());
    return this.http.get<Vehicule[]>(this.apiUrl, { params });
  }

  getDisponibles(dateDebut?: string, dateFin?: string): Observable<Vehicule[]> {
    let params = new HttpParams();
    if (dateDebut) params = params.set('dateDebut', dateDebut);
    if (dateFin) params = params.set('dateFin', dateFin);
    return this.http.get<Vehicule[]>(`${this.apiUrl}/disponibles`, { params });
  }

  getById(id: number): Observable<Vehicule> {
    return this.http.get<Vehicule>(`${this.apiUrl}/${id}`);
  }

  create(vehicule: Vehicule): Observable<Vehicule> {
    return this.http.post<Vehicule>(this.apiUrl, vehicule);
  }

  update(id: number, vehicule: Vehicule): Observable<Vehicule> {
    return this.http.put<Vehicule>(`${this.apiUrl}/${id}`, vehicule);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateStatut(id: number, statut: StatutVehicule): Observable<Vehicule> {
    return this.http.patch<Vehicule>(`${this.apiUrl}/${id}/statut`, { statut });
  }
}
