import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './shared/guard/auth.guard';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';

const routes: Routes = [

  /*{ path: '', redirectTo: 'dashboard', pathMatch:'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },*/
  { path: '', component: DashboardComponent, canActivate: [AuthGuard], title: 'Domuscontrol'},

  { path: 'login', component: SignInComponent, title: 'Login | Domuscontrol'},
  { path: 'register', component: SignUpComponent, title: 'Register | Domuscontrol'},
  { path: 'verify-email-address', component: VerifyEmailComponent, title: 'Login | Domuscontrol' },
  { path: 'forgot-password', component: ForgotPasswordComponent, title: 'Login | Domuscontrol' },
  { path: '404', component: PageNotFoundComponent, title: '404 | Domuscontrol' },

  { path: '**', redirectTo: '404' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
