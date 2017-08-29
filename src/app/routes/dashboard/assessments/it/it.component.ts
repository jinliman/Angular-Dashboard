import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-it',
  templateUrl: './it.component.html',
  styleUrls: ['./it.component.scss']
})
export class ITComponent implements OnInit {

  settings: object;
  data: Array<any>;
  constructor() { }

  ngOnInit() {
    this.data = [
      {
        priority: "<b class='a'>High</b>",
        desc: "Define the transition and post-transition strategy and plan for business applications",
        purpose: "Identify dependencies, transition resources, parameters and constraints; schedule transition activities",
        est_cost: "$ 70,000",
        est_time: "1 month",
        low: "$ 70,000",
        high: "$ 70,000",
      },
      {
        priority: "<b class='c'>Low</b>",
        desc: "Re-establish HR and payroll solutions",
        purpose: "Transfer the Company to the Buyer’s Workforce Now software application",
        est_cost: "$ 70,000",
        est_time: "1 month",
        low: "$ 70,000",
        high: "$ 70,000",
      },
      {
        priority: "<b class='b'>Medium</b>",
        desc: "Re-establish HR and payroll solutions",
        purpose: "Transfer the Company to the Buyer’s Workforce Now software application",
        est_cost: "$ 70,000",
        est_time: "1 month",
        low: "$ 70,000",
        high: "$ 70,000",
      },
      {
        priority: "Low",
        desc: "Re-establish HR and payroll solutions",
        purpose: "Transfer the Company to the Buyer’s Workforce Now software application",
        est_cost: "$ 70,000",
        est_time: "1 month",
        low: "$ 70,000",
        high: "$ 70,000",
      },
      {
        priority: "Low",
        desc: "Re-establish HR and payroll solutions",
        purpose: "Transfer the Company to the Buyer’s Workforce Now software application",
        est_cost: "$ 70,000",
        est_time: "1 month",
        low: "$ 70,000",
        high: "$ 70,000",
      },
      {
        priority: "Low",
        desc: "Re-establish HR and payroll solutions",
        purpose: "Transfer the Company to the Buyer’s Workforce Now software application",
        est_cost: "$ 70,000",
        est_time: "1 month",
        low: "$ 70,000",
        high: "$ 70,000",
      }
    ];
    this.settings = {
      columns: {
        priority: {
          title: 'Priority',
          type: 'html'
        },
        desc: {
          title: 'Description'
        },
        purpose: {
          title: 'Purpose'
        },
        est_cost: {
          title: 'Estimated Cost'
        },
        est_time: {
          title: 'Estimated Timeframe'
        },
        low: {
          title: 'Low'
        },
        high: {
          title: 'High'
        }
      },
      actions: {
        add: false,
        edit: false,
        delete: false
      }
    };
  }

}
