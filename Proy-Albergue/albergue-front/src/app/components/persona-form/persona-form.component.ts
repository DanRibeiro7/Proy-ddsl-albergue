import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms'; // Importar NgForm
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PersonaService } from '../../services/persona.service';
import { Persona } from '../../models/registro.interface';
import Swal from 'sweetalert2';

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
    
    if (input.name === 'dni') this.persona.dni = input.value;
    if (input.name === 'telefono') this.persona.telefono = input.value;
  }
  guardar(form: NgForm) {

    // 1. VALIDACIÓN DEL FORMULARIO (Campos requeridos)
    if (form.invalid) {
      Object.values(form.controls).forEach(control => {
        control.markAsTouched();
      });
      Swal.fire({
        icon: 'warning',
        title: 'Faltan datos',
        text: 'Por favor complete los campos obligatorios marcados en rojo.',
        confirmButtonColor: '#f0ad4e'
      });
      return;
    }

    // 2. VALIDACIÓN ESPECÍFICA (DNI exacto 8 dígitos)
    if (this.persona.dni.length !== 8) {
      Swal.fire({
        icon: 'warning',
        title: 'DNI Inválido',
        text: 'El número de DNI debe tener exactamente 8 dígitos.',
        confirmButtonColor: '#f0ad4e'
      });
      return;
    }

    this.isLoading = true;

    if (this.esEdicion) {
      // --- MODO EDICIÓN ---
      this.personaService.actualizarPersona(this.idPersonaEditar, this.persona).subscribe({
        next: (res) => {
          if (res.success) {
            Swal.fire({
              icon: 'success',
              title: '¡Actualizado!',
              text: 'Los datos del huésped se han guardado correctamente.',
              confirmButtonColor: '#0d6efd'
            }).then(() => {
              this.router.navigate(['/personas']);
            }); 
          } else {
            Swal.fire('Error', res.message, 'error');
          }
          this.isLoading = false;
        },
        error: () => {
          Swal.fire('Error', 'No se pudo actualizar la información.', 'error');
          this.isLoading = false;
        }
      });

    } else {
      // --- MODO CREACIÓN (AQUÍ ESTÁ EL CAMBIO) ---
      this.personaService.crearPersona(this.persona).subscribe({
        next: (res) => {
        if (res.success) {
          
          // AQUÍ ESTÁ LA LÓGICA DE DECISIÓN (Ya no depende del parámetro)
          Swal.fire({
            icon: 'success',
            title: '¡Huésped Registrado!',
            text: '¿Qué desea hacer a continuación?',
            showCancelButton: true,
            confirmButtonText: '<i class="bi bi-box-arrow-in-right"></i> Asignar Habitación',
            cancelButtonText: '<i class="bi bi-list-ul"></i> Ir a la Lista',
            confirmButtonColor: '#198754',
            cancelButtonColor: '#6c757d',
            reverseButtons: true
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/registro/nuevo'], { queryParams: { dni: this.persona.dni } });
            } else {
              this.router.navigate(['/personas']);
            }
          });

        } else {
          Swal.fire('Atención', res.message, 'warning');
        }
        this.isLoading = false;
      },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'No se pudo registrar.', 'error');
          this.isLoading = false;
        }
      });
    }
  }
}