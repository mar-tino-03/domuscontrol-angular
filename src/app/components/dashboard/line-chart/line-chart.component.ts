import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import 'chartjs-adapter-date-fns';

import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Legend,
  Tooltip,
  CategoryScale,
} from 'chart.js'

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  CategoryScale,
  Legend,
  Tooltip,
);

var FIRST = true;

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css'],
})
export class LineChartComponent implements OnChanges {
  @Input() dati: any;
  @Input() code!: string;
  @Input() labelX!: string;
  @Input() disabled!: boolean;
  @Input() color1!: string;
  @Input() labelY1!: string;
  @Input() color2!: string;
  @Input() labelY2!: string;
  @Input() color3!: string;
  @Input() labelY3!: string;
  @Input() color4!: string;
  @Input() labelY4!: string;

  public chart: any;

  /*FunctionLegend(){
    //this.chart.data.datasets[0].hidden = false;
  }*/

  createChart() {
    this.chart = new Chart(this.code, {
      type: 'line',
      options: {
        scales: {
          x: {
            type: 'time',
            //parsing: false
          },
          y: {
              type: 'linear',
              position: 'left',
              stack: 'demo',
              stackWeight: 2,
          },
          y2: {
              type: 'category',
              labels: ['ON', 'OFF'],
              offset: true,
              position: 'left',
              stack: 'demo',
              stackWeight: 1,
          }
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          tooltip:{
            position: 'nearest',
          },
        },
      },
      data: {
        datasets: [
          {
            label: this.labelY1,
            data: [],
            fill: false,
            borderColor: this.color1,
            backgroundColor: this.color1,
            stepped: true,

            //pointRadius: 0,
            parsing: {
              xAxisKey: this.labelX,
              yAxisKey: this.labelY1,
            },
            yAxisID: 'y2',
          },
          {
            label: this.labelY2,
            data: [],
            fill: false,
            borderColor: this.color2,
            backgroundColor: this.color2,
            stepped: true,

            //pointRadius: 0,
            parsing: {
              xAxisKey: this.labelX,
              yAxisKey: this.labelY2,
            },
          },
          {
            label: this.labelY3,
            data: [],
            fill: false,
            borderColor: this.color3,
            backgroundColor: this.color3,
            stepped: true,

            //pointRadius: 0,
            parsing: {
              xAxisKey: this.labelX,
              yAxisKey: this.labelY3,
            },
          },
          {
            label: this.labelY4,
            data: [],
            fill: false,
            borderColor: this.color4,
            backgroundColor: this.color4,
            cubicInterpolationMode: 'monotone',

            //pointRadius: 0,
            parsing: {
              xAxisKey: this.labelX,
              yAxisKey: this.labelY4,
            },
            hidden: true,
          },
        ],
      },
    });
  }

  ngOnInit(): void {
    //this.createChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['dati'].currentValue != undefined) {
      if(FIRST){
        this.createChart();
        FIRST=false;
      }
      this.chart.data.datasets.forEach((datasets: any) => {
        datasets.data = this.dati;
      });
      this.chart.options.scales.x.min = this.dati[this.dati.length-1].x - 3600000;
      this.chart.update();
    }
  }

  decrease(){
    let datalog = this.chart.data.datasets[0].data;
    var i = (datalog[datalog.length-1].x - this.chart.options.scales.x.min)/5;
    this.chart.options.scales.x.min = this.chart.options.scales.x.min + i;
    this.chart.update();
  }

  increase(){
    let datalog = this.chart.data.datasets[0].data;
    var i = (datalog[datalog.length-1].x - this.chart.options.scales.x.min)/4;
    this.chart.options.scales.x.min = this.chart.options.scales.x.min - i;
    this.chart.update();
  }
}
