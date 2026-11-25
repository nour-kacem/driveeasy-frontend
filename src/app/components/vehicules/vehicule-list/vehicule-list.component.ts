import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VehiculeService } from '../../../services/vehicule.service';
import { Vehicule, Carburant, StatutVehicule } from '../../../models/vehicule.model';

@Component({
  selector: 'app-vehicule-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 class="fw-bold mb-1">Catalogue du Parc Automobile</h2>
          <p class="text-muted mb-0">Gestion, statut et disponibilitÃ© des vÃ©hicules</p>
        </div>
        <a routerLink="/vehicules/new" class="btn btn-primary d-flex align-items-center gap-2">
          <i class="bi bi-plus-circle"></i> Ajouter un vÃ©hicule
        </a>
      </div>

      <!-- Filtres -->
      <div class="card p-3 mb-4 shadow-sm border-0">
        <div class="row g-3">
          <div class="col-12 col-md-4">
            <label class="form-label small fw-semibold">Carburant</label>
            <select class="form-select" [(ngModel)]="selectedCarburant" (change)="applyFilters()">
              <option value="">Tous les carburants</option>
              <option value="ESSENCE">Essence</option>
              <option value="DIESEL">Diesel</option>
              <option value="ELECTRIQUE">Ã‰lectrique</option>
              <option value="HYBRIDE">Hybride</option>
            </select>
          </div>
          <div class="col-12 col-md-4">
            <label class="form-label small fw-semibold">Statut</label>
            <select class="form-select" [(ngModel)]="selectedStatut" (change)="applyFilters()">
              <option value="">Tous les statuts</option>
              <option value="DISPONIBLE">Disponible</option>
              <option value="LOUE">LouÃ©</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>
          <div class="col-12 col-md-4">
            <label class="form-label small fw-semibold">Prix Max / Jour (â‚¬)</label>
            <input type="number" class="form-control" placeholder="Ex: 80" [(ngModel)]="selectedPrixMax" (input)="applyFilters()">
          </div>
        </div>
      </div>

      <!-- Grille de vÃ©hicules -->
      <div class="row g-4">
        <div class="col-12 col-md-6 col-xl-4" *ngFor="let v of vehicules">
          <div class="card h-100 overflow-hidden shadow-sm border-0 position-relative">
            <span class="position-absolute top-0 end-0 m-3 badge" [ngClass]="{
              'bg-success': v.statut === 'DISPONIBLE',
              'bg-danger': v.statut === 'LOUE',
              'bg-warning text-dark': v.statut === 'MAINTENANCE'
            }">{{ v.statut }}</span>

            <div class="bg-light text-center py-4 border-bottom position-relative" style="height: 180px;">
              <img [src]="v.imageUrl || 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&auto=format&fit=crop&q=80'" 
                   alt="{{ v.marque }} {{ v.modele }}"
                   class="img-fluid h-100 object-fit-contain"
                   (error)="handleImageError($event)">
            </div>

            <div class="card-body d-flex flex-column p-4">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h5 class="fw-bold mb-0">{{ v.marque }} {{ v.modele }}</h5>
                  <span class="badge bg-light text-secondary border mt-1">{{ v.immatriculation }}</span>
                </div>
                <div class="text-end">
                  <span class="fs-4 fw-bold text-primary">{{ v.prixJournalier }}â‚¬</span>
                  <span class="text-muted small">/jour</span>
                </div>
              </div>

              <div class="row g-2 my-2 py-2 border-top border-bottom small text-muted">
                <div class="col-6"><i class="bi bi-fuel-pump me-1"></i> {{ v.carburant }}</div>
                <div class="col-6"><i class="bi bi-gear me-1"></i> {{ v.boite }}</div>
                <div class="col-6"><i class="bi bi-people me-1"></i> {{ v.nbPlaces }} places</div>
                <div class="col-6"><i class="bi bi-speedometer2 me-1"></i> {{ v.kilometrage | number }} km</div>
              </div>

              <div class="mt-auto pt-3 d-flex justify-content-between align-items-center">
                <div class="btn-group">
                  <a [routerLink]="['/vehicules', v.id, 'edit']" class="btn btn-sm btn-outline-secondary">
                    <i class="bi bi-pencil"></i> Modifier
                  </a>
                  <button (click)="deleteVehicule(v)" class="btn btn-sm btn-outline-danger" [disabled]="v.statut === 'LOUE'">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
                <a *ngIf="v.statut === 'DISPONIBLE'" [routerLink]="['/locations/new']" [queryParams]="{ vehiculeId: v.id }" class="btn btn-sm btn-primary">
                  <i class="bi bi-key-fill"></i> Louer
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 text-center py-5" *ngIf="vehicules.length === 0">
          <i class="bi bi-car-front text-muted display-4"></i>
          <p class="text-muted mt-2">Aucun vÃ©hicule ne correspond aux filtres sÃ©lectionnÃ©s.</p>
        </div>
      </div>
    </div>
  `
})
export class VehiculeListComponent implements OnInit {
  private vehiculeService = inject(VehiculeService);

  vehicules: Vehicule[] = [];
  selectedCarburant = '';
  selectedStatut = '';
  selectedPrixMax?: number;

  ngOnInit(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    const carb = (this.selectedCarburant as Carburant) || undefined;
    const stat = (this.selectedStatut as StatutVehicule) || undefined;
    this.vehiculeService.getAll(carb, stat, this.selectedPrixMax).subscribe({
      next: (data) => this.vehicules = data,
      error: (e) => console.error(e)
    });
  }

  deleteVehicule(v: Vehicule): void {
    if (!v.id) return;
    if (confirm(`ÃŠtes-vous sÃ»r de vouloir supprimer le vÃ©hicule ${v.marque} ${v.modele} (${v.immatriculation}) ?`)) {
      this.vehiculeService.delete(v.id).subscribe({
        next: () => this.applyFilters(),
        error: (err) => alert('Erreur lors de la suppression: ' + (err.error?.message || err.message))
      });
    }
  }

  handleImageError(event: any): void {
    event.target.src = 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&auto=format&fit=crop&q=80';
  }
}

