"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowRight, FileText } from 'lucide-react';
import { useInvestments } from '../../hooks/useInvestments';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { useRouter } from 'next/navigation';
import { exportInvestmentToPDF } from '../../utils/exportUtils';

export const InvestmentsResult: React.FC = () => {
    const { currentCalculation, clearCalculation, selectedProducto } = useInvestments();
    const router = useRouter();
    const [exporting, setExporting] = useState<'pdf' | null>(null);
    const [showProjectionModal, setShowProjectionModal] = useState(false);

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



    if (!currentCalculation) {
        return (
            <Card className="bg-card border-border">
                <CardContent className="p-12 text-center">
                    <div className="text-gray-400 dark:text-gray-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Genera tu gráfico de inversión
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Completa el formulario y proyecta tu inversión para ver el análisis detallado.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const { initialAmount, finalAmount, totalReturn, monthlyProjection } = currentCalculation;
    const returnPercentage = (totalReturn / initialAmount) * 100;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Card Principal - Rendimiento */}
                <Card className="lg:col-span-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50/10 to-indigo-50/10 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-blue-800 dark:text-blue-400">Tu Rendimiento Proyectado</CardTitle>
                                <CardDescription className="text-blue-600 dark:text-blue-300">
                                    {selectedProducto?.nombre} - {currentCalculation.formData?.term} meses
                                </CardDescription>
                            </div>
                            <Badge className="bg-blue-600 dark:bg-blue-700 text-white">{formatCurrency(totalReturn)}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Inversión Inicial:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(initialAmount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Ganancia Total:</span>
                                    <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(totalReturn)}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Final:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(finalAmount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Rentabilidad:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{formatPercentage(returnPercentage)}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Card de Análisis */}
                <Card className="border-gray-200 dark:border-gray-700 bg-gradient-to-b from-gray-50/10 to-slate-50/10 dark:from-gray-800/30 dark:to-slate-800/30">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-gray-800 dark:text-gray-200 text-sm">Análisis de Inversión</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatPercentage(returnPercentage)}</div>
                            <div className="text-xs text-muted-foreground">Rentabilidad Total</div>
                        </div>
                        <Separator className="bg-gray-200 dark:bg-gray-700" />
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(finalAmount)}</div>
                            <div className="text-xs text-muted-foreground">Capital Final</div>
                        </div>

                        <div className="pt-2">
                            <Dialog open={showProjectionModal} onOpenChange={setShowProjectionModal}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                                        Ver Proyección Completa
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden bg-background border-border">
                                    <DialogHeader>
                                        <DialogTitle className="text-foreground">
                                            Proyección de Inversión - {selectedProducto?.nombre}
                                        </DialogTitle>
                                        <DialogDescription className="text-muted-foreground">
                                            Evolución mensual del capital durante {currentCalculation.formData?.term} meses
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="overflow-y-auto max-h-96">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted sticky top-0">
                                                <tr className="border-b border-border">
                                                    <th className="text-left p-2 text-foreground">Mes</th>
                                                    <th className="text-right p-2 text-foreground">Balance Inicial</th>
                                                    <th className="text-right p-2 text-foreground">Interés Ganado</th>
                                                    <th className="text-right p-2 text-foreground">Balance Final</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {monthlyProjection.map((projection) => (
                                                    <tr key={projection.month} className="border-b border-border hover:bg-muted/50">
                                                        <td className="p-2 font-medium text-foreground">Mes {projection.month}</td>
                                                        <td className="p-2 text-right text-foreground">{formatCurrency(projection.balance)}</td>
                                                        <td className="p-2 text-right text-green-600 dark:text-green-400">+{formatCurrency(projection.interest)}</td>
                                                        <td className="p-2 text-right font-semibold text-foreground">{formatCurrency(projection.accumulated)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Botones de Acción */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                    onClick={handleExportPDF}
                    disabled={exporting === 'pdf'}
                    variant="outline"
                    className="w-full border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700"
                >
                    <FileText className="h-4 w-4 mr-2" />
                    {exporting === 'pdf' ? 'Generando PDF...' : 'Descargar PDF'}
                </Button>
                <Button 
                    onClick={handleSolicitarInversion}
                    className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white transition-colors"
                >
                    Invertir ahora
                </Button>
            </div>
        </div>
    );
};