import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';
import { ApiResponse } from '../models/registro.interface';

@Injectable({ providedIn: 'root' })
export class PersonaService {
  private apiUrl = `${environment.apiUrl}/personas`;

  constructor(private http: HttpClient) { }

  obtenerPersonas(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  buscarPorDni(dni: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/buscar/${dni}`);
  }

  crearPersona(datos: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.apiUrl, datos);
  }

  obtenerPorId(id: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/${id}`);
  }

  actualizarPersona(id: number, datos: any): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/${id}`, datos);
  }

  // 👇 ESTE ES EL MÉTODO QUE TE FALTABA 👇
  eliminarPersona(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`);
  }
}