'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Calendar, 
  Building, 
  Eye, 
  TrendingUp,
  Clock,
  Info
} from 'lucide-react';
import { UserSolicitudInversion } from '../../types';
import { MyInvestmentsService } from '../../services/MyInvestmentsService';

interface MySolicitudCardProps {
  solicitud: UserSolicitudInversion;
}

export function MySolicitudCard({ solicitud }: MySolicitudCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusConfig = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return {
          color: 'bg-amber-500 dark:bg-amber-600',
          textColor: 'text-amber-50',
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          borderColor: 'border-amber-200 dark:border-amber-700',
          icon: '⏳',
          message: 'Evaluando tu propuesta de inversión'
        };
      case 'Aprobada':
      case 'Aprobado':
        return {
          color: 'bg-emerald-500 dark:bg-emerald-600',
          textColor: 'text-emerald-50',
          bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
          borderColor: 'border-emerald-200 dark:border-emerald-700',
          icon: '🎉',
          message: '¡Tu inversión ha sido autorizada!'
        };
      case 'Rechazada':
      case 'Rechazado':
        return {
          color: 'bg-red-500 dark:bg-red-600',
          textColor: 'text-red-50',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-700',
          icon: '📋',
          message: 'Revisa los comentarios del equipo'
        };
      default:
        return {
          color: 'bg-gray-500 dark:bg-gray-600',
          textColor: 'text-gray-50',
          bgColor: 'bg-gray-50 dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-700',
          icon: '📄',
          message: 'Estado de la solicitud'
        };
    }
  };

  const statusConfig = getStatusConfig(solicitud.estado);

  return (
    <Card className="relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200">
      {/* Status Strip - Top */}
      <div className={`h-1 ${statusConfig.color}`}></div>
      
      <CardContent className="p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-3 h-3 rounded-full ${statusConfig.color} flex-shrink-0`}></div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                {solicitud.nombre_inversion}
              </h3>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <span className="font-medium">ID:</span> #{solicitud.id_solicitud}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(solicitud.fecha_solicitud)}
              </span>
            </div>
          </div>
          
          {/* Status Badge - Moved to top right */}
          <div className={`px-3 py-1 rounded-lg ${statusConfig.color} ${statusConfig.textColor} text-xs font-medium flex items-center gap-1.5`}>
            <span>{statusConfig.icon}</span>
            {solicitud.estado}
          </div>
        </div>

        {/* Investment Overview - New Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
          {/* Financial Metrics */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              Resumen de Inversión
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-100 dark:border-green-800">
                <div className="text-lg font-bold text-green-700 dark:text-green-400">
                  {formatCurrency(solicitud.monto)}
                </div>
                <div className="text-xs text-green-600 dark:text-green-500">Capital</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
                  {solicitud.plazo_meses}m
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-500">Duración</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                <div className="text-lg font-bold text-purple-700 dark:text-purple-400">
                  {solicitud.tasa_anual}%
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-500">Rendimiento</div>
              </div>
            </div>
          </div>

          {/* Status Message - New position */}
          <div className={`p-4 rounded-xl border ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
            <div className="text-center">
              <div className="text-2xl mb-2">{statusConfig.icon}</div>
              <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {statusConfig.message}
              </div>
            </div>
          </div>
        </div>

        {/* Employment & Financial Info - Redesigned */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm font-medium">
              <Building className="h-4 w-4" />
              Perfil Laboral
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Empresa:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{solicitud.empresa || 'No especificado'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">RUC:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{solicitud.ruc || 'No especificado'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Modalidad:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{solicitud.tipo_empleo || 'No especificado'}</span>
              </div>
            </div>
          </div>

          {(solicitud.ingresos || solicitud.egresos) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm font-medium">
                <DollarSign className="h-4 w-4" />
                Estado Financiero
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Ingresos:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {solicitud.ingresos ? formatCurrency(solicitud.ingresos) : 'N/D'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Gastos:</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {solicitud.egresos ? formatCurrency(solicitud.egresos) : 'N/D'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400">Excedente:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {(solicitud.ingresos && solicitud.egresos) 
                      ? formatCurrency(solicitud.ingresos - solicitud.egresos)
                      : 'N/D'
                    }
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Product Description and Document Actions Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Product Description - Conditional */}
          {solicitud.descripcion_inversion && (
            <div className="lg:col-span-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Características del Producto</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {solicitud.descripcion_inversion}
              </p>
            </div>
          )}
          
          {/* Document Actions - Side position */}
          {solicitud.documento_validacion_uri && (
            <div className={`${solicitud.descripcion_inversion ? '' : 'lg:col-span-3'} p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col justify-center`}>
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600 h-auto py-3"
                onClick={() => window.open(solicitud.documento_validacion_uri, '_blank')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Revisar Documentación Adjunta
              </Button>
            </div>
          )}
        </div>

        {/* Admin Comments - Enhanced */}
        {solicitud.observacion_admin && (
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-l-4 border-indigo-400 dark:border-indigo-500 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-indigo-600 dark:text-indigo-400">💬</span>
              <span className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">
                Observaciones del Equipo de Evaluación
              </span>
            </div>
            <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">
              {solicitud.observacion_admin}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}