import { Component, OnInit, ElementRef } from '@angular/core';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-onedrive-auth',
  templateUrl: './onedrive-auth.component.html',
  styleUrls: ['./onedrive-auth.component.scss']
})
export class OnedriveAuthComponent implements OnInit {

  constructor(
    private elementRef: ElementRef,
  ) { }

  ngOnInit() {
  }

  initOnedriveScript(){
    var script = document.createElement("script");
    script.type = "text/javascript"
    script.src = "https://js.live.net/v7.2/OneDrive.js"
    this.elementRef.nativeElement.appendChild(script);
  }
  ngAfterViewInit() {
    this.initOnedriveScript()
  }
}
