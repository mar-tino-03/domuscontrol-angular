import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { AuthService } from '../../shared/services/auth.service';
import { FirebaseService } from '../../shared/services/firebase.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { animate, style, transition, trigger } from '@angular/animations';
import { openMeteoService } from 'src/app/shared/services/open_meteo.service';
import { GetPrevPipe } from '../../pipe/get-prev.pipe';
import { GetHistoricalChartPipe } from '../../pipe/get-historical-chart.pipe';
import { ColumnChartComponent } from './column-chart/column-chart.component';
import { LineChartComponent } from './line-chart/line-chart.component';
import { ExplainingPanelComponent } from './explaining-panel/explaining-panel.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { CircularSliderComponent } from './circular-slider/circular-slider.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
declare var brain: any;

const fadeInWidth = trigger('fadeInWidth',[
  transition(':enter', [
    style({
      width: 0
    }),
    animate( '150ms linear',  style({
      width: '18px'
    }))
  ]),
  transition(':leave', [
    style({
      width: '18px'
    }),
    animate( '150ms linear',  style({
      width: 0
    }))
  ])
]);
/*
const fadeInOpacity = trigger('fadeInOpacity',[
  transition(':color', [
    style({
      opacity: 0
    }),
    animate( '0.6s linear',  style({
      opacity: 1
    }))
  ])
]);*/


@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    animations: [
        fadeInWidth,
        //fadeInOpacity,
        //fadeInOnEnterAnimation(),
    ],
    standalone: true,
    imports: [
        MatToolbarModule,
        NgIf,
        MatProgressBarModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatIconModule,
        MatMenuModule,
        MatButtonModule,
        CircularSliderComponent,
        FormsModule,
        MatExpansionModule,
        NgFor,
        ExplainingPanelComponent,
        LineChartComponent,
        ColumnChartComponent,
        GetHistoricalChartPipe,
        GetPrevPipe,
    ],
})
export class DashboardComponent implements OnInit {
  colorDefault = [ "#4dc9f6", "#f67019", "#f53794", "#ffce56", "#9966ff", "#4bc0c0" ];

  //termostato = {value: null, historical: null};
  historical!: {};
  datalog!: {};
  settings: any;
  brainlog: any;

  valueRange!: number;
  mod!: string;
  oldmod!: string;
  prev = 0;
  prog: any;
  InChart : any;
  InError: any;
  historicalChart: any;
  outDoor: any;

  openMeteo: any;

  dialogRef: any;
  spinner = 0;
  disabled=true;
  disabledGuage=true;


  constructor(
    private meta: Meta,
    public authService: AuthService,
    public firebaseService: FirebaseService,
    public openMeteoService: openMeteoService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void{
    this.meta.removeTag('name=description');
    this.meta.removeTag('name=keywords');
    this.meta.addTags([
      { name: 'description', content: 'Manage and control home thermostat from your smartphone' },
      { name: 'keywords', content: 'domuscontrol, dashboard' }
    ]);

    if (!navigator.onLine)
      this.offlineEvent({type: "offline"});

    this.openMeteoService.getDatiDay()
    .subscribe({
      next: (data:any)=>{
        this.openMeteo = data;
      },
      error: () => {
        console.log("Api-meteo not work");
      }
    });


    this.firebaseService.onChange().subscribe({
      next: (termostato: any) => {

        if(true)
          this.historical = termostato.historical;
        if(true)
          this.datalog = termostato.value.datalog;
        if(true)
          this.settings = termostato.value.settings;
        if(true)
          this.brainlog = termostato.brainlog;

        this.disabled = false;
        this.disabledGuage = false;
        this._snackBar.dismiss();
        if(this.settings != null && this.datalog != null){
          setTemp(this, this.settings.temp, this.settings.mod, termostato.value.datalog);
          setMod(this, this.settings.mod);
          setProg(this, this.settings.programmazione);
          this.prev = calcPrev(this.brainlog, this.datalog, this.openMeteo);
          setSpinner(this, this.settings.timestamp, termostato.value.datalog);
          this.InError = setError(this.datalog);
          this.InChart = setDatalog(this.openMeteo, this.datalog);
          //this.historicalChart = setHistorical(termostato.historical);
          this.outDoor = getOpenMeteo(this.openMeteo, new Date());
        }
      },
      error: (e) => {
        this.disabled = true;
        this.disabledGuage = true;
        setSpinner(this, 0, null);
        this._snackBar.openFromComponent(snackPermition);
      }
    });

    this.firebaseService.checkQueue().subscribe({
      next: (line: any) => {
        console.log("you are admin")
        if(line != undefined)
          this._snackBar.openFromComponent(snackAccept, { data: line });
      },
      error: () => {
        //console.log("no admin")
      }
    });
  }

  changeTmp(){
    this.firebaseService.setTmp(this.valueRange);
  }

  changeChip(select: string){
    if(select && select != this.oldmod)
      this.oldmod = this.firebaseService.setMod(select);
  }

  openDialog(data: any){
    this.dialogRef = this.dialog.open(DialogAnimationsExampleDialog, {
      width: '270px',
      data: data
    });

    this.dialogRef.afterClosed().subscribe((result: any) => {
      if(result != null && result.ora != null && result.temp != null){
        result.ora = time_tino(result.ora);
        this.firebaseService.setProg(result);
      }
    });
  }

  @HostListener("window:online", ["$event"])
  onlineEvent(event: any) {
    if (event.type == "online") {
      console.log("ora online");
      this.disabled = false;
      this.disabledGuage = false;
      this.ngOnInit();
      this._snackBar.dismiss();
    }
  }
  @HostListener("window:offline", ["$event"])
  offlineEvent(event: any) {
    if (event.type == "offline") {
      console.log("ora offline");
      this.disabled = true;
      this.disabledGuage = true;
      try{
        this.dialogRef.close();
      }catch (error) {}
      this._snackBar.openFromComponent(snackOffline);
    }
  }

  SignOut(){
    this.firebaseService.delateValueChanges();
    this.authService.SignOut();
    this._snackBar.dismiss();
  }


  time_tino(e:any){ return time_tino(e) }
  tino_time(e:any){ return tino_time(e) }
}

/*  DIALOG  */

@Component({
  selector: 'dialog-animations-example-dialog',
  styleUrls: ['dialog/dialog-programmazione.css'],
  templateUrl: 'dialog/dialog-programmazione.html',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    NgIf,
    MatDialogModule,
    MatIconModule,
  ],
})
export class DialogAnimationsExampleDialog {
  ora!: string; temp!: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DialogAnimationsExampleDialog>) {
      if(data != null && data.ora != null)
        this.ora = tino_time(data.ora)
      if(data != null && data.temp != null)
        this.temp = data.temp
    }
}

/*  OFFLINE  */

@Component({
  selector: 'snack-offline',
  templateUrl: 'snack/snack-offline.html',
  standalone: true,
  styleUrls: ['snack/snack.css'],
  imports: [MatButtonModule, MatSnackBarModule],
})
export class snackOffline {
}

/*  PERMITION  */

@Component({
  selector: 'snack-permition',
  templateUrl: 'snack/snack-permition.html',
  standalone: true,
  styleUrls:  ['snack/snack.css'],
  imports: [MatButtonModule, MatSnackBarModule],
})
export class snackPermition {
  constructor(
    public authService: AuthService,
    public firebaseService: FirebaseService,
    private _snackBar: MatSnackBar
  ) {}
  request(){
    this.firebaseService.reqPermition(this.authService.userLoggedIn);
    this._snackBar.dismiss();
    this._snackBar.openFromComponent(snackQueue, { });
  }
}

/*  LINEEE  */

@Component({
  selector: 'snack-queue',
  templateUrl: 'snack/snack-queue.html',
  standalone: true,
  styleUrls:  ['snack/snack.css'],
  imports: [MatButtonModule, MatSnackBarModule],
})
export class snackQueue {
  constructor(
    public firebaseService: FirebaseService,
  ) {}
  ngOnInit(){
    this.firebaseService.delateValueChanges();
    setInterval((e:any)=>{
      this.firebaseService.onChange().subscribe(
        (termostato: any) => {
          window.location.reload();
        },
        error => {
          console.log("error");
        }
      );
    }, 2000)
  }
}

/*  ACCEPT  */

@Component({
  selector: 'snack-accept',
  templateUrl: 'snack/snack-accept.html',
  standalone: true,
  styleUrls:  ['snack/snack.css'],
  imports: [MatButtonModule, MatSnackBarModule],
})
export class snackAccept {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: any,
    public firebaseService: FirebaseService,
    private _snackBar: MatSnackBar,
  ) {}
  name(){
    return this.data.name != undefined ? this.data.name : this.data.email;
  }
  accept(){
    this.firebaseService.accPermition(this.data.id);
    this._snackBar.dismiss();
  }
}

var k: any[];

function setTemp(t: any, temp: number, mod: string, data: any) {
  if(mod == "auto"){
    k = Object.keys(data);
    t.valueRange = data[k[k.length-1]].des;
  }
  else if(mod == "manual")
    t.valueRange = temp;
  else if(mod == "off")
    t.valueRange = 0;
}

function setMod(t: any, mod: string) {
  t.oldmod = t.mod;
  t.mod = mod;
  if(mod == "auto")
    t.disabledGuage = true
  else if(mod == "manual")
    t.disabledGuage = false
  else if(mod == "off")
    t.disabledGuage = true
}

function setProg(t: any, prog: any) {

  t.prog = Object.keys(prog).map((ora:any)=>{
    return{
      ora: tino_time(Number(ora)),
      temp: prog[ora].tmp
    }
  })
}

function setSpinner(t: any, time: number, data: any) {
  try {
    k = Object.keys(data);
    if(time < data[k[k.length-1]].timestamp)
      t.spinner = 2;
    else
      t.spinner = 1;
  } catch (error) {
      t.spinner = 4;
  }
}

function setDatalog(meteo: any, data: any) {

  k = Object.keys(data);
  var tempOut;
  return k.map((elem: any)=>{
    tempOut = getOpenMeteo(meteo, new Date(data[elem].timestamp));
    return {
      x: data[elem].timestamp,
      rele: data[elem].rele ? "ON" : "OFF",
      tmp:  data[elem].tmp,
      des:  data[elem].des==-100 ? null : data[elem].des,
      hum:  data[elem].hum,
      tmpOut: tempOut!=null && tempOut[0]!=null ? tempOut[0].value : null,

    };
  })
}

function setError(data: any) {

  k = Object.keys(data);
  var array=[];
  var i=k.length-1;
  var count=0;
  var type;
  while(i >= 0){
    if(data[k[i]].msg != null){
      switch (data[k[i]].msg) {
        case "External System":
          type = "Reset";
          break;
        case "Software/System restart":
          type = "Reset";
          break;
        case "Wifi Connect":
          type = "Wifi";
          break;
        default:
          type = "Error";
          break;
      }
      array.push({
        id: data[k[i]].LocalTime,
        msg: data[k[i]].msg,
        type: type,
        data_long: new Date(data[k[i]].timestamp).toLocaleString(),
        data_short: new Date(data[k[i]].timestamp).toLocaleDateString(),
      });
      count++;
    }
    if(count>=4)
      return array;
    i--;
  }
  if(array.length == 0)
    return null;
  return array;
}
/*
function setHistorical(data: any){

  var date = Object.keys(data);
  var chart = data;

  for (let i = 0; i < date.length; i++) {
    var k = Object.keys(data[date[i]]);
    var h: Date;
    chart[date[i]] = k.map((elem: any)=>{
      h = new Date(Number(elem))
      return JSON.parse(`{
        "x": ${h.getMonth() > 6 ? h.setFullYear(1970) : h.setFullYear(1971)},
        "${date[i]}": ${data[date[i]][elem][date[i]] / 864000}
      }`)
    });
  }
  return chart;
}*/

function getOpenMeteo(data: any, time: Date) : any {

  var dati=[];
  if(data==null || data.hourly==null)
    return null;

  var i=0, j=null, k: any;
  for(i=0; i<data.hourly.time.length; i++){
    k = new Date(data.hourly.time[i]);
    if(time.getTime() - 1800000 < k.getTime() && k.getTime() < time.getTime() + 1800000){
      j = i;
      break;
    }
  }
  if(j == null)
    return null;

  dati.push({
    type: "temp",
    valuePath: data.hourly.temperature_2m[i] + data.hourly_units.temperature_2m,
    value: data.hourly.temperature_2m[i],
    date: new Date(data.hourly.time[i]).toLocaleString(),
  })
  dati.push({
    type: "hum",
    valuePath: data.hourly.relativehumidity_2m[i] + data.hourly_units.relativehumidity_2m,
    value: data.hourly.relativehumidity_2m[i]
  })
  dati.push({
    type: "pres",
    valuePath: data.hourly.surface_pressure[i] + data.hourly_units.surface_pressure,
    value: data.hourly.surface_pressure[i]
  })
  dati.push({
    type: "wind",
    valuePath: data.hourly.windspeed_10m[i] + data.hourly_units.windspeed_10m,
    value: data.hourly.windspeed_10m[i],
  })
  return dati;
}

function calcPrev(brainlog: any, datalog: any, meteo:any): number{
  var k = Object.keys(datalog);
  if(datalog[k[k.length-1]].rele == 0)
    return 0;

  var tempOut = getOpenMeteo(meteo, new Date())[0].value;
  var windOut = getOpenMeteo(meteo, new Date())[3].value;
  var param = {
    "Temp Inizio (°C)":   (datalog[k[k.length-1]].tmp) / brainlog.INPUTFACTOR,
    "Temp Fine (°C)":     (datalog[k[k.length-1]].des+0.5) / brainlog.INPUTFACTOR,
    "Temp Esterna (°C)":  (tempOut>0 ? tempOut : 0) / brainlog.INPUTFACTOR,
    "Vento (km/h)":       (windOut>0 ? windOut : 0) / brainlog.INPUTFACTOR
  }

  /*param = {
    "Temp Inizio (°C)":   21 /brainlog.INPUTFACTOR ,
    "Temp Fine (°C)":     22 /brainlog.INPUTFACTOR ,
    "Temp Esterna (°C)":  getOpenMeteo(meteo, new Date())[0].value /brainlog.INPUTFACTOR ,
    "Vento (km/h)":       getOpenMeteo(meteo, new Date())[3].value /brainlog.INPUTFACTOR
  }*/
  try {

    const net = new brain.NeuralNetwork();
    net.fromJSON(JSON.parse(brainlog.json));
    //console.log(param, net.run(param)["Tempo Impiegato (min)"])
    return Number((net.run(param)["Tempo Impiegato (min)"]*brainlog.OUTPUTFACTOR).toFixed(0));
  } catch (error) {
    console.error("rete neurale non corretta!");
    return 0;
  }

}


function time_tino(ora: any): number{
  if(ora == null) return -1;
  const arr = ora.split(":");
  console.log(arr[0] , arr[1]);
  return Number(arr[0]*3600) + Number(arr[1]*60);
}

function tino_time(time: number): string{
  if(time == null) return '00:00';
  const ora = String(Math.trunc(time / 3600)).padStart(2, '0');
  const min = String((time / 60) % 60).padStart(2, '0');
  return ora + ':' + min;
}
