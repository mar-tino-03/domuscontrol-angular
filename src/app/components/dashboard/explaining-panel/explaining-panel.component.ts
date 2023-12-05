import { Component, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'explaining-panel',
  templateUrl: './explaining-panel.component.html',
  styleUrl: './explaining-panel.component.css'
})
export class ExplainingPanelComponent {
  @Input() dati!: {};
  first!: string;
  second!: string;

  ngOnChanges(changes: SimpleChanges){

    if (changes['dati'] != null && changes['dati'].currentValue != null) {
      this.first  = changes['dati'].currentValue.first;
      this.second = changes['dati'].currentValue.second;
    }
  }
}
