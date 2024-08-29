export interface Usuario {

    id?:number;
    name: string;
    calle:string;
    municipio: string;
    noCta: string;
    fechaUltPago: string,
    meses:string,
    adeudo:number,
    adeudo_letra:string,
    meses_letra: string,
}

export interface Login{
    email: string;
    password: string;
}

export interface ResponseI{
    status: string;
    token: any;
}

export interface Alta{
    nombre:string;
    numero_cuenta: string;
    adeudo: string;
    numero_folio:string;
    adeudo_letra: string;
    meses_letra: string;
}

export interface RespuestaAlta{
    nombre:string;
    numero_cuenta: string;
    adeudo: string;
    numero_folio:string;
    update_at:string;
    created_at:string;
    id:number;
}