import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Alta, Login, ResponseI, RespuestaAlta, Usuario } from '../interfaces/requerimiento';

@Injectable({
  providedIn: 'root'
})
export class DocumentosService {

  private appUrl: string;
  private apiUrl: string;
  private apiUrl2: string;
  private url: string;

  constructor( private http: HttpClient ) { 
    
    this.appUrl = environment.endpoint;
    this.apiUrl = 'api/tomas/';
    this.apiUrl2 = 'api/requerimiento';
    this.url = 'https://portalweb.sapalapaz.gob.mx/api/requirimiento/token';
  }



  getToma( id:number ):Observable< any >{

    const options = {
      method: 'GET',
      headers:{
        Authorization: `Bearer 201|PWc15j4pz1UXcUrVUHPae9uCY2bWue7JyshlrLs9`
      }
    }

    return this.http.get<any>( ( this.appUrl + this.apiUrl + id ), options )

  } 

  loginByEmail(form:Login):Observable<ResponseI>{

    let direccion = this.url  
    return this.http.post<ResponseI>(direccion,form);

  } 

  postAlta( form:Alta ):Observable<RespuestaAlta>{

    const options = {
      method: 'POST',
      headers:{
        Authorization: `Bearer 201|PWc15j4pz1UXcUrVUHPae9uCY2bWue7JyshlrLs9`
      }
    }

    return this.http.post<RespuestaAlta>( ( this.appUrl + this.apiUrl2 ), form, options  )
  }


}
