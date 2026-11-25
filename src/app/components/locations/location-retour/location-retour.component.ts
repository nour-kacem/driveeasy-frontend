import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LocationService } from '../../../services/location.service';
import { Location, LocationDetailResponse } from '../../../models/location.model';

@Component({
  selector: 'app-location-retour',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container" style="max-width: 800px;">
      <div class="card p-4 shadow-sm border-0 my-4" *ngIf="detail">
        <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
          <div>
            <h3 class="fw-bold mb-1">Clôture et Retour de Véhicule</h3>
            <p class="text-muted mb-0">Location #{{ detail.location.id }}</p>
          </div>
          <a routerLink="/locations" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-arrow-left"></i> Retour à la liste
          </a>
        </div>

        <!-- Récapitulatif location -->
        <div class="card bg-light border-0 p-3 mb-4">
          <div class="row g-2">
            <div class="col-md-6">
              <span class="small text-muted">Client :</span>
              <div class="fw-bold">{{ detail.client?.nom }} {{ detail.client?.prenom }}</div>
              <div class="small text-muted">Permis: {{ detail.client?.numeroPermis }}</div>
            </div>
            <div class="col-md-6">
              <span class="small text-muted">Véhicule :</span>
              <div class="fw-bold">{{ detail.vehicule?.marque }} {{ detail.vehicule?.modele }}</div>
              <div class="small text-muted">Immat: {{ detail.vehicule?.immatriculation }}</div>
            </div>
            <div class="col-md-6 mt-2">
              <span class="small text-muted">Dates :</span>
              <div>{{ detail.location.dateDebut }} &rarr; {{ detail.location.dateFinPrevue }}</div>
            </div>
            <div class="col-md-6 mt-2">
              <span class="small text-muted">Km de départ :</span>
              <div class="fw-bold">{{ detail.location.kmDepart || 0 }} km</div>
            </div>
          </div>
        </div>

        <!-- Formulaire de retour si EN_COURS -->
        <div *ngIf="!retourTermine">
          <div class="mb-4">
            <label class="form-label fw-semibold fs-5">Kilométrage au retour (km) <span class="text-danger">*</span></label>
            <input type="number" class="form-control form-control-lg" [(ngModel)]="kmRetour" 
                   [min]="detail.location.kmDepart || 0" placeholder="Ex: 15400">
            <div class="form-text">Le kilométrage doit être supérieur ou égal au départ ({{ detail.location.kmDepart || 0 }} km).</div>
          </div>

          <div class="d-flex justify-content-end gap-2">
            <a routerLink="/locations" class="btn btn-outline-secondary">Annuler</a>
            <button (click)="validerRetour()" class="btn btn-success btn-lg px-4" 
                    [disabled]="!kmRetour || kmRetour < (detail.location.kmDepart || 0) || isSubmitting">
              <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
              <i class="bi bi-check-circle me-1"></i> Clôturer et Calculer la Facture
            </button>
          </div>
        </div>

        <!-- Fiche de restitution imprimable après clôture -->
        <div *ngIf="retourTermine" class="printable-invoice mt-4 p-4 border rounded bg-white">
          <div class="text-center mb-4">
            <h4 class="fw-bold text-primary">DriveEasy - Fiche de Restitution & Facture Finale</h4>
            <p class="text-muted small">Location #{{ locationCloturee?.id }} &bull; Clôturée le {{ locationCloturee?.dateRetourEffectif }}</p>
          </div>

          <div class="table-responsive">
            <table class="table table-bordered">
              <tbody>
                <tr>
                  <th class="w-50">Client</th>
                  <td>{{ detail.client?.nom }} {{ detail.client?.prenom }} ({{ detail.client?.categorieClient }})</td>
                </tr>
                <tr>
                  <th>Véhicule</th>
                  <td>{{ detail.vehicule?.marque }} {{ detail.vehicule?.modele }} ({{ detail.vehicule?.immatriculation }})</td>
                </tr>
                <tr>
                  <th>Période prévue</th>
                  <td>{{ detail.location.dateDebut }} au {{ detail.location.dateFinPrevue }}</td>
                </tr>
                <tr>
                  <th>Date de retour effectif</th>
                  <td>{{ locationCloturee?.dateRetourEffectif }}</td>
                </tr>
                <tr>
                  <th>Kilomètres parcourus</th>
                  <td>{{ (locationCloturee?.kmRetour || 0) - (locationCloturee?.kmDepart || 0) }} km (Départ: {{ locationCloturee?.kmDepart }} / Retour: {{ locationCloturee?.kmRetour }})</td>
                </tr>
                <tr *ngIf="locationCloturee?.penalite && locationCloturee?.penalite! > 0" class="table-danger">
                  <th>Pénalités de retard</th>
                  <td class="text-danger fw-bold">+{{ locationCloturee?.penalite }}€</td>
                </tr>
                <tr class="table-primary fs-5">
                  <th>Montant Total Payé</th>
                  <td class="fw-bold text-primary">{{ locationCloturee?.montantTotal }}€</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="d-flex justify-content-between mt-4">
            <a routerLink="/locations" class="btn btn-outline-secondary">
              <i class="bi bi-list"></i> Liste des locations
            </a>
            <button (click)="imprimer()" class="btn btn-primary d-flex align-items-center gap-2">
              <i class="bi bi-printer"></i> Imprimer la Facture
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LocationRetourComponent implements OnInit {
  private locationService = inject(LocationService);
  private route = inject(ActivatedRoute);

  detail?: LocationDetailResponse;
  kmRetour?: number;
  isSubmitting = false;
  retourTermine = false;
  locationCloturee?: Location;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.locationService.getById(+id).subscribe({
        next: (d) => {
          this.detail = d;
          if (d.location.statut === 'TERMINEE') {
            this.retourTermine = true;
            this.locationCloturee = d.location;
          }
        },
        error: (e) => alert('Erreur: ' + e.message)
      });
    }
  }

  validerRetour(): void {
    if (!this.detail || !this.detail.location.id || !this.kmRetour) return;
    this.isSubmitting = true;

    this.locationService.retourner(this.detail.location.id, { kmRetour: this.kmRetour }).subscribe({
      next: (loc) => {
        this.isSubmitting = false;
        this.retourTermine = true;
        this.locationCloturee = loc;
      },
      error: (err) => {
        this.isSubmitting = false;
        alert('Erreur: ' + (err.error?.message || err.message));
      }
    });
  }

  imprimer(): void {
    window.print();
  }
}
