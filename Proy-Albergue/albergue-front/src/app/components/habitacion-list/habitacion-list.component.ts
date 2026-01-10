import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HabitacionService } from '../../services/habitacion.service';
import { Habitacion } from '../../models/habitacion.interface';
import { RegistroService } from '../../services/registro.service';
import { AcompananteService } from '../../services/acompanante.service'; 
import { PersonaService } from '../../services/persona.service';
import Swal from 'sweetalert2'; 
import { FormsModule } from '@angular/forms';


declare var bootstrap: any;

@Component({
  selector: 'app-habitacion-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './habitacion-list.component.html',
  styleUrls: ['./habitacion-list.component.css']
})
export class HabitacionListComponent implements OnInit {

  detalleSeleccionado: any = null;
  habitacionesEstudiantes: Habitacion[] = [];
  habitacionesPacientes: Habitacion[] = [];
  listaAcompanantes: any[] = [];
  idRegistroActual: number = 0;

  mostrarFormAgregar: boolean = false;
  dniBusqueda: string = '';
  nombreEncontrado: string = '';
  idPersonaEncontrada: number = 0;
  parentescoSeleccionado: string = '';
  buscandoPersona: boolean = false;

  constructor(
    private habitacionService: HabitacionService,
    private registroService: RegistroService,
    private acompananteService: AcompananteService, // <--- INYECTAR
    private personaService: PersonaService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarHabitaciones();
  }

  cargarHabitaciones(): void {
    this.habitacionService.obtenerHabitaciones().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          const lista = response.data as Habitacion[];
          this.habitacionesEstudiantes = lista.filter(h => h.tipo === 'ESTUDIANTE');
          this.habitacionesPacientes = lista.filter(h => h.tipo === 'PACIENTE');
        }
      },
      error: (err) => console.error('Error cargando habitaciones', err)
    });
  }

  gestionarHabitacion(hab: Habitacion): void {
    if (hab.estado === 'DISPONIBLE') {
      this.router.navigate(['/registro/nuevo'], {
        queryParams: { idHabitacion: hab.idhabitacion, tipo: hab.tipo }
      });
    } else {
      // Ver detalle (Modal)
      this.habitacionService.obtenerDetalleOcupacion(hab.idhabitacion!).subscribe({
        next: (res) => {
          if (res.success) {
            this.detalleSeleccionado = res.data;
            this.detalleSeleccionado.idhabitacion = hab.idhabitacion;
            this.idRegistroActual = this.detalleSeleccionado.idregistro;


            this.cargarAcompanantes();
            this.mostrarFormAgregar = false;
            this.resetFormulario();

            const modalElement = document.getElementById('modalDetalleHabitacion');
            if (modalElement) {
              const modal = new bootstrap.Modal(modalElement);
              modal.show();
            }
          }
        },
        error: (err) => Swal.fire('Error', 'No se pudo cargar el detalle', 'error')
      });
    }
  }

  cargarAcompanantes() {
    if (!this.idRegistroActual) return;
    this.acompananteService.listarPorRegistro(this.idRegistroActual).subscribe({
      next: (res: any) => {
        if (res.success) this.listaAcompanantes = res.data;
      }
    });
  }

  toggleFormulario() {
    this.mostrarFormAgregar = !this.mostrarFormAgregar;
    if (!this.mostrarFormAgregar) {
      this.resetFormulario();
    }
  }

  resetFormulario() {
    this.dniBusqueda = '';
    this.nombreEncontrado = '';
    this.idPersonaEncontrada = 0;
    this.parentescoSeleccionado = '';
    this.buscandoPersona = false;
  }

  buscarPersona() {
    if (this.dniBusqueda.length !== 8) return;


    const yaExiste = this.listaAcompanantes.some(ac => ac.dni === this.dniBusqueda);
    if (yaExiste) {
      Swal.fire('Duplicado', 'Esta persona ya está en la lista de acompañantes.', 'warning');
      return;
    }


    if (this.dniBusqueda === this.detalleSeleccionado.dni) {
      Swal.fire('Error', 'El huésped principal no puede ser su propio acompañante.', 'error');
      return;
    }

    this.buscandoPersona = true;
    this.personaService.buscarPorDni(this.dniBusqueda).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.nombreEncontrado = `${res.data.nombres} ${res.data.apellidos}`;
          this.idPersonaEncontrada = res.data.idpersona;
        } else {
          this.nombreEncontrado = '';
          Swal.fire({
            text: 'Persona no encontrada. ¿Desea registrarla ahora?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Ir a Registrar',
            cancelButtonText: 'Cancelar'
          }).then((result) => {
            if (result.isConfirmed) {

              const modalElement = document.getElementById('modalDetalleHabitacion');
              if (modalElement) {
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) modalInstance.hide();
              }
              this.router.navigate(['/personas/nuevo']);
            }
          });
        }
        this.buscandoPersona = false;
      },
      error: () => {
        this.buscandoPersona = false;
        Swal.fire('Error', 'No se pudo realizar la búsqueda.', 'error');
      }
    });
  }

  guardarAcompanante() {
    if (!this.idPersonaEncontrada || !this.parentescoSeleccionado) return;

    if (!this.detalleSeleccionado) {
      Swal.fire('Error', 'No se ha cargado la información de la habitación.', 'error');
      return;
    }

    const ocupantesActuales = 1 + this.listaAcompanantes.length;
    const capacidadMaxima = this.detalleSeleccionado.capacidad || 2;

    console.log('Validando:', ocupantesActuales, '>=', capacidadMaxima);
    if (ocupantesActuales >= capacidadMaxima) {
      Swal.fire({
        title: '¡Habitación Llena!',
        text: `Esta habitación tiene una capacidad máxima de ${capacidadMaxima} personas.`,
        icon: 'warning',
        confirmButtonColor: '#ffc107',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    this.acompananteService.agregar({
      idregistro: this.idRegistroActual,
      idpersona: this.idPersonaEncontrada,
      parentesco: this.parentescoSeleccionado
    }).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.cargarAcompanantes();
          this.toggleFormulario(); 
          Swal.fire({
            title: 'Agregado',
            text: 'Acompañante registrado correctamente',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          Swal.fire('No permitido', res.mensaje, 'warning');
        }
      },
      error: (err) => {
        const msg = err.error?.mensaje || 'Ocurrió un error al procesar la solicitud.';
        Swal.fire('Atención', msg, 'warning');
      }
    });
  }


  quitarAcompanante(idAcompanante: number) {
    Swal.fire({
      title: '¿Quitar acompañante?',
      text: "Se desvinculará de esta habitación.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, quitar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.acompananteService.eliminar(idAcompanante).subscribe({
          next: () => {
            this.cargarAcompanantes();
            Swal.fire('Eliminado', 'El acompañante ha sido retirado.', 'success');
          }
        });
      }
    });
  }

  liberarHabitacion(idHabitacion: number): void {
    Swal.fire({
      title: '¿Finalizar Hospedaje?',
      text: "La habitación quedará marcada como DISPONIBLE y el registro se cerrará.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: '<i class="bi bi-box-arrow-right"></i> Sí, liberar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.registroService.liberarHabitacion(idHabitacion).subscribe({
          next: (res) => {
            if (res.success) {
              const modalElement = document.getElementById('modalDetalleHabitacion');
              if (modalElement) {
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) modalInstance.hide();
              }
              Swal.fire('¡Habitación Liberada!', 'El hospedaje ha finalizado.', 'success');
              this.cargarHabitaciones();
            } else {
              Swal.fire('Advertencia', res.mensaje, 'warning');
            }
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo procesar la salida.', 'error');
          }
        });
      }
    });
  }
}