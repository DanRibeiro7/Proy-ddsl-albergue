import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ReporteService {

  private apiUrl = 'http://localhost:3000/api/reportes';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  private headers() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.auth.obtenerToken()}`
      })
    };
  }

  total() {
    return this.http.get<any>(`${this.apiUrl}/total`, this.headers());
  }

  pacientes() {
    return this.http.get<any>(`${this.apiUrl}/pacientes`, this.headers());
  }

  estudiantes() {
    return this.http.get<any>(`${this.apiUrl}/estudiantes`, this.headers());
  }
}
