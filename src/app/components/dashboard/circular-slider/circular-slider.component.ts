import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
declare var $:any;

var onValue: { emit: (arg0: number) => void; };
var onChange: { emit: (arg0: number) => void; };

@Component({
  selector: 'app-circular-slider',
  template: '<div id="slider"></div>',
  styleUrls: ['./circular-slider.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CircularSliderComponent implements OnInit{
  @Input() valueRange!: number;
  @Output() valueRangeChange = new EventEmitter();
  @Output() change = new EventEmitter();

  ngOnInit(){

    onValue = this.valueRangeChange;
    onChange  = this.change;

    $("#slider").roundSlider({
      radius: 100,
      circleShape: "pie",
      sliderType: "min-range",
      //showTooltip: false,
      startAngle: 315,
      width: 4,
      handleSize: "+11",

      min: "14",
      max: "36",
      step: "0.5",

      //handleShape: "dot",
      //mouseScrollAction: true,
      //value: "29",
      editableTooltip: false,
      //sliderType: "min-range",
      lineCap: "round",

      /*  event  */
      //beforeCreate: "traceEvent",
      // create: "traceEvent",
      // start: "traceEvent",
      // stop: "traceEvent",
      //drag: "traceEvent",

      update: function () {
        onValue.emit(Number($("#slider").data("roundSlider").getValue()));
      },
      change: function () {
        //console.log("sand: ", $("#slider").data("roundSlider").getValue());
        onChange.emit(Number($("#slider").data("roundSlider").getValue()));
      },
      tooltipFormat: function (e:any) {
        var val = e.value.toString();
        if (!(e.value * 10 % 10)) { val = val + ".0"; }
        return `<p style="font-size: 1.55em; margin:0;">` + "heating" + "</p>" +
               `<p style="font-size: 2.3em;  margin:0;">` + val + "°</p>" +
               `<p style="font-size: 1.35em; margin:0;">` + "1/2 hr to" + "</p>";
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes['valueRange'].currentValue != undefined)
      $("#slider").data("roundSlider").setValue(changes['valueRange'].currentValue);
  }
}

