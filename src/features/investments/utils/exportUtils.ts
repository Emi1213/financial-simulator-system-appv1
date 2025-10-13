import { jsPDF } from 'jspdf';
import { utils, writeFile } from 'xlsx';
import { InvestmentCalculation, IProductoInversion } from '../types/investmentInterface';

interface Institution {
  id_info: number;
  nombre: string;
  logo: string;
  slogan: string;
  color_primario: string;
  color_secundario: string;
  direccion: string;
  pais: string;
  owner: string;
  telefono: string;
  correo: string;
  estado: boolean;
}

/**
 * Obtiene los datos de la institución desde la API
 */
export const getInstitutionData = async (): Promise<Institution | null> => {
  try {
    const response = await fetch('/api/admin/institution');
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Error cargando datos de la institución:', error);
    return null;
  }
};

/**
 * Convierte hex color a RGB
 */
const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0];
};

/**
 * Agrega marca de agua al PDF
 */
const addWatermark = (pdf: jsPDF, institution: Institution | null) => {
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  
  pdf.saveGraphicsState();
  pdf.setGState(new (pdf as any).GState({ opacity: 0.1 }));
  pdf.setFontSize(60);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(200, 200, 200);
  
  const watermarkText = institution?.nombre || 'SIMULACIÓN';
  const textWidth = pdf.getTextWidth(watermarkText);
  
  pdf.text(watermarkText, 
    (pageWidth - textWidth) / 2, 
    pageHeight / 2,
    { angle: 45 }
  );
  
  pdf.restoreGraphicsState();
};

/**
 * Exporta la simulación de inversión a PDF con diseño tipo interface moderna
 */
export const exportInvestmentToPDF = async (
  calculation: InvestmentCalculation,
  producto: IProductoInversion,
  monto: number,
  plazo: number
) => {
  try {
    const institution = await getInstitutionData();
    const nombreEmpresa = institution?.nombre || 'Institución Financiera';
    const colorPrimario = institution?.color_primario || '#3b82f6';
    const colorSecundario = institution?.color_secundario || '#1e40af';
    const colorVerde = '#10b981';
    const colorAzul = '#3b82f6';
    const colorGris = '#6b7280';
    const colorFondo = '#f8fafc';

    const pdf = new jsPDF('p', 'mm', 'a4');
    let yPosition = 15;
    const margin = 15;
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const cardWidth = pageWidth - (margin * 2);

    const addWatermarkToAllPages = () => {
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        addWatermark(pdf, institution);
      }
    };

    const checkPageBreak = (requiredHeight: number = 10) => {
      if (yPosition + requiredHeight > pageHeight - 20) {
        pdf.addPage();
        yPosition = 15;
        return true;
      }
      return false;
    };

    // Función para crear gradiente simulado con múltiples rectángulos
    const drawGradientCard = (x: number, y: number, width: number, height: number, color1: string, color2: string) => {
      const steps = 20;
      const stepHeight = height / steps;
      
      for (let i = 0; i < steps; i++) {
        const ratio = i / (steps - 1);
        const [r1, g1, b1] = hexToRgb(color1);
        const [r2, g2, b2] = hexToRgb(color2);
        
        const r = Math.round(r1 + (r2 - r1) * ratio);
        const g = Math.round(g1 + (g2 - g1) * ratio);
        const b = Math.round(b1 + (b2 - b1) * ratio);
        
        pdf.setFillColor(r, g, b);
        pdf.rect(x, y + (i * stepHeight), width, stepHeight, 'F');
      }
    };

    // Función para crear cards estilo interface
    const drawCard = (x: number, y: number, width: number, height: number, gradientColor1: string, gradientColor2: string) => {
      // Sombra
      pdf.setFillColor(0, 0, 0, 0.1);
      pdf.rect(x + 1, y + 1, width, height, 'F');
      
      // Card con gradiente
      drawGradientCard(x, y, width, height, gradientColor1, gradientColor2);
      
      // Borde
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.2);
      pdf.rect(x, y, width, height);
    };

    const addCardText = (
      text: string,
      x: number,
      y: number,
      fontSize = 10,
      isBold = false,
      color: string = '#ffffff',
      align: 'left' | 'center' | 'right' = 'left'
    ) => {
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
      
      const [r, g, b] = hexToRgb(color);
      pdf.setTextColor(r, g, b);

      let xPosition = x;
      if (align === 'center') {
        const textWidth = pdf.getTextWidth(text);
        xPosition = x - (textWidth / 2);
      } else if (align === 'right') {
        const textWidth = pdf.getTextWidth(text);
        xPosition = x - textWidth;
      }

      pdf.text(text, xPosition, y);
    };

    // --- HEADER MODERNO CON GRADIENTE ---
    drawGradientCard(0, 0, pageWidth, 50, colorPrimario, colorSecundario);
    
    // Logo/Título principal
    addCardText(nombreEmpresa.toUpperCase(), pageWidth / 2, 20, 18, true, '#ffffff', 'center');
    
    if (institution?.slogan) {
      addCardText(institution.slogan, pageWidth / 2, 28, 10, false, '#e0e7ff', 'center');
    }
    
    // Subtítulo con badge style
    drawCard(margin, 35, cardWidth, 12, '#10b981', '#059669');
    addCardText('CALCULADORA DE CRECIMIENTO PATRIMONIAL', pageWidth / 2, 43, 12, true, '#ffffff', 'center');
    
    yPosition = 55;

    // --- CARDS DE RESUMEN ESTILO INTERFACE ---
    const returnPercentage = ((calculation.totalReturn / calculation.initialAmount) * 100);
    
    checkPageBreak(35);
    
    // Card Principal - Información del Producto
    drawCard(margin, yPosition, cardWidth * 0.65, 32, '#3b82f6', '#1e40af');
    addCardText('Tu Rendimiento Proyectado', margin + 8, yPosition + 12, 12, true, '#ffffff');
    addCardText(producto.nombre, margin + 8, yPosition + 20, 10, false, '#e0e7ff');
    addCardText(`$${calculation.totalReturn.toLocaleString()}`, margin + (cardWidth * 0.65) - 8, yPosition + 20, 14, true, '#ffffff', 'right');
    
    // Card Lateral - Análisis
    drawCard(margin + (cardWidth * 0.68), yPosition, cardWidth * 0.32, 32, '#6b7280', '#4b5563');
    addCardText('Análisis de Inversión', margin + (cardWidth * 0.68) + 8, yPosition + 12, 10, true, '#ffffff');
    addCardText(`${returnPercentage.toFixed(2)}%`, margin + (cardWidth * 0.68) + (cardWidth * 0.16), yPosition + 20, 12, true, '#ffffff', 'center');
    addCardText('Rentabilidad Total', margin + (cardWidth * 0.68) + (cardWidth * 0.16), yPosition + 28, 8, false, '#d1d5db', 'center');
    
    yPosition += 40;
    
    // Grid de información detallada
    const gridCols = 2;
    const colWidth = cardWidth / gridCols;
    
    // Columna 1 - Datos de Inversión
    drawCard(margin, yPosition, colWidth - 2, 25, '#f8fafc', '#e2e8f0');
    addCardText('Datos de Inversion', margin + 8, yPosition + 10, 10, true, '#1f2937');
    addCardText(`Monto Inicial: $${monto.toLocaleString()}`, margin + 8, yPosition + 16, 8, false, '#374151');
    addCardText(`Plazo: ${plazo} meses`, margin + 8, yPosition + 20, 8, false, '#374151');
    
    // Columna 2 - Producto
    drawCard(margin + colWidth + 2, yPosition, colWidth - 2, 25, '#f0fdf4', '#dcfce7');
    addCardText('Detalles del Producto', margin + colWidth + 10, yPosition + 10, 10, true, '#166534');
    addCardText(`Tasa: ${producto.tasa_anual}% anual`, margin + colWidth + 10, yPosition + 16, 8, false, '#15803d');
    if (producto.tipo_inversion) {
      addCardText(`Tipo: ${producto.tipo_inversion.nombre}`, margin + colWidth + 10, yPosition + 20, 8, false, '#15803d');
    }
    
    yPosition += 35;

    // --- TABLA ESTILO MODAL MODERNA ---
    checkPageBreak(35);
    
    // Header de la tabla con gradiente
    drawCard(margin, yPosition, cardWidth, 12, '#1f2937', '#111827');
    addCardText('Proyeccion de Inversion - Evolucion Mensual', pageWidth / 2, yPosition + 8, 11, true, '#ffffff', 'center');
    yPosition += 18;
    
    // Crear tabla con estilo moderno
    const rowHeight = 6;
    const headerHeight = 8;
    
    // Header de columnas
    drawCard(margin, yPosition, cardWidth, headerHeight, '#f1f5f9', '#e2e8f0');
    
    const colWidths = [25, 35, 35, 35, 35];
    const headers = ['Mes', 'Balance Inicial', 'Interés Ganado', 'Balance Final', 'Total Acumulado'];
    let xPos = margin + 5;
    
    headers.forEach((header, idx) => {
      addCardText(header, xPos, yPosition + 6, 8, true, '#475569');
      xPos += colWidths[idx];
    });
    
    yPosition += headerHeight + 2;
    
    // Filas de datos con alternating colors
    calculation.monthlyProjection.forEach((projection, index) => {
      checkPageBreak(rowHeight + 2);
      
      const bgColor1 = index % 2 === 0 ? '#ffffff' : '#f8fafc';
      const bgColor2 = index % 2 === 0 ? '#fefefe' : '#f1f5f9';
      
      drawCard(margin, yPosition, cardWidth, rowHeight, bgColor1, bgColor2);
      
      const balanceInicial = projection.month === 1 ? calculation.initialAmount : 
                            (calculation.monthlyProjection[projection.month - 2]?.accumulated || 0);
      
      xPos = margin + 5;
      const rowData = [
        { text: `Mes ${projection.month}`, color: '#374151' },
        { text: `$${balanceInicial.toLocaleString()}`, color: '#374151' },
        { text: `+$${projection.interest.toLocaleString()}`, color: '#059669' },
        { text: `$${projection.balance.toLocaleString()}`, color: '#374151' },
        { text: `$${projection.accumulated.toLocaleString()}`, color: '#1d4ed8' }
      ];
      
      rowData.forEach((cell, idx) => {
        addCardText(cell.text, xPos, yPosition + 4, 7, false, cell.color);
        xPos += colWidths[idx];
      });
      
      yPosition += rowHeight + 1;
    });
    
    yPosition += 10;
    
    // --- RESUMEN FINAL CON CARDS ---
    checkPageBreak(45);
    
    // Card de resumen con métricas destacadas
    drawCard(margin, yPosition, cardWidth, 35, '#0f172a', '#1e293b');
    addCardText('Resumen Final de tu Inversion', pageWidth / 2, yPosition + 12, 12, true, '#ffffff', 'center');
    
    // Tres métricas en línea
    const metricWidth = cardWidth / 3;
    
    // Inversión inicial
    addCardText('Inversión Inicial', margin + (metricWidth * 0.5), yPosition + 20, 8, false, '#cbd5e1', 'center');
    addCardText(`$${calculation.initialAmount.toLocaleString()}`, margin + (metricWidth * 0.5), yPosition + 26, 10, true, '#ffffff', 'center');
    
    // Ganancia total
    addCardText('Ganancia Total', margin + (metricWidth * 1.5), yPosition + 20, 8, false, '#cbd5e1', 'center');
    addCardText(`$${calculation.totalReturn.toLocaleString()}`, margin + (metricWidth * 1.5), yPosition + 26, 10, true, '#10b981', 'center');
    
    // Total final
    addCardText('Total Final', margin + (metricWidth * 2.5), yPosition + 20, 8, false, '#cbd5e1', 'center');
    addCardText(`$${calculation.finalAmount.toLocaleString()}`, margin + (metricWidth * 2.5), yPosition + 26, 10, true, '#3b82f6', 'center');
    
    yPosition += 45;
    
    // --- FOOTER MODERNO ---
    checkPageBreak(30);
    
    if (institution) {
      drawCard(margin, yPosition, cardWidth, 25, '#f8fafc', '#e2e8f0');
      addCardText('Informacion de Contacto', margin + 8, yPosition + 8, 10, true, '#1f2937');
      
      let contactY = yPosition + 15;
      if (institution.direccion) {
        addCardText(`Direccion: ${institution.direccion}`, margin + 8, contactY, 8, false, '#374151');
        contactY += 4;
      }
      if (institution.telefono) {
        addCardText(`Telefono: ${institution.telefono}`, margin + 8, contactY, 8, false, '#374151');
        contactY += 4;
      }
      if (institution.correo) {
        addCardText(`Correo: ${institution.correo}`, margin + 8, contactY, 8, false, '#374151');
      }
      
      yPosition += 30;
    }
    
    // Timestamp final
    addCardText(`Documento generado: ${new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, pageWidth / 2, yPosition + 5, 7, false, '#6b7280', 'center');

    addWatermarkToAllPages();

    const fileName = `Simulación_Inversión_${producto.nombre.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().getTime()}.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('Error generando PDF:', error);
    throw new Error('Error al generar el PDF. Por favor, intente nuevamente.');
  }
};

/**
 * Exporta la simulación a Excel
 */
export const exportInvestmentToExcel = async (
  calculation: InvestmentCalculation,
  producto: IProductoInversion,
  monto: number,
  plazo: number
) => {
  try {
    const institution = await getInstitutionData();
    const nombreEmpresa = institution?.nombre || 'Institución Financiera';
    const returnPercentage = ((calculation.totalReturn / calculation.initialAmount) * 100);

    const wb = utils.book_new();

    // Resumen
    const resumenData: any[][] = [
      [nombreEmpresa.toUpperCase()],
      institution?.slogan ? [institution.slogan] : [''],
      ['SIMULACIÓN DE INVERSIÓN'],
      [''],
      ['RESUMEN DE LA INVERSIÓN'],
      ['Producto de Inversión:', producto.nombre],
      ['Descripción:', producto.descripcion],
      ['Monto Inicial:', `$${monto.toLocaleString()}`],
      ['Plazo de Inversión:', `${plazo} meses`],
      ['Tasa Anual:', `${producto.tasa_anual}%`],
      [''],
      ['RESULTADOS'],
      ['Monto Final:', `$${calculation.finalAmount.toLocaleString()}`],
      ['Ganancia Total:', `$${calculation.totalReturn.toLocaleString()}`],
      ['Rentabilidad:', `${returnPercentage.toFixed(2)}%`]
    ];

    if (producto.tipo_inversion) {
      resumenData.push(
        ['Tipo de Inversión:', producto.tipo_inversion.nombre],
        ['Nivel de Riesgo:', producto.tipo_inversion.nivel_riesgo],
        ['Tipo de Interés:', producto.tipo_inversion.tipo_interes]
      );
    }

    resumenData.push(['']);
    resumenData.push(['INFORMACIÓN DE CONTACTO']);
    if (institution) {
      if (institution.direccion) resumenData.push(['Dirección:', institution.direccion]);
      if (institution.telefono) resumenData.push(['Teléfono:', institution.telefono]);
      if (institution.correo) resumenData.push(['Correo Electrónico:', institution.correo]);
    }
    resumenData.push(['']);
    resumenData.push(['Documento generado el:', new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })]);

    const wsResumen = utils.aoa_to_sheet(resumenData);
    wsResumen['!cols'] = [{ width: 25 }, { width: 40 }];
    if (!wsResumen['!merges']) wsResumen['!merges'] = [];
    wsResumen['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } });
    wb.SheetNames.push('Resumen');
    wb.Sheets['Resumen'] = wsResumen;

    // Proyección Mensual
    const proyeccionHeader = [
      'Mes',
      'Balance Inicial',
      'Interés Ganado',
      'Balance Final',
      'Acumulado Total'
    ];
    
    const proyeccionRows = calculation.monthlyProjection.map((projection, index) => {
      const balanceInicial = projection.month === 1 ? calculation.initialAmount : 
                            (calculation.monthlyProjection[index - 1]?.accumulated || 0);
      return [
        projection.month,
        balanceInicial,
        projection.interest,
        projection.balance,
        projection.accumulated
      ];
    });

    const wsProyeccion = utils.aoa_to_sheet([proyeccionHeader, ...proyeccionRows]);
    wsProyeccion['!cols'] = [
      { width: 10 },
      { width: 18 },
      { width: 18 },
      { width: 18 },
      { width: 18 }
    ];
    wb.SheetNames.push('Proyección Mensual');
    wb.Sheets['Proyección Mensual'] = wsProyeccion;

    const fileName = `Simulación_Inversión_${producto.nombre.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().getTime()}.xlsx`;
    writeFile(wb, fileName);

  } catch (error) {
    console.error('Error generando Excel:', error);
    throw new Error('Error al generar el Excel. Por favor, intente nuevamente.');
  }
};