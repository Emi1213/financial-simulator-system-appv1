"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { 
    Field, 
    FieldContent, 
    FieldError, 
    FieldLabel 
} from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { useInvestments } from '../../hooks/useInvestments';
import { InvestmentFormData, IProductoInversion } from '../../types/investmentInterface';

export const InvestmentsForm: React.FC = () => {
    const { 
        calculateInvestmentAsync, 
        error, 
        productosInversion, 
        selectedProducto, 
        selectProducto, 
        validateAmount, 
        validateTerm 
    } = useInvestments();
    
    const [formData, setFormData] = useState<InvestmentFormData>({
        producto_inversion_id: 0,
        amount: 0,
        term: 12,
    });

    const [isCalculating, setIsCalculating] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const handleInputChange = (field: keyof InvestmentFormData, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
        
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (fieldErrors[field]) {
            setFieldErrors(prev => ({
                ...prev,
                [field]: '',
            }));
        }
    };

    // Actualizar producto seleccionado cuando cambie la selección
    useEffect(() => {
        if (formData.producto_inversion_id > 0) {
            const producto = productosInversion.find(p => p.id === formData.producto_inversion_id);
            selectProducto(producto || null);
        } else {
            selectProducto(null);
        }
    }, [formData.producto_inversion_id, productosInversion, selectProducto]);

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (formData.producto_inversion_id <= 0) {
            errors.producto_inversion_id = 'Debe seleccionar un producto de inversión';
        }

        if (formData.amount <= 0) {
            errors.amount = 'El monto debe ser mayor a 0';
        } else if (formData.producto_inversion_id > 0) {
            const amountValidation = validateAmount(formData.producto_inversion_id, formData.amount);
            if (!amountValidation.valid) {
                errors.amount = amountValidation.message!;
            }
        }

        if (formData.term <= 0) {
            errors.term = 'El plazo debe ser mayor a 0';
        } else if (formData.producto_inversion_id > 0) {
            const termValidation = validateTerm(formData.producto_inversion_id, formData.term);
            if (!termValidation.valid) {
                errors.term = termValidation.message!;
            }
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCalculate = async () => {
        if (validateForm()) {
            setIsCalculating(true);
            try {
                await calculateInvestmentAsync(formData);
            } catch (error) {
                console.error('Error al calcular inversión:', error);
            } finally {
                setIsCalculating(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsCalculating(true);
        try {
            await calculateInvestmentAsync(formData);
        } catch (error) {
            console.error('Error al calcular inversión:', error);
        } finally {
            setIsCalculating(false);
        }
    };

    return (
        <Card className="border-green-200 bg-gradient-to-b from-green-50 to-emerald-50">
            <CardHeader className="pb-6">
                <CardTitle className="text-green-800">Planifica tu Futuro Financiero</CardTitle>
                <CardDescription className="text-green-700">
                    Define los parámetros de tu inversión y descubre el potencial de crecimiento de tu capital
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        <Field data-invalid={!!fieldErrors.producto_inversion_id}>
                            <FieldLabel className="text-sm font-medium text-gray-700">
                                Producto de Inversión Preferido
                            </FieldLabel>
                            <FieldContent>
                                <Select
                                    value={formData.producto_inversion_id.toString()}
                                    onValueChange={(value) => handleInputChange('producto_inversion_id', parseInt(value) || 0)}
                                >
                                    <SelectTrigger className="border-green-200 focus:border-green-400 focus:ring-green-400 py-3">
                                        <SelectValue placeholder="Elige tu opción de inversión ideal" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {productosInversion.map((producto) => (
                                            <SelectItem key={producto.id} value={producto.id.toString()}>
                                                <div className="flex flex-col w-full py-1">
                                                    <span className="font-medium text-gray-900">{producto.nombre}</span>
                                                    <span className="text-sm text-green-600">
                                                        {producto.tasa_anual}% anual • {producto.tipo_inversion?.nombre}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldErrors.producto_inversion_id && <FieldError>{fieldErrors.producto_inversion_id}</FieldError>}
                            </FieldContent>
                        </Field>



                        <div className="space-y-6">
                            <Field data-invalid={!!fieldErrors.amount}>
                                <FieldLabel className="text-sm font-medium text-gray-700">
                                    Capital Inicial de Inversión
                                    {selectedProducto && (
                                        <div className="mt-1 text-xs text-green-600 font-normal">
                                            Rango permitido: ${selectedProducto.monto_minimo.toLocaleString()} - ${selectedProducto.monto_maximo.toLocaleString()}
                                        </div>
                                    )}
                                </FieldLabel>
                                <FieldContent>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                        <Input
                                            id="amount"
                                            type="number"
                                            placeholder="¿Cuánto deseas invertir?"
                                            value={formData.amount || ''}
                                            onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                                            min={selectedProducto?.monto_minimo || 0}
                                            max={selectedProducto?.monto_maximo}
                                            step="1000"
                                            className="border-green-200 focus:border-green-400 focus:ring-green-400 pl-8 py-4 text-lg"
                                            aria-invalid={!!fieldErrors.amount}
                                        />
                                    </div>
                                    {fieldErrors.amount && <FieldError>{fieldErrors.amount}</FieldError>}
                                    {selectedProducto && (
                                        <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                            💡 <strong>Rentabilidad:</strong> {selectedProducto.tasa_anual}% anual • <strong>Tipo:</strong> {selectedProducto.tipo_inversion?.nombre} • <strong>Riesgo:</strong> {selectedProducto.tipo_inversion?.nivel_riesgo}
                                        </div>
                                    )}
                                </FieldContent>
                            </Field>

                            <Field data-invalid={!!fieldErrors.term}>
                                <FieldLabel className="text-sm font-medium text-gray-700">
                                    Período de Inversión
                                    {selectedProducto && (
                                        <div className="mt-1 text-xs text-green-600 font-normal">
                                            Duración disponible: {selectedProducto.plazo_min_meses} - {selectedProducto.plazo_max_meses} meses
                                        </div>
                                    )}
                                </FieldLabel>
                                <FieldContent>
                                    <div className="relative">
                                        <Input
                                            id="term"
                                            type="number"
                                            placeholder="¿Por cuántos meses?"
                                            value={formData.term || ''}
                                            onChange={(e) => handleInputChange('term', parseInt(e.target.value) || 0)}
                                            min={selectedProducto?.plazo_min_meses || 1}
                                            max={selectedProducto?.plazo_max_meses || 360}
                                            className="border-green-200 focus:border-green-400 focus:ring-green-400 py-4 text-lg"
                                            aria-invalid={!!fieldErrors.term}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">meses</span>
                                    </div>
                                    {fieldErrors.term && <FieldError>{fieldErrors.term}</FieldError>}
                                    {selectedProducto && (
                                        <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                            📊 <strong>Modalidad:</strong> {selectedProducto.tipo_inversion?.tipo_interes} • <strong>Tasa:</strong> {selectedProducto.tipo_inversion?.tipo_tasa}
                                            {selectedProducto.descripcion && (
                                                <>
                                                    <br />
                                                    📝 <strong>Detalles:</strong> {selectedProducto.descripcion}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </FieldContent>
                            </Field>
                        </div>
                    </div>

                    <div className="pt-6">
                        <Button
                            type="submit"
                            disabled={formData.producto_inversion_id <= 0 || !formData.amount || isCalculating || Object.values(fieldErrors).some(error => error)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-medium"
                        >
                            {isCalculating ? (
                                <>
                                    <Spinner className="mr-2 h-5 w-5" />
                                    Proyectando tu Futuro...
                                </>
                            ) : (
                                'Descubrir mi Potencial de Ganancia'
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};