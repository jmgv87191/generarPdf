import { Routes } from '@angular/router';
import { CartaInvitacionComponent } from './components/carta-invitacion/carta-invitacion.component';
import { OrdenSuspensionComponent } from './components/orden-suspension/orden-suspension.component';
import { RequerimientoCobroComponent } from './components/requerimiento-cobro/requerimiento-cobro.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [

    {
        path:'',
        component: LoginComponent
    },
    {
        path:'home',
        component: HomeComponent
    },
    {
        path:'invitacion',
        component: CartaInvitacionComponent
    },
    {
        path:'suspension',
        component: OrdenSuspensionComponent
    },
    {
        path:'cobro',
        component: RequerimientoCobroComponent
    },
    {
        path:'**', pathMatch:'full', redirectTo:''
    }

];
