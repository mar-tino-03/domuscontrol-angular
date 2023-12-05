import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation, SimpleChanges } from '@angular/core';
declare var $:any;

var onValue: { emit: (arg0: number) => void; };
var onChange: { emit: (arg0: number) => void; };
var prev=0;

@Component({
  selector: 'app-circular-slider',
  template: '<div id="slider"></div>',
  styleUrls: ['./circular-slider.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CircularSliderComponent implements OnInit{
  @Input() valueRange!: number;
  @Input() disabled!: boolean;
  @Input() prev!: String;
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
      // drag: "traceEvent",

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
        //console.log(prev)
        return `<div style="font-size: 1.55em; display: flex;justify-content: center;">` + "heating" + "</div>" +
               `<div style="font-size: 2.3em;  display: flex;justify-content: center;">` + val + "°</div>" +
               `<div style="font-size: 1.35em; display: flex;justify-content: center;">` + prev + " to" + "</div>";
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes['valueRange']!=undefined && changes['valueRange'].currentValue != undefined)
      $("#slider").data("roundSlider").setValue(changes['valueRange'].currentValue);

    if(changes['disabled']!=undefined && changes['disabled'].currentValue != undefined){
      setTimeout( () => {
        if(changes['disabled'].currentValue == true)
          $("#slider").roundSlider("disable");
        else
          $("#slider").roundSlider("enable");
      }, 10 );
    }

    if(changes['prev'] != undefined && changes['prev'].currentValue != undefined){
      setTimeout( () => {
        prev = changes['prev'].currentValue;
        $("#slider").data("roundSlider").setValue($("#slider").data("roundSlider").getValue()+0.5);
        $("#slider").data("roundSlider").setValue($("#slider").data("roundSlider").getValue()-0.5);
      }, 10 );
    }
  }
}

