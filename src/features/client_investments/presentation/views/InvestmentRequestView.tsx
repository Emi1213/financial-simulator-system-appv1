'use client';

import React from 'react';
import { InvestmentRequestForm } from '../components/InvestmentRequestForm';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const InvestmentRequestView: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/client/inversiones/solicitar');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Debe iniciar sesión para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Formulario de Solicitud de Inversión
        </h1>
        <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Bienvenido al proceso de solicitud de inversión. Complete la información en dos sencillos pasos: 
          primero configure su inversión y proporcione sus datos laborales, luego suba su documentación 
          y complete la verificación de identidad para finalizar su solicitud.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          Proceso seguro y protegido
        </div>
      </div>

      {(() => {
        console.log('🔍 [DEBUG] user:', user);
        console.log('🔍 [DEBUG] user.id tipo:', typeof user?.id);
        console.log('🔍 [DEBUG] user.id valor:', user?.id);
        
        if (!user?.id) {
          return (
            <div className="text-center text-red-500">
              Error: No se pudo obtener la información del usuario
            </div>
          );
        }
        
        const userId = parseInt(user.id);
        console.log('🔍 [DEBUG] parseInt result:', userId);
        
        if (isNaN(userId)) {
          return (
            <div className="text-center text-red-500">
              Error: ID de usuario inválido ({user.id})
            </div>
          );
        }
        
        return <InvestmentRequestForm userId={userId} />;
      })()}
    </div>
  );
};