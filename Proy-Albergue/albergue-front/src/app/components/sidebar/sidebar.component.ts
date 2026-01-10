import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; 
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule 
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  usuario: any = null;

  constructor(
    public authService: AuthService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    
    this.usuario = this.authService.obtenerUsuario();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}