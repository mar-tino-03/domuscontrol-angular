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
} from 'chart.js'

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Legend,
  Tooltip,
);


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
  @Input() typeAxisY1: any
  @Input() color2!: string;
  @Input() labelY2!: string;
  @Input() color3!: string;
  @Input() labelY3!: string;
  @Input() color4!: string;
  @Input() labelY4!: string;

  public chart: any;
  FIRST = true;

  /*FunctionLegend(){
    //this.chart.data.datasets[0].hidden = false;
  }*/

  createChart() {
    this.chart = new Chart(this.code, {
      type: 'line',
      options: {
        normalized: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            ticks: {
              maxRotation: 0,
            }
          },
          y: {
              type: 'linear',
              position: 'left',
              stack: 'demo',
              stackWeight: 2,
          },
          yBool: {
              type: this.typeAxisY1,
              labels: ['ON', 'OFF'],
              offset: true,
              position: 'left',
              stack: 'demo',
              stackWeight: 1,
          }
        },
        parsing: false,
        interaction: {
          mode: 'nearest',
          axis: 'x',
          //mode: 'index',
          intersect: false,
        },
        plugins: {
          tooltip:{
            position: 'nearest',
            callbacks: {
              label: function(tooltipItems: any) {
                  if(tooltipItems.dataset.label == "rele")
                    return tooltipItems.formattedValue;
                  if(tooltipItems.dataset.label == "hum")
                    return tooltipItems.formattedValue + ' %';
                  return tooltipItems.formattedValue + ' °C';
              }
            }
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
            yAxisID: "yBool",
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
    if (changes['dati'] != undefined && changes['dati'].currentValue != undefined) {
      if(this.FIRST){
        this.createChart();
        this.chart.data.datasets.forEach((datasets: any) => {
          datasets.data = this.dati;
        });
        this.chart.options.scales.x.min = this.dati[this.dati.length-1].x - 3600000;
        this.FIRST=false;
      }
      else{
        this.chart.data.datasets.forEach((datasets: any) => {
          datasets.data = this.dati;
        });
      }
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
    if(this.chart.data.datasets[0].data[0].x < this.chart.options.scales.x.min - i){
      this.chart.options.scales.x.min = this.chart.options.scales.x.min - i;
      this.chart.update();
    }else{
      this.chart.options.scales.x.min = this.chart.data.datasets[0].data[0].x;
      this.chart.update();
    }
  }
}
