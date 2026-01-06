import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';
import { habitacionResponse } from '../models/habitacion.interface';

@Injectable({
  providedIn: 'root'
})
export class HabitacionService {

  private apiUrl = `${environment.apiUrl}/habitaciones`;

  constructor(private http: HttpClient) {}

  obtenerHabitaciones(): Observable<habitacionResponse> {
    return this.http.get<habitacionResponse>(this.apiUrl);
  }

  obtenerHabitacionPorId(id: number): Observable<habitacionResponse> {
    return this.http.get<habitacionResponse>(`${this.apiUrl}/${id}`);
  }

  crearHabitacion(datos: any): Observable<any> {
    return this.http.post(this.apiUrl, datos);
  }

  actualizarHabitacion(id: number, datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, datos);
  }

  actualizarEstado(
    id: number,
    estado: 'DISPONIBLE' | 'OCUPADA'
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, { estado });
  }

  eliminarHabitacion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
