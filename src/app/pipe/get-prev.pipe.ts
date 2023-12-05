import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getPrev',
  pure: true,
})
export class GetPrevPipe implements PipeTransform {

  transform(minute: number): string {
    //console.log(minute)
    if(minute > 120)
      return String(Math.floor(minute/60) + ":" + (Math.floor(minute%60/15) * 15) + " h")
    return String(minute + " min")
  }

}
