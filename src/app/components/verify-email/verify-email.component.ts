import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-verify-email',
    templateUrl: './verify-email.component.html',
    styleUrls: ['./verify-email.component.css'],
    standalone: true,
    imports: [
        FormsModule,
        NgIf,
        MatButtonModule,
        RouterLink,
    ],
})

export class VerifyEmailComponent implements OnInit {
  constructor(public authService: AuthService) {}

  ngOnInit() {}
}
