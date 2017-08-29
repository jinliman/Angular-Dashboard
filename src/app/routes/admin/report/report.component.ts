import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {

  data: Array<any>;
  reportTypeArr: object;
  industryArr: object;
  countryArr: object;
  cityArr: object;
  stateArr: object;
  statusArr: object;
  constructor() { }

  ngOnInit() {
    this.reportTypeArr = {
      '1': 'ITDD',
      '2': 'HRDD'
    }
    this.countryArr = {
      'usa': 'US',
      'mex': 'MEX',
    }
    this.cityArr = {
      '1': 'Dallas',
      '2': 'Mexico City',
    }
    this.stateArr = {
      '1': 'TX',
      '2': 'Mex'
    }
    this.statusArr = {
      '1': 'Completed',
      '2': 'Pending',
      '3': 'Not Started'
    }
    this.industryArr = {
      '1': 'Advertising',
      '2': 'Aerospace &amp; Defense',
      '3': 'Agriculture &amp; Forestry Sector',
      '4': 'Arts, Entertainment &amp;  Media',
      '5': 'Automotive',
      '6': 'Building &amp; Construction',
      '7': 'Business Services',
      '8': 'Chemical',
      '9': 'Construction',
      '10': 'Consulting &amp; Professional Services',
      '11': 'Consumer Products &amp; Goods',
      '12': 'Education',
      '13': 'Finance &amp; Insurance',
      '14': 'Government',
      '15': 'Healthcare',
      '16': 'Healthcare Information &amp; Technology',
      '17': 'Manufacturing &amp; Industrials',
      '18': 'Membership Organizations',
      '19': 'Mining',
      '20': 'Oil &amp; Gas',
      '21': 'Pharmaceuticals',
      '22': 'Real Estate',
      '23': 'Renewables/Energy',
      '24': 'Restaurants, Bars &amp; Food Services',
      '25': 'Retail',
      '26': 'Technology &amp; Telecom',
      '27': 'Transportation Services',
      '28': 'Utilities',
      '29': 'Waste &amp; Recycling',
      '30': 'Wholesale'
    }

    this.data = [
      {
        ID: "1420",
        initDate: "May 12,2017",
        startDate: "May 12,2017",
        completeDate: "May 12,2017",
        reportType: "1",
        initiatorName: "John Doe",
        initCompanyName: "Soft Corp",
        initiatorIndustry: "1",
        teamNumber: "5",
        country: "usa",
        city: "1",
        state: "1",
        status: "1",
        score: "98",
        action: "1"
      },
      {
        ID: "1420",
        initDate: "May 12,2017",
        startDate: "May 12,2017",
        completeDate: "May 12,2017",
        reportType: "1",
        initiatorName: "John Doe",
        initCompanyName: "Soft Corp",
        initiatorIndustry: "1",
        teamNumber: "5",
        country: "usa",
        city: "1",
        state: "1",
        status: "2",
        score: "68",
        action: "1"
      },
      {
        ID: "1420",
        initDate: "May 12,2017",
        startDate: "May 12,2017",
        completeDate: "May 12,2017",
        reportType: "1",
        initiatorName: "John Doe",
        initCompanyName: "Soft Corp",
        initiatorIndustry: "1",
        teamNumber: "5",
        country: "usa",
        city: "1",
        state: "1",
        status: "3",
        score: "88",
        action: "1"
      },
    ];
  }
}
