export interface habitacion {
    idhabitacion?: number;       
    numero_habitacion?: number;
    piso?: number;
    tipo?: 'PACIENTE' | 'ESTUDIANTE';
    capacidad?: number;
    estado?: 'DISPONIBLE' | 'OCUPADA' | 'MANTENIMIENTO';
}

export interface habitacionResponse {
    success: boolean;
    data: habitacion | habitacion[];
    count?: number;
    message: string;
    error?: string;
}