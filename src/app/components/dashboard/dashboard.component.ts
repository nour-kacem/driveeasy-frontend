import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VehiculeService } from '../../services/vehicule.service';
import { LocationService } from '../../services/location.service';
import { ClientService } from '../../services/client.service';
import { Vehicule } from '../../models/vehicule.model';
import { Location, StatistiquesResponse } from '../../models/location.model';
import { Client } from '../../models/client.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid">
      <!-- En-tête -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold mb-1">Tableau de bord</h2>
          <p class="text-muted mb-0">Vue d'ensemble en temps réel de votre agence DriveEasy</p>
        </div>
        <div class="d-flex gap-2">
          <button (click)="loadData()" class="btn btn-outline-secondary d-flex align-items-center gap-1">
            <i class="bi bi-arrow-clockwise"></i> Actualiser
          </button>
          <a routerLink="/locations/new" class="btn btn-primary d-flex align-items-center gap-1">
            <i class="bi bi-plus-lg"></i> Nouvelle Location
          </a>
        </div>
      </div>

      <!-- Cartes KPIs -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card h-100 p-3 border-0 bg-primary text-white shadow-sm">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <span class="text-white-50 small text-uppercase fw-bold">Parc Total</span>
                <h3 class="fw-bold my-2">{{ vehicules.length }}</h3>
                <span class="badge bg-white text-primary fw-semibold">
                  {{ dispoCount }} disponibles
                </span>
              </div>
              <div class="bg-white bg-opacity-25 p-3 rounded-circle">
                <i class="bi bi-car-front fs-3"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card h-100 p-3 border-0 bg-success text-white shadow-sm">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <span class="text-white-50 small text-uppercase fw-bold">Locations en cours</span>
                <h3 class="fw-bold my-2">{{ enCoursCount }}</h3>
                <span class="badge bg-white text-success fw-semibold">
                  {{ stats?.tauxOccupation || 0 }}% d'occupation
                </span>
              </div>
              <div class="bg-white bg-opacity-25 p-3 rounded-circle">
                <i class="bi bi-key fs-3"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card h-100 p-3 border-0 bg-info text-white shadow-sm">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <span class="text-white-50 small text-uppercase fw-bold">Chiffre d'Affaires</span>
                <h3 class="fw-bold my-2">{{ (stats?.chiffreAffairesTotal || 0) | currency:'EUR':'symbol':'1.2-2':'fr' }}</h3>
                <span class="badge bg-white text-info fw-semibold">
                  {{ locations.length }} réservations totales
                </span>
              </div>
              <div class="bg-white bg-opacity-25 p-3 rounded-circle">
                <i class="bi bi-cash-coin fs-3"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card h-100 p-3 border-0 bg-warning text-dark shadow-sm">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <span class="text-dark-50 small text-uppercase fw-bold">Clients Enregistrés</span>
                <h3 class="fw-bold my-2">{{ clients.length }}</h3>
                <span class="badge bg-dark text-white fw-semibold">
                  {{ vipCount }} VIP & Fidèles
                </span>
              </div>
              <div class="bg-dark bg-opacity-10 p-3 rounded-circle">
                <i class="bi bi-people fs-3 text-dark"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Graphiques / Répartitions -->
      <div class="row g-4 mb-4">
        <!-- État du parc -->
        <div class="col-12 col-lg-6">
          <div class="card h-100 p-4 shadow-sm">
            <h5 class="fw-bold mb-3 d-flex align-items-center gap-2">
              <i class="bi bi-pie-chart text-primary"></i> Répartition du parc automobile
            </h5>
            <div class="progress mb-4" style="height: 28px;">
              <div class="progress-bar bg-success fw-bold" role="progressbar" 
                   [style.width.%]="(dispoCount / (vehicules.length || 1)) * 100">
                {{ dispoCount }} Dispo
              </div>
              <div class="progress-bar bg-danger fw-bold" role="progressbar" 
                   [style.width.%]="(loueCount / (vehicules.length || 1)) * 100">
                {{ loueCount }} Loués
              </div>
              <div class="progress-bar bg-warning text-dark fw-bold" role="progressbar" 
                   [style.width.%]="(maintCount / (vehicules.length || 1)) * 100">
                {{ maintCount }} Maint.
              </div>
            </div>

            <div class="row text-center mt-3">
              <div class="col-4 border-end">
                <div class="d-flex align-items-center justify-content-center gap-2 text-success fw-bold">
                  <i class="bi bi-circle-fill small"></i> Disponibles
                </div>
                <h4 class="mt-2 fw-bold">{{ dispoCount }}</h4>
              </div>
              <div class="col-4 border-end">
                <div class="d-flex align-items-center justify-content-center gap-2 text-danger fw-bold">
                  <i class="bi bi-circle-fill small"></i> En location
                </div>
                <h4 class="mt-2 fw-bold">{{ loueCount }}</h4>
              </div>
              <div class="col-4">
                <div class="d-flex align-items-center justify-content-center gap-2 text-warning fw-bold">
                  <i class="bi bi-circle-fill small"></i> Maintenance
                </div>
                <h4 class="mt-2 fw-bold">{{ maintCount }}</h4>
              </div>
            </div>
          </div>
        </div>

        <!-- Dernières locations en cours -->
        <div class="col-12 col-lg-6">
          <div class="card h-100 p-4 shadow-sm">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-bold mb-0 d-flex align-items-center gap-2">
                <i class="bi bi-clock-history text-primary"></i> Activité récente des locations
              </h5>
              <a routerLink="/locations" class="small text-decoration-none fw-semibold">Voir tout &rarr;</a>
            </div>

            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Client / Véhicule</th>
                    <th>Période</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let loc of locations.slice(0, 5)">
                    <td class="fw-bold">#{{ loc.id }}</td>
                    <td>Client #{{ loc.clientId }} &bull; Véhicule #{{ loc.vehiculeId }}</td>
                    <td class="small">{{ loc.dateDebut }} &rarr; {{ loc.dateFinPrevue }}</td>
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
                    <td colspan="4" class="text-center text-muted py-3">Aucune location enregistrée</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private vehiculeService = inject(VehiculeService);
  private locationService = inject(LocationService);
  private clientService = inject(ClientService);

  vehicules: Vehicule[] = [];
  locations: Location[] = [];
  clients: Client[] = [];
  stats?: StatistiquesResponse;

  get dispoCount(): number {
    return this.vehicules.filter(v => v.statut === 'DISPONIBLE').length;
  }
  get loueCount(): number {
    return this.vehicules.filter(v => v.statut === 'LOUE').length;
  }
  get maintCount(): number {
    return this.vehicules.filter(v => v.statut === 'MAINTENANCE').length;
  }
  get enCoursCount(): number {
    return this.locations.filter(l => l.statut === 'EN_COURS').length;
  }
  get vipCount(): number {
    return this.clients.filter(c => c.categorieClient === 'VIP' || c.categorieClient === 'FIDELE').length;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.vehiculeService.getAll().subscribe({
      next: (data) => this.vehicules = data,
      error: (e) => console.error(e)
    });
    this.locationService.getAll().subscribe({
      next: (data) => this.locations = data,
      error: (e) => console.error(e)
    });
    this.clientService.getAll().subscribe({
      next: (data) => this.clients = data,
      error: (e) => console.error(e)
    });
    this.locationService.getStatistiques().subscribe({
      next: (data) => this.stats = data,
      error: (e) => console.error(e)
    });
  }
}
