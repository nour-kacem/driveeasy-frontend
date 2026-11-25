import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientService } from '../../../services/client.service';
import { VehiculeService } from '../../../services/vehicule.service';
import { LocationService } from '../../../services/location.service';
import { Client, EligibiliteResponse } from '../../../models/client.model';
import { Vehicule } from '../../../models/vehicule.model';
import { SimulationResponse } from '../../../models/location.model';

@Component({
  selector: 'app-location-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container" style="max-width: 900px;">
      <div class="card p-4 shadow-sm border-0 my-4">
        <!-- Titre & Stepper -->
        <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
          <div>
            <h3 class="fw-bold mb-1">Nouvelle Location</h3>
            <p class="text-muted mb-0">Assistant de création de réservation pas-à-pas</p>
          </div>
          <span class="badge bg-primary fs-6 px-3 py-2">Étape {{ currentStep }} / 4</span>
        </div>

        <!-- Indicateur d'étapes -->
        <div class="d-flex justify-content-between position-relative mb-5 px-3">
          <div class="text-center position-relative z-1">
            <div class="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-1 fw-bold"
                 [ngClass]="currentStep >= 1 ? 'bg-primary text-white' : 'bg-light text-muted border'"
                 style="width: 36px; height: 36px;">1</div>
            <span class="small fw-semibold">Client</span>
          </div>
          <div class="text-center position-relative z-1">
            <div class="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-1 fw-bold"
                 [ngClass]="currentStep >= 2 ? 'bg-primary text-white' : 'bg-light text-muted border'"
                 style="width: 36px; height: 36px;">2</div>
            <span class="small fw-semibold">Période</span>
          </div>
          <div class="text-center position-relative z-1">
            <div class="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-1 fw-bold"
                 [ngClass]="currentStep >= 3 ? 'bg-primary text-white' : 'bg-light text-muted border'"
                 style="width: 36px; height: 36px;">3</div>
            <span class="small fw-semibold">Véhicule</span>
          </div>
          <div class="text-center position-relative z-1">
            <div class="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-1 fw-bold"
                 [ngClass]="currentStep >= 4 ? 'bg-primary text-white' : 'bg-light text-muted border'"
                 style="width: 36px; height: 36px;">4</div>
            <span class="small fw-semibold">Devis & Validation</span>
          </div>
        </div>

        <!-- ÉTAPE 1 : Sélection Client -->
        <div *ngIf="currentStep === 1">
          <h5 class="fw-bold mb-3"><i class="bi bi-person-check me-2 text-primary"></i>Étape 1 : Sélectionner le client</h5>
          
          <div class="mb-3">
            <label class="form-label fw-semibold">Choisir un client :</label>
            <select class="form-select form-select-lg" [(ngModel)]="selectedClientId" (change)="onClientChange()">
              <option [ngValue]="null">-- Sélectionner un client --</option>
              <option *ngFor="let c of clients" [ngValue]="c.id">
                {{ c.nom }} {{ c.prenom }} (CIN: {{ c.cin }} - {{ c.categorieClient }})
              </option>
            </select>
          </div>

          <!-- Éligibilité Box -->
          <div *ngIf="selectedClient" class="card p-3 my-3 border" [ngClass]="eligibilite?.eligible ? 'bg-success-subtle text-success-emphasis border-success' : 'bg-danger-subtle text-danger-emphasis border-danger'">
            <div class="d-flex align-items-center gap-3">
              <i class="bi fs-2" [ngClass]="eligibilite?.eligible ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'"></i>
              <div>
                <h6 class="fw-bold mb-1">{{ eligibilite?.eligible ? 'Client Éligible' : 'Client NON Éligible' }}</h6>
                <div class="small">{{ eligibilite?.raison }}</div>
                <div class="small mt-1"><strong>Permis :</strong> {{ selectedClient.numeroPermis }} (expire: {{ selectedClient.dateExpirationPermis }})</div>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-end mt-4">
            <button (click)="goToStep(2)" class="btn btn-primary px-4" [disabled]="!selectedClient || !eligibilite?.eligible">
              Suivant : Période &rarr;
            </button>
          </div>
        </div>

        <!-- ÉTAPE 2 : Période -->
        <div *ngIf="currentStep === 2">
          <h5 class="fw-bold mb-3"><i class="bi bi-calendar-range me-2 text-primary"></i>Étape 2 : Définir la période de location</h5>
          
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Date de début <span class="text-danger">*</span></label>
              <input type="date" class="form-control form-control-lg" [(ngModel)]="dateDebut" [min]="today">
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Date de fin prévue <span class="text-danger">*</span></label>
              <input type="date" class="form-control form-control-lg" [(ngModel)]="dateFinPrevue" [min]="dateDebut || today">
            </div>
          </div>

          <div class="d-flex justify-content-between mt-4">
            <button (click)="goToStep(1)" class="btn btn-outline-secondary px-4">&larr; Retour</button>
            <button (click)="goToStep(3)" class="btn btn-primary px-4" [disabled]="!dateDebut || !dateFinPrevue || dateFinPrevue < dateDebut">
              Suivant : Choisir le véhicule &rarr;
            </button>
          </div>
        </div>

        <!-- ÉTAPE 3 : Choix du Véhicule Disponible -->
        <div *ngIf="currentStep === 3">
          <h5 class="fw-bold mb-3"><i class="bi bi-car-front me-2 text-primary"></i>Étape 3 : Sélectionner un véhicule disponible</h5>
          
          <div class="row g-3" *ngIf="disponibles.length > 0">
            <div class="col-md-6" *ngFor="let v of disponibles">
              <div class="card p-3 h-100 border cursor-pointer" 
                   [ngClass]="{ 'border-primary bg-primary-subtle shadow-sm': selectedVehiculeId === v.id }"
                   (click)="selectedVehiculeId = v.id ?? null" style="cursor: pointer;">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 class="fw-bold mb-1">{{ v.marque }} {{ v.modele }}</h6>
                    <span class="badge bg-light text-dark border">{{ v.immatriculation }}</span>
                  </div>
                  <span class="fs-5 fw-bold text-primary">{{ v.prixJournalier }}€<small class="text-muted fs-6">/j</small></span>
                </div>
                <div class="small text-muted mt-2">
                  <span>{{ v.carburant }}</span> &bull; <span>{{ v.boite }}</span> &bull; <span>{{ v.nbPlaces }} places</span>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="disponibles.length === 0" class="alert alert-warning my-3">
            Aucun véhicule disponible pour cette période.
          </div>

          <div class="d-flex justify-content-between mt-4">
            <button (click)="goToStep(2)" class="btn btn-outline-secondary px-4">&larr; Retour</button>
            <button (click)="calculerSimulation()" class="btn btn-primary px-4" [disabled]="!selectedVehiculeId">
              Suivant : Devis & Simulation &rarr;
            </button>
          </div>
        </div>

        <!-- ÉTAPE 4 : Simulation du Tarif & Confirmation -->
        <div *ngIf="currentStep === 4">
          <h5 class="fw-bold mb-3"><i class="bi bi-receipt me-2 text-primary"></i>Étape 4 : Devis calculé et confirmation</h5>
          
          <div *ngIf="simulation" class="card bg-light border-0 p-4 mb-4">
            <div class="row g-3">
              <div class="col-md-6">
                <p class="mb-2"><strong>Client :</strong> {{ selectedClient?.nom }} {{ selectedClient?.prenom }} ({{ selectedClient?.categorieClient }})</p>
                <p class="mb-2"><strong>Période :</strong> {{ dateDebut }} au {{ dateFinPrevue }}</p>
                <p class="mb-0"><strong>Durée :</strong> {{ simulation.nbJours }} jour(s)</p>
              </div>
              <div class="col-md-6 border-start ps-md-4">
                <div class="d-flex justify-content-between mb-2">
                  <span>Tarif journalier :</span>
                  <span class="fw-semibold">{{ simulation.prixJournalier }}€</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span>Montant brut :</span>
                  <span>{{ simulation.montantBrut }}€</span>
                </div>
                <div class="d-flex justify-content-between mb-2 text-success" *ngIf="simulation.pourcentageRemise > 0">
                  <span>Remise fidélité ({{ simulation.pourcentageRemise * 100 }}%) :</span>
                  <span>-{{ simulation.montantRemise }}€</span>
                </div>
                <div class="d-flex justify-content-between pt-2 border-top fs-5 fw-bold text-primary">
                  <span>Total Net :</span>
                  <span>{{ simulation.montantNet }}€</span>
                </div>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-between mt-4">
            <button (click)="goToStep(3)" class="btn btn-outline-secondary px-4">&larr; Retour</button>
            <button (click)="confirmerReservation()" class="btn btn-success btn-lg px-4" [disabled]="isSubmitting">
              <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
              <i class="bi bi-check-lg me-1"></i> Confirmer la Réservation
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LocationWizardComponent implements OnInit {
  private clientService = inject(ClientService);
  private vehiculeService = inject(VehiculeService);
  private locationService = inject(LocationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  currentStep = 1;
  today = new Date().toISOString().split('T')[0];

  clients: Client[] = [];
  selectedClientId: number | null = null;
  selectedClient?: Client;
  eligibilite?: EligibiliteResponse;

  dateDebut = '';
  dateFinPrevue = '';

  disponibles: Vehicule[] = [];
  selectedVehiculeId: number | null = null;

  simulation?: SimulationResponse;
  isSubmitting = false;

  ngOnInit(): void {
    this.clientService.getAll().subscribe({
      next: (data) => {
        this.clients = data;
        const paramClientId = this.route.snapshot.queryParamMap.get('clientId');
        if (paramClientId) {
          this.selectedClientId = +paramClientId;
          this.onClientChange();
        }
      }
    });

    const paramVehiculeId = this.route.snapshot.queryParamMap.get('vehiculeId');
    if (paramVehiculeId) {
      this.selectedVehiculeId = +paramVehiculeId;
    }
  }

  onClientChange(): void {
    if (!this.selectedClientId) {
      this.selectedClient = undefined;
      this.eligibilite = undefined;
      return;
    }
    this.selectedClient = this.clients.find(c => c.id === this.selectedClientId);
    this.clientService.checkEligibilite(this.selectedClientId).subscribe({
      next: (res) => this.eligibilite = res
    });
  }

  goToStep(step: number): void {
    if (step === 3) {
      this.vehiculeService.getDisponibles(this.dateDebut, this.dateFinPrevue).subscribe({
        next: (data) => {
          this.disponibles = data;
          this.currentStep = step;
        }
      });
      return;
    }
    this.currentStep = step;
  }

  calculerSimulation(): void {
    if (!this.selectedClientId || !this.selectedVehiculeId) return;
    this.locationService.simuler({
      clientId: this.selectedClientId,
      vehiculeId: this.selectedVehiculeId,
      dateDebut: this.dateDebut,
      dateFinPrevue: this.dateFinPrevue
    }).subscribe({
      next: (res) => {
        this.simulation = res;
        this.currentStep = 4;
      },
      error: (e) => alert('Erreur calcul devis: ' + e.message)
    });
  }

  confirmerReservation(): void {
    if (!this.selectedClientId || !this.selectedVehiculeId) return;
    this.isSubmitting = true;
    this.locationService.creer({
      clientId: this.selectedClientId,
      vehiculeId: this.selectedVehiculeId,
      dateDebut: this.dateDebut,
      dateFinPrevue: this.dateFinPrevue
    }).subscribe({
      next: (loc) => {
        this.isSubmitting = false;
        alert(` Réservation #${loc.id} créée avec succès !`);
        this.router.navigate(['/locations']);
      },
      error: (err) => {
        this.isSubmitting = false;
        alert('Erreur: ' + (err.error?.message || err.message));
      }
    });
  }
}
