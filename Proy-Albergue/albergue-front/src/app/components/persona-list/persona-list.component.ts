import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { RouterLink, Router } from '@angular/router';
import { PersonaService } from '../../services/persona.service';
import { Persona } from '../../models/registro.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-persona-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], 
  templateUrl: './persona-list.component.html',
  styleUrls: ['./persona-list.component.css']
})
export class PersonaListComponent implements OnInit {

  listaCompleta: Persona[] = []; 
  listaFiltrada: Persona[] = []; 
  
  loading = true;
  personaSeleccionada: Persona | null = null;

  textoBusqueda: string = '';
  paginaActual: number = 1;
  itemsPorPagina: number = 10;

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
    this.paginaActual = 1; 
  }

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

  verFicha(persona: Persona) {
    this.personaSeleccionada = persona;
  }

  irAHospedar(dni: string) {
    
    this.router.navigate(['/registro/nuevo'], { queryParams: { dni: dni } });
  }

  eliminarPersona(persona: Persona) {

    if ((persona.es_hospedado || 0) > 0) { 
        Swal.fire({
            icon: 'warning',
            title: 'No se puede eliminar',
            text: 'Esta persona tiene un hospedaje activo (como titular o acompañante).',
            confirmButtonColor: '#f0ad4e'
        });
        return;
    }


    Swal.fire({
      title: '¿Eliminar Persona?',
      text: `Se eliminará a ${persona.nombres} ${persona.apellidos}. Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.personaService.eliminarPersona(persona.idpersona!).subscribe({ 
          next: (res: any) => { 
            if(res.success) {
                Swal.fire(
                    'Eliminado',
                    'La persona ha sido eliminada correctamente.',
                    'success'
                );
                this.cargarPersonas(); 
            } else {
                Swal.fire('Error', res.message, 'error');
            }
          },
          error: (err) => {

            Swal.fire('Error', 'No se puede eliminar porque tiene registros históricos asociados.', 'error');
          }
        });
      }
    });    
  }
}