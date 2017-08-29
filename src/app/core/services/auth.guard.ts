import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './index';

@Injectable()
export class AuthGuard implements CanActivate {

	constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		if(this.authService.isLoggedIn()) {
			return true;
		}
		this.router.navigate(['/login'],{ queryParams: { returnUrl: state.url }});
		return false;
	}
}
