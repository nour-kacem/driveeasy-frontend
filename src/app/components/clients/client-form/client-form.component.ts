import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientService } from '../../../services/client.service';
import { Client } from '../../../models/client.model';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container" style="max-width: 800px;">
      <div class="card p-4 shadow-sm border-0 my-4">
        <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
          <h3 class="fw-bold mb-0">
            {{ isEditMode ? 'Modifier la Fiche Client' : 'Enregistrer un Nouveau Client' }}
          </h3>
          <a routerLink="/clients" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-arrow-left"></i> Retour
          </a>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Numéro CIN <span class="text-danger">*</span></label>
              <input type="text" class="form-control" formControlName="cin" placeholder="Ex: CIN-1234">
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Catégorie Fidélité</label>
              <select class="form-select" formControlName="categorieClient">
                <option value="STANDARD">Standard</option>
                <option value="FIDELE">Fidèle (-5%)</option>
                <option value="VIP">VIP (-10%)</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Nom <span class="text-danger">*</span></label>
              <input type="text" class="form-control" formControlName="nom">
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Prénom <span class="text-danger">*</span></label>
              <input type="text" class="form-control" formControlName="prenom">
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Date de Naissance <span class="text-danger">*</span></label>
              <input type="date" class="form-control" formControlName="dateNaissance">
              <div class="form-text small">Âge minimum de 21 ans pour louer un véhicule.</div>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Email <span class="text-danger">*</span></label>
              <input type="email" class="form-control" formControlName="email">
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Téléphone <span class="text-danger">*</span></label>
              <input type="tel" class="form-control" formControlName="telephone">
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Adresse Complète <span class="text-danger">*</span></label>
              <input type="text" class="form-control" formControlName="adresse">
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Numéro de Permis <span class="text-danger">*</span></label>
              <input type="text" class="form-control" formControlName="numeroPermis" placeholder="Ex: PERMIS-FR-1234">
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Date d'Expiration du Permis <span class="text-danger">*</span></label>
              <input type="date" class="form-control" formControlName="dateExpirationPermis">
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
            <a routerLink="/clients" class="btn btn-outline-secondary">Annuler</a>
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid || isSubmitting">
              <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
              {{ isEditMode ? 'Mettre à jour' : 'Enregistrer le client' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ClientFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = false;
  clientId?: number;
  isSubmitting = false;

  form: FormGroup = this.fb.group({
    cin: ['', [Validators.required]],
    nom: ['', [Validators.required]],
    prenom: ['', [Validators.required]],
    dateNaissance: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', [Validators.required]],
    adresse: ['', [Validators.required]],
    numeroPermis: ['', [Validators.required]],
    dateExpirationPermis: ['', [Validators.required]],
    categorieClient: ['STANDARD', [Validators.required]]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.clientId = +id;
      this.clientService.getById(this.clientId).subscribe({
        next: (c) => this.form.patchValue(c),
        error: (e) => alert('Erreur: ' + e.message)
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isSubmitting = true;
    const client: Client = this.form.value;

    const op = this.isEditMode && this.clientId
      ? this.clientService.update(this.clientId, client)
      : this.clientService.create(client);

    op.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/clients']);
      },
      error: (err) => {
        this.isSubmitting = false;
        alert('Erreur: ' + (err.error?.message || err.message));
      }
    });
  }
}
