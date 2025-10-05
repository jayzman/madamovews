import { CreateChauffeurDto } from "./create-chauffeur.dto";
declare const UpdateChauffeurDto_base: import("@nestjs/common").Type<Partial<CreateChauffeurDto>>;
export declare class UpdateChauffeurDto extends UpdateChauffeurDto_base {
    photoUrl?: string;
}
export {};
