import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-calendar-page',
  templateUrl: './calendar-page.component.html',
  styleUrls: ['./calendar-page.component.scss']
})
export class CalendarPageComponent implements OnInit {

  calendarOptions:Object = {
      height: 'parent',
      fixedWeekCount : false,
      editable: false,
      eventLimit: true, // allow "more" link when too many events
      eventBackgroundColor: 'rgba(169, 226, 124, 0.8)',
      eventBorderColor: '#eaeaea',
      eventTextColor: '#2b332c',
      header: {
        left: 'prev title next',
        center: '',
        right: 'month agendaWeek agendaDay listMonth today'
      },
      events: [
        {
          title: 'ITDD-Social Magazine',
          start: '2017-08-09T16:00:00',
          end: '2017-08-09T18:00:00'
        },
        {
          title: 'ITDD-Conference',
          start: '2017-08-10T18:00:00',
          end: '2017-08-10T20:00:00'
        },
      ]
    };
  constructor() { }

  ngOnInit() {
    console.log(this.calendarOptions)
  }

}
