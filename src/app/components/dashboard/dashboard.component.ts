import { Component, HostListener, Inject, Input, OnInit, ViewChild, inject } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { FirebaseService } from '../../shared/services/firebase.service';
import { MatTable } from '@angular/material/table';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {MatSnackBar, MatSnackBarModule, MAT_SNACK_BAR_DATA} from '@angular/material/snack-bar';
import { fadeInOnEnterAnimation, fadeOutOnLeaveAnimation } from 'angular-animations';
import { MatTooltipModule } from '@angular/material/tooltip';


export interface progg {ora: number, temp: number}
const ELEMENT_DATA: progg[] = [];


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [
    fadeInOnEnterAnimation(),
  ],
})
export class DashboardComponent implements OnInit {
  valueRange!: number;
  auto=false; manual=false; off=false;
  displayedColumns: string[] = ['ora', 'temp','star'];
  dataSource = [...ELEMENT_DATA];
  @ViewChild(MatTable) table!: MatTable<progg>;
  datiChart : any;
  spinner=true;
  disabled=false;

  constructor(
    public authService: AuthService,
    public firebaseService: FirebaseService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
  ) {}

  ngOnInit(){
    if (!navigator.onLine)
      this.offlineEvent({type: "offline"});

    this.firebaseService.onChange().subscribe(
      (termostato: any) => {
        this.valueRange = termostato.settings.temp;
        setChip(this, termostato.settings.mod);
        setProg(this, termostato.settings.programmazione);
        setSpinner(this, termostato.settings.timestamp, termostato.datalog);
        this.datiChart = setDatalog(this, termostato.datalog);

        this.disabled = false;
        this._snackBar.dismiss();
      },
      error => {
        //console.log("no permition")
        this.disabled = true;
        this._snackBar.openFromComponent(snackPermition, {/*duration: this.durationInSeconds * 1000,*/});
      }
    );

    this.firebaseService.checkLine().subscribe(
      (line: any) => {
        console.log("you are admin")
        if(line != undefined)
          this._snackBar.openFromComponent(snackAccept, { data: line });
      },
      error => {
        //console.log("no admin")
      }
    )
  }

  changeTmp(){
    this.firebaseService.setTmp(this.valueRange);
  }

  changeChip(mod: string){
    this.firebaseService.setMod(mod);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAnimationsExampleDialog, {
      width: '270px',
    });

    dialogRef.afterClosed().subscribe(result => {
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
      this.ngOnInit();
      this._snackBar.dismiss();
    }
  }
  @HostListener("window:offline", ["$event"])
  offlineEvent(event: any) {
    if (event.type == "offline") {
      console.log("ora offline");
      this.disabled = true;
      this._snackBar.openFromComponent(snackOffline, {/*duration: this.durationInSeconds * 1000,*/});
    }
  }

  SignOut(){
    this.firebaseService.delateValueChanges();
    this.authService.SignOut();
    this._snackBar.dismiss();
  }


  time_tino(e:any){ return time_tino(e); }
}

/*  Dialog  */

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
  constructor(public dialogRef: MatDialogRef<DialogAnimationsExampleDialog>) {}
  ora!: number; temp!: number;
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
  reload(){
    window.location.reload()
  }
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
    this._snackBar.openFromComponent(snackLine, { });
  }
}

/*  LINEEE  */

@Component({
  selector: 'snack-line',
  templateUrl: 'snack/snack-line.html',
  standalone: true,
  styleUrls:  ['snack/snack.css'],
  imports: [MatButtonModule, MatSnackBarModule],
})
export class snackLine {
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

function setChip(t: any, mod: string) {
  switch(mod){
    case 'auto':
      t.auto = true; t.manual = false; t.off = false;
    break;
    case 'manual':
      t.auto = false; t.manual = true; t.off = false;
    break;
    case 'off':
      t.auto = false; t.manual = false; t.off = true;
    break;
    default:
      t.auto = false; t.manual = false; t.off = false;
  }
}

function setProg(t: any, prog: any) {

  if(prog != null){
    t.dataSource = [...ELEMENT_DATA];
    for (let ora in prog) {
      t.dataSource.push({
        ora: tino_time(Number(ora)),
        temp: prog[ora].temp
      });
    }
    t.table.renderRows();
  }
}

var k: any[];
function setSpinner(t: any, time: number, data: any) {
  k = Object.keys(data);
  if(time < data[k[k.length-1]].timestamp)
    t.spinner = false;
  else
    t.spinner = true;
}

function setDatalog(t: any, data: any) {

  k = Object.keys(data);
  return k.map((elem: any)=>{
    return {
      x: data[elem].timestamp,
      tmp:  data[elem].tmp,
      hum:  data[elem].hum,
      des:  data[elem].des==-100 ? null : data[elem].des,
      rele: data[elem].rele,
    };
  })
}

function time_tino(ora: any): number{
  if(ora == null) return -1;
  const arr = ora.split(":");
  console.log(arr[0] , arr[1]);
  return Number(arr[0]*60) + Number(arr[1]);
}

function tino_time(time: number): string{
  if(time == null) return '00:00';
  const ora = String(Math.trunc(time / 60)).padStart(2, '0');
  const min = String(time % 60).padStart(2, '0');
  return ora + ':' + min;
}
