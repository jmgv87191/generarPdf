import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DocumentosService } from '../../services/documentos.service';
import { Router } from '@angular/router';
import { ResponseI } from '../../interfaces/requerimiento';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  form: FormGroup;
  errorStatus: boolean = false;
  errorMsj: any = "";
  errorMessageVariable: string = '';
  pantallaError: boolean = true;

  constructor( private fb: FormBuilder,
              private api:DocumentosService,
              private router:Router
  ){

    this.form = this.fb.group({
      email: ['dartheberron@gmail.com', Validators.required],
      password: ['dragones21', Validators.required],
      device_name: ['toma1', Validators.required],
    })
  }

  onLogin(form: any){

    this.api.loginByEmail(form).subscribe(data =>{
      console.log(data)
      let dataResponse: ResponseI = data;

      if (dataResponse.token ) {
        localStorage.setItem("token",dataResponse.token );
        this.router.navigate(['home']);
      }else{
        this.errorStatus = true;
        this.errorMsj = "Error"
      }
    
    },
    
    (error: HttpErrorResponse) => {
      if (error.status === 422) {

          console.error('Usuario o contraseña incorrectos');
          this.errorMessageVariable = 'Usuario o contraseña incorrectossas ';
          console.log(this.errorMessageVariable)

          this.pantallaError = false
      
        
      } else {
        console.error('Usuario o contraseña incorrectos:', error.message);
        this.errorMessageVariable = 'Ocurrió un error Usuario o contraseña. Por favor, inténtalo de nuevo más tarde.';
      }
    }

    )

  }

}
