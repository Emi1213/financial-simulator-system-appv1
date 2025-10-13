"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, FileText, Download } from 'lucide-react';
import { useInvestments } from '../../hooks/useInvestments';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { useRouter } from 'next/navigation';
import { exportInvestmentToPDF, exportInvestmentToExcel } from '../../utils/exportUtils';

export const InvestmentsResult: React.FC = () => {
    const { currentCalculation, clearCalculation, selectedProducto } = useInvestments();
    const router = useRouter();
    const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);

    const handleSolicitarInversion = () => {
        if (!currentCalculation?.formData) return;
        
        const { producto_inversion_id, amount, term } = currentCalculation.formData;
        const params = new URLSearchParams({
            id: producto_inversion_id.toString(),
            monto: amount.toString(),
            plazo: term.toString()
        });
        
        router.push(`/client/investments/solicitar?${params.toString()}`);
    };

    const handleExportPDF = async () => {
        if (!currentCalculation || !selectedProducto || !currentCalculation.formData) return;
        
        try {
            setExporting('pdf');
            const { amount, term } = currentCalculation.formData;
            await exportInvestmentToPDF(currentCalculation, selectedProducto, amount, term);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setExporting(null);
        }
    };

    const handleExportExcel = async () => {
        if (!currentCalculation || !selectedProducto || !currentCalculation.formData) return;
        
        try {
            setExporting('excel');
            const { amount, term } = currentCalculation.formData;
            await exportInvestmentToExcel(currentCalculation, selectedProducto, amount, term);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setExporting(null);
        }
    };

    if (!currentCalculation) {
        return (
            <Card className="border-gray-200 bg-gradient-to-b from-gray-50 to-slate-50">
                <CardHeader className="text-center py-8">
                    <CardTitle className="text-gray-700">Proyección de Rendimientos</CardTitle>
                    <CardDescription className="text-gray-600 max-w-md mx-auto">
                        Completa el formulario y simula tu inversión para ver los resultados proyectados
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-24 text-gray-400">
                        <p className="text-lg">Esperando simulación...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const { initialAmount, finalAmount, totalReturn, monthlyProjection } = currentCalculation;
    const returnPercentage = (totalReturn / initialAmount) * 100;

    return (
        <div className="w-full space-y-8">
            {/* Resumen de Rendimientos */}
            <div className="space-y-6">
                {/* Monto Inicial */}
                <Card className="border-blue-200 bg-gradient-to-b from-blue-50 to-indigo-50">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <div>
                            <CardTitle className="text-blue-800 text-lg">Monto Inicial</CardTitle>
                            <CardDescription className="text-blue-700">Capital invertido</CardDescription>
                        </div>
                        <div className="text-3xl font-bold text-blue-600">
                            {formatCurrency(initialAmount)}
                        </div>
                    </CardHeader>
                </Card>

                {/* Monto Final */}
                <Card className="border-green-200 bg-gradient-to-b from-green-50 to-emerald-50">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <div>
                            <CardTitle className="text-green-800 text-lg">Monto Final</CardTitle>
                            <CardDescription className="text-green-700">Capital + rendimientos</CardDescription>
                        </div>
                        <div className="text-3xl font-bold text-green-600">
                            {formatCurrency(finalAmount)}
                        </div>
                    </CardHeader>
                </Card>

                {/* Ganancia Total */}
                <Card className="border-purple-200 bg-gradient-to-b from-purple-50 to-violet-50">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <div>
                            <CardTitle className="text-purple-800 text-lg">Ganancia Total</CardTitle>
                            <CardDescription className="text-purple-700">
                                Rendimiento: {formatPercentage(returnPercentage)}
                            </CardDescription>
                        </div>
                        <div className="text-3xl font-bold text-purple-600">
                            {formatCurrency(totalReturn)}
                        </div>
                    </CardHeader>
                </Card>
            </div>

            {/* Acciones */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                        onClick={handleExportPDF}
                        disabled={exporting === 'pdf'}
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50 py-6"
                    >
                        <FileText className="h-5 w-5 mr-2" />
                        {exporting === 'pdf' ? 'Generando PDF...' : 'Exportar PDF'}
                    </Button>
                    <Button
                        onClick={handleExportExcel}
                        disabled={exporting === 'excel'}
                        variant="outline"
                        className="text-green-600 border-green-200 hover:bg-green-50 disabled:opacity-50 py-6"
                    >
                        <Download className="h-5 w-5 mr-2" />
                        {exporting === 'excel' ? 'Generando Excel...' : 'Exportar Excel'}
                    </Button>
                    <Button 
                        onClick={handleSolicitarInversion}
                        className="bg-green-600 hover:bg-green-700 text-white py-6"
                    >
                        <ArrowRight className="h-5 w-5 mr-2" />
                        Solicitar Inversión
                    </Button>
                </div>
                <div className="flex justify-center">
                    <Button variant="ghost" onClick={clearCalculation} className="text-gray-500 hover:text-gray-700">
                        Limpiar Simulación
                    </Button>
                </div>
            </div>

            {/* Proyección Mensual */}
            <Card className="border-gray-200 bg-gradient-to-b from-gray-50 to-slate-50">
                <CardHeader>
                    <CardTitle className="text-gray-800">Proyección Mensual</CardTitle>
                    <CardDescription className="text-gray-600">
                        Evolución del capital mes a mes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Headers */}
                        <div className="grid grid-cols-4 gap-4 font-medium text-sm text-muted-foreground pb-2">
                            <div>Mes</div>
                            <div className="text-right">Balance</div>
                            <div className="text-right">Interés</div>
                            <div className="text-right">Acumulado</div>
                        </div>
                        
                        <Separator />
                        
                        {/* Rows */}
                        <div className="max-h-96 overflow-y-auto space-y-2">
                            {monthlyProjection.map((projection) => (
                                <div
                                    key={projection.month}
                                    className="grid grid-cols-4 gap-4 py-2 text-sm hover:bg-muted/50 rounded-md px-2"
                                >
                                    <div className="font-medium">
                                        Mes {projection.month}
                                    </div>
                                    <div className="text-right">
                                        {formatCurrency(projection.balance)}
                                    </div>
                                    <div className="text-right text-green-600">
                                        +{formatCurrency(projection.interest)}
                                    </div>
                                    <div className="text-right font-medium">
                                        {formatCurrency(projection.accumulated)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};