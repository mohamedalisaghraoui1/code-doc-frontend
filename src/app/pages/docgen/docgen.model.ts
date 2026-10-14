/** Miroir de GeneratedDocumentResponse (backend code-doc). Le PDF n'y figure jamais : uniquement un lien. */
export interface GeneratedDocument {
    id: string;
    title: string;
    /** "Java", "Python, Go"... : langages détectés dans l'archive. */
    language: string;
    projectName: string;
    /** Ex. "/api/projects/{id}/download". */
    downloadUrl: string;
    methodsDocumented: number;
    /** Toujours 0 côté backend depuis la suppression des raccourcis Java : non affiché. */
    methodsFromTrivial: number;
    methodsFromCache: number;
    methodsFailed: number;
    /** Instant ISO-8601. */
    generatedAt: string;
}
