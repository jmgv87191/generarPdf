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
  selector: 'app-requerimiento-cobro',
  standalone: true,
  imports: [SideBarComponent, ReactiveFormsModule, CommonModule,QRCodeModule, RouterLink],
  templateUrl: './requerimiento-cobro.component.html',
  styleUrl: './requerimiento-cobro.component.css'
})

export class RequerimientoCobroComponent implements OnInit {

  altura = 160;
  form: FormGroup;
  clveusuIngresada!: number;
  codigoQr: string = 'adasd';
  mensajeOriginal: string = 'juan manuel';
  mensajeOriginal2: string = 'juan manuel';
  mensajeCifrado: string = '';
  mensajeDescifrado: string = '';
  dayOfMonth: string;
  dayOfMonthDosDiasAntes!: string;
  monthName: string;

  usuario: Usuario = {
    id: 3,
    name: 'Juan manuel gutierrez',
    calle: 'andador 3 no revolucionssssssssssssssssssss de 1910 entre sonora y sinalaoa int 4',
    municipio: 'La Paz',
    noCta: '010101.01',
    fechaUltPago: '27/Sept/2011',
    meses: '133',
    adeudo: '141306.43',
    adeudo_letra:'asdasdasdasd',
    meses_letra: ''
  };

  formAlta: Alta = {
    nombre: '',
    numero_cuenta:'',
    adeudo: '',
    numero_folio:'',
    adeudo_letra: '',
    meses_letra:''
  }

  constructor(
    private _documentService: DocumentosService,
    private fb: FormBuilder

  ){
    this.form = this.fb.group({
      cveusu: ['17070008', Validators.required]
    });


    const today = new Date();
    const dosDiasAntes = new Date();

    dosDiasAntes.setDate(today.getDate() - 2);

    this.dayOfMonth = this.getDayOfMonth(today);
    this.dayOfMonthDosDiasAntes = this.getDayOfMonth(dosDiasAntes);
    this.monthName = this.getMonthName(today);

  }

  ngOnInit(): void {


  }

  getDayOfMonth(date: Date): string {
    const day = date.getDate(); // Obtiene el día del mes (1-31)
    return day < 10 ? '0' + day : day.toString(); // Asegura que tenga dos dígitos
  }

  getDayOfMonthDosDiasAntes(date: Date): string {
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
        numero_folio: 'R',
        meses_letra:''
      }
      
      this.usuario.name = data.usuario.nombre;
      this.usuario.calle = data.usuario.direccion;
      this.usuario.municipio = data.recibos[0].Ciudad;
      this.usuario.noCta = data.usuario.cuenta;
      this.usuario.fechaUltPago = data.usuario.fechaUltimoPago.split(' ')[0];
      
      this.usuario.meses = data.usuario.mesesAdeudo;
      this.usuario.adeudo = parseFloat(data.usuario.saldo).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      this.usuario.adeudo_letra = data.recibos[0].TotalPagarLetra;

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
/*         ['Número de Contrato o Número de Cuenta:', `${this.usuario.adeudo_letra  }`],
 */      ],
    })

    doc.addImage(imageUrl, 'JPEG', 130, 5, 55, 23);
    doc.addImage(imageUrl2, 'JPEG', 25, 7, 24, 24);
    doc.addImage(imageUrl3, 'JPEG', 15, 275, 175, 15);
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(6);

    doc.text('"AÑO DEL CINCUENTENARIO DE LA CONVERSIÓN DE TERRITORIO FEDERAL A ESTADO LIBRE Y SOBERANO DE BAJA CALIFORNIA SUR”', 50, 38 );
    doc.text('“2024, AÑO DEL 75 ANIVERSARIO DE LA PUBLICACIÓN DEL ACUERDO DE COLONIZACIÓN DEL VALLE DE SANTO DOMINGO”', 64, 41 );

    doc.setFontSize(10);
    doc.text('', 137, 47 );
    doc.text(`No. de oficio: DG/DC/RP/${usuario.id}/2024.`, 135, 50 );
    doc.text('Asunto: Requerimiento de Pago.', 139, 54 );
    doc.text(`La Paz, Baja California Sur, a ${this.dayOfMonth} de ${this.monthName} de 2024.`, 100, 58 );

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

    })
    doc.setFont("helvetica", "bold");

    doc.text('REQUERIMIENTO DE PAGO DE LOS DERECHOS POR SUMINISTRO DE AGUA POTABLE,', 30, 112 );
    doc.text('ALCANTARILLADO Y SANEAMIENTO.', 75, 117 );
    doc.text('', 80, 122 );
    doc.setFont("helvetica", "normal");

    autoTable(doc, {
      theme: 'plain',
      tableWidth: 160,
      margin: { top: 20, bottom: 0, left: 25 },
      columnStyles: {
        0: { cellWidth: 160, halign: 'justify' } // Justifica el texto en la columna 0
      },
      styles: {
        cellPadding: 1,
        halign: 'justify', // Esto asegura que el texto en las celdas esté justificado
        valign: 'top' // Alineación vertical si es necesario
      },
      body: [
        [`Considerando la fecha ${this.dayOfMonthDosDiasAntes} de ${this.monthName} de 2024, se identificó en el registro del Sistema Comercial del Organismo Operador Municipal del Sistema de Agua Potable, Alcantarillado y Saneamiento de La Paz (OOMSAPAS), un adeudo por los servicios y meses que se señalan en la siguiente tabla:`  ],
      ],
    })  

    autoTable(doc, {
      theme: 'grid',
      tableWidth: 170,
      margin: {top:50, bottom: 85, left:20 },
      columnStyles:{ 0:{cellWidth:  40 } },
      body: [
        ['Obligación omitida', `último pago`, 'Meses','Adeudo',`Plazo para 
realizar el pago`  ],
        ['El Pago de los servicios de agua potable, drenaje, alcantarillado y saneamiento.', `${this.usuario.fechaUltPago  }`,
          `${this.usuario.meses}`,`$ ${this.usuario.adeudo}`,"3 días" ],
      ],
    })

    autoTable(doc, {
      theme: 'plain',
      tableWidth: 170,
      margin: { top: 20, bottom: 0, left: 22.5 },
      columnStyles: {
        0: { cellWidth: 165, halign: 'justify' } // Justifica el texto en la columna 0
      },
      styles: {
        cellPadding: 1,
        halign: 'justify', // Esto asegura que el texto en las celdas esté justificado
        valign: 'top' // Alineación vertical si es necesario
      },
      body: [
        [`Asimismo, este Organismo Operador le informa que no existen documentos o registro electrónico que acredite el pago de los derechos por los Servicios Públicos en materia de Agua Potable, Alcantarillado y Saneamiento y  en ejercicio  de sus facultades  realiza el requerimiento de  pago de los adeudos al sujeto obligado  (usuario) en materia de los  servicios que tiene  contratados con este  Organismo Operador, toda vez que ha incurrido en exceso del plazo a que se refiere la Cláusula Segunda del Contrato para la Prestación del Servicio de Agua Potable y cuyo fundamento refiere a los artículos 96, 97 y 119 de la Ley de Aguas del Estado de Baja California Sur.`  ],
        [''],
        [{ content: 'FUNDAMENTO', styles: { halign: 'center', fontStyle: 'bold' } }],
        [''],
        ['En los artículos 4 párrafo quinto, 14, 16, 27 párrafo quinto, 31 fracción IV, y 115 fracción III, inciso a), fracción IV inciso c) de la Constitución Política de los Estados Unidos Mexicanos; artículo 148 fracción IX, inciso a), XVI, 154 fracción VIII de la Constitución Política del Estado Libre y Soberano de Baja California Sur; artículo 2, 27 fracción VII, 28 fracción III, 36 fracciones I y V, 96, 97 y 116 de la Ley del Aguas del Estado de Baja California Sur; último párrafo del artículo 50 de la Ley de Procedimiento Administrativo para el Estado y los Municipios de Baja California Sur; artículos que facultan a este Organismo a recaudar, obtener o recibir los ingresos por los servicios públicos.']
      ],
    })  

    /* Segunda hoja  */
    
    doc.addPage();


    doc.addImage(imageUrl, 'JPEG', 130, 10, 55, 23);
    doc.addImage(imageUrl2, 'JPEG', 25, 12, 24, 24);
    doc.addImage(imageUrl3, 'JPEG', 15, 275, 175, 15);

    
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(6);

    doc.text('"AÑO DEL CINCUENTENARIO DE LA CONVERSIÓN DE TERRITORIO FEDERAL A ESTADO LIBRE Y SOBERANO DE BAJA CALIFORNIA SUR”', 48, 42 );
    doc.text('“2024, AÑO DEL 75 ANIVERSARIO DE LA PUBLICACIÓN DEL ACUERDO DE COLONIZACIÓN DEL VALLE DE SANTO DOMINGO”', 62, 45 );


    doc.setFontSize(10);
    doc.text(`No. de oficio: DG/DC/RP/${usuario.id}/2024.`, 135, 60 );
    doc.text('Asunto: Requerimiento de Pago.', 139, 65 );
    doc.text(`La Paz, Baja California Sur, a ${this.dayOfMonth} de ${this.monthName} de 2024.`, 100, 70 );

    autoTable(doc, {
      theme: 'plain',
      tableWidth: 170,
      margin: { top: 80, bottom: 0, left: 22.5 },
      columnStyles: {
        0: { cellWidth: 165, halign: 'justify' } // Justifica el texto en la columna 0
      },
      styles: {
        cellPadding: 1,
        halign: 'justify', // Alineación horizontal general justificada
        valign: 'top' // Alineación vertical si es necesario
      },
      body: [
        [`En el Boletín Oficial del Gobierno del Estado de Baja California Sur con fecha 20 de diciembre de 2022, tomo XLIX, No. 77, se establecen las cuotas referentes al pago de derechos generados por la prestación de los servicios públicos en materia de Agua Potable, Alcantarillado y Saneamiento, las cuales deben ser pagadas por los usuarios dentro de la fecha límite que se indique en sus recibos.`],
        [''],
        // Crear una celda con alineación centrada para "REQUERIMIENTO"
        [{ content: 'REQUERIMIENTO', styles: { halign: 'center', fontStyle: 'bold' } }],
        [''],
        [`De conformidad con el fundamento antes mencionado, se le requiere para que en el término de 3 (tres) días hábiles siguientes al día en que haya surtido efectos la notificación del presente documento, realice el pago de los periodos omitidos, o en su caso, exhiba los documentos con los cuales acredite haber realizado el pago, para lo cual deberá: 1) agendar cita mediante el correo electrónico ccr.dc@sapalapaz.gob.mx, 2) o mediante el número telefónico: (612) 1238600 Ext. 1242 en un horario de lunes a viernes de 8:00 a 15:00 hrs. y sábados de 9:00 a 13:00 hrs. Del mismo modo, en el domicilio citado al pie de página del presente documento, deberá mostrar copia de los siguientes documentos:`],
        [''],
        [`a) Los comprobantes de pago de los periodos señalados en el cuadro de arriba.`],
        [`b) Contrato firmado entre el organismo operador de servicios y el usuario de la toma.`],
        [`c) Carta poder o escritura notarial en el caso de representación de personas física o moral.`],
        [`d) Identificación oficial vigente.`],
        [''],
        [`Por último, se hace de su conocimiento que en caso de no atender el presente requerimiento en los términos establecidos y de no proceder a las aclaraciones de pago o de continuar con el incumplimiento de las obligaciones fiscales de pago, se dará inicio a las acciones establecidas en el artículo 119 de la Ley del Aguas del Estado de Baja California Sur que a la letra dice: La falta de pago de las cuotas por servicio, a la fecha de vencimiento, por parte de usuarios no domésticos, faculta al Municipio o al prestador de los servicios para suspender los servicios públicos hasta que se regularice su pago.(…) Lo anterior, será independiente de poner en conocimiento de tal situación a las autoridades sanitarias.`],
        [''],
        [{ content: 'ATENTAMENTE', styles: { halign: 'center', fontStyle: 'bold' } }],
        [''],
        [''],
        [{ content: 'ING. ZULEMA GUADALUPE LAZOS RAMÍREZ', styles: { halign: 'center', fontStyle: 'bold' } }],
        [{ content: 'DIRECTORA GENERAL DEL ORGANISMO OPERADOR MUNICIPAL DEL SISTEMA DE AGUA', styles: { halign: 'center' } }],
        [{ content: 'POTABLE, ALCANTARILLADO Y SANEAMIENTO DE LA PAZ.', styles: { halign: 'center'} }],

      ],
    });
  
    doc.setFontSize(6);
    doc.text('C.C.P.- Lic. Neyma Luna Salaices. - Directora Comercial. - Para su atención procedente.', 30, 263);
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
  
      doc.save('requerimiento_cobro.pdf');
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
