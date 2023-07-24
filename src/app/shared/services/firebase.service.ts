import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  tmp;
  mod;
  prog;
  data;

  constructor(public db: AngularFireDatabase){
    this.tmp  = db.object('test/temp');
    this.mod  = db.object('test/mod');
    this.prog =           'test/programmazione/';
    this.data = db.object('test');
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
    return this.data.valueChanges();
  }
}


