import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Chart, ChartDataset } from 'chart.js';
//import 'ng2-charts';
import 'chartjs-adapter-date-fns';
//import 'luxon';
//import 'chartjs-adapter-luxon';
//import 'chartjs-adapter-moment';
declare var $:any;

import {
  BarController,
  BarElement,
  CategoryScale,
  PointElement,
  TimeScale,
  Legend,
  Tooltip,
} from 'chart.js'
import { query } from '@angular/animations';

Chart.register(
  BarController,
  BarElement,
  PointElement,
  CategoryScale,
  TimeScale,
  Legend,
  Tooltip,
);

@Component({
  selector: 'app-column-chart',
  templateUrl: './column-chart.component.html',
  styleUrls: ['./column-chart.component.css']
})
export class ColumnChartComponent implements OnInit{
  @Input() dati: any;
  @Input() code!: string;
  @Input() labelX!: string;
  @Input() disabled!: boolean;
  @Input() color1!: string;
  @Input() labelY1!: string;
  @Input() color2!: string;
  @Input() labelY2!: string;

  public chart: any;
  FIRST = true;

  createChart() {
    this.chart = new Chart(this.code, {
      type: 'bar',
      options: {
        normalized: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            stacked: true,
            time: {
              unit: 'week',
              displayFormats: {
                week: 'dd MMM'
              }
            },
            ticks: {
              autoSkip: true,
              //source: 'auto',
              maxRotation: 0,
              font: function(context: any) {
                if (context.tick && Number(context.tick.label.split(' ')[0]) <= 7) {
                  return {
                    weight: 'bold',
                  };
                }
                return {}
              }
            }
          },
          y: {
              type: 'linear',
              position: 'left',
              stacked: true,
          }
        },
        parsing: false,
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
        plugins: {
          tooltip:{
            position: 'nearest',
            callbacks: {
              label: function(tooltipItems: any) {
                return tooltipItems.formattedValue + ' %';
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
            borderColor: this.color1,
            backgroundColor: this.color1,

            parsing: {
              xAxisKey: this.labelX,
              yAxisKey: this.labelY1,
            },
          },
          {
            label: this.labelY2,
            data: [],
            borderColor: this.color2,
            backgroundColor: this.color2,

            parsing: {
              xAxisKey: this.labelX,
              yAxisKey: this.labelY2,
            },
          },
        ],
      },
    });
  }

  ngOnInit(): void {
    $(".chart-container").animate({scrollLeft: ( $(".container").width() - $(".chart-container").width() ) / 2}, 400);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['dati'] != undefined && changes['dati'].currentValue != undefined) {
      if(this.FIRST){
        this.createChart();
        var i=0;
        var date = Object.keys(this.dati);

        this.chart.data.datasets.forEach((datasets: any) => {
          datasets.data = this.dati[date[i]];
          i++
        });
        this.FIRST=false;
      }
      else{
        var i=0;
        var date = Object.keys(this.dati);
        this.chart.data.datasets.forEach((datasets: any) => {
          datasets.data = this.dati[date[i]];
          i++
        });
      }
      this.chart.update();
    }
  }
}
