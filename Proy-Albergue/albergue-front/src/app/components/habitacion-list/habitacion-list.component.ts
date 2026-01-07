import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HabitacionService } from '../../services/habitacion.service';
import { Habitacion } from '../../models/habitacion.interface';
import { RegistroService } from '../../services/registro.service';

@Component({
  selector: 'app-habitacion-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './habitacion-list.component.html',
  styleUrls: ['./habitacion-list.component.css']
})
export class HabitacionListComponent implements OnInit {
  detalleSeleccionado: any = null;
  habitacionesEstudiantes: Habitacion[] = [];
  habitacionesPacientes: Habitacion[] = [];

  constructor(
    private habitacionService: HabitacionService,
    private registroService: RegistroService,
    private router: Router // Inyección del Router
  ) { }

  ngOnInit(): void {
    this.cargarHabitaciones();
  }

  cargarHabitaciones(): void {
    this.habitacionService.obtenerHabitaciones().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          // Casteamos la data
          const lista = response.data as Habitacion[];

          // Filtramos por pabellón
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
      // CASO 2: OCUPADA -> Fetch details and show Modal
      this.habitacionService.obtenerDetalleOcupacion(hab.idhabitacion!).subscribe({
        next: (res) => {
          if (res.success) {
            this.detalleSeleccionado = res.data;
            // We use standard Bootstrap to open the modal via ID
            const modalElement = document.getElementById('modalDetalleHabitacion');
            if (modalElement) {
              // @ts-ignore
              const modal = new bootstrap.Modal(modalElement);
              modal.show();
            }
          }
        },
        error: (err) => alert('Error al cargar detalles')
      });
    }
  }

  liberarHabitacion(idHabitacion: number): void {
    if (confirm('¿Confirmar salida del huésped? Se cerrará el registro y la habitación quedará DISPONIBLE.')) {
      
      // Llamamos al servicio de REGISTRO, no al de habitación
      this.registroService.liberarHabitacion(idHabitacion).subscribe({
        next: (res) => {
          if (res.success) {
            alert('Salida registrada correctamente.');
            this.cargarHabitaciones(); // Recargamos para ver la habitación verde y sin nombre
          } else {
            alert('Advertencia: ' + res.mensaje);
          }
        },
        error: (err) => {
          console.error(err);
          alert('Error al procesar la salida.');
        }
      });
    }
  }
}