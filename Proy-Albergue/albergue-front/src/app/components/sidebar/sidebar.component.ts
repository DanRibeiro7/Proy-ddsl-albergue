import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // 👈 RouterModule incluye todo
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule // 👈 Usamos esto para que funcionen los links y la clase "active"
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  usuario: any = null;

  constructor(
    public authService: AuthService, // Public para poder usar authService.isAdmin() en el HTML
    private router: Router
  ) {}

  ngOnInit(): void {
    // Carga los datos del usuario (Nombre, Rol) al iniciar
    this.usuario = this.authService.obtenerUsuario();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}