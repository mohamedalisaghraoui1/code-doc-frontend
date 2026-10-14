import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { GeneratedDocument } from './docgen.model';
import { DocgenService } from './docgen.service';

@Component({
    selector: 'app-docgen',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, TagModule, ToastModule, ProgressBarModule, InputTextModule, IconFieldModule, InputIconModule, TooltipModule],
    providers: [MessageService],
    template: `
        <p-toast />

        <!-- Indicateurs -->
        <div class="grid grid-cols-12 gap-8 mb-8">
            @for (stat of stats(); track stat.label) {
                <div class="col-span-12 md:col-span-6 xl:col-span-3">
                    <div class="card mb-0">
                        <div class="flex justify-between">
                            <div>
                                <span class="block text-muted-color font-medium mb-4">{{ stat.label }}</span>
                                <div class="text-surface-900 dark:text-surface-0 font-medium text-2xl">{{ stat.value }}</div>
                            </div>
                            <div class="flex items-center justify-center rounded-border" [ngClass]="stat.bg" style="width: 2.5rem; height: 2.5rem">
                                <i class="pi text-xl!" [ngClass]="[stat.icon, stat.color]"></i>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>

        <!-- Envoi du zip -->
        <div class="card">
            <div class="font-semibold text-xl mb-4">Générer une documentation</div>

            <input #fileInput type="file" accept=".zip,application/zip" class="hidden" (change)="onFileInput($event)" />

            <div
                class="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-border text-center transition-colors"
                [ngClass]="dragging() ? 'border-primary bg-primary-50 dark:bg-primary-950' : 'border-surface'"
                [class.cursor-pointer]="!uploading()"
                (click)="!uploading() && fileInput.click()"
                (dragover)="onDragOver($event)"
                (dragleave)="dragging.set(false)"
                (drop)="onDrop($event)"
            >
                <i class="pi pi-cloud-upload text-4xl text-muted-color"></i>
                @if (selectedFile(); as file) {
                    <div class="font-medium">{{ file.name }}</div>
                    <div class="text-muted-color text-sm">{{ formatSize(file.size) }}</div>
                } @else {
                    <div class="font-medium">Glissez le zip de votre projet ici</div>
                    <div class="text-muted-color text-sm">ou cliquez pour parcourir (.zip)</div>
                }
            </div>

            @if (uploading()) {
                <div class="mt-4">
                    <p-progressbar mode="indeterminate" [style]="{ height: '6px' }" />
                    <div class="text-muted-color text-sm mt-2">Analyse du code et génération de la documentation en cours : cela peut prendre plusieurs minutes selon la taille du projet.</div>
                </div>
            }

            <div class="flex gap-2 mt-4">
                <p-button label="Générer la documentation" icon="pi pi-file-pdf" [disabled]="!selectedFile() || uploading()" [loading]="uploading()" (onClick)="generate()" />
                <p-button label="Effacer" icon="pi pi-times" severity="secondary" outlined [disabled]="!selectedFile() || uploading()" (onClick)="selectedFile.set(null)" />
            </div>
        </div>

        <!-- Tableau des documents -->
        <div class="card">
            <div class="flex items-center justify-between flex-wrap gap-2 mb-4">
                <div class="font-semibold text-xl">Documentations générées</div>
                <div class="flex items-center gap-2">
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" placeholder="Rechercher..." (input)="dt.filterGlobal($any($event.target).value, 'contains')" />
                    </p-iconfield>
                    <p-button icon="pi pi-refresh" severity="secondary" outlined pTooltip="Rafraîchir" [loading]="loading()" (onClick)="refresh()" />
                </div>
            </div>

            <p-table
                #dt
                [value]="documents()"
                [loading]="loading()"
                [rows]="10"
                [paginator]="true"
                [rowsPerPageOptions]="[10, 25, 50]"
                [globalFilterFields]="['title', 'projectName', 'language']"
                [rowHover]="true"
                dataKey="id"
                sortField="generatedAt"
                [sortOrder]="-1"
                [tableStyle]="{ 'min-width': '60rem' }"
                currentPageReportTemplate="{first} à {last} sur {totalRecords} documents"
                [showCurrentPageReport]="true"
            >
                <ng-template #header>
                    <tr>
                        <th pSortableColumn="title">Projet <p-sortIcon field="title" /></th>
                        <th pSortableColumn="language">Langages <p-sortIcon field="language" /></th>
                        <th pSortableColumn="methodsDocumented" class="text-right">Méthodes documentées <p-sortIcon field="methodsDocumented" /></th>
                        <th pSortableColumn="methodsFromCache" class="text-right">Depuis le cache <p-sortIcon field="methodsFromCache" /></th>
                        <th pSortableColumn="methodsFailed" class="text-right">Échecs <p-sortIcon field="methodsFailed" /></th>
                        <th pSortableColumn="generatedAt">Généré le <p-sortIcon field="generatedAt" /></th>
                        <th class="text-center">PDF</th>
                    </tr>
                </ng-template>
                <ng-template #body let-doc>
                    <tr>
                        <td class="font-medium">{{ doc.title }}</td>
                        <td>
                            <div class="flex flex-wrap gap-1">
                                @for (lang of languages(doc.language); track lang) {
                                    <p-tag [value]="lang" severity="info" />
                                }
                            </div>
                        </td>
                        <td class="text-right">{{ doc.methodsDocumented }}</td>
                        <td class="text-right">{{ doc.methodsFromCache }}</td>
                        <td class="text-right">
                            <p-tag [value]="'' + doc.methodsFailed" [severity]="doc.methodsFailed > 0 ? 'danger' : 'success'" />
                        </td>
                        <td>{{ doc.generatedAt | date: 'dd/MM/yyyy HH:mm' }}</td>
                        <td class="text-center">
                            <p-button icon="pi pi-download" label="Télécharger" size="small" [loading]="downloadingId() === doc.id" [disabled]="downloadingId() !== null" (onClick)="download(doc)" />
                        </td>
                    </tr>
                </ng-template>
                <ng-template #emptymessage>
                    <tr>
                        <td colspan="7" class="text-center text-muted-color py-8">Aucune documentation générée pour le moment. Envoyez un zip ci-dessus pour commencer.</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class Docgen implements OnInit {
    private readonly service = inject(DocgenService);
    private readonly messages = inject(MessageService);

    documents = signal<GeneratedDocument[]>([]);
    loading = signal(false);
    uploading = signal(false);
    dragging = signal(false);
    selectedFile = signal<File | null>(null);
    downloadingId = signal<string | null>(null);

    stats = computed(() => {
        const docs = this.documents();
        const sum = (pick: (d: GeneratedDocument) => number) => docs.reduce((acc, d) => acc + pick(d), 0);
        return [
            { label: 'Documentations', value: docs.length, icon: 'pi-file-pdf', bg: 'bg-blue-100 dark:bg-blue-400/10', color: 'text-blue-500' },
            { label: 'Méthodes documentées', value: sum((d) => d.methodsDocumented), icon: 'pi-code', bg: 'bg-green-100 dark:bg-green-400/10', color: 'text-green-500' },
            { label: 'Réutilisées (cache)', value: sum((d) => d.methodsFromCache), icon: 'pi-database', bg: 'bg-cyan-100 dark:bg-cyan-400/10', color: 'text-cyan-500' },
            { label: 'Échecs de génération', value: sum((d) => d.methodsFailed), icon: 'pi-exclamation-triangle', bg: 'bg-orange-100 dark:bg-orange-400/10', color: 'text-orange-500' }
        ];
    });

    ngOnInit(): void {
        this.refresh();
    }

    refresh(): void {
        this.loading.set(true);
        this.service.list().subscribe({
            next: (docs) => {
                this.documents.set(docs);
                this.loading.set(false);
            },
            error: (err) => {
                this.loading.set(false);
                this.fail('Chargement impossible', err);
            }
        });
    }

    // --- Sélection du fichier ---

    onFileInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.pick(input.files?.[0]);
        input.value = ''; // permet de re-sélectionner le même fichier
    }

    onDragOver(event: DragEvent): void {
        event.preventDefault();
        if (!this.uploading()) this.dragging.set(true);
    }

    onDrop(event: DragEvent): void {
        event.preventDefault();
        this.dragging.set(false);
        if (!this.uploading()) this.pick(event.dataTransfer?.files?.[0]);
    }

    private pick(file: File | undefined): void {
        if (!file) return;
        if (!file.name.toLowerCase().endsWith('.zip')) {
            this.messages.add({ severity: 'warn', summary: 'Format invalide', detail: 'Seuls les fichiers .zip sont acceptés.' });
            return;
        }
        this.selectedFile.set(file);
    }

    // --- Actions ---

    generate(): void {
        const file = this.selectedFile();
        if (!file) return;

        this.uploading.set(true);
        this.service.upload(file).subscribe({
            next: (doc) => {
                // La ligne est ajoutée en tête sans recharger toute la liste.
                this.documents.update((docs) => [doc, ...docs]);
                this.selectedFile.set(null);
                this.uploading.set(false);
                this.messages.add({ severity: 'success', summary: 'Documentation générée', detail: `${doc.title} : ${doc.methodsDocumented} méthodes documentées.` });
            },
            error: (err) => {
                this.uploading.set(false);
                this.fail('Génération échouée', err);
            }
        });
    }

    download(doc: GeneratedDocument): void {
        this.downloadingId.set(doc.id);
        this.service.download(doc).subscribe({
            next: (blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${doc.title}.pdf`;
                a.click();
                URL.revokeObjectURL(url);
                this.downloadingId.set(null);
            },
            error: (err) => {
                this.downloadingId.set(null);
                this.fail('Téléchargement impossible', err);
            }
        });
    }

    // --- Utilitaires d'affichage ---

    languages(value: string): string[] {
        return (value ?? '')
            .split(',')
            .map((l) => l.trim())
            .filter(Boolean);
    }

    formatSize(bytes: number): string {
        return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(2)} Mo` : `${Math.max(1, Math.round(bytes / 1024))} Ko`;
    }

    private fail(summary: string, err: HttpErrorResponse): void {
        // Le backend renvoie { message } (GlobalExceptionHandler) ; status 0 = backend injoignable.
        const detail = err.status === 0 ? 'Backend injoignable (http://localhost:8080).' : (err.error?.message ?? err.message);
        this.messages.add({ severity: 'error', summary, detail, life: 8000 });
    }
}
