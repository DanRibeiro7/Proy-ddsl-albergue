import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PersonaService } from '../../services/persona.service';
import { RegistroService } from '../../services/registro.service';
import { HabitacionService } from '../../services/habitacion.service';
import { Persona, Registro } from '../../models/registro.interface';
import { Habitacion } from '../../models/habitacion.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-form.component.html',
  styleUrls: ['./registro-form.component.css']
})  
export class RegistroComponent implements OnInit {

  habitacionId: number = 0;
  tipoHabitacion: string = '';
  seleccionManual: string = "";
  datosPaciente = { diagnostico: '', hospital: '', sis: '' };
  datosEstudiante = { institucion: '', carrera: '', ciclo: '' };
  
  habitacionesEstudiantes: Habitacion[] = [];
  habitacionesPacientes: Habitacion[] = [];

  persona: Persona = { dni: '', nombres: '', apellidos: '', telefono: '', procedencia: '' };
  
  fechaIngreso: string = new Date().toISOString().split('T')[0];
  fechaSalida: string = '';
  isLoading = false;

  // NUEVO: Variables para alertas bonitas
  mensajeAlerta: string = '';
  tipoAlerta: 'success' | 'error' = 'error';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private personaService: PersonaService,
    private registroService: RegistroService,
    private habitacionService: HabitacionService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const idParam = params['idHabitacion'];
      if (idParam) {
        this.habitacionId = +idParam;
        this.tipoHabitacion = params['tipo'];
      } else { 
        this.cargarHabitacionesDisponibles(); 
      }

      const dniParam = params['dni'];
      if (dniParam) {
        this.persona.dni = dniParam;
        this.buscarDni(); 
      }
    });
  }

  // --- NUEVO: Validar solo números en input ---
  soloNumeros(event: any) {
    const charCode = (event.which) ? event.which : event.keyCode;
    // Solo permite números (ASCII 48-57)
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  // --- NUEVO: Mostrar alerta bonita ---
  mostrarAlerta(mensaje: string, tipo: 'success' | 'error') {
    this.mensajeAlerta = mensaje;
    this.tipoAlerta = tipo;
    // Auto-ocultar después de 5 segundos
    setTimeout(() => this.mensajeAlerta = '', 5000);
  }

  cargarHabitacionesDisponibles() {
    this.habitacionService.obtenerHabitaciones().subscribe({
      next: (res: any) => {
        if (res.success && Array.isArray(res.data)) {
          const todas = res.data as Habitacion[];
          this.habitacionesEstudiantes = todas.filter(h => h.tipo === 'ESTUDIANTE' && h.estado === 'DISPONIBLE');
          this.habitacionesPacientes = todas.filter(h => h.tipo === 'PACIENTE' && h.estado === 'DISPONIBLE');
        }
      }
    });
  }

  seleccionarHabitacionManual() {
    const idSeleccionado = +this.seleccionManual;
    const hab = [...this.habitacionesEstudiantes, ...this.habitacionesPacientes]
                .find(h => h.idhabitacion === idSeleccionado);
    if (hab) {
      this.habitacionId = hab.idhabitacion!;
      this.tipoHabitacion = hab.tipo!;
    }
  }

  limpiarSeleccion() {
    this.habitacionId = 0;
    this.tipoHabitacion = '';
    this.seleccionManual = "";
    if (this.habitacionesEstudiantes.length === 0) {
        this.cargarHabitacionesDisponibles();
    }
  }

  buscarDni() {
    if (this.persona.dni.length === 8) {
      this.isLoading = true;
      this.persona.idpersona = undefined; 
      
      this.personaService.buscarPorDni(this.persona.dni).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.persona = res.data as any;
            if (this.persona.datosEstudiante) this.datosEstudiante = this.persona.datosEstudiante;
            if (this.persona.datosPaciente) this.datosPaciente = this.persona.datosPaciente;
            
            // Éxito silencioso (no mostramos alerta verde aquí, solo llenamos datos)
          } else {
            const dniTemp = this.persona.dni;
            this.persona = { 
              dni: dniTemp, nombres: '', apellidos: '', telefono: '', procedencia: '' 
            };
            if (this.tipoHabitacion === 'ESTUDIANTE') this.persona.idtipo_persona = 2;
            else if (this.tipoHabitacion === 'PACIENTE') this.persona.idtipo_persona = 1;
            
            this.mostrarAlerta('DNI no encontrado. Por favor registre los datos.', 'error');
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          if (this.tipoHabitacion === 'ESTUDIANTE') this.persona.idtipo_persona = 2;
          else if (this.tipoHabitacion === 'PACIENTE') this.persona.idtipo_persona = 1;
        }
      });
    }
  }

  guardarRegistro() {
    // 1. Validaciones
    if (this.habitacionId === 0) {
      this.mostrarAlerta('Debe seleccionar una habitación.', 'error');
      return;
    }
    
    // Validación DNI (Longitud y contenido)
    if (!this.persona.dni || this.persona.dni.length !== 8 || isNaN(Number(this.persona.dni))) {
      this.mostrarAlerta('El DNI debe tener 8 dígitos numéricos.', 'error');
      return;
    }

    if (!this.persona.nombres) {
      this.mostrarAlerta('El nombre es obligatorio.', 'error');
      return;
    }

    // 2. Preparar datos extra
    if (this.persona.idtipo_persona === 1) {
       this.persona.datosPaciente = this.datosPaciente;
    } else if (this.persona.idtipo_persona === 2) {
       this.persona.datosEstudiante = this.datosEstudiante;
    }
    
    this.isLoading = true;
    
    // Asignar tipo si vino de habitación
    if (!this.persona.idtipo_persona) {
       this.persona.idtipo_persona = this.tipoHabitacion === 'ESTUDIANTE' ? 2 : 1;
    }

    // 3. Lógica Crear/Actualizar
    if (this.persona.idpersona) {
      this.personaService.actualizarPersona(this.persona.idpersona, this.persona).subscribe({
        next: (res) => {
          if (res.success) {
            this.finalizarHospedaje(this.persona.idpersona!); 
          } else {
            this.mostrarAlerta('Error al actualizar datos: ' + res.message, 'error');
            this.isLoading = false;
          }
        },
        error: (err) => {
          console.error(err);
          this.mostrarAlerta('Error al actualizar la información de la persona', 'error');
          this.isLoading = false;
        }
      });

    } else {
      this.personaService.crearPersona(this.persona).subscribe({
        next: (resPer) => {
          if (resPer.success) {
            const nuevoId = resPer.data.idpersona || resPer.data.insertId;
            this.finalizarHospedaje(nuevoId);
          } else {
             this.mostrarAlerta('Error al guardar persona: ' + resPer.message, 'error');
             this.isLoading = false;
          }
        },
        error: (err) => {
          const mensaje = err.error?.mensaje || err.message;
          this.mostrarAlerta('No se pudo registrar la persona: ' + mensaje, 'error');
          this.isLoading = false;
        }
      });
    }
  }

  finalizarHospedaje(idPersona: number) {
    const ahora = new Date();
    const horaActual = ahora.toTimeString().split(' ')[0]; 
    const fechaConHora = `${this.fechaIngreso} ${horaActual}`;

    const nuevoRegistro: Registro = {
      idpersona: idPersona,
      idhabitacion: this.habitacionId,
      fecha_ingreso: fechaConHora,
      estado: 'ACTIVO'
    };

    this.registroService.crearRegistro(nuevoRegistro).subscribe({
  next: (resReg) => {
    if (resReg.success) {
      
      // ALERTA ELEGANTE
      Swal.fire({
        title: '¡Registro Exitoso!',
        text: 'El huésped ha sido asignado a la habitación correctamente.',
        icon: 'success',
        confirmButtonText: 'Ir al Mapa',
        confirmButtonColor: '#0d6efd' // Color azul Bootstrap
      }).then((result) => {
        // Redirige solo cuando el usuario hace clic en OK
        if (result.isConfirmed) {
          this.router.navigate(['/habitaciones']);
        }
      });

    } else {
      // Usamos SweetAlert para error también
      Swal.fire('Error', resReg.message, 'error');
    }
    this.isLoading = false;
  },
  error: (err) => {
    console.error('ERROR REGISTRO:', err);
    Swal.fire('Error crítico', 'No se pudo guardar el registro.', 'error');
    this.isLoading = false;
  }
});
  }

  cancelar() {
    this.router.navigate(['/habitaciones']);
  }
}