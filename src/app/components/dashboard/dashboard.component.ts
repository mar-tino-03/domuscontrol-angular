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
import {MatSnackBar, MatSnackBarRef, MatSnackBarModule, MAT_SNACK_BAR_DATA} from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

export interface progg {ora: number, temp: number}
const ELEMENT_DATA: progg[] = [];


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  valueRange!: number;
  auto=false; manual=false; off=false;
  displayedColumns: string[] = ['ora', 'temp','star'];
  dataSource = [...ELEMENT_DATA];
  @ViewChild(MatTable) table!: MatTable<progg>;
  disabled=false;

  constructor(
    public authService: AuthService,
    public firebaseService: FirebaseService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(){
    this.firebaseService.onChange().subscribe(
      (termostato: any) => {
        this.valueRange = termostato.temp;
        setChip(this, termostato.mod);
        setProg(this, termostato.programmazione);
        console.log(termostato);
        this.disabled = false;
        this._snackBar.dismiss();
      },
      error => {
        console.log(error)
        this.disabled = true;
        this._snackBar.openFromComponent(snackPermition, {/*duration: this.durationInSeconds * 1000,*/});
      }
    );

    this.firebaseService.checkLine().subscribe(
      (line: any) => {
        if(line != undefined)
          this._snackBar.openFromComponent(snackAccept, { data: line });
      },
      error => {
        console.log("no admin")
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
      width: '250px',
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
  styleUrls: ['dialog-programmazione.css'],
  templateUrl: 'dialog-programmazione.html',
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
  snackBarRef = inject(MatSnackBarRef);
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
  snackBarRef = inject(MatSnackBarRef);
  constructor(
    public authService: AuthService,
    public firebaseService: FirebaseService,
    private _snackBar: MatSnackBar
  ) {}
  request(){
    this.firebaseService.reqPermition(this.authService.userLoggedIn.uid, this.authService.userLoggedIn.displayName);
    this.snackBarRef.dismiss();
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
  snackBarRef = inject(MatSnackBarRef);
  reload(){
    window.location.reload()
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
