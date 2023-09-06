import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
//import { AppUpdateService } from './service/pwa.service';

/*interface Course {
  data: string;
  tmp: number;
  hum: number;
}*/

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent /*implements OnInit*/ {
  /*sideMode!: any;
  width: number | undefined;

  sidenavlist = [
    { link: '/', name: '' },
    { link: '/', name: 'home' },
    { link: '/magazzino', name: 'magazzino' },
    { link: '/statistiche', name: 'statistiche' },
  ];

  constructor(
    private responsive: BreakpointObserver,
    private cdr: ChangeDetectorRef,
  ) {}

  setWidth(widthNumber: number) {
    this.width = widthNumber;
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.responsive.observe(Breakpoints.Handset).subscribe((result) => {
      this.sideMode = 'push';
      if (result.matches) {
        this.sideMode = 'over';
      }
    });
  }*/
}
