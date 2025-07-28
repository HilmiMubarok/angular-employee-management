import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  constructor(private router: Router) {}


  
  isMainDashboard(): boolean {
    // Check if we're on the main dashboard route and not a child route
    return this.router.url === '/dashboard';
  }
}
