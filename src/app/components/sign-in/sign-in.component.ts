import { Component, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css'],
})

export class SignInComponent implements OnInit{
  hide=true;

  constructor(
    private meta: Meta,
    public authService: AuthService
    ) {}

  ngOnInit(): void {
    this.meta.removeTag('name=description');
    this.meta.removeTag('name=keywords');
    this.meta.addTags([
      { name: 'description', content: 'Enter your user and password and log in to Domuscontrol. Are you a new user? Create a new account.' },
      { name: 'keywords', content: 'domuscontrol, login' }
    ]);
  }
}
