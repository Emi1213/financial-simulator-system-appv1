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
                {currentCalculation && (
                    <div className="w-full">
                        <InvestmentsResult />
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