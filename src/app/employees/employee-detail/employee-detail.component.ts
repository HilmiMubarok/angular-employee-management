import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Employee } from '../../models/employee.model';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.css']
})
export class EmployeeDetailComponent implements OnInit {
  employee: Employee | null = null;
  isLoading = true;
  employeeId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.employeeId = +params['id'];
      this.loadEmployee();
    });
  }

  loadEmployee(): void {
    this.isLoading = true;
    this.employeeService.getEmployeeById(this.employeeId).subscribe({
      next: (employee) => {
        if (employee) {
          this.employee = employee;
          this.isLoading = false;
        } else {
          this.snackBar.open('Employee not found', 'Close', { duration: 3000 });
          this.navigateToList();
        }
      },
      error: (error) => {
        console.error('Error loading employee', error);
        this.snackBar.open('Error loading employee details', 'Close', { duration: 3000 });
        this.isLoading = false;
        this.navigateToList();
      }
    });
  }

  editEmployee(): void {
    this.router.navigate(['/employees', this.employeeId, 'edit']);
  }

  deleteEmployee(): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(this.employeeId).subscribe({
        next: (success) => {
          if (success) {
            this.snackBar.open('Employee deleted successfully', 'Close', { duration: 3000 });
            this.navigateToList();
          } else {
            this.snackBar.open('Failed to delete employee', 'Close', { duration: 3000 });
          }
        },
        error: (error) => {
          console.error('Error deleting employee', error);
          this.snackBar.open('Error deleting employee', 'Close', { duration: 3000 });
        }
      });
    }
  }

  navigateToList(): void {
    this.router.navigate(['/employees']);
  }
}
