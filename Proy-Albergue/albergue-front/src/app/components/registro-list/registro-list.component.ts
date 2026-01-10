import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { RouterLink } from '@angular/router';
import { RegistroService } from '../../services/registro.service';
declare var bootstrap: any;
@Component({
  selector: 'app-registro-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], 
  templateUrl: './registro-list.component.html',
  styleUrls: ['./registro-list.component.css']
  
})

export class RegistroListComponent implements OnInit {

  listaCompleta: any[] = [];
  listaFiltrada: any[] = []; 
  loading: boolean = true;
  registroSeleccionado: any = null;

  textoBusqueda: string = '';
  paginaActual: number = 1;
  itemsPorPagina: number = 10;

  constructor(private registroService: RegistroService) {}

  ngOnInit(): void {
    this.cargarRegistros();
  }

  cargarRegistros() {
    this.registroService.obtenerRegistros().subscribe({
      next: (res: any) => { 
        if (res.success) {
          this.listaCompleta = res.data;
          this.listaFiltrada = res.data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
verDetalle(idRegistro: number) {
    this.registroService.obtenerRegistroPorId(idRegistro).subscribe({
      next: (res) => {
        if (res.success) {
          this.registroSeleccionado = res.data;
          
          const modalElement = document.getElementById('modalDetalleRegistro');
          if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
          }
        }
      },
      error: (err) => alert('Error al cargar el detalle')
    });
  }
  filtrar() {
    const texto = this.textoBusqueda.toLowerCase();

    if (texto === '') {
      this.listaFiltrada = this.listaCompleta;
    } else {
      this.listaFiltrada = this.listaCompleta.filter(r => 
        r.nombre_huesped.toLowerCase().includes(texto) ||
        r.dni.includes(texto) ||
        r.numero_habitacion.toString().includes(texto)
      );
    }
    this.paginaActual = 1; 
  }

  obtenerDatosPaginados() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.listaFiltrada.slice(inicio, fin);
  }

  cambiarPagina(delta: number) {
    this.paginaActual += delta;
  }

  get totalPaginas(): number {
    return Math.ceil(this.listaFiltrada.length / this.itemsPorPagina);
  }
}