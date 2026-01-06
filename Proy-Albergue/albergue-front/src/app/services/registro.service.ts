import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';
import { Registro, ApiResponse } from '../models/registro.interface';

@Injectable({ providedIn: 'root' })
export class RegistroService {
  private apiUrl = `${environment.apiUrl}/registros`;

  constructor(private http: HttpClient) { }

  // Guardar el ingreso
  crearRegistro(registro: Registro): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.apiUrl, registro);
  }
}