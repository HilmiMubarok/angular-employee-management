import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Employee } from '../models/employee.model';
import { employees as dummyEmployees } from '../employee.data';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private employees: Employee[] = [];
  private employeesSubject = new BehaviorSubject<Employee[]>([]);

  constructor() {
    this.employees = [...dummyEmployees];
    this.employeesSubject.next(this.employees);
  }

  getEmployees(): Observable<Employee[]> {
    return this.employeesSubject.asObservable();
  }

  getEmployeeById(id: number): Observable<Employee | undefined> {
    const employee = this.employees.find(emp => emp.id === id);
    return of(employee);
  }

  addEmployee(employee: Employee): Observable<Employee> {
    // Generate a new ID (max ID + 1)
    const newId = this.employees.length > 0 
      ? Math.max(...this.employees.map(emp => emp.id)) + 1 
      : 1;
    
    const newEmployee = {
      ...employee,
      id: newId
    };
    
    this.employees.push(newEmployee);
    this.employeesSubject.next([...this.employees]);
    
    return of(newEmployee);
  }

  updateEmployee(employee: Employee): Observable<Employee> {
    const index = this.employees.findIndex(emp => emp.id === employee.id);
    
    if (index !== -1) {
      this.employees[index] = { ...employee };
      this.employeesSubject.next([...this.employees]);
      return of(this.employees[index]);
    }
    
    throw new Error(`Employee with id ${employee.id} not found`);
  }

  deleteEmployee(id: number): Observable<boolean> {
    const initialLength = this.employees.length;
    this.employees = this.employees.filter(emp => emp.id !== id);
    
    if (initialLength !== this.employees.length) {
      this.employeesSubject.next([...this.employees]);
      return of(true);
    }
    
    return of(false);
  }
}