import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PersonaService } from '../../services/persona.service';
import { RegistroService } from '../../services/registro.service';
import { HabitacionService } from '../../services/habitacion.service';
import { Persona, Registro } from '../../models/registro.interface';
import { Habitacion } from '../../models/habitacion.interface';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-form.component.html',
  styleUrls: ['./registro-form.component.css']
})  
export class RegistroComponent implements OnInit {

  // Variables de control
  habitacionId: number = 0;
  tipoHabitacion: string = '';
  seleccionManual: string = "";
  datosPaciente = { diagnostico: '', hospital: '', sis: '' };
  datosEstudiante = { institucion: '', carrera: '', ciclo: '' };
  
  habitacionesEstudiantes: Habitacion[] = [];
  habitacionesPacientes: Habitacion[] = [];

  // Modelo de persona
  persona: Persona = {
    dni: '', nombres: '', apellidos: '', telefono: '', procedencia: ''
  };
  
  fechaIngreso: string = new Date().toISOString().split('T')[0];
  fechaSalida: string = '';
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private personaService: PersonaService,
    private registroService: RegistroService,
    private habitacionService: HabitacionService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      
      // 1. Si viene desde el mapa de habitaciones (ya trae ID habitación)
      const idParam = params['idHabitacion'];
      if (idParam) {
        this.habitacionId = +idParam;
        this.tipoHabitacion = params['tipo'];
      } else { 
        // Si no trae habitación, cargamos la lista para que elija manual
        this.cargarHabitacionesDisponibles(); 
      }

      // 2. Si viene desde "Nuevo Huésped" (ya trae DNI)
      const dniParam = params['dni'];
      if (dniParam) {
        this.persona.dni = dniParam;
        // Buscamos automáticamente los datos de la persona
        this.buscarDni(); 
      }
    });
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
      
      // Limpiamos datos previos por si busca otro DNI seguido
      this.persona.idpersona = undefined; 
      
      this.personaService.buscarPorDni(this.persona.dni).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            // SI EXISTE: Llenamos todo
            this.persona = res.data as any;
            if (this.persona.datosEstudiante) this.datosEstudiante = this.persona.datosEstudiante;
            if (this.persona.datosPaciente) this.datosPaciente = this.persona.datosPaciente;
          } else {
            // SI NO EXISTE: Limpiamos nombres pero mantenemos DNI
            const dniTemp = this.persona.dni;
            this.persona = { 
              dni: dniTemp, nombres: '', apellidos: '', telefono: '', procedencia: '' 
            };
            
            // SUGERENCIA INTELIGENTE:
            // Si la habitación es de estudiantes, marcamos "Estudiante" por defecto
            if (this.tipoHabitacion === 'ESTUDIANTE') {
              this.persona.idtipo_persona = 2;
            } else if (this.tipoHabitacion === 'PACIENTE') {
              this.persona.idtipo_persona = 1;
            }
            // (Si no hay habitación seleccionada, el usuario elegirá manualmente con los botones nuevos)
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
           // En caso de error de red, asumimos nuevo y aplicamos misma lógica
           if (this.tipoHabitacion === 'ESTUDIANTE') this.persona.idtipo_persona = 2;
           else if (this.tipoHabitacion === 'PACIENTE') this.persona.idtipo_persona = 1;
        }
      });
    }
  }

  guardarRegistro() {
    // 1. Validaciones
    if (this.habitacionId === 0) {
      alert('Debe seleccionar una habitación');
      return;
    }
    if (!this.persona.nombres || !this.persona.dni) {
      alert('Complete los datos obligatorios (DNI y Nombres)');
      return;
    }

    // 2. Preparar datos extra
    if (this.persona.idtipo_persona === 1) {
       this.persona.datosPaciente = this.datosPaciente;
    } else if (this.persona.idtipo_persona === 2) {
       this.persona.datosEstudiante = this.datosEstudiante;
    }
    
    this.isLoading = true;
    this.persona.idtipo_persona = this.tipoHabitacion === 'ESTUDIANTE' ? 2 : 1;

    // 3. LÓGICA INTELIGENTE: ¿Crear o Actualizar?
    
    if (this.persona.idpersona) {
      // CASO A: La persona YA EXISTE (el buscador trajo su ID) -> ACTUALIZAMOS
      this.personaService.actualizarPersona(this.persona.idpersona, this.persona).subscribe({
        next: (res) => {
          if (res.success) {
            // Pasamos directo a crear el registro de hospedaje
            this.finalizarHospedaje(this.persona.idpersona!); 
          } else {
            alert('Error al actualizar datos: ' + res.message);
            this.isLoading = false;
          }
        },
        error: (err) => {
          console.error(err);
          alert('Error al actualizar la información de la persona');
          this.isLoading = false;
        }
      });

    } else {
      // CASO B: La persona ES NUEVA (no tiene ID) -> CREAMOS
      this.personaService.crearPersona(this.persona).subscribe({
        next: (resPer) => {
          if (resPer.success) {
            const nuevoId = resPer.data.idpersona || resPer.data.insertId;
            this.finalizarHospedaje(nuevoId);
          } else {
             alert('Error al guardar persona: ' + resPer.message);
             this.isLoading = false;
          }
        },
        error: (err) => {
          // Aquí atrapamos el error del DNI duplicado si el buscador falló
          const mensaje = err.error?.mensaje || err.message;
          alert('No se pudo registrar la persona: ' + mensaje);
          this.isLoading = false;
        }
      });
    }
  }
  finalizarHospedaje(idPersona: number) {
    
    // Agregamos la hora actual a la fecha seleccionada
    const ahora = new Date();
    const horaActual = ahora.toTimeString().split(' ')[0]; // "14:30:00"
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
          alert('¡Hospedaje registrado con éxito!');
          this.router.navigate(['/habitaciones']);
        } else {
          alert('Error del servidor: ' + resReg.message);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('ERROR REGISTRO:', err);
        const mensaje = err.error?.mensaje || 'Error desconocido';
        alert('Fallo al crear el hospedaje: ' + mensaje);
        this.isLoading = false;
      }
    });
  }
  cancelar() {
    this.router.navigate(['/habitaciones']);
  }
}