import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReporteService } from '../../services/reporte.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reporte-total.component.html'
})
export class ReporteTotalComponent implements OnInit {

  total = 0;

  constructor(private reporteService: ReporteService) {}

  ngOnInit(): void {
    this.reporteService.total().subscribe(r => {
      this.total = r.total;
    });
  }
}
