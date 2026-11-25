import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClientService } from '../../../services/client.service';
import { LocationService } from '../../../services/location.service';
import { Client, EligibiliteResponse } from '../../../models/client.model';
import { Location } from '../../../models/location.model';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container" style="max-width: 900px;" *ngIf="client">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold mb-1">{{ client.nom }} {{ client.prenom }}</h2>
          <span class="badge" [ngClass]="{
            'badge-vip': client.categorieClient === 'VIP',
            'badge-fidele': client.categorieClient === 'FIDELE',
            'badge-standard': client.categorieClient === 'STANDARD'
          }">Catégorie {{ client.categorieClient }}</span>
        </div>
        <div class="d-flex gap-2">
          <a routerLink="/clients" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left"></i> Retour
          </a>
          <a [routerLink]="['/clients', client.id, 'edit']" class="btn btn-primary">
            <i class="bi bi-pencil"></i> Modifier
          </a>
        </div>
      </div>

      <!-- Statut Éligibilité -->
      <div class="card p-3 mb-4 shadow-sm border-0" [ngClass]="eligibilite?.eligible ? 'bg-success-subtle text-success-emphasis border-success' : 'bg-danger-subtle text-danger-emphasis border-danger'">
        <div class="d-flex align-items-center gap-3">
          <i class="bi fs-1" [ngClass]="eligibilite?.eligible ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'"></i>
          <div>
            <h5 class="fw-bold mb-1">
              {{ eligibilite?.eligible ? 'Client Éligible à la Location' : 'Client NON Éligible' }}
            </h5>
            <p class="mb-0">{{ eligibilite?.raison }}</p>
          </div>
        </div>
      </div>

      <!-- Coordonnées & Permis -->
      <div class="row g-4 mb-4">
        <div class="col-md-6">
          <div class="card p-4 h-100 shadow-sm border-0">
            <h5 class="fw-bold mb-3 border-bottom pb-2"><i class="bi bi-person me-2 text-primary"></i>Informations Personnelles</h5>
            <p><strong>CIN :</strong> {{ client.cin }}</p>
            <p><strong>Date de Naissance :</strong> {{ client.dateNaissance }}</p>
            <p><strong>Date d'Inscription :</strong> {{ client.dateInscription }}</p>
            <p><strong>Location en cours :</strong> 
              <span class="badge" [ngClass]="client.activeRental ? 'bg-warning text-dark' : 'bg-secondary'">
                {{ client.activeRental ? 'Oui (active)' : 'Non' }}
              </span>
            </p>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card p-4 h-100 shadow-sm border-0">
            <h5 class="fw-bold mb-3 border-bottom pb-2"><i class="bi bi-card-text me-2 text-primary"></i>Coordonnées & Permis</h5>
            <p><strong>Email :</strong> {{ client.email }}</p>
            <p><strong>Téléphone :</strong> {{ client.telephone }}</p>
            <p><strong>Adresse :</strong> {{ client.adresse }}</p>
            <p><strong>Permis N° :</strong> {{ client.numeroPermis }}</p>
            <p><strong>Expiration Permis :</strong> {{ client.dateExpirationPermis }}</p>
          </div>
        </div>
      </div>

      <!-- Historique des locations -->
      <div class="card p-4 shadow-sm border-0">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-bold mb-0"><i class="bi bi-clock-history me-2 text-primary"></i>Historique des Locations</h5>
          <a [routerLink]="['/locations/new']" [queryParams]="{ clientId: client.id }" class="btn btn-sm btn-outline-primary">
            + Nouvelle location pour ce client
          </a>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Véhicule</th>
                <th>Période</th>
                <th>Montant</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let loc of locations">
                <td class="fw-bold">#{{ loc.id }}</td>
                <td>Véhicule #{{ loc.vehiculeId }}</td>
                <td>{{ loc.dateDebut }} &rarr; {{ loc.dateFinPrevue }}</td>
                <td class="fw-bold text-primary">{{ loc.montantTotal }}€</td>
                <td>
                  <span class="badge" [ngClass]="{
                    'bg-warning text-dark': loc.statut === 'RESERVEE',
                    'bg-success': loc.statut === 'EN_COURS',
                    'bg-secondary': loc.statut === 'TERMINEE',
                    'bg-danger': loc.statut === 'ANNULEE'
                  }">{{ loc.statut }}</span>
                </td>
              </tr>
              <tr *ngIf="locations.length === 0">
                <td colspan="5" class="text-center py-3 text-muted">Aucune location enregistrée pour ce client.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ClientDetailComponent implements OnInit {
  private clientService = inject(ClientService);
  private locationService = inject(LocationService);
  private route = inject(ActivatedRoute);

  client?: Client;
  eligibilite?: EligibiliteResponse;
  locations: Location[] = [];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const clientId = +id;
      this.clientService.getById(clientId).subscribe({
        next: (c) => {
          this.client = c;
          this.clientService.checkEligibilite(clientId).subscribe({
            next: (e) => this.eligibilite = e
          });
        }
      });
      this.locationService.getAll(undefined, clientId).subscribe({
        next: (locs) => this.locations = locs
      });
    }
  }
}
