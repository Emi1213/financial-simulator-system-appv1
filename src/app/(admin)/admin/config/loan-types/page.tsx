'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface LoanType {
  id_credito?: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  interes: number;
  plazo_min: number;
  plazo_max: number;
  informacion: string;
  estado: boolean; // Frontend usa boolean
  cobros_indirectos?: Array<{
    id_indirecto: number;
    nombre: string;
    tipo: string;
    interes: number;
    tipo_interes: string;
  }>;
}

interface Indirect {
  id_indirecto: number;
  nombre: string;
  tipo: string;
  interes: number;
  tipo_interes: 'porcentaje' | 'desembolso';
}

export default function LoanTypesPage() {
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
  const [indirects, setIndirects] = useState<Indirect[]>([]);
  const [selectedIndirects, setSelectedIndirects] = useState<number[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLoan, setEditingLoan] = useState<LoanType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');

  const emptyLoan: LoanType = {
    nombre: '',
    descripcion: '',
    tipo: '',
    interes: 0,
    plazo_min: 1,
    plazo_max: 12,
    informacion: '',
    estado: true,
    cobros_indirectos: [],
  };

  const [formData, setFormData] = useState<LoanType>(emptyLoan);

  // Carga inicial
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadLoanTypes(), loadIndirects()]);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const loadLoanTypes = async () => {
    try {
      setError('');
      const res = await fetch('/api/admin/loan-types');
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al cargar los tipos de crédito');
      }

      const data: any[] = await res.json();
      
      // ✅ CORRECCIÓN: Normalizar consistentemente el estado
      const normalizedData = data.map(loan => ({
        ...loan,
        estado: Boolean(loan.estado) // Asegurar boolean
      }));

      setLoanTypes(normalizedData);
    } catch (error: any) {
      console.error('Error cargando tipos de crédito:', error);
      setError(error.message);
      throw error;
    }
  };

  const loadIndirects = async () => {
    try {
      const res = await fetch('/api/admin/indirects');
      if (res.ok) {
        const data: Indirect[] = await res.json();
        setIndirects(data);
      } else {
        throw new Error('Error al cargar cobros indirectos');
      }
    } catch (error: any) {
      console.error('Error cargando cobros indirectos:', error);
      setError('Error al cargar cobros indirectos');
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = '/api/admin/loan-types';
      const method = editingLoan ? 'PUT' : 'POST';

      // ✅ CORRECCIÓN: Preparar datos para enviar - convertir estado boolean a número
      const payload = {
        ...formData,
        estado: formData.estado ? 1 : 0, // Convertir boolean a número para el backend
        cobros_indirectos: selectedIndirects,
        ...(editingLoan && { id_credito: editingLoan.id_credito })
      };

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        await loadLoanTypes(); // Recargar los datos
        resetForm();
      } else {
        throw new Error(result.error || `Error al ${editingLoan ? 'actualizar' : 'crear'} el crédito`);
      }
    } catch (error: any) {
      console.error('Error guardando tipo de crédito:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (loan: LoanType) => {
    setEditingLoan(loan);
    setFormData({ 
      ...loan,
      estado: Boolean(loan.estado) // ✅ CORRECCIÓN: Asegurar que sea boolean
    });
    setSelectedIndirects(loan.cobros_indirectos?.map(ci => ci.id_indirecto) || []);
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (id_credito: number) => {
    if (!confirm('¿Estás seguro de eliminar este tipo de crédito?')) return;
    
    try {
      setError('');
      const res = await fetch(`/api/admin/loan-types?id=${id_credito}`, { 
        method: 'DELETE' 
      });
      
      const result = await res.json();
      
      if (res.ok) {
        await loadLoanTypes();
        alert('Tipo de crédito eliminado correctamente');
      } else {
        throw new Error(result.error || 'Error al eliminar');
      }
    } catch (error: any) {
      console.error('Error eliminando crédito:', error);
      setError(error.message);
    }
  };

  const handleFormChange = (field: keyof LoanType, value: any) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value 
    }));
  };

  const handleNumberChange = (field: keyof LoanType, value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    handleFormChange(field, numValue);
  };

  const toggleIndirectSelection = (id: number) => {
    setSelectedIndirects(prev =>
      prev.includes(id) 
        ? prev.filter(x => x !== id) 
        : [...prev, id]
    );
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingLoan(null);
    setFormData(emptyLoan);
    setSelectedIndirects([]);
    setError('');
  };

  const getIndirectDisplayText = (ind: Indirect) => {
    return `${ind.nombre} (${ind.tipo_interes === 'porcentaje' ? `${ind.interes}%` : `$${ind.interes}`})`;
  };

  // El resto del JSX permanece igual...
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-lg">Cargando tipos de crédito...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Tipos de Crédito</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Gestiona los diferentes tipos de crédito del sistema</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400 dark:text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Gestión de Tipos de Crédito
              </h2>
              <Button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                disabled={loading}
                variant="default"
              >
                + Agregar Tipo
              </Button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {loanTypes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No hay tipos de crédito registrados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Interés
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Plazo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loanTypes.map(loan => (
              <tr key={loan.id_credito} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{loan.nombre}</div>
                    {loan.descripcion && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate" title={loan.descripcion}>
                        {loan.descripcion}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {loan.tipo}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {loan.interes}%
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {loan.plazo_min} - {loan.plazo_max} meses
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    loan.estado 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                  }`}>
                    {loan.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(loan)}
                      disabled={loading}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loan.id_credito && handleDelete(loan.id_credito)}
                      disabled={loading}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                    >
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}

                </tbody>
              </table>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border dark:border-gray-700 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {editingLoan ? 'Editar Crédito' : 'Nuevo Crédito'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información Básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre *
                  </label>
                  <input 
                    type="text" 
                    value={formData.nombre} 
                    onChange={e => handleFormChange('nombre', e.target.value)} 
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors placeholder-gray-500 dark:placeholder-gray-400" 
                    required 
                    placeholder="Ej: Crédito Personal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo *
                  </label>
                  <input 
                    type="text" 
                    value={formData.tipo} 
                    onChange={e => handleFormChange('tipo', e.target.value)} 
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors placeholder-gray-500 dark:placeholder-gray-400" 
                    required 
                    placeholder="Ej: Personal, Hipotecario, etc."
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea 
                  value={formData.descripcion} 
                  onChange={e => handleFormChange('descripcion', e.target.value)} 
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors placeholder-gray-500 dark:placeholder-gray-400" 
                  rows={2}
                  placeholder="Breve descripción del tipo de crédito..."
                />
              </div>

              {/* Interés y Plazos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Interés Anual (%) *
                  </label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    value={formData.interes} 
                    onChange={e => handleNumberChange('interes', e.target.value)} 
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plazo Mínimo (meses) *
                  </label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.plazo_min} 
                    onChange={e => handleNumberChange('plazo_min', e.target.value)} 
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plazo Máximo (meses) *
                  </label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.plazo_max} 
                    onChange={e => handleNumberChange('plazo_max', e.target.value)} 
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors" 
                    required 
                  />
                </div>
              </div>

              {/* Información Adicional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Información Adicional
                </label>
                <textarea 
                  value={formData.informacion} 
                  onChange={e => handleFormChange('informacion', e.target.value)} 
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors placeholder-gray-500 dark:placeholder-gray-400" 
                  rows={3}
                  placeholder="Información adicional, requisitos, condiciones especiales..."
                />
              </div>

              {/* Cobros Indirectos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Cobros Indirectos Asociados
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 max-h-48 overflow-y-auto space-y-2 bg-gray-50 dark:bg-gray-700">
                  {indirects.map(ind => (
                    <label key={ind.id_indirecto} className="flex items-center space-x-3 p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={selectedIndirects.includes(ind.id_indirecto)} 
                        onChange={() => toggleIndirectSelection(ind.id_indirecto)} 
                        className="h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-600 rounded" 
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-200 flex-1">
                        {getIndirectDisplayText(ind)}
                      </span>
                    </label>
                  ))}
                  {indirects.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No hay cobros indirectos disponibles
                    </p>
                  )}
                </div>
              </div>

              {/* Estado */}
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={formData.estado} 
                  onChange={e => handleFormChange('estado', e.target.checked)} 
                  className="h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-600 rounded" 
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Crédito activo y disponible
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <Button
                  type="submit" 
                  disabled={saving} 
                  className="px-6 py-2  rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {saving ? 'Guardando...' : (editingLoan ? 'Actualizar' : 'Crear Crédito')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}