import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  listar(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  crear(usuario: any): Observable<any> {
    return this.http.post(this.apiUrl, usuario);
  }

  actualizar(id: number, usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, usuario);
  }

cambiarEstado(id: number, estado: 'ACTIVO' | 'INACTIVO'): Observable<any> {
  return this.http.put(`${this.apiUrl}/${id}/estado`, { estado });
}

}
