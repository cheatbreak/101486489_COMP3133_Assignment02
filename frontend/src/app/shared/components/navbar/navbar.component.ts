import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg bg-white border-bottom sticky-top">
      <div class="container">
        <a class="navbar-brand fw-bold text-primary" routerLink="/employees">
          EmployeeMS GraphQL
        </a>

        <div class="d-flex align-items-center gap-2 ms-auto">
          @if (isLoggedIn()) {
            <span class="text-secondary small d-none d-md-inline">Hi, {{ currentUsername() }}</span>
            <a class="btn btn-outline-primary btn-sm" routerLink="/employees" routerLinkActive="active">Employees</a>
            <a class="btn btn-primary btn-sm" routerLink="/employees/add">Add Employee</a>
            <button class="btn btn-outline-danger btn-sm" (click)="logout()">Logout</button>
          } @else {
            <a class="btn btn-outline-primary btn-sm" routerLink="/login">Login</a>
            <a class="btn btn-primary btn-sm" routerLink="/signup">Signup</a>
          }
        </div>
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);

  readonly isLoggedIn = computed(() => this.authService.isLoggedIn());
  readonly currentUsername = computed(() => this.authService.currentUser()?.username ?? 'User');

  logout(): void {
    this.authService.logout();
  }
}
