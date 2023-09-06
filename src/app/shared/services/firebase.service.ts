import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable, Subject, takeUntil } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  set;
  prog;
  data;
  line;
  user;
  static reqPermition: any;
  private unsubscribe = new Subject<void>();

  constructor(
    public db: AngularFireDatabase){
    this.set  = db.object('termostato/value/settings/');
    this.prog =           'termostato/value/settings/programmazione/';
    this.data = db.object('termostato/value');
    this.line = db.object('permition/line');
    this.user = db.object('permition/user');
  }

  setTmp(temp: number){
    this.set.update({
      "temp": temp,
      "timestamp": new Date().getTime()
    })
  }

  setMod(mod: string){
    this.set.update({
      "mod": mod,
      "timestamp": new Date().getTime()
    })
  }

  setProg(prog: {ora:any, temp:any}){
    this.db.object(this.prog + prog.ora).set({temp: prog.temp});
  }

  onChange(): Observable<unknown>{
    return this.data.valueChanges().pipe(
      takeUntil(this.unsubscribe)
    );
  }

  reqPermition(user:any){
    var us;
    us = {
      id: user.uid,
      email: user.email
    }

    if(user.displayName != undefined){
      us = {
        id: user.uid,
        email: user.email,
        name: user.displayName
      }
    }

    this.line.set(us);
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


