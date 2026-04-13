import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="row justify-content-center align-items-center min-vh-75">
      <div class="col-lg-5 col-md-7">
        <div class="auth-card p-4 p-md-5">
          <div class="text-center mb-4">
            <h2 class="fw-bold mb-2">Welcome back</h2>
            <p class="text-secondary mb-0">Log in with your username or email to manage employee records.</p>
          </div>

          @if (serverError) {
            <div class="alert alert-danger">{{ serverError }}</div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="mb-3">
              <label class="form-label">Username or Email</label>
              <input type="text" class="form-control" formControlName="usernameOrEmail" placeholder="Enter your username or email">
              @if (submitted && loginForm.controls.usernameOrEmail.errors) {
                <small class="text-danger">Username or email is required.</small>
              }
            </div>

            <div class="mb-3">
              <label class="form-label">Password</label>
              <input type="password" class="form-control" formControlName="password" placeholder="Enter your password">
              @if (submitted && loginForm.controls.password.errors) {
                <small class="text-danger">Password must be at least 6 characters.</small>
              }
            </div>

            <button class="btn btn-primary w-100" type="submit" [disabled]="loading">
              {{ loading ? 'Logging in...' : 'Login' }}
            </button>
          </form>

          <p class="text-center mt-4 mb-0">
            Don’t have an account?
            <a routerLink="/signup" class="fw-semibold text-decoration-none">Create one</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  submitted = false;
  loading = false;
  serverError = '';

  readonly loginForm = this.fb.nonNullable.group({
    usernameOrEmail: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    this.submitted = true;
    this.serverError = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { usernameOrEmail, password } = this.loginForm.getRawValue();

    this.authService.login(usernameOrEmail, password).subscribe({
      next: () => {
        this.loading = false;
        window.location.href = '/employees';
      },
      error: (error) => {
        this.loading = false;
        this.serverError = error.message || 'Invalid username/email or password.';
      },
    });
  }
}
