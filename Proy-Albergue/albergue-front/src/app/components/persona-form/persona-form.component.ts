import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms'; // Importar NgForm
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PersonaService } from '../../services/persona.service';
import { Persona } from '../../models/registro.interface';

@Component({
  selector: 'app-persona-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './persona-form.component.html',
  styleUrls: ['./persona-form.component.css']
})
export class PersonaFormComponent implements OnInit {

  persona: Persona = {
    dni: '', nombres: '', apellidos: '', telefono: '', procedencia: '', idtipo_persona: 1
  };

  titulo: string = 'Nuevo Huésped';
  esEdicion: boolean = false;
  idPersonaEditar: number = 0;
  isLoading: boolean = false;

  constructor(
    private personaService: PersonaService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.esEdicion = true;
        this.idPersonaEditar = +id;
        this.titulo = 'Editar Huésped';
        this.cargarPersona(this.idPersonaEditar);
      }
    });
  }

  cargarPersona(id: number) {
    this.isLoading = true;
    this.personaService.obtenerPorId(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.persona = res.data;
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

  validarSoloNumeros(event: any) {
    const input = event.target;

    input.value = input.value.replace(/[^0-9]/g, '');
  }
  guardar(form: NgForm, irAHospedar: boolean) {

    if (form.invalid) {

      Object.values(form.controls).forEach(control => {
        control.markAsTouched();
      });
      return; // Detenemos la ejecución
    }

    this.isLoading = true;

    if (this.esEdicion) {
      // --- ACTUALIZAR ---
      this.personaService.actualizarPersona(this.idPersonaEditar, this.persona).subscribe({
        next: (res) => {
          if (res.success) {
            alert('Datos actualizados correctamente');
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
      // --- CREAR NUEVO ---
      this.personaService.crearPersona(this.persona).subscribe({
        next: (res) => {
          if (res.success) {

            if (irAHospedar) {
              this.router.navigate(['/registro'], {
                queryParams: { dni: this.persona.dni }
              });
            } else {
              alert('Huésped registrado correctamente');
              this.router.navigate(['/personas']);
            }

          } else {
            alert('Error: ' + res.message);
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error completo:', err);
          const mensajeError = err.error?.mensaje || 'Error al conectar con el servidor';

          alert('ADVERTENCIA: ' + mensajeError);

          this.isLoading = false;
        }
      });
    }
  }
}