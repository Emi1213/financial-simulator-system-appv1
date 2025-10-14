'use client';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState, useEffect } from 'react';

interface LoanType {
  id_indirecto?: number;
  nombre: string;
  tipo: string;
  interes: number; // valor real
  tipo_interes: "porcentaje" | "desembolso"; // % o monto fijo
}

export default function LoanTypesPage() {
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLoan, setEditingLoan] = useState<LoanType | null>(null);
  const [saving, setSaving] = useState(false);

  const emptyLoan: LoanType = {
    nombre: '',
    tipo: '',
    interes: 0,
    tipo_interes: 'porcentaje',
  };

  const [formData, setFormData] = useState<LoanType>(emptyLoan);

  useEffect(() => {
    loadLoanTypes();
  }, []);

  const loadLoanTypes = async () => {
    try {
      const res = await fetch('/api/admin/indirects');
      if (res.ok) {
        const data = await res.json();
        setLoanTypes(data);
      }
    } catch (error) {
      console.error('Error cargando tipos de crédito:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = '/api/admin/indirects';
      const method = editingLoan ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await loadLoanTypes();
        setShowForm(false);
        setEditingLoan(null);
        setFormData(emptyLoan);
      } else throw new Error('Error al guardar');
    } catch (error) {
      console.error(error);
      alert('Error al guardar tipo de crédito');
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (field: keyof LoanType, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddNew = () => {
    setEditingLoan(null);
    setFormData(emptyLoan);
    setShowForm(true);
  };

  const handleEdit = (loan: LoanType) => {
    setEditingLoan(loan);
    setFormData(loan);
    setShowForm(true);
  };

  const handleDelete = async (id_indirecto: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este cobro indirecto?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/indirects?id=${id_indirecto}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadLoanTypes();
        alert('Cobro indirecto eliminado correctamente');
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (error) {
      console.error('Error eliminando cobro indirecto:', error);
      alert('Error al eliminar el cobro indirecto');
    }
  };

  return (
    <div className="p-6 dark:bg-gray-900 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Cobros Indirectos</h1>
        <Button onClick={handleAddNew} variant="default" className="px-4 py-2 rounded-md">
          + Agregar Tipo
        </Button>
      </div>

      <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-lg shadow overflow-hidden bg-white dark:bg-gray-800">
        <TableHeader className="bg-gray-50 dark:bg-gray-700">
          <TableRow className="hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <TableHead className="px-6 py-3 text-left text-gray-700 dark:text-gray-300 font-medium">Nombre</TableHead>
            <TableHead className="px-6 py-3 text-left text-gray-700 dark:text-gray-300 font-medium">Tipo</TableHead>
            <TableHead className="px-6 py-3 text-left text-gray-700 dark:text-gray-300 font-medium">Interés</TableHead>
            <TableHead className="px-6 py-3 text-left text-gray-700 dark:text-gray-300 font-medium">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {loanTypes.map(loan => (
            <TableRow key={loan.id_indirecto} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <TableHead className="px-6 py-4 text-gray-900 dark:text-gray-100">{loan.nombre}</TableHead>
              <TableHead className="px-6 py-4 text-gray-900 dark:text-gray-100">{loan.tipo}</TableHead>
              <TableHead className="px-6 py-4 text-gray-900 dark:text-gray-100">
                {loan.interes} {loan.tipo_interes === 'porcentaje' ? '%' : 'USD'}
              </TableHead>
              <TableHead className="px-6 py-4">
                <Button 
                  onClick={() => handleEdit(loan)} 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-2"
                >
                  Editar
                </Button>
                <Button
                  onClick={() => handleDelete(loan.id_indirecto!)}
                  variant="ghost" 
                  size="sm" 
                  className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                >
                  Eliminar
                </Button>
              </TableHead>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">{editingLoan ? 'Editar' : 'Nuevo'} Cobro Indirecto</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Nombre</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => handleFormChange('nombre', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Tipo</label>
                <input
                  type="text"
                  required
                  value={formData.tipo}
                  onChange={(e) => handleFormChange('tipo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Interés</label>
                  <input
                    type="number"
                    required
                    value={formData.interes}
                    step={formData.tipo_interes === 'porcentaje' ? 0.01 : 1}
                    onChange={(e) => handleFormChange('interes', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Tipo de Interés</label>
                  <select
                    value={formData.tipo_interes}
                    onChange={(e) => handleFormChange('tipo_interes', e.target.value as "porcentaje" | "desembolso")}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  >
                    <option value="porcentaje">Porcentaje (%)</option>
                    <option value="desembolso">Desembolso (USD)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowForm(false); setFormData(emptyLoan); }}
                  className="px-4 py-2"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={saving} 
                  variant="default"
                  className="px-4 py-2"
                >
                  {saving ? 'Guardando...' : editingLoan ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}