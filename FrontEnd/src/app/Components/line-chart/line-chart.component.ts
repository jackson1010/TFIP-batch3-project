import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewInit,
  Inject,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import Chart, { registerables } from 'chart.js/auto';
import Annotation from 'chartjs-plugin-annotation';
import { Service } from 'src/app/services';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css'],
})
export class LineChartComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() stock: any;
  @Input() mainChart: any;
  chart?: Chart;
  color: string = 'red';

  @ViewChild('chartContainer', { static: true })
  chartContainer!: ElementRef;

  ngOnInit(): void {
    Chart.register(...registerables, Annotation);
  }

  ngAfterViewInit(): void {
    this.createCharts();
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['stock'] && !changes['stock'].firstChange) {
  
      this.createCharts();
    }
  }

  createCharts(): void {
    if (!this.stock) {
      return;
    }

    if (this.mainChart) {
 
      if (this.stock.percentageChange > 0) {
        this.color = '#68d99a';
      }

      this.destroyCharts();
      const canvas = this.createCanvasElement(this.stock.symbol);
      let arr: string[] = this.stock.date.slice(-79);
      this.chart = new Chart(canvas, {
        type: 'line',
        data: {
          labels: arr,
          datasets: [
            {
              data: this.stock.close.slice(-79),
              borderColor: this.color,
              pointRadius: 1,
            },
          ],
        },
        options: {
          aspectRatio: 2,
          plugins: {
            annotation: {
              annotations: {
                line1: {
                  type: 'line',
                  yMin: this.stock.open,
                  yMax: this.stock.open,
                  borderColor: this.color,
                  borderWidth: 2,
                  label: {
                    display: true,
                    content: 'Open: ' + this.stock.open,
                    position: 'end',
                  },
                },
              },
            },
            tooltip: {
              mode: 'index',
              intersect: false,
            },
            legend: {
              display: false,
            },
          },
          hover: {
            mode: 'nearest',
            intersect: true,
          },
          scales: {
            x: {
              display: true,
              ticks: {
                autoSkip: true,
                maxTicksLimit: 8,
              },
              grid: {
                display: false,
              },
            },
            y: {
              display: true,
              ticks: {
                autoSkip: true,
                maxTicksLimit: 8,
              },
              grid: {
                display: false,
              },
            },
          },
        },
      });
    } else {
      if (this.stock.percentageChange > 0) {
        this.color = '#68d99a';
      }

      this.destroyCharts();
      const canvas = this.createCanvasElement(this.stock.symbol);
      let arr: string[] = new Array(79).fill('');
      this.chart = new Chart(canvas, {
        type: 'line',
        data: {
          labels: arr,
          datasets: [
            {
              data: this.stock.close.slice(-79),
              borderColor: this.color,
              pointRadius: 0,
            },
          ],
        },
        options: {
          aspectRatio: 2,
          plugins: {
            annotation: {
              annotations: {
                line1: {
                  type: 'line',
                  yMin: this.stock.open,
                  yMax: this.stock.open,
                  borderColor: this.color,
                  borderWidth: 2,
                  // label:{
                  //   display: true,
                  //   content: this.stock.open,
                  //   position: 'start',
                  // }
                },
              },
            },
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              display: false,
              grid: {
                display: false,
              },
            },
            y: {
              display: false,
              grid: {
                display: false,
              },
            },
          },
        },
      });
    }
  }

  destroyCharts(): void {
    if (this.chart) {
      // Save the canvas element
      const canvasElement = this.chart.canvas;

      // Destroy the chart
      this.chart.destroy();

      // Remove the canvas element from the DOM
      canvasElement.parentNode?.removeChild(canvasElement);
    }
  }

  createCanvasElement(id: string): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.id = id;
    this.chartContainer.nativeElement.appendChild(canvas);
    return canvas;
  }
}
