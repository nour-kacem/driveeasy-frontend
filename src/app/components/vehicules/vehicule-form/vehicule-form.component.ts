import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VehiculeService } from '../../../services/vehicule.service';
import { Vehicule } from '../../../models/vehicule.model';

@Component({
  selector: 'app-vehicule-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container" style="max-width: 800px;">
      <div class="card p-4 shadow-sm border-0 my-4">
        <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
          <h3 class="fw-bold mb-0">
            {{ isEditMode ? 'Modifier le Véhicule' : 'Ajouter un Nouveau Véhicule' }}
          </h3>
          <a routerLink="/vehicules" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-arrow-left"></i> Retour
          </a>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Immatriculation <span class="text-danger">*</span></label>
              <input type="text" class="form-control" formControlName="immatriculation" placeholder="Ex: AA-123-BB">
              <div *ngIf="form.get('immatriculation')?.invalid && form.get('immatriculation')?.touched" class="text-danger small mt-1">
                L'immatriculation est obligatoire.
              </div>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Marque <span class="text-danger">*</span></label>
              <input type="text" class="form-control" formControlName="marque" placeholder="Ex: Renault">
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Modèle <span class="text-danger">*</span></label>
              <input type="text" class="form-control" formControlName="modele" placeholder="Ex: Clio V">
            </div>

            <div class="col-md-3">
              <label class="form-label fw-semibold">Année <span class="text-danger">*</span></label>
              <input type="number" class="form-control" formControlName="annee">
            </div>

            <div class="col-md-3">
              <label class="form-label fw-semibold">Couleur</label>
              <input type="text" class="form-control" formControlName="couleur" placeholder="Ex: Noir">
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Carburant <span class="text-danger">*</span></label>
              <select class="form-select" formControlName="carburant">
                <option value="ESSENCE">Essence</option>
                <option value="DIESEL">Diesel</option>
                <option value="ELECTRIQUE">Électrique</option>
                <option value="HYBRIDE">Hybride</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Boîte de vitesse <span class="text-danger">*</span></label>
              <select class="form-select" formControlName="boite">
                <option value="MANUELLE">Manuelle</option>
                <option value="AUTOMATIQUE">Automatique</option>
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold">Nombre de places <span class="text-danger">*</span></label>
              <input type="number" class="form-control" formControlName="nbPlaces">
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold">Kilométrage (km) <span class="text-danger">*</span></label>
              <input type="number" class="form-control" formControlName="kilometrage">
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold">Prix Journalier (€) <span class="text-danger">*</span></label>
              <input type="number" step="0.5" class="form-control" formControlName="prixJournalier">
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Statut <span class="text-danger">*</span></label>
              <select class="form-select" formControlName="statut">
                <option value="DISPONIBLE">Disponible</option>
                <option value="LOUE">Loué</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">URL de l'image</label>
              <input type="url" class="form-control" formControlName="imageUrl" placeholder="https://...">
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
            <a routerLink="/vehicules" class="btn btn-outline-secondary">Annuler</a>
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid || isSubmitting">
              <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
              {{ isEditMode ? 'Enregistrer les modifications' : 'Créer le véhicule' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class VehiculeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private vehiculeService = inject(VehiculeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = false;
  vehiculeId?: number;
  isSubmitting = false;

  form: FormGroup = this.fb.group({
    immatriculation: ['', [Validators.required]],
    marque: ['', [Validators.required]],
    modele: ['', [Validators.required]],
    annee: [new Date().getFullYear(), [Validators.required, Validators.min(1990)]],
    couleur: [''],
    carburant: ['ESSENCE', [Validators.required]],
    boite: ['MANUELLE', [Validators.required]],
    nbPlaces: [5, [Validators.required, Validators.min(1)]],
    kilometrage: [0, [Validators.required, Validators.min(0)]],
    prixJournalier: [45.0, [Validators.required, Validators.min(1)]],
    statut: ['DISPONIBLE', [Validators.required]],
    imageUrl: ['']
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.vehiculeId = +id;
      this.vehiculeService.getById(this.vehiculeId).subscribe({
        next: (v) => this.form.patchValue(v),
        error: (err) => alert('Impossible de charger le véhicule: ' + err.message)
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isSubmitting = true;
    const v: Vehicule = this.form.value;

    const op = this.isEditMode && this.vehiculeId
      ? this.vehiculeService.update(this.vehiculeId, v)
      : this.vehiculeService.create(v);

    op.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/vehicules']);
      },
      error: (err) => {
        this.isSubmitting = false;
        alert('Erreur: ' + (err.error?.message || err.message));
      }
    });
  }
}
