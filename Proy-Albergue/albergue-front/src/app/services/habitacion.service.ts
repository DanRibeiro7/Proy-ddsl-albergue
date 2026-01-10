import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';
import { HabitacionResponse } from '../models/habitacion.interface';

@Injectable({
  providedIn: 'root'
})
export class HabitacionService {

  private apiUrl = `${environment.apiUrl}/habitaciones`;

  constructor(private http: HttpClient) { }

  obtenerHabitaciones(): Observable<HabitacionResponse> {
    return this.http.get<HabitacionResponse>(this.apiUrl);
  }

  obtenerHabitacionPorId(id: number): Observable<HabitacionResponse> {
    return this.http.get<HabitacionResponse>(`${this.apiUrl}/${id}`);
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
  obtenerDetalleOcupacion(idHabitacion: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${idHabitacion}/detalle`);
  }
}
  