import { StatutCourse } from "@prisma/client";
export declare class CreateCourseDto {
    chauffeurId: number;
    clientId: number;
    startLocation: string;
    endLocation: string;
    startTime: string;
    endTime?: string;
    estimatedDuration: string;
    currentLocation?: string;
    estimatedPrice: number;
    finalPrice?: number;
    paymentMethod: string;
    status?: StatutCourse;
}
