import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {

  username = '';
  password = '';
  error = '';
  isLoading = false; // Agregamos estado de carga para bloquear el botón

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    // 1. Limpiar errores previos
    this.error = '';

    // 2. Validación Local: Campos vacíos
    if (!this.username.trim() || !this.password.trim()) {
      this.error = 'Por favor, ingrese usuario y contraseña.';
      return;
    }

    this.isLoading = true;

    // 3. Llamada al Backend
    this.authService.login({
      username: this.username,
      password: this.password
    }).subscribe({
      next: (res) => {
        // Login exitoso
        this.authService.guardarSesion(res.token, res.usuario);
        this.router.navigate(['/reportes']);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error Login:', err);
        
        // 4. Capturar mensaje del backend o usar uno genérico
        // Si tu backend devuelve { success: false, mensaje: "Contraseña errónea" }
        if (err.error && err.error.mensaje) {
          this.error = err.error.mensaje;
        } else {
          this.error = 'Credenciales incorrectas o error de servidor.';
        }
        
        this.isLoading = false;
      }
    });
  }
}