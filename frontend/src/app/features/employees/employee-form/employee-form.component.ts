import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmployeeFormValue } from '../../../core/models/employee.model';
import { EmployeeService } from '../../../core/services/employee.service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="content-card p-4 p-md-5">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 class="fw-bold mb-1">{{ isEditMode ? 'Update Employee' : 'Add Employee' }}</h2>
          <p class="text-secondary mb-0">
            {{ isEditMode ? 'Edit the employee record and save the changes.' : 'Fill out the form to create a new employee record.' }}
          </p>
        </div>
        <a class="btn btn-outline-secondary" routerLink="/employees">Back to list</a>
      </div>

      @if (serverError) {
        <div class="alert alert-danger">{{ serverError }}</div>
      }

      <form [formGroup]="employeeForm" (ngSubmit)="onSubmit()">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">First Name</label>
            <input class="form-control" type="text" formControlName="firstName">
            @if (submitted && employeeForm.controls.firstName.errors) {
              <small class="text-danger">First name is required.</small>
            }
          </div>

          <div class="col-md-6">
            <label class="form-label">Last Name</label>
            <input class="form-control" type="text" formControlName="lastName">
            @if (submitted && employeeForm.controls.lastName.errors) {
              <small class="text-danger">Last name is required.</small>
            }
          </div>

          <div class="col-md-6">
            <label class="form-label">Email</label>
            <input class="form-control" type="email" formControlName="email">
            @if (submitted && employeeForm.controls.email.errors) {
              <small class="text-danger">A valid email is required.</small>
            }
          </div>

          <div class="col-md-6">
            <label class="form-label">Gender</label>
            <select class="form-select" formControlName="gender">
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            @if (submitted && employeeForm.controls.gender.errors) {
              <small class="text-danger">Gender is required.</small>
            }
          </div>

          <div class="col-md-6">
            <label class="form-label">Department</label>
            <input class="form-control" type="text" formControlName="department">
            @if (submitted && employeeForm.controls.department.errors) {
              <small class="text-danger">Department is required.</small>
            }
          </div>

          <div class="col-md-6">
            <label class="form-label">Position / Designation</label>
            <input class="form-control" type="text" formControlName="position">
            @if (submitted && employeeForm.controls.position.errors) {
              <small class="text-danger">Position is required.</small>
            }
          </div>

          <div class="col-md-6">
            <label class="form-label">Salary</label>
            <input class="form-control" type="number" formControlName="salary">
            @if (submitted && employeeForm.controls.salary.errors) {
              <small class="text-danger">Salary must be at least 1000.</small>
            }
          </div>

          <div class="col-md-6">
            <label class="form-label">Hire Date</label>
            <input class="form-control" type="date" formControlName="hireDate">
            @if (submitted && employeeForm.controls.hireDate.errors) {
              <small class="text-danger">Hire date is required.</small>
            }
          </div>

          <div class="col-md-6">
            <label class="form-label">Profile Picture</label>
            <input class="form-control" type="file" accept="image/*" (change)="onFileChange($event)">
            <small class="text-secondary">The selected image is converted to a Base64 data URL and sent through GraphQL as photoUrl.</small>
          </div>

          <div class="col-12 d-flex align-items-center gap-3 mt-2">
            @if (imagePreview) {
              <img [src]="imagePreview" alt="preview" class="profile-preview">
            }
            <div>
              <div class="fw-semibold">Image preview</div>
              <div class="text-secondary small">Upload JPG, PNG, or WEBP.</div>
            </div>
          </div>
        </div>

        <div class="d-flex gap-2 justify-content-end mt-4">
          <a class="btn btn-outline-secondary" routerLink="/employees">Cancel</a>
          <button class="btn btn-primary" type="submit" [disabled]="loading">
            {{ loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Employee' : 'Add Employee') }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class EmployeeFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  submitted = false;
  loading = false;
  serverError = '';
  isEditMode = false;
  employeeId = '';
  imagePreview: string | null = null;

  readonly employeeForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    gender: ['', [Validators.required]],
    department: ['', [Validators.required]],
    position: ['', [Validators.required]],
    salary: [1000, [Validators.required, Validators.min(1000)]],
    hireDate: ['', [Validators.required]],
    profilePicture: [''],
  });

  ngOnInit(): void {
    this.employeeId = this.route.snapshot.paramMap.get('id') ?? '';
    this.isEditMode = !!this.employeeId;

    if (this.isEditMode) {
      this.employeeService.getEmployee(this.employeeId).subscribe({
        next: (employee) => {
          this.employeeForm.patchValue({
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            gender: employee.gender,
            department: employee.department,
            position: employee.position,
            salary: employee.salary,
            hireDate: employee.hireDate?.slice(0, 10),
            profilePicture: employee.profilePicture ?? '',
          });
          this.imagePreview = employee.profilePicture ?? null;
        },
        error: (error) => {
          this.serverError = error.message || 'Unable to load employee data.';
        },
      });
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      this.employeeForm.patchValue({ profilePicture: result });
      this.imagePreview = result;
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    this.submitted = true;
    this.serverError = '';

    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const payload = this.employeeForm.getRawValue() as EmployeeFormValue;

    const request$ = this.isEditMode
      ? this.employeeService.updateEmployee(this.employeeId, payload)
      : this.employeeService.createEmployee(payload);

    request$.subscribe({
      next: (employee) => {
        this.loading = false;
        void this.router.navigate(['/employees']);
      },
      error: (error) => {
        this.loading = false;
        this.serverError = error.message || 'Unable to save employee.';
      },
    });
  }
}
