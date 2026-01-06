import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';
import { ApiResponse } from '../models/registro.interface';

@Injectable({ providedIn: 'root' })
export class PersonaService {
  private apiUrl = `${environment.apiUrl}/personas`;

  constructor(private http: HttpClient) { }

  // Buscar persona por DNI
  buscarPorDni(dni: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/buscar/${dni}`);
  }

  // Crear nueva persona
  crearPersona(datos: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.apiUrl, datos);
  }
}