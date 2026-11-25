import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client, CategorieClient, EligibiliteResponse } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);
  private apiUrl = '/api/clients';

  getAll(nom?: string, cin?: string, email?: string): Observable<Client[]> {
    let params = new HttpParams();
    if (nom) params = params.set('nom', nom);
    if (cin) params = params.set('cin', cin);
    if (email) params = params.set('email', email);
    return this.http.get<Client[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  create(client: Client): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client);
  }

  update(id: number, client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}`, client);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  checkEligibilite(id: number): Observable<EligibiliteResponse> {
    return this.http.get<EligibiliteResponse>(`${this.apiUrl}/${id}/eligibilite`);
  }

  updateCategorie(id: number, categorieClient: CategorieClient): Observable<Client> {
    return this.http.patch<Client>(`${this.apiUrl}/${id}/categorie`, { categorieClient });
  }
}
