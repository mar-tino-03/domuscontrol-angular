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
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Legend,
  Tooltip,
);

var mounthBold: any[] = [];
var FIRST = true;
var i: number, j: number, date: String[];
var yAxisID: string, hidden:boolean, stepped:boolean;

@Component({
    selector: 'app-line-chart',
    templateUrl: './line-chart.component.html',
    styleUrls: ['./line-chart.component.css'],
    standalone: true,
    imports: [
        MatButtonModule,
        MatTooltipModule,
        MatIconModule,
    ],
})
export class LineChartComponent implements OnChanges {
  @Input() dati: any;
  @Input() code!: string;
  @Input() labelX!: string;
  @Input() disabled!: boolean;
  @Input() color!: string[];

  public chart: any;

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
              stack: 'first',
              stackWeight: 2,
          },
          yBool: {
              type: "category",
              labels: ['ON', 'OFF'],
              offset: true,
              position: 'left',
              stack: 'first',
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
          /*{
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
          {
            label: this.labelY5,
            data: [],
            fill: false,
            borderColor: this.color5,
            backgroundColor: this.color5,
            cubicInterpolationMode: 'monotone',

            //pointRadius: 0,
            parsing: {
              xAxisKey: this.labelX,
              yAxisKey: this.labelY5,
            },
            hidden: true,
          },*/
        ],
      },
    });
  }

  ngOnInit(): void {
    FIRST = true;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['dati'] != undefined && changes['dati'].currentValue != undefined) {
      if(FIRST){
        this.createChart();
        addData(this);
        this.chart.options.scales.x.min = this.dati[this.dati.length-1].x - 3600000;
        FIRST=false;
      }
      else{
        aggData(this);
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


function addData(t: any) {
  i=0, j=0;
  var legend = Object.keys(t.dati[0]);
  var datiSpecifici: any;

  //console.log(legend);

  legend.forEach((l: any) => {
    if(l != t.labelX){
      datiSpecifici=[];
      for(j=0; j<t.dati.length; j++){
        datiSpecifici.push(JSON.parse(`{
          "x" : ${t.dati[j][t.labelX]},
          "${l}" : ${typeof(t.dati[j][l])=="string" ? '"'+t.dati[j][l]+'"' : t.dati[j][l]}
        }`));
      }

      if(l=="rele") yAxisID = "yBool";
      else          yAxisID = "y";
      if(l=="hum" || l=="tmpOut") hidden = true ;
      else                        hidden = false;
      if(l!="hum" && l!="tmpOut") stepped = true;
      else                        stepped = false;

      t.chart.data.datasets.push({
        label: l,
        data:  datiSpecifici,
        borderColor: t.color[i],
        backgroundColor: t.color[i],
        yAxisID: yAxisID,
        hidden: hidden,
        stepped: stepped,
        cubicInterpolationMode: !stepped ? 'monotone': '',

        parsing: {
          xAxisKey: t.labelX,
          yAxisKey: l,
        }
      })
      i++;
    }
  });
}

function aggData(t: any) {
  i=0, j=0;
  var legend = Object.keys(t.dati[0]);
  var datiSpecifici: any;

  legend.forEach((l: any) => {
    if(l != t.labelX){
      datiSpecifici=[];
      for(j=0; j<t.dati.length; j++){
        datiSpecifici.push(JSON.parse(`{
          "x" : ${t.dati[j][t.labelX]},
          "${l}" : ${typeof(t.dati[j][l])=="string" ? '"'+t.dati[j][l]+'"' : t.dati[j][l]}
        }`));
      }

      t.chart.data.datasets.forEach((d:any)=>{
        if(d.label == l)
          d.data = datiSpecifici;
      })
      i++;
    }
  });
}
