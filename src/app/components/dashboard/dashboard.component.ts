import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { FirebaseService } from '../../shared/services/firebase.service';
import { MatTable, MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { MatIcon, MatIconModule } from '@angular/material/icon';

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

  constructor(
    public authService: AuthService,
    public firebaseService: FirebaseService,
    public dialog: MatDialog
  ) {}

  ngOnInit(){
    this.firebaseService.onChange().subscribe((e: any)=>{
      this.valueRange = e.temp;
      setChip(this, e.mod);
      setProg(this, e.programmazione);
    });
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

  time_tino(e:any){ return time_tino(e); }
}

@Component({
  selector: 'dialog-animations-example-dialog',
  templateUrl: 'dialog-programmazione.html',
  styleUrls: ['./dialog-programmazione.css'],
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
