import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Chart, ChartDataset } from 'chart.js';
import 'chartjs-adapter-date-fns';
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

Chart.register(
  BarController,
  BarElement,
  PointElement,
  CategoryScale,
  TimeScale,
  Legend,
  Tooltip,
);

var mounthBold: any[] = [];
var FIRST = true;
var i: number, date: String[];

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
  @Input() color!: String[];

  public chart: any;

  createChart() {
    this.chart = new Chart(this.code, {
      type: 'bar',
      options:{
        normalized: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'week',
              displayFormats: {
                week: 'dd MMM'
              }
            },
            ticks: {
              //autoSkip: true,
              source: 'auto',
              maxRotation: 0,
              font: function(context: any) {
                if(context && context.index == 0)
                  mounthBold = [];
                if(context && !mounthBold.includes(context.tick.label.split(' ')[1])/*&& Number(context.tick.label.split(' ')[0]) <= 7*/) {
                  mounthBold.push(context.tick.label.split(' ')[1]);
                  return {
                    weight: 'bold',
                  };
                }
                return {}
              }
            }
            //stacked: true,
          },
          y: {
            type: 'linear',
            position: 'left',
            //stacked: true,
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
              title(tooltipItems: any) {
                return tooltipItems[0].label.split(",")[0];
              },
              label(tooltipItems) {
                return tooltipItems.formattedValue + ' %';
              }
            }
          },
        },
        //responsive: true,
      },

      data: {
        datasets: [],
      },
    });
  }

  ngOnInit(): void {
    $(".chart-container").animate({scrollLeft: ( $(".container").width() - $(".chart-container").width() ) / 2}, 0);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['dati'] != undefined && changes['dati'].currentValue != undefined) {
      if(FIRST){
        this.createChart();
        addData(this);
        FIRST=false;
      }else{
        aggData(this);
      }
      this.chart.update();
    }
  }
}

function addData(t: any) {
  i=0;
  date = Object.keys(t.dati);

  date.forEach((d: any) => {
    t.chart.data.datasets.push({
      label: d,
      data:  t.dati[String(date[i])],
      borderColor: t.color[i],
      backgroundColor: t.color[i],
      //categoryPercentage: 1.0,
      //barPercentage: 0.5,

      parsing: {
        xAxisKey: t.labelX,
        yAxisKey: d,
      }
    })
    i++;
  });
}

function aggData(t: any) {
  i=0;
  date = Object.keys(t.dati);

  date.forEach((l: any) => {
    t.chart.data.datasets.forEach((d:any)=>{
      if(d.label == l)
        d.data = t.dati[l];
    })
    i++;
  });
}
