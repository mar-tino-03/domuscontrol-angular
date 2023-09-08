import { Component, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { AuthService } from '../../shared/services/auth.service';
import { FirebaseService } from '../../shared/services/firebase.service';
import { MatTable } from '@angular/material/table';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { fadeInOnEnterAnimation, fadeOutOnLeaveAnimation } from 'angular-animations';
import { MatChipListboxChange } from '@angular/material/chips';


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
  mod!: string;
  oldmod!: string;
  displayedColumns: string[] = ['Time', 'Temp','star'];
  dataSource = [...ELEMENT_DATA];
  @ViewChild(MatTable) table!: MatTable<progg>;
  datiChart : any;
  spinner = 0;
  disabled=true;
  disabledGuage=true;

  constructor(
    private meta: Meta,
    public authService: AuthService,
    public firebaseService: FirebaseService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
  ) {}

  ngOnInit(){
    if (!navigator.onLine)
      this.offlineEvent({type: "offline"});

    this.meta.removeTag('name=description');
    this.meta.removeTag('name=keywords');
    this.meta.addTags([
      { name: 'description', content: 'Manage and control home thermostat from your smartphone' },
      { name: 'keywords', content: 'domuscontrol, dashboard' }
    ]);

    this.firebaseService.onChange().subscribe(
      (termostato: any) => {
        this.disabled = false;
        this.disabledGuage = false;
        this._snackBar.dismiss();

        setTemp(this, termostato.settings.temp, termostato.settings.mod, termostato.datalog);
        setMod(this, termostato.settings.mod);
        setProg(this, termostato.settings.programmazione);
        setSpinner(this, termostato.settings.timestamp, termostato.datalog);
        this.datiChart = setDatalog(this, termostato.datalog);
      },
      error => {
        //console.log("no permition")
        this.disabled = true;
        this.disabledGuage = true;
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

  changeChip(changes: MatChipListboxChange){
    console.log(changes);
    if(changes.value && changes.value != this.oldmod)
      this.oldmod = this.firebaseService.setMod(changes.value);
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

  if(prog != null){
    t.dataSource = [...ELEMENT_DATA];
    for (let ora in prog) {
      t.dataSource.push({
        ora: tino_time(Number(ora)),
        temp: prog[ora].tmp
      });
    }
    t.table.renderRows();
  }
}


function setSpinner(t: any, time: number, data: any) {
  k = Object.keys(data);
  if(time < data[k[k.length-1]].timestamp)
    t.spinner = 2;
  else
    t.spinner = 1;
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
  return Number(arr[0]*3600) + Number(arr[1]*60);
}

function tino_time(time: number): string{
  if(time == null) return '00:00';
  const ora = String(Math.trunc(time / 3600)).padStart(2, '0');
  const min = String((time / 60) % 60).padStart(2, '0');
  return ora + ':' + min;
}
