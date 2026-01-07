import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(datos: { username: string; password: string }) {
    return this.http.post<any>(`${this.apiUrl}/login`, datos);
  }

  guardarSesion(token: string, usuario: any) {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }

  obtenerUsuario() {
    const u = localStorage.getItem('usuario');
    return u ? JSON.parse(u) : null;
  }

  obtenerToken() {
    return localStorage.getItem('token');
  }

  estaLogueado(): boolean {
    return !!this.obtenerToken();
  }

  isAdmin(): boolean {
    const u = this.obtenerUsuario();
    return u?.rol === 'ADMIN';
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
