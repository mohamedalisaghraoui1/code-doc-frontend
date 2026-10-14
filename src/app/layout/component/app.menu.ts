import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        @for (item of model; track item.label) {
            <li app-menuitem [item]="item" [root]="true"></li>
        }
    </ul> `
})
export class AppMenu {
    model: MenuItem[] = [
        {
            label: 'Code-doc',
            items: [{ label: 'Documentations', icon: 'pi pi-fw pi-file-pdf', routerLink: ['/'] }]
        }
    ];
}
