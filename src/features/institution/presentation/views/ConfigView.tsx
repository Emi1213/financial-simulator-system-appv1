'use client';

import { useState } from 'react';
import { useInstitution } from '../../hooks/useInstitution';
import { InstitutionConfig } from '../../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Componente selector de color
function ColorPicker({ 
  value, 
  onChange, 
  label, 
  description 
}: { 
  value: string; 
  onChange: (color: string) => void; 
  label: string;
  description?: string;
}) {
  const presetColors = [
    '#3b82f6', '#1d4ed8', '#2563eb', // Blues
    '#10b981', '#059669', '#047857', // Greens
    '#f59e0b', '#d97706', '#b45309', // Ambers
    '#ef4444', '#dc2626', '#b91c1c', // Reds
    '#8b5cf6', '#7c3aed', '#6d28d9', // Purples
    '#6b7280', '#4b5563', '#374151', // Grays
  ];

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      {/* Selector de color actual */}
      <div className="flex items-center gap-3">
        <div 
          className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer shadow-sm"
          style={{ backgroundColor: value }}
          onClick={() => document.getElementById(`color-input-${label}`)?.click()}
        />
        <div className="flex-1">
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className="font-mono"
          />
        </div>
        <input
          id={`color-input-${label}`}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="hidden"
        />
      </div>
      
      {/* Colores predefinidos */}
      <div className="grid grid-cols-6 gap-2">
        {presetColors.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={`w-8 h-8 rounded-md border-2 transition-all hover:scale-110 ${
              value === color ? 'border-gray-800 ring-2 ring-gray-300' : 'border-gray-200'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
      
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
}

export function ConfigView() {
  const { config, updateConfig, isLoading } = useInstitution();
  const [formData, setFormData] = useState<InstitutionConfig>(config);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage('');
      await updateConfig(formData);
      setMessage('Configuración guardada exitosamente');
    } catch (error) {
      setMessage('Error al guardar la configuración');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Configuración de Institución</h1>
        <p className="text-gray-600">
          Configura la información que se mostrará en toda la aplicación
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panel de Configuración */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo URL */}
              <div className="space-y-2">
                <Label htmlFor="logo">URL del Logo</Label>
                <Input
                  id="logo"
                  type="text"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  placeholder="https://ejemplo.com/logo.png"
                />
                <p className="text-sm text-gray-500">
                  URL de la imagen del logo de la institución
                </p>
              </div>

              {/* Nombre de la Institución */}
              <div className="space-y-2">
                <Label htmlFor="institutionName">Nombre de la Institución</Label>
                <Input
                  id="institutionName"
                  type="text"
                  value={formData.institutionName}
                  onChange={(e) =>
                    setFormData({ ...formData, institutionName: e.target.value })
                  }
                  placeholder="FINANCIAL SIMULATOR"
                />
              </div>

              {/* Eslogan */}
              <div className="space-y-2">
                <Label htmlFor="slogan">Eslogan</Label>
                <Input
                  id="slogan"
                  type="text"
                  value={formData.slogan}
                  onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                  placeholder="Tu mejor opción financiera"
                />
              </div>
            </CardContent>
          </Card>

          {/* Colores de Marca */}
          <Card>
            <CardHeader>
              <CardTitle>Colores de Marca  54</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ColorPicker
                label="Color Primario"
                value={formData.colors.primary}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colors: { ...formData.colors, primary: color },
                  })
                }
                description="Color usado en botones principales y elementos destacados"
              />

              <ColorPicker
                label="Color Secundario"
                value={formData.colors.secondary}
                onChange={(color) =>
                  setFormData({
                    ...formData,
                    colors: { ...formData.colors, secondary: color },
                  })
                }
                description="Color usado en texto secundario y elementos sutiles"
              />
            </CardContent>
          </Card>

          {/* Botones de Acción */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 sm:flex-none"
                  size="lg"
                >
                  {isSaving ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setFormData(config)}
                  disabled={isSaving}
                  size="lg"
                >
                  Restablecer
                </Button>
              </div>

              {/* Mensaje de estado */}
              {message && (
                <div className="mt-4">
                  <Badge 
                    variant={message.includes('Error') ? 'destructive' : 'default'}
                    className="px-4 py-2"
                  >
                    {message}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel de Vista Previa */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Vista Previa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Vista Previa Principal */}
              <div className="relative">
                <div 
                  className="p-6 rounded-lg text-white"
                  style={{ 
                    background: `linear-gradient(135deg, ${formData.colors.primary}, ${formData.colors.secondary})` 
                  }}
                >
                  <div className="flex items-center gap-4">
                    {formData.logo ? (
                      <img 
                        src={formData.logo} 
                        alt="Logo" 
                        className="w-12 h-12 rounded-lg bg-white/20 p-1"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling!.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-xl ${formData.logo ? 'hidden' : ''}`}
                    >
                      {formData.institutionName.charAt(0) || 'I'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg leading-tight">
                        {formData.institutionName || 'Institución'}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {formData.slogan || 'Eslogan de la institución'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Elementos de UI de ejemplo */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Elementos de ejemplo:</p>
                
                <Button 
                  style={{ backgroundColor: formData.colors.primary }}
                  className="w-full text-white hover:opacity-90"
                >
                  Botón Primario
                </Button>
                
                <Button 
                  variant="outline" 
                  style={{ 
                    borderColor: formData.colors.secondary,
                    color: formData.colors.secondary 
                  }}
                  className="w-full"
                >
                  Botón Secundario
                </Button>

                <div className="flex gap-2">
                  <Badge style={{ backgroundColor: formData.colors.primary }}>
                    Activo
                  </Badge>
                  <Badge 
                    variant="outline" 
                    style={{ 
                      borderColor: formData.colors.secondary,
                      color: formData.colors.secondary 
                    }}
                  >
                    Pendiente
                  </Badge>
                </div>
              </div>

              {/* Información de colores */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: formData.colors.primary }}
                  />
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    {formData.colors.primary}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: formData.colors.secondary }}
                  />
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    {formData.colors.secondary}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
