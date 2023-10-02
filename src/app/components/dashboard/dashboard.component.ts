import { Component, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { AuthService } from '../../shared/services/auth.service';
import { FirebaseService } from '../../shared/services/firebase.service';
import { MatTable } from '@angular/material/table';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { TinotinoService } from 'src/app/shared/services/tinotino.service';
import { animate, animation, style, transition, trigger } from '@angular/animations';


export interface progg {ora: number, temp: number}
const ELEMENT_DATA: progg[] = [];

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
})
export class DashboardComponent implements OnInit {
  valueRange!: number;
  mod!: string;
  oldmod!: string;
  prog: any;

  /*displayedColumns: string[] = ['Time', 'Temp','star'];
  dataSource = [...ELEMENT_DATA];
  @ViewChild(MatTable) table!: MatTable<progg>;*/

  dialogRef: any;
  InChart : any;
  OutChart: any;
  historicalChart: any;
  lastDate!: any;
  spinner = 0;
  disabled=true;
  disabledGuage=true;


  constructor(
    private meta: Meta,
    public authService: AuthService,
    public firebaseService: FirebaseService,
    public tinotinoService: TinotinoService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
  ) {}

  ngOnInit(){
    this.meta.removeTag('name=description');
    this.meta.removeTag('name=keywords');
    this.meta.addTags([
      { name: 'description', content: 'Manage and control home thermostat from your smartphone' },
      { name: 'keywords', content: 'domuscontrol, dashboard' }
    ]);

    if (!navigator.onLine)
      this.offlineEvent({type: "offline"});

    this.firebaseService.onChange().subscribe(
      (termostato: any) => {
        this.disabled = false;
        this.disabledGuage = false;
        this._snackBar.dismiss();
        var set = termostato.value.settings;

        setTemp(this, set.temp, set.mod, termostato.value.datalog);
        setMod(this, set.mod);
        setProg(this, set.programmazione);
        setSpinner(this, set.timestamp, termostato.value.datalog);
        this.InChart = setDatalog(termostato.value.datalog);
        this.historicalChart = setHistorical(termostato.historical)
      },
      error => {
        //console.log("no permition")
        this.disabled = true;
        this.disabledGuage = true;
        setSpinner(this, 0, null);
        this._snackBar.openFromComponent(snackPermition);
      }
    );

    this.firebaseService.checkQueue().subscribe(
      (line: any) => {
        console.log("you are admin")
        if(line != undefined)
          this._snackBar.openFromComponent(snackAccept, { data: line });
      },
      error => {
        //console.log("no admin")
      }
    );

    setOutdoor(this, 86400);
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
      this.dialogRef.close();
      this._snackBar.openFromComponent(snackOffline);
    }
  }
  @HostListener("window:", )

  SignOut(){
    this.firebaseService.delateValueChanges();
    this.authService.SignOut();
    this._snackBar.dismiss();
  }


  time_tino(e:any){ return time_tino(e) }
  tino_time(e:any){ return tino_time(e) }
  setOutdoor(n:number){ setOutdoor(this, n) }
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
  /*if(prog != null){
    t.dataSource = [...ELEMENT_DATA];
    for (let ora in prog) {
      t.dataSource.push({
        ora: tino_time(Number(ora)),
        temp: prog[ora].tmp
      });
    }
    t.table.renderRows();
  }*/
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

function setDatalog(data: any) {

  k = Object.keys(data);
  return k.map((elem: any)=>{
    return {
      x: data[elem].timestamp,
      tmp:  data[elem].tmp,
      hum:  data[elem].hum,
      des:  data[elem].des==-100 ? null : data[elem].des,
      rele: data[elem].rele ? 'ON' : 'OFF',
    };
  })
}

function setHistorical(data: any){

  var date = Object.keys(data);

  for (let i = 0; i < date.length; i++) {
    var k = Object.keys(data[date[i]]);
    var h: Date;
    data[date[i]] = k.map((elem: any)=>{
      h = new Date(Number(elem))
      return JSON.parse(`{
        "x": ${h.getMonth() > 6 ? h.setFullYear(1970) : h.setFullYear(1971)},
        "${date[i]}": ${data[date[i]][elem][date[i]] / 864000}
      }`)
    });
  }
  return data;
}

function setOutdoor(t:any, length: number) {
  t.tinotinoService.getDati(length).subscribe((dati: any) => {
    t.OutChart = Object.keys(dati).map((dato: any) => {
      dati[dato].data = new Date(dati[dato].data).getTime();
      dati[dato].tmp = parseFloat(dati[dato].tmp);
      dati[dato].hum = parseFloat(dati[dato].hum);
      dati[dato].pres= parseFloat(dati[dato].pres);
      dati[dato].bat = parseFloat(dati[dato].bat);
      return dati[dato];
    });
    t.lastDate = new Date(t.OutChart[t.OutChart.length - 1].data).toLocaleString();
  });
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
