export declare enum TypeDocument {
    PERMIS_DE_CONDUIRE = "PERMIS_DE_CONDUIRE",
    ASSURANCE = "ASSURANCE",
    CONTROLE_TECHNIQUE = "CONTROLE_TECHNIQUE",
    CARTE_PROFESSIONNELLE = "CARTE_PROFESSIONNELLE",
    AUTRE = "AUTRE"
}
export declare class CreateDocumentDto {
    nom: string;
    type: string;
    fichier?: string;
    mimeType?: string;
    taille?: number;
    dateExpiration?: string;
}
