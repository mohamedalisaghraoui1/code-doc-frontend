import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Docgen } from './app/pages/docgen/docgen';
import { Notfound } from './app/pages/notfound/notfound';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [{ path: '', component: Docgen }]
    },
    { path: 'notfound', component: Notfound },
    { path: '**', redirectTo: '/notfound' }
];
