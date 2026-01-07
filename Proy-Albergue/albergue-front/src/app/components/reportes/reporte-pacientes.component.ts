import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReporteService } from '../../services/reporte.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reporte-pacientes.component.html'
})
export class ReportePacientesComponent implements OnInit {

  total = 0;

  constructor(private reporte: ReporteService) {}

  ngOnInit(): void {
    this.reporte.pacientes().subscribe(r => this.total = r.total);
  }
}
