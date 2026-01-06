import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Soluciona *ngIf y ngClass
import { FormsModule } from '@angular/forms';     // Soluciona [(ngModel)]
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PersonaService } from '../../services/persona.service';
import { Persona } from '../../models/registro.interface';

@Component({
  selector: 'app-persona-form',
  standalone: true,
  // 👇 ESTO ES VITAL: Sin estos imports, el HTML falla
  imports: [CommonModule, FormsModule, RouterLink], 
  templateUrl: './persona-form.component.html',
  styleUrls: ['./persona-form.component.css']
})
export class PersonaFormComponent implements OnInit {

  // --- VARIABLES (Soluciona errores "Property does not exist") ---
  persona: Persona = {
    dni: '', nombres: '', apellidos: '', telefono: '', procedencia: '', idtipo_persona: 1
  };

  titulo: string = 'Nuevo Huésped';
  boton: string = 'Guardar';
  esEdicion: boolean = false;
  idPersonaEditar: number = 0;
  isLoading: boolean = false;

  constructor(
    private personaService: PersonaService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Detectamos si venimos a EDITAR (hay ID en URL) o CREAR
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.esEdicion = true;
        this.idPersonaEditar = +id;
        this.titulo = 'Editar Huésped';
        this.boton = 'Actualizar';
        this.cargarPersona(this.idPersonaEditar);
      }
    });
  }

  // --- MÉTODOS (Soluciona errores "Method does not exist") ---

  cargarPersona(id: number) {
    this.isLoading = true;
    this.personaService.obtenerPorId(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.persona = res.data; // Rellenamos el formulario
        } else {
          alert('No se pudo cargar la información');
          this.router.navigate(['/personas']);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  guardar() {
    // Validaciones básicas
    if (!this.persona.dni || !this.persona.nombres || !this.persona.apellidos) {
      alert('Por favor complete DNI, Nombres y Apellidos');
      return;
    }

    this.isLoading = true;

    if (this.esEdicion) {
      // MODO ACTUALIZAR
      this.personaService.actualizarPersona(this.idPersonaEditar, this.persona).subscribe({
        next: (res) => {
          if (res.success) {
            alert('Huésped actualizado correctamente');
            this.router.navigate(['/personas']);
          } else {
            alert('Error: ' + res.message);
          }
          this.isLoading = false;
        },
        error: () => {
          alert('Error al actualizar');
          this.isLoading = false;
        }
      });
    } else {
      // MODO CREAR
      this.personaService.crearPersona(this.persona).subscribe({
        next: (res) => {
          if (res.success) {
            alert('Huésped registrado correctamente');
            this.router.navigate(['/personas']);
          } else {
            alert('Error: ' + res.message);
          }
          this.isLoading = false;
        },
        error: () => {
          alert('Error al guardar');
          this.isLoading = false;
        }
      });
    }
  }
}