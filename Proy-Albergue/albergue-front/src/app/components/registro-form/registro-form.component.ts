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

  // Listas para el dropdown (LO QUE NECESITA TU HTML)
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
      const idParam = params['idHabitacion'];
      
      if (idParam) {
        // CASO A: Viene desde el mapa de habitaciones (Pre-seleccionado)
        this.habitacionId = +idParam;
        this.tipoHabitacion = params['tipo'];
      } else {
        // CASO B: Viene desde el menú lateral (Manual)
        this.cargarHabitacionesDisponibles();
      }
    });
  }

  // Carga las habitaciones para llenar los <optgroup> de tu select
  cargarHabitacionesDisponibles() {
    this.habitacionService.obtenerHabitaciones().subscribe({
      next: (res: any) => {
        if (res.success && Array.isArray(res.data)) {
          const todas = res.data as Habitacion[];
          
          // Filtramos y llenamos las listas que usa tu HTML
          this.habitacionesEstudiantes = todas.filter(h => h.tipo === 'ESTUDIANTE' && h.estado === 'DISPONIBLE');
          this.habitacionesPacientes = todas.filter(h => h.tipo === 'PACIENTE' && h.estado === 'DISPONIBLE');
        }
      }
    });
  }

  // Se ejecuta cuando el usuario elige una opción del dropdown
  seleccionarHabitacionManual() {
    const idSeleccionado = +this.seleccionManual;
    
    // Buscamos en ambas listas para encontrar los datos completos
    const hab = [...this.habitacionesEstudiantes, ...this.habitacionesPacientes]
                .find(h => h.idhabitacion === idSeleccionado);
    
    if (hab) {
      this.habitacionId = hab.idhabitacion!;
      this.tipoHabitacion = hab.tipo!; // 'ESTUDIANTE' o 'PACIENTE'
    }
  }

  // Botón "X" para cancelar selección y volver al dropdown
  limpiarSeleccion() {
    this.habitacionId = 0;
    this.tipoHabitacion = '';
    this.seleccionManual = "";
    
    // Si venía del mapa, ahora necesitamos cargar la lista
    if (this.habitacionesEstudiantes.length === 0) {
        this.cargarHabitacionesDisponibles();
    }
  }

  buscarDni() {
    if (this.persona.dni.length === 8) {
      this.isLoading = true;
      this.personaService.buscarPorDni(this.persona.dni).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.persona = res.data as any;
          }
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    }
  }

 guardarRegistro() {
  // Validaciones básicas
  if (this.habitacionId === 0) {
    alert('Debe seleccionar una habitación');
    return;
  }
  if (!this.persona.nombres || !this.persona.dni) {
    alert('Complete los datos obligatorios (DNI y Nombres)');
    return;
  }

  this.isLoading = true;
  this.persona.idtipo_persona = this.tipoHabitacion === 'ESTUDIANTE' ? 2 : 1;

  console.log('Enviando persona al backend:', this.persona); // <--- MIRA ESTO EN CONSOLA

  // 1. Guardar Persona
  this.personaService.crearPersona(this.persona).subscribe({
    next: (resPer) => {
      console.log('Respuesta Persona:', resPer); // <--- LOG DE ÉXITO

      if (resPer.success) {
        // Obtenemos el ID, ya sea nuevo (insertId) o existente (idpersona)
        const idPersona = resPer.data.idpersona || resPer.data.insertId;

        // 2. Guardar Registro
        const nuevoRegistro: Registro = {
          idpersona: idPersona,
          idhabitacion: this.habitacionId,
          fecha_ingreso: this.fechaIngreso,
          // fecha_salida: NO LA MANDAMOS PORQUE ES OPCIONAL
          estado: 'ACTIVO'
        };

        this.registroService.crearRegistro(nuevoRegistro).subscribe({
          next: (resReg) => {
            console.log('Respuesta Registro:', resReg);
            if (resReg.success) {
              alert('¡Hospedaje registrado con éxito!');
              this.router.navigate(['/habitaciones']);
            } else {
              alert('Error del servidor: ' + resReg.message);
            }
            this.isLoading = false;
          },
          error: (err) => {
            console.error('ERROR REGISTRO:', err); // <--- VER ERROR REAL
            alert('Fallo al crear el hospedaje: ' + (err.error?.mensaje || err.message));
            this.isLoading = false;
          }
        });

      } else {
         alert('Error al guardar persona: ' + resPer.message);
         this.isLoading = false;
      }
    },
    error: (err) => {
      console.error('ERROR PERSONA:', err); // <--- AQUÍ ESTÁ TU PROBLEMA
      // Mostramos el error real en lugar de "Error de conexión"
      alert('Error conectando con el servidor: ' + (err.error?.mensaje || err.message || err.statusText));
      this.isLoading = false;
    }
  });
}

  cancelar() {
    this.router.navigate(['/habitaciones']);
  }
}