import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Employee } from '../../../core/models/employee.model';
import { EmployeeService } from '../../../core/services/employee.service';
import { FullNamePipe } from '../../../shared/pipes/full-name.pipe';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, CurrencyPipe, FullNamePipe],
  template: `
    <div class="content-card p-4 p-md-5">
      @if (loading) {
        <div class="text-center py-5">Loading employee details...</div>
      } @else if (serverError) {
        <div class="alert alert-danger">{{ serverError }}</div>
      } @else if (employee) {
        <div class="row g-4 align-items-start">
          <div class="col-lg-4 text-center">
            <img
              class="img-fluid rounded-4 border detail-photo"
              [src]="employee.profilePicture || 'https://placehold.co/400x400?text=Employee'"
              [alt]="employee.firstName"
            >
          </div>

          <div class="col-lg-8">
            <div class="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
              <div>
                <h2 class="fw-bold mb-1">{{ employee | fullName }}</h2>
                <div class="badge-soft d-inline-block me-2">{{ employee.department }}</div>
                <div class="badge bg-light text-dark d-inline-block">{{ employee.position }}</div>
              </div>
              <div class="d-flex gap-2 flex-wrap">
                <a class="btn btn-outline-secondary" routerLink="/employees">Back</a>
                <a class="btn btn-primary" [routerLink]="['/employees', employee.id, 'edit']">Update</a>
              </div>
            </div>

            <div class="row g-3">
              <div class="col-md-6">
                <div class="text-secondary small">Email</div>
                <div class="fw-semibold">{{ employee.email }}</div>
              </div>
              <div class="col-md-6">
                <div class="text-secondary small">Gender</div>
                <div class="fw-semibold">{{ employee.gender }}</div>
              </div>
              <div class="col-md-6">
                <div class="text-secondary small">Department</div>
                <div class="fw-semibold">{{ employee.department }}</div>
              </div>
              <div class="col-md-6">
                <div class="text-secondary small">Position</div>
                <div class="fw-semibold">{{ employee.position }}</div>
              </div>
              <div class="col-md-6">
                <div class="text-secondary small">Salary</div>
                <div class="fw-semibold">{{ employee.salary | currency:'CAD':'symbol':'1.0-0' }}</div>
              </div>
              <div class="col-md-6">
                <div class="text-secondary small">Hire Date</div>
                <div class="fw-semibold">{{ employee.hireDate | date:'fullDate' }}</div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class EmployeeDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly employeeService = inject(EmployeeService);
  private readonly cdr = inject(ChangeDetectorRef);

  employee: Employee | null = null;
  loading = false;
  serverError = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.serverError = 'Employee id is missing.';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.serverError = '';
    this.cdr.detectChanges();

    this.employeeService.getEmployee(id).subscribe({
      next: (employee) => {
        this.loading = false;
        this.employee = employee;
        this.serverError = '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        this.serverError = error.message || 'Unable to load employee.';
        this.cdr.detectChanges();
      },
    });
  }
}