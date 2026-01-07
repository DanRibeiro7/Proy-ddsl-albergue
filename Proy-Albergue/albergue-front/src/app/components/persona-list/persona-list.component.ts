import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <--- IMPORTANTE PARA EL BUSCADOR
import { RouterLink, Router } from '@angular/router';
import { PersonaService } from '../../services/persona.service';
import { Persona } from '../../models/registro.interface';

@Component({
  selector: 'app-persona-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], // <--- AGREGAR FormsModule
  templateUrl: './persona-list.component.html',
  styleUrls: ['./persona-list.component.css']
})
export class PersonaListComponent implements OnInit {

  // Datos Originales
  listaCompleta: Persona[] = []; // Guardamos copia de todo
  listaFiltrada: Persona[] = []; // Lo que se muestra según búsqueda
  
  loading = true;
  personaSeleccionada: Persona | null = null;

  // Paginación y Filtro
  textoBusqueda: string = '';
  paginaActual: number = 1;
  itemsPorPagina: number = 15;

  constructor(
    private personaService: PersonaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPersonas();
  }

  cargarPersonas() {
    this.personaService.obtenerPersonas().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.listaCompleta = res.data;
          this.listaFiltrada = res.data; // Al inicio, filtrada = completa
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  // --- LÓGICA DE FILTRADO ---
  filtrar() {
    const texto = this.textoBusqueda.toLowerCase();
    
    if (texto === '') {
      this.listaFiltrada = this.listaCompleta;
    } else {
      this.listaFiltrada = this.listaCompleta.filter(p => 
        p.nombres.toLowerCase().includes(texto) ||
        p.apellidos.toLowerCase().includes(texto) ||
        p.dni.includes(texto)
      );
    }
    this.paginaActual = 1; // Volver a la primera página al buscar
  }

  // --- LÓGICA DE PAGINACIÓN ---
  obtenerDatosPaginados(): Persona[] {
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

  // --- MÉTODOS EXISTENTES ---
  verFicha(persona: Persona) {
    this.personaSeleccionada = persona;
  }

  irAHospedar(dni: string) {
    this.router.navigate(['/registro'], { queryParams: { dni: dni } });
  }

  eliminarPersona(id: number) {
    if (confirm('¿Está seguro de eliminar a esta persona?')) {
      this.personaService.eliminarPersona(id).subscribe({ 
        next: () => { 
          alert('Persona eliminada correctamente');
          this.cargarPersonas(); 
        },
        error: (err) => alert('Error: ' + err.message)
      });
    }
  }
}