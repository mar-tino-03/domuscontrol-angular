import { Component,  } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
})

export class SignUpComponent {
  constructor(
    private meta: Meta,
    public authService: AuthService
    ) {}

  ngOnInit(): void {
    this.meta.removeTag('name=description');
    this.meta.removeTag('name=keywords');
    this.meta.addTags([
      { name: 'description', content: 'Create a new account. Do you already have an account? Enter your user and password and log in to Domuscontrol.' },
      { name: 'keywords', content: 'domuscontrol, register' }
    ]);
  }
}
