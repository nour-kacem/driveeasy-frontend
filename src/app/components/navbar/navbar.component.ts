import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm py-3">
      <div class="container-fluid px-4">
        <a class="navbar-brand d-flex align-items-center gap-2" routerLink="/dashboard">
          <i class="bi bi-car-front-fill text-primary fs-3"></i>
          <span class="fs-4 fw-bold">Drive<span class="text-primary">Easy</span></span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navMenu">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-lg-2">
            <li class="nav-item">
              <a class="nav-link px-3" routerLink="/dashboard" routerLinkActive="active">
                <i class="bi bi-speedometer2 me-1"></i> Dashboard
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link px-3" routerLink="/vehicules" routerLinkActive="active">
                <i class="bi bi-truck-front me-1"></i> Parc Véhicules
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link px-3" routerLink="/clients" routerLinkActive="active">
                <i class="bi bi-people me-1"></i> Clients
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link px-3" routerLink="/locations" routerLinkActive="active">
                <i class="bi bi-key me-1"></i> Locations
              </a>
            </li>
          </ul>
          <div class="d-flex align-items-center gap-2">
            <a routerLink="/locations/new" class="btn btn-primary d-flex align-items-center gap-2 px-3 shadow-sm">
              <i class="bi bi-plus-circle-fill"></i>
              <span>Nouvelle Location</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .nav-link {
      font-weight: 500;
      border-radius: 8px;
      transition: all 0.2s ease;
    }
    .nav-link:hover, .nav-link.active {
      background-color: rgba(255, 255, 255, 0.1);
      color: #38bdf8 !important;
    }
  `]
})
export class NavbarComponent {}
