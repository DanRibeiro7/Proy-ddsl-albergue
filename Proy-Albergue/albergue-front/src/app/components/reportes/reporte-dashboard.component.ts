import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ReporteService } from '../../services/reporte.service';

@Component({
  selector: 'app-reporte-dashboard',
  standalone: true, 
  imports: [CommonModule], 
  templateUrl: './reporte-dashboard.component.html',
  styleUrls: ['./reporte-dashboard.component.css']
})
export class ReporteDashboardComponent implements OnInit {

  totalActivos: number = 0;
  camasDisponibles: number = 0;
  totalCamas: number = 20; 
  totalRaciones: number = 0; 
  porcentajeOcupacion: number = 0;
fechaActual = new Date();
  dataPorTipo: any[] = [];
  topLugares: any[] = [];
  listaEstadias: any[] = [];

  constructor(private reporteService: ReporteService) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {

    this.reporteService.obtenerTotal().subscribe((res: any) => {
      if(res.success) {
        this.totalActivos = res.data.total;
        this.totalRaciones = this.totalActivos + 6; 
        

        if (this.totalCamas > 0) {
            this.porcentajeOcupacion = Math.round((this.totalActivos / 40) * 100);
        }
      }
    });


    this.reporteService.obtenerPorTipo().subscribe((res: any) => {
      if(res.success) this.dataPorTipo = res.data;
    });

      
    this.reporteService.obtenerProcedencias().subscribe((res: any) => {
      if(res.success) this.topLugares = res.data;
    });


    this.reporteService.obtenerEstadoHabitaciones().subscribe((res: any) => {
      if(res.success) {
        const disponibles = res.data.find((d:any) => d.estado === 'DISPONIBLE');
        this.camasDisponibles = disponibles ? disponibles.cantidad : 0;
      }
    });

    this.reporteService.obtenerEstadiasProlongadas().subscribe((res: any) => {
        if(res.success) {
            this.listaEstadias = res.data;
        }
    });
  }
}