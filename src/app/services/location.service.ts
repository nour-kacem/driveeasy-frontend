import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Location,
  LocationDetailResponse,
  SimulationRequest,
  SimulationResponse,
  RetourRequest,
  StatistiquesResponse,
  StatutLocation
} from '../models/location.model';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private http = inject(HttpClient);
  private apiUrl = '/api/locations';

  getAll(statut?: StatutLocation, clientId?: number, vehiculeId?: number): Observable<Location[]> {
    let params = new HttpParams();
    if (statut) params = params.set('statut', statut);
    if (clientId) params = params.set('clientId', clientId.toString());
    if (vehiculeId) params = params.set('vehiculeId', vehiculeId.toString());
    return this.http.get<Location[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<LocationDetailResponse> {
    return this.http.get<LocationDetailResponse>(`${this.apiUrl}/${id}`);
  }

  simuler(request: SimulationRequest): Observable<SimulationResponse> {
    return this.http.post<SimulationResponse>(`${this.apiUrl}/simulation`, request);
  }

  creer(location: Partial<Location>): Observable<Location> {
    return this.http.post<Location>(this.apiUrl, location);
  }

  demarrer(id: number): Observable<Location> {
    return this.http.patch<Location>(`${this.apiUrl}/${id}/depart`, {});
  }

  retourner(id: number, request: RetourRequest): Observable<Location> {
    return this.http.patch<Location>(`${this.apiUrl}/${id}/retour`, request);
  }

  annuler(id: number): Observable<Location> {
    return this.http.patch<Location>(`${this.apiUrl}/${id}/annulation`, {});
  }

  getStatistiques(): Observable<StatistiquesResponse> {
    return this.http.get<StatistiquesResponse>(`${this.apiUrl}/statistiques`);
  }
}
