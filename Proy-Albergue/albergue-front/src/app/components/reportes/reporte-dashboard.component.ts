import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // <--- 1. IMPORTAR ESTO
import { ReporteService } from '../../services/reporte.service';

@Component({
  selector: 'app-reporte-dashboard',
  standalone: true, // Esto probablemente ya estaba, o es el default
  imports: [CommonModule], // <--- 2. AGREGAR ESTO AQUÍ
  templateUrl: './reporte-dashboard.component.html',
  styleUrls: ['./reporte-dashboard.component.css']
})
export class ReporteDashboardComponent implements OnInit {

  totalActivos: number = 0;
  camasDisponibles: number = 0;
  totalCamas: number = 20; 
  
  dataPorTipo: any[] = [];
  topLugares: any[] = [];

  constructor(private reporteService: ReporteService) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    // 1. Total Hospedados
    this.reporteService.obtenerTotal().subscribe((res: any) => {
      if(res.success) this.totalActivos = res.data.total;
    });

    // 2. Desglose (Estudiante/Paciente)
    this.reporteService.obtenerPorTipo().subscribe((res: any) => {
      if(res.success) this.dataPorTipo = res.data;
    });

    // 3. Top Procedencias
    this.reporteService.obtenerProcedencias().subscribe((res: any) => {
      if(res.success) this.topLugares = res.data;
    });

    // 4. Estado Habitaciones
    this.reporteService.obtenerEstadoHabitaciones().subscribe((res: any) => {
      if(res.success) {
        const disponibles = res.data.find((d:any) => d.estado === 'DISPONIBLE');
        this.camasDisponibles = disponibles ? disponibles.cantidad : 0;
      }
    });
  }
}