import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './index';

@Injectable()
export class AdminAuthGuard implements CanActivate {

	constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		if(this.authService.isAdminLoggedIn()) {
			return true;
		}
		this.router.navigate(['admin/login'],{ queryParams: { returnUrl: state.url }});
		return false;
	}
}
