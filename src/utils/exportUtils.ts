import { jsPDF } from 'jspdf';
import { utils, writeFile } from 'xlsx';
import { SimulationResult, AmortizationRow, LoanType } from '../types/loanTypes';

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
 * Exporta la simulación de crédito a PDF con diseño moderno tipo interface
 */
export const exportToPDF = async (
  resultado: SimulationResult,
  loan: LoanType,
  monto: number,
  tasaInteres: number,
  plazo: number,
  tipoAmortizacion: string
) => {
  try {
    const institution = await getInstitutionData();
    const nombreEmpresa = institution?.nombre || 'Institución Financiera';
    const colorPrimario = institution?.color_primario || '#3b82f6';
    const colorSecundario = institution?.color_secundario || '#1e40af';
    const colorVerde = '#10b981';
    const colorRojo = '#ef4444';
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
    drawCard(margin, 35, cardWidth, 12, colorRojo, '#dc2626');
    addCardText('SIMULADOR DE CRÉDITO Y AMORTIZACIÓN', pageWidth / 2, 43, 12, true, '#ffffff', 'center');
    
    yPosition = 55;

    // --- CARDS DE RESUMEN ESTILO INTERFACE ---
    const ahorroVsCredito = monto - resultado.totalPagar;
    
    checkPageBreak(35);
    
    // Card Principal - Tu Crédito
    drawCard(margin, yPosition, cardWidth * 0.65, 32, '#3b82f6', '#1e40af');
    addCardText('Tu Plan de Crédito', margin + 8, yPosition + 12, 12, true, '#ffffff');
    addCardText(loan.nombre, margin + 8, yPosition + 20, 10, false, '#e0e7ff');
    addCardText(`$${resultado.cuotaFinal.toFixed(0)}`, margin + (cardWidth * 0.65) - 8, yPosition + 20, 14, true, '#ffffff', 'right');
    addCardText('Cuota Mensual', margin + (cardWidth * 0.65) - 8, yPosition + 28, 8, false, '#cbd5e1', 'right');
    
    // Card Lateral - Análisis de Costo
    drawCard(margin + (cardWidth * 0.68), yPosition, cardWidth * 0.32, 32, colorRojo, '#dc2626');
    addCardText('Costo Total', margin + (cardWidth * 0.68) + 8, yPosition + 12, 10, true, '#ffffff');
    addCardText(`$${resultado.totalInteres.toFixed(0)}`, margin + (cardWidth * 0.68) + (cardWidth * 0.16), yPosition + 20, 12, true, '#ffffff', 'center');
    addCardText('Total Intereses', margin + (cardWidth * 0.68) + (cardWidth * 0.16), yPosition + 28, 8, false, '#fecaca', 'center');
    
    yPosition += 40;
    
    // Grid de información detallada
    const gridCols = 3;
    const colWidth = cardWidth / gridCols;
    
    // Columna 1 - Datos del Crédito
    drawCard(margin, yPosition, colWidth - 2, 25, '#f8fafc', '#e2e8f0');
    addCardText('Detalles del Crédito', margin + 8, yPosition + 10, 10, true, '#1f2937');
    addCardText(`Monto: $${monto.toLocaleString()}`, margin + 8, yPosition + 16, 8, false, '#374151');
    addCardText(`Plazo: ${plazo} meses`, margin + 8, yPosition + 20, 8, false, '#374151');
    
    // Columna 2 - Sistema
    drawCard(margin + colWidth + 1, yPosition, colWidth - 2, 25, '#fef3c7', '#fcd34d');
    addCardText('Sistema de Pago', margin + colWidth + 9, yPosition + 10, 10, true, '#92400e');
    addCardText(`${tipoAmortizacion === 'frances' ? 'Francés' : 'Alemán'}`, margin + colWidth + 9, yPosition + 16, 8, false, '#b45309');
    addCardText(`Tasa: ${tasaInteres}% anual`, margin + colWidth + 9, yPosition + 20, 8, false, '#b45309');
    
    // Columna 3 - Resultado
    drawCard(margin + (colWidth * 2) + 2, yPosition, colWidth - 2, 25, '#f0fdf4', '#dcfce7');
    addCardText('Resultado Final', margin + (colWidth * 2) + 10, yPosition + 10, 10, true, '#166534');
    addCardText(`Total: $${resultado.totalPagar.toFixed(0)}`, margin + (colWidth * 2) + 10, yPosition + 16, 8, false, '#15803d');
    if (resultado.cobrosIndirectosMensuales > 0) {
      addCardText(`+Cobros: $${resultado.cobrosIndirectosMensuales.toFixed(0)}`, margin + (colWidth * 2) + 10, yPosition + 20, 8, false, '#15803d');
    }
    
    yPosition += 35;

    // --- COBROS INDIRECTOS CARD ---
    if (loan.cobros_indirectos?.length) {
      checkPageBreak(20);
      drawCard(margin, yPosition, cardWidth, 20, '#fef2f2', '#fee2e2');
      addCardText('Cobros Indirectos Incluidos', margin + 8, yPosition + 8, 10, true, '#991b1b');
      
      let cobroY = yPosition + 14;
      loan.cobros_indirectos.forEach((cobro) => {
        addCardText(`• ${cobro.nombre}: ${cobro.tipo_interes === 'porcentaje' ? `${cobro.interes}%` : `$${cobro.interes}`}`, 
          margin + 8, cobroY, 8, false, '#dc2626');
        cobroY += 4;
      });
      
      yPosition += 25;
    }

    // --- TABLA ESTILO MODAL MODERNA ---
    checkPageBreak(35);
    
    // Header de la tabla con gradiente
    drawCard(margin, yPosition, cardWidth, 12, '#1f2937', '#111827');
    addCardText('Tabla de Amortización - Evolución de tu Crédito', pageWidth / 2, yPosition + 8, 11, true, '#ffffff', 'center');
    yPosition += 18;
    
    // Crear tabla con estilo moderno
    const rowHeight = 6;
    const headerHeight = 8;
    
    // Header de columnas
    drawCard(margin, yPosition, cardWidth, headerHeight, '#f1f5f9', '#e2e8f0');
    
    const colWidths = [20, 25, 22, 20, 20, 22, 25, 25];
    const headers = ['Mes', 'Saldo Inicial', 'Pago Base', 'Interés', 'Capital', 'Cobros Ind.', 'Pago Total', 'Saldo Final'];
    let xPos = margin + 3;
    
    headers.forEach((header, idx) => {
      addCardText(header, xPos, yPosition + 6, 7, true, '#475569');
      xPos += colWidths[idx];
    });
    
    yPosition += headerHeight + 2;
    
    // Filas de datos con alternating colors
    resultado.tablaAmortizacion.forEach((fila, index) => {
      checkPageBreak(rowHeight + 2);
      
      const bgColor1 = index % 2 === 0 ? '#ffffff' : '#f8fafc';
      const bgColor2 = index % 2 === 0 ? '#fefefe' : '#f1f5f9';
      
      drawCard(margin, yPosition, cardWidth, rowHeight, bgColor1, bgColor2);
      
      xPos = margin + 3;
      const rowData = [
        { text: `${fila.mes}`, color: '#374151' },
        { text: `$${fila.saldoInicial.toFixed(0)}`, color: '#374151' },
        { text: `$${fila.pago.toFixed(0)}`, color: '#374151' },
        { text: `$${fila.interes.toFixed(0)}`, color: '#ef4444' },
        { text: `$${fila.capital.toFixed(0)}`, color: '#059669' },
        { text: `$${fila.cobrosIndirectos.toFixed(0)}`, color: '#f59e0b' },
        { text: `$${fila.pagoTotal.toFixed(0)}`, color: '#1d4ed8' },
        { text: `$${fila.saldoFinal.toFixed(0)}`, color: '#374151' }
      ];
      
      rowData.forEach((cell, idx) => {
        addCardText(cell.text, xPos, yPosition + 4, 6, false, cell.color);
        xPos += colWidths[idx];
      });
      
      yPosition += rowHeight + 1;
    });
    
    yPosition += 10;
    
    // --- RESUMEN FINAL CON CARDS ---
    checkPageBreak(45);
    
    // Card de resumen con métricas destacadas
    drawCard(margin, yPosition, cardWidth, 35, '#0f172a', '#1e293b');
    addCardText('Resumen Final de tu Crédito', pageWidth / 2, yPosition + 12, 12, true, '#ffffff', 'center');
    
    // Tres métricas en línea
    const metricWidth = cardWidth / 3;
    
    // Monto del crédito
    addCardText('Monto del Crédito', margin + (metricWidth * 0.5), yPosition + 20, 8, false, '#cbd5e1', 'center');
    addCardText(`$${monto.toLocaleString()}`, margin + (metricWidth * 0.5), yPosition + 26, 12, true, '#ffffff', 'center');
    
    // Total de intereses
    addCardText('Total Intereses', margin + (metricWidth * 1.5), yPosition + 20, 8, false, '#fecaca', 'center');
    addCardText(`$${resultado.totalInteres.toLocaleString()}`, margin + (metricWidth * 1.5), yPosition + 26, 12, true, '#ef4444', 'center');
    
    // Total a pagar
    addCardText('Total a Pagar', margin + (metricWidth * 2.5), yPosition + 20, 8, false, '#cbd5e1', 'center');
    addCardText(`$${resultado.totalPagar.toLocaleString()}`, margin + (metricWidth * 2.5), yPosition + 26, 12, true, '#ffffff', 'center');
    
    yPosition += 45;
    
    // --- FOOTER INFORMATIVO ---
    if (institution) {
      checkPageBreak(25);
      drawCard(margin, yPosition, cardWidth, 20, '#f8fafc', '#f1f5f9');
      addCardText('Información de Contacto', pageWidth / 2, yPosition + 8, 10, true, '#374151', 'center');
      
      let footerY = yPosition + 14;
      if (institution.direccion) {
        addCardText(`${institution.direccion}`, margin + 8, footerY, 8, false, '#6b7280');
        footerY += 4;
      }
      if (institution.telefono && institution.correo) {
        addCardText(`${institution.telefono}`, margin + 8, footerY, 8, false, '#6b7280');
        addCardText(`${institution.correo}`, margin + (cardWidth * 0.6), footerY, 8, false, '#6b7280');
      }
      
      yPosition += 25;
    }
    
    // Timestamp
    checkPageBreak(10);
    const timestamp = new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    addCardText(`Documento generado el ${timestamp}`, pageWidth / 2, yPosition + 5, 8, false, '#9ca3af', 'center');

    addWatermarkToAllPages();

    const fileName = `Simulación_Crédito_${loan.nombre.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().getTime()}.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('Error generando PDF:', error);
    throw new Error('Error al generar el PDF. Por favor, intente nuevamente.');
  }
};

/**
 * Exporta la simulación a Excel (igual que antes, ajustando alineación)
 */
export const exportToExcel = async (
  resultado: SimulationResult,
  loan: LoanType,
  monto: number,
  tasaInteres: number,
  plazo: number,
  tipoAmortizacion: string
) => {
  try {
    const institution = await getInstitutionData();
    const nombreEmpresa = institution?.nombre || 'Institución Financiera';

    const wb = utils.book_new();

    // Resumen
    const resumenData: any[][] = [
      [nombreEmpresa.toUpperCase()],
      institution?.slogan ? [institution.slogan] : [''],
      ['SIMULACIÓN DE CRÉDITO'],
      [''],
      ['RESUMEN DEL CRÉDITO'],
      ['Tipo de Crédito:', loan.nombre],
      ['Sistema de Amortización:', tipoAmortizacion === 'frances' ? 'Francés (Cuota Constante)' : 'Alemán (Amortización Constante)'],
      ['Monto del Crédito:', `$${monto.toLocaleString()}`],
      ['Tasa de Interés Anual:', `${tasaInteres}%`],
      ['Plazo:', `${plazo} meses`],
      [''],
      ['DETALLE DE PAGOS'],
      ['Cuota Base Mensual:', `$${resultado.cuotaMensual.toFixed(2)}`]
    ];

    if (resultado.cobrosIndirectosMensuales > 0) {
      resumenData.push(['Cobros Indirectos Mensuales:', `$${resultado.cobrosIndirectosMensuales.toFixed(2)}`]);
    }

    resumenData.push(
      ['Cuota Final Mensual:', `$${resultado.cuotaFinal.toFixed(2)}`],
      ['Total de Intereses:', `$${resultado.totalInteres.toFixed(2)}`],
      ['Total a Pagar:', `$${resultado.totalPagar.toFixed(2)}`]
    );

    if (loan.cobros_indirectos?.length) {
      resumenData.push(['']);
      resumenData.push(['COBROS INDIRECTOS INCLUIDOS']);
      loan.cobros_indirectos.forEach(cobro => {
        resumenData.push([`${cobro.nombre}:`, `${cobro.tipo_interes === 'porcentaje' ? `${cobro.interes}% del monto` : `$${cobro.interes} fijos`}`]);
      });
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
    wsResumen['!cols'] = [{ width: 25 }, { width: 35 }];
    if (!wsResumen['!merges']) wsResumen['!merges'] = [];
    wsResumen['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }); // título principal merge
    wb.SheetNames.push('Resumen');
    wb.Sheets['Resumen'] = wsResumen;

    // Tabla de amortización
    const tablaHeader = [
      'Mes',
      'Saldo Inicial',
      'Pago Base',
      'Interés',
      'Capital',
      'Cobros Indirectos',
      'Pago Total',
      'Saldo Final'
    ];
    const tablaRows = resultado.tablaAmortizacion.map(fila => [
      fila.mes,
      fila.saldoInicial,
      fila.pago,
      fila.interes,
      fila.capital,
      fila.cobrosIndirectos,
      fila.pagoTotal,
      fila.saldoFinal
    ]);

    const wsTabla = utils.aoa_to_sheet([tablaHeader, ...tablaRows]);
    wb.SheetNames.push('Amortización');
    wb.Sheets['Amortización'] = wsTabla;

    const fileName = `Simulación_Crédito_${loan.nombre.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().getTime()}.xlsx`;
    writeFile(wb, fileName);

  } catch (error) {
    console.error('Error generando Excel:', error);
    throw new Error('Error al generar el Excel. Por favor, intente nuevamente.');
  }
};
