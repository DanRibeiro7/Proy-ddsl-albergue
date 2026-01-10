export interface Persona {
    idpersona?: number;
    dni: string;
    nombres: string;
    apellidos: string;
    telefono?: string;
    
    id_comunidad?: number; 
    
    
    nombre_comunidad?: string; 
    es_hospedado?: number;    

    idtipo_persona?: number;
    
    institucion?: string;
    carrera?: string;
    ciclo_actual?: string;
    
    diagnostico?: string;
    hospital_origen?: string;
    codigo_sis?: string;

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