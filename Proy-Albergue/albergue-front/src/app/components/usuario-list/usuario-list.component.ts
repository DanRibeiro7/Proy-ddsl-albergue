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

  // NUEVO
  nuevoUsuario = {
    username: '',
    password: '',
    rol: 'USUARIO'
  };

  // EDITAR
  usuarioEditando: any = null;
  usuarioForm = {
    username: '',
    password: '',
    rol: 'USUARIO'
  };

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  // =========================
  // LISTAR
  // =========================
  cargarUsuarios() {
    this.usuarioService.listar().subscribe({
      next: (res) => this.usuarios = res.data,
      error: () => alert('Error al cargar usuarios')
    });
  }

  // =========================
  // CREAR
  // =========================
  crearUsuario() {
    if (!this.nuevoUsuario.username || !this.nuevoUsuario.password) {
      alert('Complete todos los campos');
      return;
    }

    const idrol = this.nuevoUsuario.rol === 'ADMIN' ? 1 : 2;

    this.usuarioService.crear({
      username: this.nuevoUsuario.username,
      password: this.nuevoUsuario.password,
      idrol
    }).subscribe({
      next: () => {
        this.nuevoUsuario = { username: '', password: '', rol: 'USUARIO' };
        this.cargarUsuarios();
      },
      error: (err) =>
        alert('Error al crear usuario: ' + (err.error?.mensaje || err.message))
    });
  }

  // =========================
  // CAMBIAR ESTADO (ENUM)
  // =========================
  cambiarEstado(usuario: any) {
    if (!confirm('¿Seguro de cambiar el estado?')) return;

    const nuevoEstado =
      usuario.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

    this.usuarioService
      .cambiarEstado(usuario.idusuario, nuevoEstado)
      .subscribe({
        next: () => this.cargarUsuarios(),
        error: () => alert('Error al cambiar estado')
      });
  }

  // =========================
  // EDITAR
  // =========================
  abrirEditar(usuario: any) {
    this.usuarioEditando = usuario;
    this.usuarioForm = {
      username: usuario.username,
      password: '',
      rol: usuario.rol
    };
  }

  actualizarUsuario() {
    if (!this.usuarioEditando) return;

    const idrol = this.usuarioForm.rol === 'ADMIN' ? 1 : 2;

    const payload: any = {
      username: this.usuarioForm.username,
      idrol
    };

    if (this.usuarioForm.password) {
      payload.password = this.usuarioForm.password;
    }

    this.usuarioService
      .actualizar(this.usuarioEditando.idusuario, payload)
      .subscribe({
        next: () => {
          this.usuarioEditando = null;
          this.cargarUsuarios();
          alert('Usuario actualizado');
        },
        error: () => alert('Error al actualizar usuario')
      });
  }
}
