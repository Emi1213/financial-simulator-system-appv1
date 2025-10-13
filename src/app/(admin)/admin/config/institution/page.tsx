// src/app/(admin)/admin/config/institution/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
            type="button"
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

interface InstitutionData {
  id_info?: number;
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
  estado: number; // number porque en MySQL BOOLEAN es TINYINT(1)
}

export default function InstitutionConfigPage() {
  const [formData, setFormData] = useState<InstitutionData>({
    nombre: '',
    logo: '',
    slogan: '',
    color_primario: '#3B82F6',
    color_secundario: '#1E40AF',
    direccion: '',
    pais: 'Ecuador',
    owner: '',
    telefono: '',
    correo: '',
    estado: 1 // 1 = true, 0 = false
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Cargar datos existentes
  useEffect(() => {
    loadInstitutionData();
  }, []);

  const loadInstitutionData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/institution');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setFormData(data);
        }
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/institution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('Configuración guardada exitosamente');
      } else {
        throw new Error('Error al guardar');
      }
    } catch (error) {
      console.error('Error guardando datos:', error);
      setMessage('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  // Función corregida que acepta string y number
  const handleChange = (field: keyof InstitutionData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-32 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Configuración de Institución</h1>
        <p className="text-gray-600">Gestiona la información que se mostrará en toda la aplicación</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panel de Configuración */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Información Básica */}
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre de la Institución *</Label>
                    <Input
                      id="nombre"
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) => handleChange('nombre', e.target.value)}
                      placeholder="Ej: Banco Central"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="owner">Propietario/CEO *</Label>
                    <Input
                      id="owner"
                      type="text"
                      required
                      value={formData.owner}
                      onChange={(e) => handleChange('owner', e.target.value)}
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo">URL del Logo</Label>
                  <Input
                    id="logo"
                    type="url"
                    value={formData.logo}
                    onChange={(e) => handleChange('logo', e.target.value)}
                    placeholder="https://ejemplo.com/logo.png"
                  />
                  {formData.logo && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <img 
                        src={formData.logo} 
                        alt="Logo preview" 
                        className="h-16 object-contain border rounded bg-white p-2"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <p className="text-sm text-gray-500">URL de la imagen del logo de la institución</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slogan">Eslogan</Label>
                  <Input
                    id="slogan"
                    type="text"
                    value={formData.slogan}
                    onChange={(e) => handleChange('slogan', e.target.value)}
                    placeholder="Ej: Tu socio financiero de confianza"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Colores de la Marca */}
            <Card>
              <CardHeader>
                <CardTitle>Colores de Marca</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <ColorPicker
                  label="Color Primario"
                  value={formData.color_primario}
                  onChange={(color) => handleChange('color_primario', color)}
                  description="Color usado en botones principales y elementos destacados"
                />

                <ColorPicker
                  label="Color Secundario"
                  value={formData.color_secundario}
                  onChange={(color) => handleChange('color_secundario', color)}
                  description="Color usado en texto secundario y elementos sutiles"
                />
              </CardContent>
            </Card>

            {/* Información de Contacto */}
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono *</Label>
                    <Input
                      id="telefono"
                      type="tel"
                      required
                      value={formData.telefono}
                      onChange={(e) => handleChange('telefono', e.target.value)}
                      placeholder="Ej: (01) 234-5678"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="correo">Correo Electrónico *</Label>
                    <Input
                      id="correo"
                      type="email"
                      required
                      value={formData.correo}
                      onChange={(e) => handleChange('correo', e.target.value)}
                      placeholder="Ej: info@institucion.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección *</Label>
                  <Input
                    id="direccion"
                    type="text"
                    required
                    value={formData.direccion}
                    onChange={(e) => handleChange('direccion', e.target.value)}
                    placeholder="Ej: Av. Principal 123, Lima"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="pais">País *</Label>
                    <Select 
                      value={formData.pais} 
                      onValueChange={(value) => handleChange('pais', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar país" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ecuador">Ecuador</SelectItem>
                        <SelectItem value="Chile">Chile</SelectItem>
                        <SelectItem value="Colombia">Colombia</SelectItem>
                        <SelectItem value="Perú">Perú</SelectItem>
                        <SelectItem value="México">México</SelectItem>
                        <SelectItem value="Argentina">Argentina</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select 
                      value={formData.estado.toString()} 
                      onValueChange={(value) => handleChange('estado', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Activo</SelectItem>
                        <SelectItem value="0">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botones de Acción */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1 sm:flex-none"
                    size="lg"
                  >
                    {saving ? 'Guardando...' : 'Guardar Configuración'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                    disabled={saving}
                    size="lg"
                  >
                    Cancelar
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
          </form>
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
                    background: `linear-gradient(135deg, ${formData.color_primario}, ${formData.color_secundario})` 
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
                      {formData.nombre.charAt(0) || 'I'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg leading-tight">
                        {formData.nombre || 'Nombre de la Institución'}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {formData.slogan || 'Eslogan de la institución'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Información de contacto */}
              <div className="space-y-3 text-sm">
                <h4 className="font-medium text-gray-700">Información de Contacto:</h4>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Propietario:</strong> {formData.owner || 'No especificado'}</p>
                  <p><strong>Dirección:</strong> {formData.direccion || 'No especificada'}</p>
                  <p><strong>Teléfono:</strong> {formData.telefono || 'No especificado'}</p>
                  <p><strong>Email:</strong> {formData.correo || 'No especificado'}</p>
                  <p><strong>País:</strong> {formData.pais}</p>
                  <div className="flex items-center gap-2">
                    <strong>Estado:</strong>
                    <Badge variant={formData.estado === 1 ? 'default' : 'secondary'}>
                      {formData.estado === 1 ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Elementos de UI de ejemplo */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Elementos de ejemplo:</p>
                
                <Button 
                  style={{ backgroundColor: formData.color_primario }}
                  className="w-full text-white hover:opacity-90"
                >
                  Botón Primario
                </Button>
                
                <Button 
                  variant="outline" 
                  style={{ 
                    borderColor: formData.color_secundario,
                    color: formData.color_secundario 
                  }}
                  className="w-full"
                >
                  Botón Secundario
                </Button>

                <div className="flex gap-2">
                  <Badge style={{ backgroundColor: formData.color_primario }}>
                    Activo
                  </Badge>
                  <Badge 
                    variant="outline" 
                    style={{ 
                      borderColor: formData.color_secundario,
                      color: formData.color_secundario 
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
                    style={{ backgroundColor: formData.color_primario }}
                  />
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    {formData.color_primario}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: formData.color_secundario }}
                  />
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    {formData.color_secundario}
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