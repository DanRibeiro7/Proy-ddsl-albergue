import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HabitacionService } from '../../services/habitacion.service';
import { habitacion } from '../../models/habitacion.interface';

@Component({
  selector: 'app-habitacion-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './habitacion-list.component.html',
  styleUrls: ['./habitacion-list.component.css']
})
export class HabitacionListComponent implements OnInit {

  habitacionesEstudiantes: habitacion[] = [];
  habitacionesPacientes: habitacion[] = [];

  constructor(
    private habitacionService: HabitacionService,
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
          const lista = response.data as habitacion[];

          // Filtramos por pabellón
          this.habitacionesEstudiantes = lista.filter(h => h.tipo === 'ESTUDIANTE');
          this.habitacionesPacientes = lista.filter(h => h.tipo === 'PACIENTE');
        }
      },
      error: (err) => console.error('Error cargando habitaciones', err)
    });
  }

  // --- LÓGICA PRINCIPAL DEL FLUJO ---
  gestionarHabitacion(hab: habitacion): void {
    if (hab.estado === 'DISPONIBLE') {
      // CASO 1: Está libre -> Vamos al Registro (Check-in)
      this.router.navigate(['/registro'], { 
        queryParams: { 
          idHabitacion: hab.idhabitacion, 
          tipo: hab.tipo // Pasamos si es ESTUDIANTE o PACIENTE para bloquear el select
        } 
      });
    } else {
      // CASO 2: Está ocupada -> Mostramos info (o podrías abrir un modal aquí)
      alert(`La habitación ${hab.numero_habitacion} está ocupada actualmente.`);
    }
  }

  liberarHabitacion(id: number): void {
    if (confirm('¿Está seguro de liberar esta habitación? Se marcará como DISPONIBLE.')) {
      this.habitacionService.actualizarEstado(id, 'DISPONIBLE').subscribe({
        next: () => {
          // alert('Habitación liberada correctamente'); // Opcional, a veces es molesto tantos alerts
          this.cargarHabitaciones(); // Refrescamos la lista para ver el cambio a Verde
        },
        error: (err) => alert('Error al liberar: ' + err.message)
      });
    }
  }
}