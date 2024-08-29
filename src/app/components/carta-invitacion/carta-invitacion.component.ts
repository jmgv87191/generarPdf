import { Component, OnInit } from '@angular/core';
import { SideBarComponent } from '../side-bar/side-bar.component';
import { RouterLink, RouterOutlet } from '@angular/router';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'
import { Alta, Usuario } from '../../interfaces/requerimiento';
import { FormGroup, Validators, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DocumentosService } from '../../services/documentos.service';
import { QRCodeModule } from 'angularx-qrcode';

@Component({
  selector: 'app-carta-invitacion',
  standalone: true,
  imports: [SideBarComponent, ReactiveFormsModule, CommonModule,QRCodeModule, RouterLink],
  templateUrl: './carta-invitacion.component.html',
  styleUrl: './carta-invitacion.component.css'
})
export class CartaInvitacionComponent {
  altura = 160;
  form: FormGroup;
  clveusuIngresada!: number;
  codigoQr: string = 'adasd';
  mensajeOriginal: string = 'juan manuel';
  mensajeOriginal2: string = 'juan manuel';
  mensajeCifrado: string = '';
  mensajeDescifrado: string = '';
  dayOfMonth: string;
  monthName: string;

  usuario: Usuario = {
    id: 3,
    name: 'Juan manuel gutierrez',
    calle: 'andador 3 no revolucionssssssssssssssssssss de 1910 entre sonora y sinalaoa int 4',
    municipio: 'La Paz',
    noCta: '010101.01',
    fechaUltPago: '27/Sept/2011',
    meses: '133',
    adeudo: 141306.43,
  };

  formAlta: Alta = {
    nombre: '',
    numero_cuenta:'',
    adeudo: '',
    numero_folio:''
  }

  constructor(
    private _documentService: DocumentosService,
    private fb: FormBuilder

  ){
    this.form = this.fb.group({
      cveusu: ['11030031', Validators.required]
    });


    const today = new Date();
    this.dayOfMonth = this.getDayOfMonth(today);
    this.monthName = this.getMonthName(today);

  }

  ngOnInit(): void {
    console.log(this.dayOfMonth)
    console.log(this.monthName)

  }

  getDayOfMonth(date: Date): string {
    const day = date.getDate(); // Obtiene el día del mes (1-31)
    return day < 10 ? '0' + day : day.toString(); // Asegura que tenga dos dígitos
  }

  getMonthName(date: Date): string {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
      'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const monthIndex = date.getMonth(); // Obtiene el índice del mes (0-11)
    return months[monthIndex];
  }

  getDatos(id: number) {
    this._documentService.postAlta(this.formAlta).subscribe((data)=>{
      this.usuario.id = data.id
    })  
    this._documentService.getToma(id).subscribe((data) => {

      this.formAlta = {
        nombre: data.usuario.nombre,
        numero_cuenta: data.usuario.cuenta,
        adeudo: String(data.usuario.saldo),
        numero_folio: '1'
      }
      this.usuario.name = data.usuario.nombre;
      this.usuario.calle = data.usuario.direccion;
      this.usuario.municipio = data.recibos[0].Ciudad;
      this.usuario.noCta = data.usuario.cuenta;
      this.usuario.fechaUltPago = data.usuario.fechaUltimoPago;
      this.usuario.meses = data.usuario.mesesAdeudo;
      this.usuario.adeudo = data.usuario.saldo;

      this.codigoQr = data.usuario.nombre;
      
        this.generatePDF(this.usuario);
    });
  }

  sendCveusu() {
    this.clveusuIngresada = this.form.value.cveusu;
    this.getDatos(this.clveusuIngresada);
  }

  downloadQRCode() {
    const qrCodeElement = document.querySelector('qrcode canvas') as HTMLCanvasElement;
    if (qrCodeElement) {
      const url = qrCodeElement.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qrcode.png';
      a.click();
    }
  }

  generatePDF( usuario:Usuario ){

    const imageUrl = 'assets/sapa.png';
    const imageUrl2 = 'assets/logo-ayuntamiento.jpg';
    const imageUrl3 = 'assets/New.jpg';

    const doc = new jsPDF();

    console.log( this.usuario )
    
    autoTable(doc, {
      theme: 'grid',
      tableWidth: this.altura,
      margin: { top:65, bottom: 75, left:25, right:0 },
      columnStyles:{ 0:{cellWidth:  40 } },
      body: [
        ['Usuario:', `${this.usuario.name  }` ],
        ['Calle y número:', `${this.usuario.calle  }` ],
        ['Municipio:', `${this.usuario.municipio  }`],
        ['Número de Contrato o Número de Cuenta:', `${this.usuario.noCta  }`],
      ],
    })

    doc.addImage(imageUrl, 'JPEG', 130, 5, 55, 23);
    doc.addImage(imageUrl2, 'JPEG', 25, 7, 20, 20);
    doc.addImage(imageUrl3, 'JPEG', 15, 275, 175, 15);
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(6);

    doc.text('"2024, AÑO DEL CINCUENTENARIO DE LA CONVERSIÓN DE TERRITORIO FEDERAL A ESTADO LIBRE Y SOBERANO DE BAJA CALIFORNIA SUR"', 50, 33 );
    doc.text('“2024, AÑO DEL 75 ANIVERSARIO DE LA PUBLICACIÓN DEL ACUERDO DE COLONIZACIÓN DEL VALLE DE SANTO DOMINGO”', 69, 36 );

    doc.setFontSize(10);
    doc.text('', 137, 47 );
    doc.text(`No. de Folio: DC/CR/CI/${usuario.id}/2024.`, 140, 50 );
    doc.text('Asunto: ', 153, 54 );
    doc.setFont("helvetica", "bold");
    doc.text('Carta Invitación.', 166, 54 );
    doc.setFont("helvetica", "normal");

    doc.text(`La Paz, Baja California Sur, a ${this.dayOfMonth} de ${this.monthName} de 2024.`, 112, 58 );

    autoTable(doc, {
      theme: 'grid',
      tableWidth: 160,
      margin: { bottom: 0, left:25 },
      columnStyles:{ 0:{cellWidth:  40 } },
      styles: { fillColor: [255, 255, 255], textColor: [255, 255, 255], lineColor: [255, 255, 255] },

      body: [
        ['Obligación omitida', `Fecha del último pago`, 'Meses','Adeudo','Plazo para realizar el pago'  ],
      ],
    })

    autoTable(doc, {
      theme: 'grid',
      tableWidth: 160,
      margin: { bottom: 0, left:25 },
      columnStyles:{ 0:{cellWidth:  40 } },
      styles: { fillColor: [255, 255, 255], textColor: [255, 255, 255], lineColor: [255, 255, 255] },

      body: [
        ['Obligación omitida', `Fecha del último pago`, 'Meses','Adeudo','Plazo para realizar el pago'  ],
      ],
    })

    doc.setFont("helvetica", "bold");
    doc.text('CARTA INVITACIÓN', 90, 112 );
    doc.text('', 80, 122 );
    doc.setFont("helvetica", "normal");

    doc.text('El Organismo Operador Municipal del Sistema de Agua Potable, Alcantarillado y Saneamiento de La', 27, 130 );
    doc.text('Paz; conocido por sus siglas OOMSAPAS ha identificado en su Sistema Comercial un pasivo de ', 29, 135 );
    doc.text('$95,921.73 (NOVENTA Y CINCO MIL NOVECIENTOS VEINTIUN PESOS 731/100M.N.), de 107 meses', 23, 140 );
    doc.text('vencidos por el pago de los servicios de agua potable, alcantarillado y saneamiento.', 39, 145 );

    doc.text('Por lo anterior, le hacemos una cordial invitación para acercarse a las oficinas de OOMSAPAS y', 29, 155 );
    doc.text('conocer el monto del adeudo y las alternativas que ofrece el Organismo Operador para realizar el pago', 23, 160 );
    doc.text('de los 107 meses identificados, tomando en cuenta sus condiciones de pago. ', 45, 165 );

    doc.text('En este sentido, lo esperamos a la brevedad en cualquiera de nuestras oficinas ubicadas en Calle Félix ', 23, 175 );
    doc.text('Ortega Número 2330 e/ Calle Márquez de León y Normal Urbana, Zona Centro, La Paz, Baja California', 23, 180 );
    doc.text('Sur, con el teléfono (612) 12-38600 Ext. 1242, de lunes a viernes de 8:00 a 16:00 hrs. y sábados de 9:00 ', 23, 185 );
    doc.text('a 14:00 hrs. para aclarar o cubrir el adeudo; en el término de 3 días hábiles después de la recepción de', 24, 190 );
    doc.text('la presente invitación. ', 87, 195 );

    doc.text('En caso de haber realizado el pago total de los meses identificados con adeudo o estar al corriente en ', 25, 205 );
    doc.text('los pagos, omitir el presente documento.', 75, 210 );
    
    
    doc.text('ATENTAMENTE', 91, 220);
    doc.setFont("helvetica", "bold");
    doc.text('LIC. NEYMA LUNA SALAICES', 80, 240);
    doc.setFont("helvetica", "normal");
    doc.text('DIRECTORA COMERCIAL DEL ORGANISMO OPERADOR MUNICIPAL DEL SISTEMA DE AGUA', 27, 245);
    doc.text('POTABLE, ALCANTARILLADO Y SANEAMIENTO DE LA PAZ.', 54, 250);
    doc.setFontSize(6);
/*     doc.text('C.C.P.- C. Carlos Andrés Camargo Lira, Director Comercial. - Para su atención procedente.', 30, 263);
    doc.text('C.c.p. Archivo.', 30, 265); */
    
    
    this.mensajeOriginal = this.usuario.name +" "+ this.usuario.adeudo + " "+ this.usuario.noCta
    setTimeout(() => {
      
      this.mensajeOriginal2 =  this.cifrarMensaje(this.mensajeOriginal)
    }, 100);

    console.log( this.cifrarMensaje(  this.mensajeOriginal) )
    setTimeout(() => {
      
      const qrCodeElement = document.querySelector('qrcode canvas') as HTMLCanvasElement;

      if (qrCodeElement) {
        const qrCodeImageUrl = qrCodeElement.toDataURL('image/png');
        doc.addImage(qrCodeImageUrl, 'PNG', 25, 265, 30, 30);
      }
  
      doc.save('Carta Inivitacion.pdf');
    }, 100);      
  
  }

  cifrarMensaje(mensaje:string) {
    // Convertir a Base64
    this.mensajeCifrado = btoa(mensaje);
    return 'https://requerimientos.sapalapaz.gob.mx/decodificar/'+this.mensajeCifrado
  }

  descifrarMensaje(mensaje:string) {
    // Convertir de Base64 a texto
    this.mensajeDescifrado = atob(mensaje);
    return console.log(this.mensajeDescifrado)
  }

}
