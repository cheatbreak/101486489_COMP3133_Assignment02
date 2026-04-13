import { Pipe, PipeTransform } from '@angular/core';
import { Employee } from '../../core/models/employee.model';

@Pipe({
  name: 'fullName',
  standalone: true,
})
export class FullNamePipe implements PipeTransform {
  transform(employee: Pick<Employee, 'firstName' | 'lastName'> | null | undefined): string {
    if (!employee) return '';
    return `${employee.firstName} ${employee.lastName}`.trim();
  }
}
