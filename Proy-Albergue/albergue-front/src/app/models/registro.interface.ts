export interface Persona {
    idpersona?: number;
    dni: string;
    nombres: string;
    apellidos: string;
    telefono?: string;
    procedencia?: string;
    idtipo_persona?: number;
    
    // Agregamos los objetos opcionales para enviar al backend
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

// Respuesta estándar del API
export interface ApiResponse {
    success: boolean;
    data: any;
    message: string;
}