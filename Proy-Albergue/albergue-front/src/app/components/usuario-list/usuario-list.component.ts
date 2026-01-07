import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario-list.component.html'
})
export class UsuarioListComponent implements OnInit {

  usuarios: any[] = [];

  nuevoUsuario = {
    username: '',
    password: '',
    rol: 'USUARIO'
  };

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuarioService.listar().subscribe(res => {
      this.usuarios = res.data;
    });
  }

  crearUsuario() {
    if (!this.nuevoUsuario.username || !this.nuevoUsuario.password) {
      alert('Complete los campos');
      return;
    }

    // MAPEO DE ROL A ID
    const idRolToSend = this.nuevoUsuario.rol === 'ADMIN' ? 1 : 2;

    const usuarioParaEnviar = {
      username: this.nuevoUsuario.username,
      password: this.nuevoUsuario.password,
      idrol: idRolToSend // Enviamos el ID, no el nombre
    };

    this.usuarioService.crear(usuarioParaEnviar).subscribe(() => { // Enviamos el objeto correcto
      this.nuevoUsuario = {
        username: '',
        password: '',
        rol: 'USUARIO'
      };
      this.cargarUsuarios();
    }, (err) => {
        alert('Error al crear usuario: ' + (err.error?.mensaje || err.message));
    });
  }

  cambiarEstado(usuario: any) {
    if (!confirm('¿Seguro de cambiar estado?')) return;

    this.usuarioService.cambiarEstado(usuario.idusuario).subscribe(() => {
      this.cargarUsuarios();
    });
  }
}
