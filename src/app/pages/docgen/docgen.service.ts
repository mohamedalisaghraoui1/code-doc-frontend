import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { GeneratedDocument } from './docgen.model';

@Injectable({ providedIn: 'root' })
export class DocgenService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = '/api/projects';

    /** Alimente le tableau. */
    list(): Observable<GeneratedDocument[]> {
        return this.http.get<GeneratedDocument[]>(this.baseUrl);
    }

    /**
     * Envoie le zip. L'endpoint est synchrone : la réponse n'arrive qu'une fois
     * le PDF généré et sauvegardé, ce qui peut prendre plusieurs minutes.
     */
    upload(file: File): Observable<GeneratedDocument> {
        const form = new FormData();
        form.append('file', file, file.name);
        return this.http.post<GeneratedDocument>(`${this.baseUrl}/upload`, form);
    }

    /** Récupère le PDF stocké dans MongoDB. */
    download(doc: GeneratedDocument): Observable<Blob> {
        return this.http.get(doc.downloadUrl, { responseType: 'blob' });
    }
}
