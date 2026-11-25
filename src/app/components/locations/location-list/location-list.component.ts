import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LocationService } from '../../../services/location.service';
import { Location, StatutLocation } from '../../../models/location.model';

@Component({
  selector: 'app-location-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 class="fw-bold mb-1">Gestion des Locations</h2>
          <p class="text-muted mb-0">Cycle de vie des réservations, départs et retours</p>
        </div>
        <a routerLink="/locations/new" class="btn btn-primary d-flex align-items-center gap-2">
          <i class="bi bi-plus-circle"></i> Nouvelle Réservation
        </a>
      </div>

      <!-- Filtres -->
      <div class="card p-3 mb-4 shadow-sm border-0">
        <div class="row g-3 align-items-end">
          <div class="col-12 col-md-4">
            <label class="form-label small fw-semibold">Statut de la location</label>
            <select class="form-select" [(ngModel)]="selectedStatut" (change)="loadLocations()">
              <option value="">Tous les statuts</option>
              <option value="RESERVEE">Réservée</option>
              <option value="EN_COURS">En cours</option>
              <option value="TERMINEE">Terminée</option>
              <option value="ANNULEE">Annulée</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tableau des locations -->
      <div class="card shadow-sm border-0 overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Client</th>
                <th>Véhicule</th>
                <th>Dates</th>
                <th>Kilométrage</th>
                <th>Montant Net</th>
                <th>Statut</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let loc of locations">
                <td class="fw-bold">#{{ loc.id }}</td>
                <td>
                  <a [routerLink]="['/clients', loc.clientId]" class="fw-bold text-decoration-none text-dark">
                    Client #{{ loc.clientId }}
                  </a>
                </td>
                <td>
                  <span class="badge bg-light text-dark border">Véhicule #{{ loc.vehiculeId }}</span>
                </td>
                <td>
                  <div class="small fw-semibold">{{ loc.dateDebut }} &rarr; {{ loc.dateFinPrevue }}</div>
                  <div *ngIf="loc.dateRetourEffectif" class="small text-muted">
                    Retourné le: {{ loc.dateRetourEffectif }}
                  </div>
                </td>
                <td>
                  <span class="small text-muted">Départ: {{ loc.kmDepart || 0 }} km</span>
                  <div *ngIf="loc.kmRetour" class="small fw-semibold text-success">
                    Retour: {{ loc.kmRetour }} km
                  </div>
                </td>
                <td>
                  <div class="fw-bold text-primary">{{ loc.montantTotal }}€</div>
                  <div *ngIf="loc.penalite && loc.penalite > 0" class="badge bg-danger">
                    +{{ loc.penalite }}€ pénalité
                  </div>
                </td>
                <td>
                  <span class="badge" [ngClass]="{
                    'bg-warning text-dark': loc.statut === 'RESERVEE',
                    'bg-success': loc.statut === 'EN_COURS',
                    'bg-secondary': loc.statut === 'TERMINEE',
                    'bg-danger': loc.statut === 'ANNULEE'
                  }">{{ loc.statut }}</span>
                </td>
                <td class="text-end">
                  <div class="btn-group">
                    <!-- Démarrer location si RESERVEE -->
                    <button *ngIf="loc.statut === 'RESERVEE'" (click)="demarrerLocation(loc)" 
                            class="btn btn-sm btn-outline-success" title="Démarrer le départ">
                      <i class="bi bi-play-circle"></i> Départ
                    </button>

                    <!-- Retour véhicule si EN_COURS -->
                    <a *ngIf="loc.statut === 'EN_COURS'" [routerLink]="['/locations', loc.id, 'retour']" 
                       class="btn btn-sm btn-outline-primary" title="Enregistrer le retour">
                      <i class="bi bi-box-arrow-in-down"></i> Retour
                    </a>

                    <!-- Annuler si RESERVEE -->
                    <button *ngIf="loc.statut === 'RESERVEE'" (click)="annulerLocation(loc)" 
                            class="btn btn-sm btn-outline-danger" title="Annuler réservation">
                      <i class="bi bi-x-circle"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="locations.length === 0">
                <td colspan="8" class="text-center py-4 text-muted">Aucune location trouvée.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class LocationListComponent implements OnInit {
  private locationService = inject(LocationService);

  locations: Location[] = [];
  selectedStatut = '';

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations(): void {
    const s = (this.selectedStatut as StatutLocation) || undefined;
    this.locationService.getAll(s).subscribe({
      next: (data) => this.locations = data,
      error: (e) => console.error(e)
    });
  }

  demarrerLocation(loc: Location): void {
    if (!loc.id) return;
    if (confirm(`Confirmer le départ de la location #${loc.id} ? Le statut du véhicule passera à LOUÉ.`)) {
      this.locationService.demarrer(loc.id).subscribe({
        next: () => this.loadLocations(),
        error: (err) => alert('Erreur: ' + (err.error?.message || err.message))
      });
    }
  }

  annulerLocation(loc: Location): void {
    if (!loc.id) return;
    if (confirm(`Confirmer l'annulation de la réservation #${loc.id} ?`)) {
      this.locationService.annuler(loc.id).subscribe({
        next: () => this.loadLocations(),
        error: (err) => alert('Erreur: ' + (err.error?.message || err.message))
      });
    }
  }
}
