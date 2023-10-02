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
  queue;
  user;
  static reqPermition: any;
  private unsubscribe = new Subject<void>();

  constructor(
    public db: AngularFireDatabase){
    this.set  = db.object('termostato/value/settings/');
    this.prog = db.object('termostato/value/settings/programmazione/');
    this.data = db.object('termostato/');
    this.queue = db.object('permition/queue');
    this.user = db.object('permition/user');
  }

  setTmp(temp: number){
    this.set.update({
      "temp": temp,
      "timestamp": {".sv" : "timestamp"}
    }).then(()=>{
      return temp;
    })
  }

  setMod(mod: string): any{
    this.set.update({
      "mod": mod,
      "timestamp": {".sv" : "timestamp"}
    }).then(()=>{
      return mod;
    })
  }

  setProg(prog: {ora:any, temp:any}){

    var lable!: any;
    if(prog!=null && prog.ora!=null && prog.temp != null)
      lable = `
        {
          "${prog.ora}": {
              "tmp": ${prog.temp},
              "timestamp": {".sv" : "timestamp"}
            }
        }
      `;
    else if(prog!=null && prog.ora!=null)
      lable = `
        {
          "${prog.ora}": {
            "tmp": null,
            "timestamp": null
            }
        }
      `;

    this.prog.update(JSON.parse(lable))
    this.set.update({"timestamp": {".sv" : "timestamp"}});
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

    this.queue.set(us);
  }

  checkQueue(): Observable<unknown>{
    return this.queue.valueChanges();
  }

  accPermition(id:string){
    this.db.object('permition/user/'+id).set(true).then((e:any)=>{
      this.queue.set(null);
    })
  }

  delateValueChanges(){
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}


