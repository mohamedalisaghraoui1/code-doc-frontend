import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-notfound',
    standalone: true,
    imports: [RouterModule, ButtonModule],
    template: `
        <div class="flex flex-col items-center justify-center min-h-screen gap-4">
            <span class="text-primary font-bold text-5xl">404</span>
            <h1 class="text-surface-900 dark:text-surface-0 font-bold text-3xl m-0">Page introuvable</h1>
            <p class="text-muted-color m-0">La ressource demandée n'existe pas.</p>
            <p-button label="Retour à l'accueil" icon="pi pi-home" routerLink="/" />
        </div>
    `
})
export class Notfound {}
