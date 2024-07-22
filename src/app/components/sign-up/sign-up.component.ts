import { Component,  } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-sign-up',
    templateUrl: './sign-up.component.html',
    styleUrls: ['./sign-up.component.css'],
    standalone: true,
    imports: [
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        RouterLink,
    ],
})

export class SignUpComponent {
  hide=true;

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
