import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

function passwordsMatchValidator(control: AbstractControl) {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="row justify-content-center align-items-center">
      <div class="col-lg-6 col-md-8">
        <div class="auth-card p-4 p-md-5">
          <div class="text-center mb-4">
            <h2 class="fw-bold mb-2">Create your account</h2>
            <p class="text-secondary mb-0">Use GraphQL signup to access the employee dashboard.</p>
          </div>

          @if (serverError) {
            <div class="alert alert-danger">{{ serverError }}</div>
          }

          <form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">Username</label>
                <input type="text" class="form-control" formControlName="username" placeholder="Enter username">
                @if (submitted && signupForm.controls.username.errors) {
                  <small class="text-danger">Username is required.</small>
                }
              </div>

              <div class="col-12">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" formControlName="email" placeholder="Enter email">
                @if (submitted && signupForm.controls.email.errors) {
                  <small class="text-danger">A valid email is required.</small>
                }
              </div>

              <div class="col-md-6">
                <label class="form-label">Password</label>
                <input type="password" class="form-control" formControlName="password" placeholder="At least 6 characters">
                @if (submitted && signupForm.controls.password.errors) {
                  <small class="text-danger">Password must be at least 6 characters.</small>
                }
              </div>

              <div class="col-md-6">
                <label class="form-label">Confirm Password</label>
                <input type="password" class="form-control" formControlName="confirmPassword" placeholder="Confirm password">
                @if (submitted && (signupForm.controls.confirmPassword.errors || signupForm.errors?.['passwordMismatch'])) {
                  <small class="text-danger">Passwords must match.</small>
                }
              </div>
            </div>

            <button class="btn btn-primary w-100 mt-4" type="submit" [disabled]="loading">
              {{ loading ? 'Creating account...' : 'Signup' }}
            </button>
          </form>

          <p class="text-center mt-4 mb-0">
            Already registered?
            <a routerLink="/login" class="fw-semibold text-decoration-none">Go to login</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class SignupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  submitted = false;
  loading = false;
  serverError = '';

  readonly signupForm = this.fb.group(
    {
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatchValidator },
  );

  onSubmit(): void {
    this.submitted = true;
    this.serverError = '';

    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formValue = this.signupForm.getRawValue();

    this.authService.signup(
      formValue.username ?? '',
      formValue.email ?? '',
      formValue.password ?? '',
    ).subscribe({
      next: () => {
        this.loading = false;
        window.location.href = '/employees';
      },
      error: (error) => {
        this.loading = false;
        this.serverError = error.message || 'Unable to create account.';
      },
    });
  }
}
