import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importante para usar ngModel
import { ActivatedRoute, Router } from '@angular/router';
import { PersonaService } from '../../services/persona.service';
import { RegistroService } from '../../services/registro.service';
import { Persona, Registro } from '../../models/registro.interface';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-form.component.html',
  styleUrls: ['./registro-form.component.css']
})
export class RegistroComponent implements OnInit {

  // Datos que vienen de la URL
  habitacionId: number = 0;
  tipoHabitacion: string = '';

  // Modelo del formulario
  persona: Persona = {
    dni: '', nombres: '', apellidos: '', telefono: '', procedencia: ''
  };
  
  fechaIngreso: string = new Date().toISOString().split('T')[0]; // Fecha hoy
  fechaSalida: string = '';

  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private personaService: PersonaService,
    private registroService: RegistroService
  ) {}

  ngOnInit(): void {
    // 1. Capturamos los datos que nos envió el componente de Habitaciones
    this.route.queryParams.subscribe(params => {
      this.habitacionId = +params['idHabitacion']; // El + convierte a número
      this.tipoHabitacion = params['tipo'];
      
      if (!this.habitacionId) {
        alert('No se seleccionó ninguna habitación');
        this.router.navigate(['/habitaciones']);
      }
    });
  }

  // Buscar si la persona ya existe al escribir el DNI
  buscarDni() {
  if (this.persona.dni.length === 8) {
    this.isLoading = true;

    this.personaService.buscarPorDni(this.persona.dni).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          // Encontró → solo autocompleta
          this.persona = res.data as any;
        } else {
          // No encontró → recién avisa
          alert('No se encontró ninguna persona con ese DNI');
        }
        this.isLoading = false;
      },
      error: () => {
        alert('Error al buscar la persona');
        this.isLoading = false;
      }
    });
  }
}


  guardarRegistro() {
    // 1. Validaciones básicas
    if (!this.persona.nombres || !this.persona.dni) {
      alert('Complete los datos del huésped');
      return;
    }

    this.isLoading = true;

    // Lógica: Primero guardamos/actualizamos la persona, luego el registro
    // Nota: Tu backend idealmente debería manejar esto en una transacción, 
    // pero aquí lo haremos en dos pasos simples para frontend.
    
    this.personaService.crearPersona(this.persona).subscribe({
      next: (resPersona) => {
        if (resPersona.success) {
          const idPersonaGuardada = resPersona.data.idpersona;

          // 2. Crear el objeto Registro
          const nuevoRegistro: Registro = {
            idpersona: idPersonaGuardada,
            idhabitacion: this.habitacionId,
            fecha_ingreso: this.fechaIngreso,
            fecha_salida: this.fechaSalida,
            estado: 'ACTIVO'
          };

          // 3. Enviar al backend
          this.registroService.crearRegistro(nuevoRegistro).subscribe({
            next: () => {
              alert('¡Hospedaje registrado con éxito!');
              this.router.navigate(['/habitaciones']); // Volver al panel
            },
            error: (err) => {
              alert('Error al guardar registro: ' + err.message);
              this.isLoading = false;
            }
          });
        }
      },
      error: (err) => {
        alert('Error al guardar persona: ' + err.message);
        this.isLoading = false;
      }
    });
  }
  
  cancelar() {
    this.router.navigate(['/habitaciones']);
  }
}