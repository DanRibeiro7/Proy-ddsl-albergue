import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';

@Injectable({ providedIn: 'root' })
export class MaestroService {
  private apiUrl = `${environment.apiUrl}/maestros`;

  constructor(private http: HttpClient) { }

  getInstituciones() {
    return this.http.get(`${this.apiUrl}/instituciones`);
  }

  getCentrosSalud() {
    return this.http.get(`${this.apiUrl}/centros-salud`);
  }
}