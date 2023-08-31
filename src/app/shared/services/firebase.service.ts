import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable, Subject, takeUntil } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  tmp;
  mod;
  prog;
  data;
  line;
  user;
  static reqPermition: any;
  private unsubscribe = new Subject<void>();

  constructor(public db: AngularFireDatabase){
    this.tmp  = db.object('termostato/temp');
    this.mod  = db.object('termostato/mod');
    this.prog =           'termostato/programmazione/';
    this.data = db.object('termostato');
    this.line = db.object('permition/line');
    this.user = db.object('permition/user');
  }

  setTmp(num: number){
    this.tmp.set(num);
  }

  setMod(mod: string){
    this.mod.set(mod);
  }

  setProg(prog: {ora:any, temp:any}){
    this.db.object(this.prog + prog.ora).set({temp: prog.temp});
  }

  onChange(): Observable<unknown>{
    return this.data.valueChanges().pipe(
      takeUntil(this.unsubscribe)
    );
  }

  reqPermition(id:string, name: string){
    this.line.set({id: id, name: name});
  }

  checkLine(): Observable<unknown>{
    return this.line.valueChanges();
  }

  accPermition(id:string){
    this.db.object('permition/user/'+id).set(true).then((e:any)=>{
      this.line.set(null);
    })
  }

  delateValueChanges(){
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}


