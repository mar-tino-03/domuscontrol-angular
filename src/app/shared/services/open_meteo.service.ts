import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class openMeteoService {

  constructor(private http: HttpClient) { }

  urlapi = "https://api.open-meteo.com/v1/forecast?latitude=45.4&longitude=8.9&hourly=temperature_2m,relativehumidity_2m,surface_pressure,windspeed_10m,weather_code,direct_normal_irradiance_instant&timezone=Europe%2FBerlin&past_days=1&forecast_days=1";

  getDatiDay(){
    return this.http.get(this.urlapi);
  }
}
