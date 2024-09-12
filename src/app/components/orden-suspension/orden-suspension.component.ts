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
import { NumeroATextoService } from '../../services/numero-atexto.service';

@Component({
  selector: 'app-orden-suspension',
  standalone: true,
  imports: [SideBarComponent, ReactiveFormsModule, CommonModule,QRCodeModule, RouterLink],
  templateUrl: './orden-suspension.component.html',
  styleUrl: './orden-suspension.component.css'
})

export class OrdenSuspensionComponent {
  
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
  cantidadEnTextoMeses!: string;

  usuario: Usuario = {
    id: 3,
    name: 'Juan manuel gutierrez',
    calle: 'andador 3 no revolucionssssssssssssssssssss de 1910 entre sonora y sinalaoa int 4',
    municipio: 'La Paz',
    noCta: '010101.01',
    fechaUltPago: '27/Sept/2011',
    meses: '133',
    adeudo: 141306.43,
    adeudo_letra: '141306.43',
    meses_letra: ''
  };

  formAlta: Alta = {
    nombre: '',
    numero_cuenta:'',
    adeudo: '',
    numero_folio:'',
    adeudo_letra: '',
    meses_letra: ''
  }

  constructor(
    private _documentService: DocumentosService,
    private fb: FormBuilder,
    private numeroATextoService: NumeroATextoService
  ){
    this.form = this.fb.group({
      cveusu: ['11030031', Validators.required]
    });


    const today = new Date();
    this.dayOfMonth = this.getDayOfMonth(today);
    this.monthName = this.getMonthName(today);

  }

  ngOnInit(): void {

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

    this._documentService.getToma(id).subscribe((data) => {

      this.formAlta = {
        nombre: data.usuario.nombre,
        numero_cuenta: data.usuario.cuenta,
        adeudo: String(data.usuario.saldo),
        adeudo_letra: String(data.usuario.saldo),
        numero_folio: 'S',
        meses_letra:''
      }
/*         this.formAlta.nombre = data.usuario.nombre;
      this.formAlta.numero_cuenta = data.usuario.cuenta; */
      
      this.usuario.name = data.usuario.nombre;
      this.usuario.calle = data.usuario.direccion;
      this.usuario.municipio = data.recibos[0].Ciudad;
      this.usuario.noCta = data.usuario.cuenta;
      this.usuario.fechaUltPago = data.usuario.fechaUltimoPago;
      this.usuario.meses = data.usuario.mesesAdeudo;
      this.usuario.adeudo = data.usuario.saldo;
      this.usuario.adeudo_letra = data.recibos[0].TotalPagarLetra;

      this.cantidadEnTextoMeses = this.numeroATextoService.numeroATexto(Number(this.usuario.meses)); // Ejemplo

      
      this.usuario.meses_letra = String(this.cantidadEnTextoMeses)

      this.codigoQr = data.usuario.nombre;
      
      this._documentService.postAlta(this.formAlta).subscribe((data)=>{
        this.usuario.id = data.id
        this.generatePDF(this.usuario);
      })



        


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

    const imageUrl = '../../../assets/sapa.png'; 
    const imageUrl2 = '../../../assets/logo-ayuntamiento.jpg'; 
    const imageUrl3 = '../../../assets/New.jpg'; 

    const doc = new jsPDF();

    
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
    doc.addImage(imageUrl2, 'JPEG', 25, 7, 24, 24);
    doc.addImage(imageUrl3, 'JPEG', 15, 275, 175, 15);
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(6);

    doc.text('"2024, AÑO DEL CINCUENTENARIO DE LA CONVERSIÓN DE TERRITORIO FEDERAL A ESTADO LIBRE Y SOBERANO DE BAJA CALIFORNIA SUR"', 50, 35 );
    doc.text('“2024, AÑO DEL 75 ANIVERSARIO DE LA PUBLICACIÓN DEL ACUERDO DE COLONIZACIÓN DEL VALLE DE SANTO DOMINGO”', 69, 38 );

    doc.setFontSize(10);
    doc.text('', 137, 47 );
    doc.text(`No. de Folio: DG/DC/OS/${usuario.id}/2024.`, 140, 50 );
    doc.text('Asunto: Orden de Suspensión.', 147, 54 );
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
    doc.text('ORDEN DE SUSPENSIÓN POR LA OMISIÓN EN EL PAGO DE LOS DERECHOS POR EL SUMINISTRO ', 20, 112 );
    doc.text('DE AGUA POTABLE, ALCANTARILLADO Y SANEAMIENTO', 55, 117 );
    doc.text('', 80, 122 );
    doc.setFont("helvetica", "normal");

    autoTable(doc, {
      theme: 'plain',
      tableWidth: 160,
      margin: { top: 0, bottom: 0, left: 15 },
      columnStyles: {
        0: { cellWidth: 180,halign: 'center' },
      },
      styles: {
        cellPadding: .5, 
      },
      body: [
        ['Por este medio y con fundamento en los artículos 14, 16, 27 párrafo quinto, 31 fracción IV, y 115'  ],
        ['fracción III, inciso a), fracción IV inciso c) de la Constitución Política de los Estados Unidos Mexicanos,'  ],
        ['al artículo 148 fracción IX inciso a), fracción XVI y 154 fracción VIII de la Constitución Política del Estado'  ],
        ['Libre y Soberano de Baja California Sur, artículo 1, 2, 3, 21, 24, 25, 27, 97, 116 y 119 de la Ley de Aguas'  ],
        ['del Estado de Baja California Sur, así como el artículo 1, 2 Fracción X del Decreto de creación, con'  ],
        ['fecha 30 de junio de 2024, Boletín Oficial del Gobierno del Estado de Baja California Sur, No. 47, tomo'  ],
        ['LI, Contrato para la Prestación del Servicio de Agua Potable que FACULTA a este Organismo Operador'  ],
        ['Municipal del Sistema de Agua Potable, Alcantarillado y Saneamiento de la Paz, Baja California Sur'  ],
        ['(OOMSAPAS) a suspender por la falta de pago por la prestación de los servicios de agua potable y'  ],
        ['alcantarillado, en el caso de incumplimiento por parte del usuario dentro de los 3 (tres) días'  ],
        ['posteriores a la fecha en que fue notificado el importe del consumo correspondiente, basándose en'  ],
        ['la Clausula Segunda del Contrato para la Prestación del Servicio de Agua Potable firmado con el'  ],
        ['propietario del inmueble (o usuario del servicio). Asimismo, la falta de pago de las cuotas por servicio,'  ],
        ['a la fecha de vencimiento, por parte de usuarios no domésticos, FACULTA al Municipio o al prestador'  ],
        ['de los servicios para suspender los servicios públicos hasta que se regularice su pago.'  ],
        [''  ],
        ['De acuerdo en lo señalado en el párrafo anterior y al no existir documentos o registro electrónico que'  ],
        ['acredite el pago de los derechos por los Servicios Públicos en materia de Agua Potable, Alcantarillado'  ],
        [`y Saneamiento en ${this.usuario.meses} ( ${this.usuario.meses_letra} ) meses, lo cual equivale a la cantidad de`],
        [`$${this.usuario.adeudo}  (${this.usuario.adeudo_letra  }), situación`  ],
        [ 'por lo cual se generó la presente orden para realizar la SUSPENSIÓN DEL SERVICIO DE AGUA POTABLE' ],
        [ 'Y ALCANTARILLADO, hasta que se cubra o regularice la situación de adeudo ante este Organismo' ],
        [ 'Operador' ],

      ],
    })   
    
    
    
    
    /* Segunda hoja  */
    
    doc.addPage();


    doc.addImage(imageUrl, 'JPEG', 130, 10, 55, 23);
    doc.addImage(imageUrl2, 'JPEG', 25, 12, 24, 24);
    doc.addImage(imageUrl3, 'JPEG', 15, 275, 175, 15);

    doc.setTextColor(0, 0, 0);

    doc.setFontSize(6);

    doc.text('AÑO DEL CINCUENTENARIO DE LA CONVERSIÓN DE TERRITORIO FEDERAL A ESTADO LIBRE Y SOBERANO DE BAJA CALIFORNIA SUR”', 50, 42 );
    doc.text('“2024, AÑO DEL 75 ANIVERSARIO DE LA PUBLICACIÓN DEL ACUERDO DE COLONIZACIÓN DEL VALLE DE SANTO DOMINGO”', 62, 45 );

    doc.setFontSize(10);
    doc.text(`No. de oficio: DG/DC/OS/${usuario.id}/2024.`, 135, 60 );
    doc.text('Asunto: Orden de Suspensión.', 142, 65 );
    doc.text(`La Paz, Baja California Sur, a ${this.dayOfMonth} de ${this.monthName} de 2024.`, 109, 70 );

    doc.text('Para la atención y seguimiento de la presente Orden de Suspensión se pone a disposición la siguiente', 24, 80);


    doc.text('dirección y teléfono de la Oficina del OOMSAPAS de La Paz, ubicada en Calle Félix Ortega Número 2330', 22, 85);
    doc.text('e/ Calle Márquez de León y Normal Urbana, Zona Centro, La Paz, Baja California Sur, con el teléfono ', 25, 90);
    doc.text('(612) 12-38600 Ext. 1242, de lunes a viernes de 8:00 a 16:00 hrs. y sábados de 9:00 a 14:00 hrs. para ', 24, 95);
    doc.text('aclarar o cubrir el adeudo.', 85, 100);
    doc.text('Sin otro particular, quedo a sus órdenes.', 73, 110);


    doc.setFont("helvetica", "bold");

    doc.text('ATENTAMENTE', 91, 130);
    doc.text('ING. ZULEMA GUADALUPE LAZOS RAMÍREZ', 67, 155);
    doc.setFont("helvetica", "normal");

    doc.text('DIRECTORA GENERAL DEL ORGANISMO OPERADOR MUNICIPAL DEL SISTEMA DE AGUA', 29, 160);
    doc.text('POTABLE, ALCANTARILLADO Y SANEAMIENTO DE LA PAZ.', 54, 165);
    doc.setFontSize(6);
    doc.text('C.C.P.-Lic. Neyma Luna Salaices. - Directora Comercial. - Para su atención procedente.', 30, 263);
    doc.text('C.c.p. Archivo.', 30, 265);

    
    this.mensajeOriginal = this.usuario.name +" "+ this.usuario.adeudo + " "+ this.usuario.noCta
    setTimeout(() => {
      
      this.mensajeOriginal2 =  this.cifrarMensaje(this.mensajeOriginal)
    }, 100);

    setTimeout(() => {
      
      const qrCodeElement = document.querySelector('qrcode canvas') as HTMLCanvasElement;

      if (qrCodeElement) {
        const qrCodeImageUrl = qrCodeElement.toDataURL('image/png');
        doc.addImage(qrCodeImageUrl, 'PNG', 25, 265, 30, 30);
      }
  
      doc.save('orden_suspension.pdf');
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
  }


  

}
