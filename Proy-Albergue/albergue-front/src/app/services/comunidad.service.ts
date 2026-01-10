import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ComunidadService {
  // Ajusta la URL según tu backend
  private apiUrl = `${environment.apiUrl}/comunidades`; 

  constructor(private http: HttpClient) { }

  obtenerComunidades(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }
}