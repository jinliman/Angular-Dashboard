import { Component, OnInit, OnDestroy} from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { DataService } from '../core/services/data.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit{
  private sub: any;
  public options = {
    position: ["top", "right"],
    timeOut: 2000,
    showProgressBar: false,
    pauseOnHover: false,
    clickToClose: true,
    maxLength: 30,
  }
  isSidebarCollapsed :boolean = false;
  constructor(
    private router: Router,
    private dataService: DataService,
  ) {
    this.dataService.sidebarToggled.subscribe(data => this.onSidebarToggled(data));
  }

  onSidebarToggled(data)
  {
    this.isSidebarCollapsed = data;
  }
  ngOnInit() {
  }

}
