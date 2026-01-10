import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AcompananteService {


  private apiUrl = `${environment.apiUrl}/acompanantes`; 

  constructor(private http: HttpClient) { }

  
  listarPorRegistro(idRegistro: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${idRegistro}`);
  }

  agregar(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data);
  }

  eliminar(idAcompanante: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${idAcompanante}`);
  }
}