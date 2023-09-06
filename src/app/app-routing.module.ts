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
  { path: '', component: DashboardComponent, canActivate: [AuthGuard] },

  { path: 'login', component: SignInComponent },
  { path: 'register', component: SignUpComponent },
  { path: 'verify-email-address', component: VerifyEmailComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: '404', component: PageNotFoundComponent },

  { path: '**', redirectTo: '404' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
