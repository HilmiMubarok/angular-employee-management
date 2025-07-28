import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Employee } from '../../models/employee.model';
import { EmployeeService } from '../../services/employee.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css']
})
export class EmployeeFormComponent implements OnInit {
  employeeForm!: FormGroup;
  isEditMode = false;
  employeeId?: number;
  isLoading = false;
  isSubmitting = false;
  maxDate = new Date();

  statusOptions = ['Active', 'Inactive'];
  groupOptions = [
    'Engineering',
    'Finance',
    'Marketing',
    'HR',
    'Operations',
    'Design',
    'Management',
    'Research',
    'Customer Support',
    'Sales'
  ];
  filteredGroupOptions!: Observable<string[]>;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    this.filteredGroupOptions = this.employeeForm.get('group')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterGroups(value || ''))
    );
    
    this.route.params.subscribe(params => {
      if (params['id'] && params['id'] !== 'new') {
        this.isEditMode = true;
        this.employeeId = +params['id'];
        this.loadEmployeeData();
      }
    });
  }

  initForm(): void {
    this.employeeForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      birthDate: ['', Validators.required],
      basicSalary: ['', [Validators.required, Validators.min(0)]],
      status: ['Active', Validators.required],
      group: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  loadEmployeeData(): void {
    if (!this.employeeId) return;
    
    this.isLoading = true;
    this.employeeService.getEmployeeById(this.employeeId).subscribe({
      next: (employee: Employee | undefined) => {
        if (employee) {
          const birthDate = new Date(employee.birthDate);
          
          this.employeeForm.patchValue({
            ...employee,
            birthDate
          });
          this.isLoading = false;
        } else {
          this.snackBar.open('Employee not found', 'Close', { duration: 3000 });
          this.navigateToList();
        }
      },
      error: (error: unknown) => {
        console.error('Error loading employee data', error);
        this.snackBar.open('Error loading employee data', 'Close', { duration: 3000 });
        this.isLoading = false;
        this.navigateToList();
      }
    });
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.markFormGroupTouched(this.employeeForm);
      return;
    }

    this.isSubmitting = true;
    const employeeData: Employee = {
      ...this.employeeForm.value,
      id: this.isEditMode && this.employeeId ? this.employeeId : undefined
    };

    const birthDate = employeeData.birthDate as unknown;
    if (birthDate instanceof Date) {
      employeeData.birthDate = birthDate.toISOString();
    }

    if (this.isEditMode && this.employeeId) {
      this.employeeService.updateEmployee(employeeData).subscribe({
        next: (success: Employee) => {
          if (success) {
            this.snackBar.open('Employee updated successfully', 'Close', { duration: 3000 });
            this.navigateToList();
          } else {
            this.snackBar.open('Failed to update employee', 'Close', { duration: 3000 });
            this.isSubmitting = false;
          }
        },
        error: (error: unknown) => {
          console.error('Error updating employee', error);
          this.snackBar.open('Error updating employee', 'Close', { duration: 3000 });
          this.isSubmitting = false;
        }
      });
    } else {
      this.employeeService.addEmployee(employeeData).subscribe({
        next: (newEmployee: Employee) => {
          if (newEmployee) {
            this.snackBar.open('Employee created successfully', 'Close', { duration: 3000 });
            this.navigateToList();
          } else {
            this.snackBar.open('Failed to create employee', 'Close', { duration: 3000 });
            this.isSubmitting = false;
          }
        },
        error: (error: unknown) => {
          console.error('Error creating employee', error);
          this.snackBar.open('Error creating employee', 'Close', { duration: 3000 });
          this.isSubmitting = false;
        }
      });
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  navigateToList(): void {
    this.router.navigate(['/employees']);
  }

  get usernameControl() { return this.employeeForm.get('username'); }
  get firstNameControl() { return this.employeeForm.get('firstName'); }
  get lastNameControl() { return this.employeeForm.get('lastName'); }
  get emailControl() { return this.employeeForm.get('email'); }
  get birthDateControl() { return this.employeeForm.get('birthDate'); }
  get basicSalaryControl() { return this.employeeForm.get('basicSalary'); }
  get statusControl() { return this.employeeForm.get('status'); }
  get groupControl() {
    return this.employeeForm.get('group');
  }
  
  get descriptionControl() {
    return this.employeeForm.get('description');
  }

  private _filterGroups(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.groupOptions.filter(group => group.toLowerCase().includes(filterValue));
  }
}
