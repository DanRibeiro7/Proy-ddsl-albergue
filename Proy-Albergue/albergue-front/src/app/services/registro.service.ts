import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';
import { Registro, ApiResponse } from '../models/registro.interface';

@Injectable({ providedIn: 'root' })
export class RegistroService {
  private apiUrl = `${environment.apiUrl}/registros`;

  constructor(private http: HttpClient) { }
  obtenerRegistros(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
  // Guardar el ingreso
  crearRegistro(registro: Registro): Observable<ApiResponse> {
    // CORRECCIÓN: Agregamos '/ingreso' para coincidir con el backend
    return this.http.post<ApiResponse>(`${this.apiUrl}/ingreso`, registro);
  }
  liberarHabitacion(idHabitacion: number): Observable<any> {
  return this.http.put(`${this.apiUrl}/liberar-habitacion/${idHabitacion}`, {});
}
}