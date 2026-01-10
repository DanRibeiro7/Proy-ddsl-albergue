import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
// CORRECCIÓN AQUÍ: Solo un nivel arriba (..)
import { environment } from '../environment/environment'; 

@Injectable({
  providedIn: 'root'
})
export class ReporteService {

  private apiUrl = `${environment.apiUrl}/reportes`;

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

  obtenerTotal() {
    return this.http.get<any>(`${this.apiUrl}/total`, this.headers());
  }

  obtenerPorTipo() {
    return this.http.get<any>(`${this.apiUrl}/por-tipo`, this.headers());
  }

  obtenerProcedencias() {
    return this.http.get<any>(`${this.apiUrl}/procedencias`, this.headers());
  }

  obtenerEstadoHabitaciones() {
    return this.http.get<any>(`${this.apiUrl}/habitaciones-estado`, this.headers());
  }
  obtenerEstadiasProlongadas() {
  return this.http.get(`${this.apiUrl}/estadias-prolongadas`);
}
}