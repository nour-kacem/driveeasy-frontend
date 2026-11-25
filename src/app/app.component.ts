import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="container-fluid px-4 py-4">
      <router-outlet></router-outlet>
    </main>
    <footer class="footer mt-auto py-3 bg-white border-top text-center text-muted small">
      <div class="container">
        <span>© 2026 DriveEasy - Plateforme Microservices Spring Boot & Angular 22 | Développé pour Karim Ben Romdhane</span>
      </div>
    </footer>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    main {
      flex: 1;
    }
  `]
})
export class AppComponent {}
