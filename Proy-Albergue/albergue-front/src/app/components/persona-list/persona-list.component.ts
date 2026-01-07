import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterLink, Router } from '@angular/router'; // <--- Importar Router
import { PersonaService } from '../../services/persona.service';
import { Persona } from '../../models/registro.interface';

@Component({
  selector: 'app-persona-list',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './persona-list.component.html',
  styleUrls: ['./persona-list.component.css']
})
export class PersonaListComponent implements OnInit { 

  listaPersonas: Persona[] = [];
  loading = true;
  personaSeleccionada: Persona | null = null;
  
  // CORRECCIÓN AQUÍ: Inyectar Router correctamente
  constructor(
    private personaService: PersonaService,
    private router: Router 
  ) {}

  ngOnInit(): void {
    this.cargarPersonas();
  }

  verFicha(persona: Persona) {
    this.personaSeleccionada = persona;
  }

  irAHospedar(dni: string) {
    this.router.navigate(['/registro'], { queryParams: { dni: dni } });
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
          this.cargarPersonas(); 
        },
        error: (err) => alert('Error al eliminar: ' + (err.error?.mensaje || err.message))
      });
    }
  }
}