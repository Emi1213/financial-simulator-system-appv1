"use client";

import React from 'react';
import { InvestmentProvider } from '../../context/InvestmentProvider';
import { InvestmentsForm } from '../components/InvestmentsForm';
import { InvestmentsResult } from '../components/InvestmentsResult';
import { useInvestments } from '../../hooks/useInvestments';

const InvestmentsContent: React.FC = () => {
    const { currentCalculation } = useInvestments();

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="text-center space-y-4">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-black">
                        Calculadora de Crecimiento
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                        Visualiza cómo tu dinero puede multiplicarse y construye tu estrategia de inversión ideal
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
                {/* Formulario de inversión */}
                <div className="w-full">
                    <InvestmentsForm />
                </div>

                {/* Resultados - Solo mostrar cuando hay cálculo */}
                {currentCalculation ? (
                    <div className="w-full">
                        <InvestmentsResult />
                    </div>
                ) : (
                    // Skeleton de rendimiento del proyecto
                    <div className="w-full">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {/* Card Principal Skeleton */}
                                <div className="lg:col-span-2 border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg p-6">
                                    <div className="animate-pulse">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <div className="h-6 bg-gray-300 rounded w-48 mb-2"></div>
                                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                                            </div>
                                            <div className="h-8 bg-gray-300 rounded w-20"></div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                                                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                                                </div>
                                                <div className="flex justify-between">
                                                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                                                    <div className="h-3 bg-gray-300 rounded w-12"></div>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <div className="h-3 bg-gray-200 rounded w-18"></div>
                                                    <div className="h-3 bg-gray-300 rounded w-14"></div>
                                                </div>
                                                <div className="flex justify-between">
                                                    <div className="h-3 bg-gray-200 rounded w-22"></div>
                                                    <div className="h-3 bg-gray-300 rounded w-10"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Lateral Skeleton */}
                                <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg p-6">
                                    <div className="animate-pulse">
                                        <div className="h-5 bg-gray-300 rounded w-32 mb-4"></div>
                                        <div className="text-center space-y-3">
                                            <div className="h-8 bg-gray-300 rounded w-16 mx-auto"></div>
                                            <div className="h-3 bg-gray-200 rounded w-20 mx-auto"></div>
                                        </div>
                                        <div className="my-4 h-px bg-gray-200"></div>
                                        <div className="text-center space-y-3">
                                            <div className="h-8 bg-gray-300 rounded w-20 mx-auto"></div>
                                            <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                                        </div>
                                        <div className="mt-4">
                                            <div className="h-8 bg-gray-300 rounded w-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Botones Skeleton */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="h-10 bg-gray-200 border-2 border-dashed border-gray-300 rounded animate-pulse"></div>
                                <div className="h-10 bg-gray-200 border-2 border-dashed border-gray-300 rounded animate-pulse"></div>
                            </div>

                            {/* Texto explicativo */}
                            <div className="text-center py-4">
                                <h3 className="text-lg font-medium text-gray-600 mb-2">
                                    📊 Rendimiento del Proyecto
                                </h3>
                                <p className="text-gray-500 text-sm">
                                    Completa el formulario para ver la proyección de tu inversión
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Lista de inversiones removida - vista centrada en simulación */}
        </div>
    );
};

export const InvestmentsView: React.FC = () => {
    return (
        <InvestmentProvider>
            <InvestmentsContent />
        </InvestmentProvider>
    );
};