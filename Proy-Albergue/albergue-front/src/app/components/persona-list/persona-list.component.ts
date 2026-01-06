import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterLink } from '@angular/router'; // <--- OBLIGATORIO PARA QUE FUNCIONEN LOS BOTONES
import { PersonaService } from '../../services/persona.service';
import { Persona } from '../../models/registro.interface';

@Component({
  selector: 'app-persona-list',
  standalone: true,
  imports: [CommonModule, RouterLink], // <--- AGREGAR RouterLink AQUÍ
  templateUrl: './persona-list.component.html',
  styleUrls: ['./persona-list.component.css']
})
export class PersonaListComponent implements OnInit { 

  listaPersonas: Persona[] = [];
  loading = true;

  constructor(private personaService: PersonaService) {}

  ngOnInit(): void {
    this.cargarPersonas();
  }

  cargarPersonas() {
    this.personaService.obtenerPersonas().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.listaPersonas = res.data;
        } else {
          console.warn('Mensaje del backend:', res.mensaje);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando personas:', err);
        this.loading = false;
      }
    });
  }

  eliminarPersona(id: number) {
    if (confirm('¿Está seguro de eliminar a esta persona?')) {
      this.personaService.eliminarPersona(id).subscribe({ 
        next: (res: any) => { 
          alert('Persona eliminada correctamente');
          this.cargarPersonas(); // Recargamos la lista
        },
        error: (err) => alert('Error al eliminar: ' + (err.error?.mensaje || err.message))
      });
    }
  }
}