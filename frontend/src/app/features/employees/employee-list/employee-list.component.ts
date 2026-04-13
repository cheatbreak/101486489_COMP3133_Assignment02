import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Employee } from '../../../core/models/employee.model';
import { EmployeeService } from '../../../core/services/employee.service';
import { FullNamePipe } from '../../../shared/pipes/full-name.pipe';
import { HighlightDirective } from '../../../shared/directives/highlight.directive';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, DatePipe, CurrencyPipe, FullNamePipe, HighlightDirective],
  template: `
    <div class="content-card p-4">
      <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <h2 class="fw-bold mb-1">Employees</h2>
          <p class="text-secondary mb-0">Manage employee records with your Assignment 1 GraphQL backend.</p>
        </div>
        <a class="btn btn-primary" routerLink="/employees/add">+ Add Employee</a>
      </div>

      <form [formGroup]="searchForm" (ngSubmit)="onSearch()" class="row g-3 mb-4">
        <div class="col-md-4">
          <label class="form-label">Department</label>
          <input class="form-control" type="text" formControlName="department" placeholder="e.g. IT">
        </div>
        <div class="col-md-4">
          <label class="form-label">Position / Designation</label>
          <input class="form-control" type="text" formControlName="position" placeholder="e.g. Developer">
        </div>
        <div class="col-md-4 d-flex align-items-end gap-2">
          <button class="btn btn-primary w-100" type="submit">Search</button>
          <button class="btn btn-outline-secondary w-100" type="button" (click)="clearSearch()">Reset</button>
        </div>
      </form>

      @if (message) {
        <div class="alert alert-success">{{ message }}</div>
      }

      @if (serverError) {
        <div class="alert alert-danger">{{ serverError }}</div>
      }

      @if (loading) {
        <div class="text-center py-5">Loading employees...</div>
      } @else if (employees.length === 0) {
        <div class="text-center py-5 text-secondary">No employees found.</div>
      } @else {
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>Email</th>
                <th>Gender</th>
                <th>Department</th>
                <th>Position</th>
                <th>Salary</th>
                <th>Hire Date</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (employee of employees; track employee.id) {
                <tr [appHighlightMatch]="isSearchMatch(employee)">
                  <td>
                    <img
                      class="employee-avatar"
                      [src]="employee.profilePicture || 'https://placehold.co/96x96?text=EMP'"
                      [alt]="employee.firstName"
                    >
                  </td>
                  <td class="fw-semibold">{{ employee | fullName }}</td>
                  <td>{{ employee.email }}</td>
                  <td>{{ employee.gender }}</td>
                  <td><span class="badge-soft">{{ employee.department }}</span></td>
                  <td>{{ employee.position }}</td>
                  <td>{{ employee.salary | currency:'CAD':'symbol':'1.0-0' }}</td>
                  <td>{{ employee.hireDate | date:'mediumDate' }}</td>
                  <td>
                    <div class="d-flex justify-content-center gap-2 flex-wrap">
                      <a class="btn btn-outline-primary btn-sm" [routerLink]="['/employees', employee.id]">View</a>
                      <a class="btn btn-outline-secondary btn-sm" [routerLink]="['/employees', employee.id, 'edit']">Update</a>
                      <button class="btn btn-outline-danger btn-sm" (click)="deleteEmployee(employee.id)">Delete</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class EmployeeListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly cdr = inject(ChangeDetectorRef);

  employees: Employee[] = [];
  loading = false;
  message = '';
  serverError = '';

  readonly searchForm = this.fb.nonNullable.group({
    department: '',
    position: '',
  });

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.serverError = '';
    this.message = '';
    this.cdr.detectChanges();

    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.loading = false;
        this.employees = employees;
        this.serverError = '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        this.employees = [];
        this.serverError = error.message || 'Unable to load employees.';
        this.cdr.detectChanges();
      },
    });
  }

  onSearch(): void {
    this.loading = true;
    this.message = '';
    this.serverError = '';
    this.cdr.detectChanges();

    this.employeeService.searchEmployees(this.searchForm.getRawValue()).subscribe({
      next: (employees) => {
        this.loading = false;
        this.employees = employees;
        this.serverError = '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        this.employees = [];
        this.serverError = error.message || 'Unable to search employees.';
        this.cdr.detectChanges();
      },
    });
  }

  clearSearch(): void {
    this.searchForm.reset({ department: '', position: '' });
    this.loadEmployees();
  }

  deleteEmployee(id: string): void {
    const confirmed = window.confirm('Are you sure you want to delete this employee?');
    if (!confirmed) return;

    this.employeeService.deleteEmployee(id).subscribe({
      next: () => {
        this.message = 'Employee deleted successfully.';
        this.loadEmployees();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.message = '';
        this.serverError = error.message || 'Unable to delete employee.';
        this.cdr.detectChanges();
      },
    });
  }

  isSearchMatch(employee: Employee): boolean {
    const filters = this.searchForm.getRawValue();
    const departmentMatch = filters.department
      ? employee.department.toLowerCase().includes(filters.department.toLowerCase())
      : false;
    const positionMatch = filters.position
      ? employee.position.toLowerCase().includes(filters.position.toLowerCase())
      : false;

    return departmentMatch || positionMatch;
  }
}