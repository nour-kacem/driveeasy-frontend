import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../../services/client.service';
import { Client, EligibiliteResponse } from '../../../models/client.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 class="fw-bold mb-1">Gestion des Clients</h2>
          <p class="text-muted mb-0">Registre des clients, pièces d'identité et éligibilité</p>
        </div>
        <a routerLink="/clients/new" class="btn btn-primary d-flex align-items-center gap-2">
          <i class="bi bi-person-plus"></i> Nouveau Client
        </a>
      </div>

      <!-- Barre de recherche -->
      <div class="card p-3 mb-4 shadow-sm border-0">
        <div class="row g-3">
          <div class="col-12 col-md-4">
            <label class="form-label small fw-semibold">Rechercher par nom / prénom</label>
            <div class="input-group">
              <span class="input-group-text bg-white"><i class="bi bi-search text-muted"></i></span>
              <input type="text" class="form-control" placeholder="Nom..." [(ngModel)]="searchNom" (input)="search()">
            </div>
          </div>
          <div class="col-12 col-md-4">
            <label class="form-label small fw-semibold">Numéro CIN</label>
            <input type="text" class="form-control" placeholder="Ex: CIN-1001" [(ngModel)]="searchCin" (input)="search()">
          </div>
          <div class="col-12 col-md-4">
            <label class="form-label small fw-semibold">Email</label>
            <input type="email" class="form-control" placeholder="Ex: email@..." [(ngModel)]="searchEmail" (input)="search()">
          </div>
        </div>
      </div>

      <!-- Tableau des clients -->
      <div class="card shadow-sm border-0 overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Client</th>
                <th>Contact</th>
                <th>Permis de conduire</th>
                <th>Catégorie</th>
                <th>Éligibilité</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of clients">
                <td class="fw-bold">#{{ c.id }}</td>
                <td>
                  <div class="fw-bold text-dark">{{ c.nom }} {{ c.prenom }}</div>
                  <div class="small text-muted"><i class="bi bi-person-vcard me-1"></i>{{ c.cin }}</div>
                </td>
                <td>
                  <div><i class="bi bi-envelope me-1 text-muted"></i>{{ c.email }}</div>
                  <div class="small text-muted"><i class="bi bi-telephone me-1"></i>{{ c.telephone }}</div>
                </td>
                <td>
                  <div class="fw-semibold">{{ c.numeroPermis }}</div>
                  <div class="small" [ngClass]="isPermisExpired(c.dateExpirationPermis) ? 'text-danger fw-bold' : 'text-muted'">
                    <i class="bi" [ngClass]="isPermisExpired(c.dateExpirationPermis) ? 'bi-exclamation-triangle-fill' : 'bi-calendar-check'"></i>
                    Exp: {{ c.dateExpirationPermis }}
                    <span *ngIf="isPermisExpired(c.dateExpirationPermis)" class="badge bg-danger ms-1">EXPIRÉ</span>
                  </div>
                </td>
                <td>
                  <span class="badge" [ngClass]="{
                    'badge-vip': c.categorieClient === 'VIP',
                    'badge-fidele': c.categorieClient === 'FIDELE',
                    'badge-standard': c.categorieClient === 'STANDARD'
                  }">{{ c.categorieClient }}</span>
                </td>
                <td>
                  <button (click)="testerEligibilite(c)" class="btn btn-sm btn-outline-info d-flex align-items-center gap-1">
                    <i class="bi bi-shield-check"></i> Tester
                  </button>
                </td>
                <td class="text-end">
                  <div class="btn-group">
                    <a [routerLink]="['/clients', c.id]" class="btn btn-sm btn-outline-primary" title="Fiche client">
                      <i class="bi bi-eye"></i>
                    </a>
                    <a [routerLink]="['/clients', c.id, 'edit']" class="btn btn-sm btn-outline-secondary" title="Modifier">
                      <i class="bi bi-pencil"></i>
                    </a>
                    <button (click)="deleteClient(c)" class="btn btn-sm btn-outline-danger" [disabled]="c.activeRental" title="Supprimer">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="clients.length === 0">
                <td colspan="7" class="text-center py-4 text-muted">Aucun client trouvé.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ClientListComponent implements OnInit {
  private clientService = inject(ClientService);

  clients: Client[] = [];
  searchNom = '';
  searchCin = '';
  searchEmail = '';

  ngOnInit(): void {
    this.search();
  }

  search(): void {
    this.clientService.getAll(
      this.searchNom.trim() || undefined,
      this.searchCin.trim() || undefined,
      this.searchEmail.trim() || undefined
    ).subscribe({
      next: (data) => this.clients = data,
      error: (e) => console.error(e)
    });
  }

  isPermisExpired(dateStr: string): boolean {
    if (!dateStr) return true;
    return new Date(dateStr) < new Date();
  }

  testerEligibilite(c: Client): void {
    if (!c.id) return;
    this.clientService.checkEligibilite(c.id).subscribe({
      next: (res: EligibiliteResponse) => {
        if (res.eligible) {
          alert(` Client éligible : ${c.nom} ${c.prenom} peut louer un véhicule.`);
        } else {
          alert(` Client NON éligible : ${res.raison}`);
        }
      },
      error: (e) => alert('Erreur: ' + e.message)
    });
  }

  deleteClient(c: Client): void {
    if (!c.id) return;
    if (confirm(`Supprimer le client ${c.nom} ${c.prenom} ?`)) {
      this.clientService.delete(c.id).subscribe({
        next: () => this.search(),
        error: (err) => alert('Erreur: ' + (err.error?.message || err.message))
      });
    }
  }
}
