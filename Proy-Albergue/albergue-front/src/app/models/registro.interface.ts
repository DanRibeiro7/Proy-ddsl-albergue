export interface Persona {
    idpersona?: number;
    dni: string;
    nombres: string;
    apellidos: string;
    telefono?: string;
    procedencia?: string;
    idtipo_persona?: number;
    
    // === NUEVOS CAMPOS (Vienen del listado con JOIN) ===
    institucion?: string;
    carrera?: string;
    ciclo_actual?: string;
    
    diagnostico?: string;
    hospital_origen?: string;
    codigo_sis?: string;

    // === TUS OBJETOS PARA GUARDAR (Déjalos como estaban) ===
    datosPaciente?: {
        diagnostico: string;
        hospital: string;
        sis: string;
    };
    datosEstudiante?: {
        institucion: string;
        carrera: string;
        ciclo: string;
    };
}

export interface Registro {
    idregistro?: number;
    idpersona: number;
    idhabitacion: number;
    fecha_ingreso: string;
    fecha_salida?: string;
    estado?: 'ACTIVO' | 'FINALIZADO';
}

export interface ApiResponse {
    success: boolean;
    data: any;
    message: string;
}