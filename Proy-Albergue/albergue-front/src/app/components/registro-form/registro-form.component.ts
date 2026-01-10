import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PersonaService } from '../../services/persona.service';
import { RegistroService } from '../../services/registro.service';
import { HabitacionService } from '../../services/habitacion.service';
import { ComunidadService } from '../../services/comunidad.service';
import { Persona, Registro } from '../../models/registro.interface';
import { Habitacion } from '../../models/habitacion.interface';
import { MaestroService } from '../../services/maestro.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-form.component.html',
  styleUrls: ['./registro-form.component.css']
})
export class RegistroComponent implements OnInit {
  listaInstituciones: any[] = [];
  listaHospitales: any[] = [];
  habitacionId: number = 0;
  tipoHabitacion: string = '';
  seleccionManual: string = "";
  listaComunidades: any[] = [];
  datosPaciente = { diagnostico: '', hospital: '', sis: '' };
  datosEstudiante = { institucion: '', carrera: '', ciclo: '' };

  habitacionesEstudiantes: Habitacion[] = [];
  habitacionesPacientes: Habitacion[] = [];

  persona: Persona = {
    dni: '', nombres: '', apellidos: '', telefono: '', id_comunidad: undefined, datosEstudiante: {
      institucion: '',
      carrera: '',
      ciclo: ''
    },
    datosPaciente: {
      diagnostico: '',
      hospital: '',
      sis: ''
    }
  };

  fechaIngreso: string = new Date().toISOString().split('T')[0];
  fechaSalida: string = '';
  isLoading = false;

  mensajeAlerta: string = '';
  tipoAlerta: 'success' | 'error' = 'error';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private personaService: PersonaService,
    private registroService: RegistroService,
    private habitacionService: HabitacionService,
    private comunidadService: ComunidadService,
    private maestroService: MaestroService
  ) { }

  ngOnInit(): void {
    this.cargarComunidades();
    this.route.queryParams.subscribe(params => {
      const idParam = params['idHabitacion'];
      if (idParam) {
        this.habitacionId = +idParam;
        this.tipoHabitacion = params['tipo'];
      } else {
        this.cargarHabitacionesDisponibles();
      }
      this.cargarListasMaestras();
      const dniParam = params['dni'];
      if (dniParam) {
        this.persona.dni = dniParam;
        this.buscarDni();
      }
    });
  }
  cargarListasMaestras() {

    this.maestroService.getInstituciones().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.listaInstituciones = res.data;
          console.log('Instituciones cargadas:', this.listaInstituciones); // Para depurar
        }
      },
      error: (err) => console.error('Error instituciones:', err)
    });


    this.maestroService.getCentrosSalud().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.listaHospitales = res.data;
          console.log('Hospitales cargados:', this.listaHospitales); // Para depurar
        }
      },
      error: (err) => console.error('Error hospitales:', err)
    });
  }
  cargarComunidades() {
    this.comunidadService.obtenerComunidades().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.listaComunidades = res.data;
        }
      },
      error: (err) => console.error('Error cargando comunidades', err)
    });
  }
  soloNumeros(event: any) {
    const charCode = (event.which) ? event.which : event.keyCode;

    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  limpiarAlCambiarDni() {

    const dniActual = this.persona.dni;


    let tipoReset: number | undefined = undefined;

    if (this.habitacionId > 0 && this.tipoHabitacion) {
      tipoReset = (this.tipoHabitacion === 'ESTUDIANTE') ? 2 : 1;
    }

    this.persona = {
      dni: dniActual,
      nombres: '',
      apellidos: '',
      telefono: '',
      id_comunidad: undefined,
      idtipo_persona: tipoReset!
    };

    this.datosPaciente = { diagnostico: '', hospital: '', sis: '' };
    this.datosEstudiante = { institucion: '', carrera: '', ciclo: '' };
  }
  mostrarAlerta(mensaje: string, tipo: 'success' | 'error') {
    this.mensajeAlerta = mensaje;
    this.tipoAlerta = tipo;
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

            const personaEncontrada = res.data as any;

            if (this.habitacionId > 0 && this.seleccionManual) {
              const tipoHab = this.tipoHabitacion === 'ESTUDIANTE' ? 2 : 1;
              if (personaEncontrada.idtipo_persona !== tipoHab) {
                this.limpiarSeleccion();
                Swal.fire('Atención', `La persona es ${personaEncontrada.idtipo_persona === 2 ? 'Estudiante' : 'Paciente'}. Seleccione una habitación correcta.`, 'info');
              }
            }

            if (this.habitacionId > 0 && !this.seleccionManual) {
              const tipoHab = this.tipoHabitacion === 'ESTUDIANTE' ? 2 : 1;
              if (personaEncontrada.idtipo_persona !== tipoHab) {
                Swal.fire('Error', `Habitación no apta para acompañante.`, 'error');
                this.persona.dni = '';
                this.isLoading = false;
                return;
              }
            }

            this.persona = personaEncontrada;

            this.datosEstudiante = this.persona.datosEstudiante || { institucion: '', carrera: '', ciclo: '' };
            this.datosPaciente = this.persona.datosPaciente || { diagnostico: '', hospital: '', sis: '' };

          } else {

            const dniTemp = this.persona.dni;

            let tipoAUsar = this.persona.idtipo_persona;

            if (this.habitacionId > 0 && this.tipoHabitacion) {
              tipoAUsar = (this.tipoHabitacion === 'ESTUDIANTE') ? 2 : 1;
            }

            this.persona = {
              dni: dniTemp,
              nombres: '',
              apellidos: '',
              telefono: '',
              id_comunidad: undefined,
              idtipo_persona: tipoAUsar || 0
            };


            this.datosPaciente = { diagnostico: '', hospital: '', sis: '' };
            this.datosEstudiante = { institucion: '', carrera: '', ciclo: '' };

            this.persona.datosEstudiante = this.datosEstudiante;
            this.persona.datosPaciente = this.datosPaciente;

            this.mostrarAlerta('DNI no encontrado. Registre al nuevo huésped.', 'error'); // Cambié a 'success' o 'info' para que no parezca error grave
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
    }
  }

  guardarRegistro() {
    if (this.habitacionId === 0) {
      this.mostrarAlerta('Debe seleccionar una habitación.', 'error');
      return;
    }

    if (!this.persona.dni || this.persona.dni.length !== 8 || isNaN(Number(this.persona.dni))) {
      this.mostrarAlerta('El DNI debe tener 8 dígitos numéricos.', 'error');
      return;
    }

    if (!this.persona.nombres || !this.persona.apellidos) {
      this.mostrarAlerta('El nombre y apellido son obligatorios.', 'error');
      return;
    }

    const tipoRequerido = this.tipoHabitacion === 'ESTUDIANTE' ? 2 : 1;

    if (!this.persona.idpersona) {
      this.persona.idtipo_persona = tipoRequerido;
    }

    else if (this.persona.idtipo_persona !== tipoRequerido) {
      Swal.fire({
        icon: 'error',
        title: 'Tipo Incompatible',
        text: `Esta persona es ${this.persona.idtipo_persona === 2 ? 'Estudiante' : 'Paciente'} y la habitación es para ${this.tipoHabitacion}.`,
        confirmButtonText: 'Entendido'
      });
      return;
    }

    if (this.persona.idtipo_persona === 1) {
      if (!this.datosPaciente.diagnostico || !this.datosPaciente.hospital) {
        this.mostrarAlerta('Para pacientes, el Diagnóstico y Hospital son obligatorios.', 'error');
        return;
      }
      this.persona.datosPaciente = this.datosPaciente;
    }

    else if (this.persona.idtipo_persona === 2) {
      if (!this.datosEstudiante.institucion || !this.datosEstudiante.carrera) {
        this.mostrarAlerta('Para estudiantes, la Institución y Carrera son obligatorias.', 'error');
        return;
      }
      this.persona.datosEstudiante = this.datosEstudiante;
    }

    this.isLoading = true;

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
          this.mostrarAlerta('Error de conexión al actualizar.', 'error');
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
          this.mostrarAlerta('Error: ' + mensaje, 'error');
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

          Swal.fire({
            title: '¡Registro Exitoso!',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            this.router.navigate(['/habitaciones']);
          });


        } else {
          Swal.fire('Error', resReg.message, 'error');
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('ERROR REGISTRO:', err);
        Swal.fire('Error crítico', 'Huesped ya tiene habitacion asignada.', 'error');
        this.isLoading = false;
      }
    });
  }

  cancelar() {
    this.router.navigate(['/habitaciones']);
  }


  alCambiarTipoPersona() {

    if (this.habitacionId > 0 && this.seleccionManual) {

      const tipoRequerido = this.tipoHabitacion === 'ESTUDIANTE' ? 2 : 1;


      if (this.persona.idtipo_persona !== tipoRequerido) {

        this.limpiarSeleccion();
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'info',
          title: 'Se limpió la habitación porque no coincide con el tipo seleccionado.',
          showConfirmButton: false,
          timer: 3000
        });
      }
    }
  }

  seleccionarHabitacionManual() {
    const idSeleccionado = +this.seleccionManual;
    const hab = [...this.habitacionesEstudiantes, ...this.habitacionesPacientes]
      .find(h => h.idhabitacion === idSeleccionado);

    if (hab) {

      if (this.persona.idtipo_persona) {
        const tipoPersonaStr = this.persona.idtipo_persona === 2 ? 'ESTUDIANTE' : 'PACIENTE';

        if (hab.tipo !== tipoPersonaStr) {
          Swal.fire('Error', `No puede asignar una habitación de ${hab.tipo} a un ${tipoPersonaStr}`, 'error');
          this.seleccionManual = "";
          return;
        }
      }


      this.habitacionId = hab.idhabitacion!;
      this.tipoHabitacion = hab.tipo!;


      if (!this.persona.idtipo_persona) {
        this.persona.idtipo_persona = hab.tipo === 'ESTUDIANTE' ? 2 : 1;
      }
    }
  }
}