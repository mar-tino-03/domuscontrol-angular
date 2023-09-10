import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TinotinoService {

  constructor(private http: HttpClient) { }

  urlbase = "https://tinotino.altervista.org/api/pull.php?";

  getDati(time: number){
    return this.http.get(this.urlbase+"time="+time)
  }

  getAllDati(){
    return this.http.get(this.urlbase)
  }
}
