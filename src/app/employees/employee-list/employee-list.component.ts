import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Employee } from '../../models/employee.model';
import { EmployeeService } from '../../services/employee.service';
import { FilterStateService } from '../../services/filter-state.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'firstName', 'lastName', 'email', 'group', 'status', 'actions'];
  dataSource = new MatTableDataSource<Employee>([]);
  isLoading = true;
  filterForm: FormGroup;
  
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
  
  statusOptions = ['Active', 'Inactive'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private employeeService: EmployeeService,
    private router: Router,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private filterStateService: FilterStateService
  ) {
    const savedState = this.filterStateService.getFilterState('employeeList');
    
    this.filterForm = this.fb.group({
      name: [savedState?.name || ''],
      group: [savedState?.group || ''],
      status: [savedState?.status || ''],
      email: [savedState?.email || '']
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
    
    this.dataSource.filterPredicate = this.createFilterPredicate();
    
    this.filterForm.valueChanges.subscribe(filterValues => {
      this.applyFilters(filterValues);
      this.filterStateService.saveFilterState('employeeList', filterValues);
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    this.sort.sort({
      id: 'id',
      start: 'desc',
      disableClear: false
    });
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.dataSource.data = employees;
        this.isLoading = false;
        
        const savedFilter = this.filterStateService.getFilterState('employeeList');
        if (savedFilter) {
          this.applyFilters(savedFilter);
        }
      },
      error: (error) => {
        console.error('Error loading employees', error);
        this.isLoading = false;
        this.snackBar.open('Error loading employees', 'Close', { duration: 3000 });
      }
    });
  }
  
  applyFilters(filterValues: any): void {
    this.dataSource.filter = JSON.stringify(filterValues);
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  
  resetFilters(): void {
    this.filterForm.reset({
      name: '',
      group: '',
      status: '',
      email: ''
    });
    
    this.filterStateService.clearFilterState('employeeList');
  }
  
  createFilterPredicate(): (data: Employee, filter: string) => boolean {
    return (data: Employee, filter: string): boolean => {
      const filterObject = JSON.parse(filter);
      
      const nameMatches = filterObject.name ? 
        (data.firstName.toLowerCase().includes(filterObject.name.toLowerCase()) || 
         data.lastName.toLowerCase().includes(filterObject.name.toLowerCase())) : true;
      
      const groupMatches = filterObject.group ? 
        data.group.toLowerCase() === filterObject.group.toLowerCase() : true;
      
      const statusMatches = filterObject.status ? 
        data.status.toLowerCase() === filterObject.status.toLowerCase() : true;
      
      const emailMatches = filterObject.email ? 
        data.email.toLowerCase().includes(filterObject.email.toLowerCase()) : true;
      
      return nameMatches && groupMatches && statusMatches && emailMatches;
    };
  }

  viewEmployee(id: number): void {
    this.router.navigate(['/employees', id]);
  }

  editEmployee(id: number): void {
    this.router.navigate(['/employees', id, 'edit']);
  }

  deleteEmployee(id: number): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: (success) => {
          if (success) {
            this.snackBar.open('Employee deleted successfully', 'Close', { duration: 3000 });
            this.loadEmployees();
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

  addEmployee(): void {
    this.router.navigate(['/employees/new']);
  }
  
  hasActiveFilters(): boolean {
    const filterValues = this.filterForm.value;
    return (
      (filterValues.name && filterValues.name.trim() !== '') ||
      (filterValues.group && filterValues.group !== '') ||
      (filterValues.status && filterValues.status !== '') ||
      (filterValues.email && filterValues.email.trim() !== '')
    );
  }
}
