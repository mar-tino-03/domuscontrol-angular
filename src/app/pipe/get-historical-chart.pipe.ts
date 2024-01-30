import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getHistoricalChart',
  pure: true,
})
export class GetHistoricalChartPipe implements PipeTransform {
  date: any;
  chart: any;
  transform(data: any): any {
    if(data==null)
      return null

    this.date = Object.keys(data);
    if(this.date.length==0)
      return null

    this.chart = Object.assign({}, data);
    for (let i = 0; i < this.date.length; i++) {
      var k = Object.keys(this.chart[this.date[i]]);
      var h: Date;
      this.chart[this.date[i]] = k.map((elem: any)=>{
        h = new Date(Number(elem))
        h.setHours(0);
        return JSON.parse(`{
          "x": ${h.getMonth() > 6 ? h.setFullYear(1970) : h.setFullYear(1971)},
          "${this.date[i]}": ${this.chart[this.date[i]][elem][this.date[i]] / 864000}
        }`)
      });
    }
    return this.chart;
  }

}
