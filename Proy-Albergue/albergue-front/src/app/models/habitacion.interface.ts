export interface Habitacion {
    idhabitacion?: number;       
    numero_habitacion?: number;
    piso?: number;
    tipo?: 'PACIENTE' | 'ESTUDIANTE';
    capacidad?: number;
    estado?: 'DISPONIBLE' | 'OCUPADA' | 'MANTENIMIENTO';
}

export interface HabitacionResponse {
    success: boolean;
    data: Habitacion | Habitacion[];
    count?: number;
    message: string;
    error?: string;
}