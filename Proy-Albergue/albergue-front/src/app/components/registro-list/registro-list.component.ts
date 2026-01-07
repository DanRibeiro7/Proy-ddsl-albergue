import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <--- 1. IMPORTANTE
import { RouterLink } from '@angular/router';
import { RegistroService } from '../../services/registro.service';
declare var bootstrap: any;
@Component({
  selector: 'app-registro-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], // <--- 2. AGREGAR AQUÍ
  templateUrl: './registro-list.component.html',
  styleUrls: ['./registro-list.component.css']
  
})

export class RegistroListComponent implements OnInit {

  // Variables de datos
  listaCompleta: any[] = []; // Copia original
  listaFiltrada: any[] = []; // La que mostramos
  loading: boolean = true;
  registroSeleccionado: any = null;

  // Variables de Filtro y Paginación
  textoBusqueda: string = '';
  paginaActual: number = 1;
  itemsPorPagina: number = 15;

  constructor(private registroService: RegistroService) {}

  ngOnInit(): void {
    this.cargarRegistros();
  }

  cargarRegistros() {
    this.registroService.obtenerRegistros().subscribe({
      next: (res: any) => { // Asegúrate que tu servicio devuelve {success, data}
        if (res.success) {
          this.listaCompleta = res.data;
          this.listaFiltrada = res.data; // Al inicio son iguales
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
          
          // Abrir Modal de Bootstrap
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
        // Filtramos por Nombre, DNI o Número de Habitación
        r.nombre_huesped.toLowerCase().includes(texto) ||
        r.dni.includes(texto) ||
        r.numero_habitacion.toString().includes(texto)
      );
    }
    this.paginaActual = 1; // Volver a pág 1 si buscamos
  }

  // --- LÓGICA DE PAGINACIÓN ---
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