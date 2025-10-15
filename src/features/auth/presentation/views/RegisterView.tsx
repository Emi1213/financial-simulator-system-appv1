'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useInstitution } from '@/features/institution/hooks/useInstitution';
import { Button } from '@/components/ui/button';
import { SelfieCapture } from '@/features/auth/presentation/components/SelfieCapture';

// Definir los tipos de datos para cada paso
interface PersonalData {
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  fechaNacimiento: string;
  cedula: string;
  telefono: string;
  usuario: string;
  clave: string;
  confirmarClave: string;
}

interface DocumentData {
  cedulaFrontal: File | null;
  cedulaReverso: File | null;
  cedulaFrontalUri: string;
  cedulaReversoUri: string;
}

interface VerificationData {
  selfie: File | null;
  selfieUri: string;
  isVerified: boolean;
}

export function RegisterView() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string; show: boolean }>({ 
    type: 'error', 
    message: '', 
    show: false 
  });
  const router = useRouter();
  const { config } = useInstitution();

  // Función para mostrar toast
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message, show: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 5000); // Auto-ocultar después de 5 segundos
  };

  // Estados para cada paso
  const [personalData, setPersonalData] = useState<PersonalData>({
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    fechaNacimiento: '',
    cedula: '',
    telefono: '',
    usuario: '',
    clave: '',
    confirmarClave: ''
  });

  const [documentData, setDocumentData] = useState<DocumentData>({
    cedulaFrontal: null,
    cedulaReverso: null,
    cedulaFrontalUri: '',
    cedulaReversoUri: ''
  });

  const [verificationData, setVerificationData] = useState<VerificationData>({
    selfie: null,
    selfieUri: '',
    isVerified: false
  });

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const finalData = {
        ...personalData,
        cedulaFrontalUri: documentData.cedulaFrontalUri,
        cedulaReversoUri: documentData.cedulaReversoUri,
        selfieUri: verificationData.selfieUri,
        verificado: verificationData.isVerified ? 1 : 0
      };

      console.log('Registering user with data:', finalData);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || data.message || 'Error en el registro';
        throw new Error(errorMessage);
      }

      showToast('success', data.message || 'Usuario registrado correctamente');
      setMessage({
        type: 'success',
        text: data.message || 'Usuario registrado correctamente'
      });

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (error: any) {
      console.error('Registration error:', error);
      showToast('error', error.message || 'Error al registrar el usuario');
      setMessage({
        type: 'error',
        text: error.message || 'Error al registrar el usuario'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, title: 'Información Personal', icon: '👤' },
      { number: 2, title: 'Documentos', icon: '📄' },
      { number: 3, title: 'Verificación', icon: '📸' }
    ];

    return (
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                  currentStep >= step.number 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step.number ? '✓' : step.icon}
                </div>
                <span className={`mt-2 text-xs font-medium ${
                  currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-20 h-1 mx-4 rounded-full transition-all duration-300 ${
                  currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 px-8 py-8 text-center">
              <div className="flex justify-center mb-4">
                {config.logo ? (
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <img
                      src={config.logo}
                      alt={config.institutionName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {config.institutionName.charAt(0)}
                  </div>
                )}
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Crear Cuenta
              </h1>
              <p className="text-slate-300">
                Únete a {config.institutionName}
              </p>
            </div>

            {/* Indicador de pasos */}
            <div className="px-8 py-6 bg-gray-50 border-b">
              {renderStepIndicator()}
            </div>

            {/* Contenido del formulario */}
            <div className="p-8">
              {message && (
                <div
                  className={`mb-6 p-4 rounded-xl border-l-4 ${
                    message.type === 'success'
                      ? 'bg-green-50 border-green-500 text-green-800'
                      : 'bg-red-50 border-red-500 text-red-800'
                  }`}
                >
                  <div className="flex items-center">
                    {message.type === 'success' ? (
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    <span className="font-medium">{message.text}</span>
                  </div>
                </div>
              )}

              {/* Aquí irán los componentes de cada paso */}
              {currentStep === 1 && (
                <PersonalInfoStep 
                  data={personalData} 
                  setData={setPersonalData}
                  onNext={() => setCurrentStep(2)}
                />
              )}
              
              {currentStep === 2 && (
                <DocumentUploadStep 
                  data={documentData} 
                  setData={setDocumentData}
                  personalData={personalData}
                  onNext={() => setCurrentStep(3)}
                  onBack={() => setCurrentStep(1)}
                  showToast={showToast}
                />
              )}
              
              {currentStep === 3 && (
                <VerificationStep 
                  data={verificationData} 
                  setData={setVerificationData}
                  documentData={documentData}
                  onBack={() => setCurrentStep(2)}
                  onSubmit={handleFinalSubmit}
                  isLoading={isLoading}
                  showToast={showToast}
                />
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-gray-50 border-t text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Tus datos están protegidos y seguros</span>
              </div>
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                ¿Ya tienes una cuenta? Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Component */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className={`max-w-md p-4 rounded-xl shadow-2xl border-2 ${
            toast.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {toast.type === 'success' ? (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold ${
                  toast.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {toast.type === 'success' ? 'Éxito' : 'Error'}
                </h4>
                <p className={`text-sm mt-1 ${
                  toast.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => setToast(prev => ({ ...prev, show: false }))}
                className={`flex-shrink-0 ml-2 ${
                  toast.type === 'success' 
                    ? 'text-green-400 hover:text-green-600' 
                    : 'text-red-400 hover:text-red-600'
                } transition-colors`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para el Paso 1: Información Personal
function PersonalInfoStep({ data, setData, onNext }: any) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateAge = (birthDate: string): boolean => {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (!data.primerNombre) newErrors.primerNombre = 'El primer nombre es requerido';
    if (!data.primerApellido) newErrors.primerApellido = 'El primer apellido es requerido';
    if (!data.cedula) newErrors.cedula = 'La cédula es requerida';
    if (!data.usuario) newErrors.usuario = 'El nombre de usuario es requerido';
    if (!data.clave) newErrors.clave = 'La contraseña es requerida';
    if (!data.confirmarClave) newErrors.confirmarClave = 'Confirmar contraseña es requerido';
    if (!data.fechaNacimiento) newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida';

    if (data.clave && data.clave.length < 6) {
      newErrors.clave = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (data.clave !== data.confirmarClave) {
      newErrors.confirmarClave = 'Las contraseñas no coinciden';
    }

    if (data.fechaNacimiento && !validateAge(data.fechaNacimiento)) {
      newErrors.fechaNacimiento = 'Debe ser mayor de edad para registrarse';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      onNext();
    }
  };

  const updateField = (field: string, value: string) => {
    setData({ ...data, [field]: value });
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Información Personal</h2>
        <p className="text-gray-600">Completa tus datos personales para continuar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
        {/* Primer Nombre */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Primer Nombre *
          </label>
          <input
            type="text"
            value={data.primerNombre}
            onChange={(e) => updateField('primerNombre', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
              errors.primerNombre 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-200 focus:border-blue-500'
            } focus:outline-none`}
            placeholder="Ingresa tu primer nombre"
          />
          {errors.primerNombre && (
            <p className="mt-1 text-sm text-red-600">{errors.primerNombre}</p>
          )}
        </div>

        {/* Segundo Nombre */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Segundo Nombre
          </label>
          <input
            type="text"
            value={data.segundoNombre}
            onChange={(e) => updateField('segundoNombre', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all duration-200"
            placeholder="Segundo nombre (opcional)"
          />
        </div>

        {/* Primer Apellido */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Primer Apellido *
          </label>
          <input
            type="text"
            value={data.primerApellido}
            onChange={(e) => updateField('primerApellido', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
              errors.primerApellido 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-200 focus:border-blue-500'
            } focus:outline-none`}
            placeholder="Ingresa tu primer apellido"
          />
          {errors.primerApellido && (
            <p className="mt-1 text-sm text-red-600">{errors.primerApellido}</p>
          )}
        </div>

        {/* Segundo Apellido */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Segundo Apellido
          </label>
          <input
            type="text"
            value={data.segundoApellido}
            onChange={(e) => updateField('segundoApellido', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all duration-200"
            placeholder="Segundo apellido (opcional)"
          />
        </div>

        {/* Fecha de Nacimiento */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Fecha de Nacimiento *
          </label>
          <input
            type="date"
            value={data.fechaNacimiento}
            onChange={(e) => updateField('fechaNacimiento', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
              errors.fechaNacimiento 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-200 focus:border-blue-500'
            } focus:outline-none`}
          />
          {errors.fechaNacimiento && (
            <p className="mt-1 text-sm text-red-600">{errors.fechaNacimiento}</p>
          )}
        </div>

        {/* Cédula */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Cédula *
          </label>
          <input
            type="text"
            value={data.cedula}
            onChange={(e) => updateField('cedula', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
              errors.cedula 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-200 focus:border-blue-500'
            } focus:outline-none`}
            placeholder="Número de cédula"
          />
          {errors.cedula && (
            <p className="mt-1 text-sm text-red-600">{errors.cedula}</p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Teléfono
          </label>
          <input
            type="tel"
            value={data.telefono}
            onChange={(e) => updateField('telefono', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all duration-200"
            placeholder="Número de teléfono"
          />
        </div>

        {/* Usuario */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Usuario *
          </label>
          <input
            type="text"
            value={data.usuario}
            onChange={(e) => updateField('usuario', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
              errors.usuario 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-200 focus:border-blue-500'
            } focus:outline-none`}
            placeholder="Nombre de usuario"
          />
          {errors.usuario && (
            <p className="mt-1 text-sm text-red-600">{errors.usuario}</p>
          )}
        </div>
      </div>

      {/* Contraseñas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
        {/* Contraseña */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Contraseña *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={data.clave}
              onChange={(e) => updateField('clave', e.target.value)}
              className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all duration-200 ${
                errors.clave 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              } focus:outline-none`}
              placeholder="Contraseña"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.clave && (
            <p className="mt-1 text-sm text-red-600">{errors.clave}</p>
          )}
        </div>

        {/* Confirmar Contraseña */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-black">
            Confirmar Contraseña *
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={data.confirmarClave}
              onChange={(e) => updateField('confirmarClave', e.target.value)}
              className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all duration-200 ${
                errors.confirmarClave 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              } focus:outline-none`}
              placeholder="Confirmar contraseña"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.confirmarClave && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmarClave}</p>
          )}
        </div>
      </div>

      {/* Botón Continuar */}
      <div className="flex justify-end pt-6">
        <Button
          onClick={handleNext}
          className="px-8 py-3 font-semibold flex items-center gap-2"
        >
          Continuar
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
}

// Componente para el Paso 2: Subir Documentos
function DocumentUploadStep({ data, setData, personalData, onNext, onBack, showToast }: any) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState({ frontal: false, reverso: false });
  const [previews, setPreviews] = useState({ frontal: '', reverso: '' });

  // Función para optimizar imagen de cédula antes de subirla
  const optimizeCedulaImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Configurar dimensiones máximas para Face++ API y cédulas
        const MAX_WIDTH = 1200; // Un poco más grande para cédulas para man tener legibilidad
        const MAX_HEIGHT = 800;
        const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB para cédulas (un poco más permisivo)
        
        let { width, height } = img;
        
        // Redimensionar si es necesario manteniendo aspect ratio
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const aspectRatio = width / height;
          
          if (width > height) {
            width = MAX_WIDTH;
            height = MAX_WIDTH / aspectRatio;
          } else {
            height = MAX_HEIGHT;
            width = MAX_HEIGHT * aspectRatio;
          }
        }
        
        // Asegurar dimensiones mínimas para legibilidad
        const MIN_WIDTH = 400;
        const MIN_HEIGHT = 250;
        if (width < MIN_WIDTH) {
          width = MIN_WIDTH;
          height = MIN_WIDTH / (img.width / img.height);
        }
        if (height < MIN_HEIGHT) {
          height = MIN_HEIGHT;
          width = MIN_HEIGHT * (img.width / img.height);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Optimizar calidad de redimensionamiento para documentos
        ctx!.imageSmoothingEnabled = true;
        ctx!.imageSmoothingQuality = 'high';
        ctx!.drawImage(img, 0, 0, width, height);
        
        // Función para crear archivo con calidad específica
        const createOptimizedFile = (quality: number) => {
          canvas.toBlob((blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name, { type: 'image/jpeg' });
              
              console.log('Cedula image optimization result:', {
                originalSize: `${img.width}x${img.height}`,
                optimizedSize: `${width}x${height}`,
                originalFileSize: `${(file.size / 1024).toFixed(1)}KB`,
                optimizedFileSize: `${(blob.size / 1024).toFixed(1)}KB`,
                fileSizeMB: `${(blob.size / (1024 * 1024)).toFixed(2)}MB`,
                quality: quality
              });
              
              // Si aún es muy grande, reducir más la calidad (pero no menos de 0.4 para mantener legibilidad)
              if (blob.size > MAX_FILE_SIZE && quality > 0.4) {
                createOptimizedFile(Math.max(0.4, quality - 0.15));
              } else {
                resolve(optimizedFile);
              }
            }
          }, 'image/jpeg', quality);
        };
        
        // Comenzar con calidad alta para documentos (0.9 para mejor legibilidad)
        createOptimizedFile(0.9);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Función para subir imagen a Supabase (reutilizando la lógica existente)
  const uploadImage = async (file: File, type: 'frontal' | 'reverso'): Promise<string> => {
    const { uploadImageToSupabase, generateUniqueFileName } = await import('@/lib/supabase');
    
    if (!personalData.cedula) {
      throw new Error('Debe completar la información personal primero');
    }

    // Optimizar imagen antes de subir
    const optimizedFile = await optimizeCedulaImage(file);

    const fileName = generateUniqueFileName(
      personalData.cedula, 
      type === 'frontal' ? 'cedula-frontal' : 'cedula-reverso',
      optimizedFile.name
    );

    const bucketName = 'cedulas';
    const publicUrl = await uploadImageToSupabase(optimizedFile, bucketName, fileName);
    return publicUrl;
  };

  const handleFileSelect = async (file: File, type: 'frontal' | 'reverso') => {
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, [type]: 'Por favor selecciona una imagen válida (JPG, PNG, WEBP)' });
      return;
    }

    // Validar tamaño inicial (10MB máximo antes de optimización)
    if (file.size > 10 * 1024 * 1024) {
      setErrors({ ...errors, [type]: 'La imagen es demasiado grande. Máximo 10MB' });
      return;
    }

    // Mostrar advertencia si la imagen es muy grande
    if (file.size > 5 * 1024 * 1024) {
      console.log(`Large image detected (${(file.size / (1024 * 1024)).toFixed(2)}MB), will be optimized automatically`);
    }

    try {
      setUploading(prev => ({ ...prev, [type]: true }));
      setErrors(prev => ({ ...prev, [type]: '' }));

      // Mostrar notificación si la imagen necesita optimización
      if (file.size > 2 * 1024 * 1024) { // 2MB
        showToast('success', `Optimizando imagen de ${type}... Esto puede tomar unos segundos.`);
      }

      // Crear preview
      const previewUrl = URL.createObjectURL(file);
      setPreviews(prev => ({ ...prev, [type]: previewUrl }));

      // Subir archivo (ahora incluye optimización automática)
      const uploadedUrl = await uploadImage(file, type);
      
      // Actualizar datos
      setData((prev: DocumentData) => {
        const newData = {
          ...prev,
          [type === 'frontal' ? 'cedulaFrontal' : 'cedulaReverso']: file,
          [type === 'frontal' ? 'cedulaFrontalUri' : 'cedulaReversoUri']: uploadedUrl
        };
        console.log(`Actualizando ${type}:`, {
          prevData: prev,
          newData: newData,
          uploadedUrl: uploadedUrl
        });
        return newData;
      });

    } catch (error: any) {
      console.error('Error uploading image:', error);
      const errorMessage = error.message || 'Error al subir la imagen';
      setErrors(prev => ({ ...prev, [type]: errorMessage }));
      showToast('error', errorMessage);
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.cedulaFrontalUri) newErrors.frontal = 'La imagen del anverso de la cédula es requerida';
    if (!data.cedulaReversoUri) newErrors.reverso = 'La imagen del reverso de la cédula es requerida';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      onNext();
    }
  };

  const renderUploadArea = (type: 'frontal' | 'reverso', title: string, description: string) => {
    const isUploading = uploading[type];
    const hasFile = type === 'frontal' ? data.cedulaFrontalUri : data.cedulaReversoUri;
    const preview = previews[type];
    const error = errors[type];

    return (
      <div className={`border-2 border-dashed rounded-2xl p-6 transition-all duration-300 ${
        error ? 'border-red-300 bg-red-50' : 
        hasFile ? 'border-green-300 bg-green-50' : 
        'border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50'
      }`}>
        <div className="text-center">
          {isUploading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-blue-600 font-medium">Subiendo imagen...</p>
            </div>
          ) : preview || hasFile ? (
            <div className="space-y-4">
              {preview && (
                <div className="relative inline-block">
                  <img 
                    src={preview} 
                    alt={title}
                    className="w-32 h-20 object-cover rounded-lg shadow-md"
                  />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
              <div>
                <p className="text-green-600 font-semibold">{title} subida correctamente</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => document.getElementById(`file-${type}`)?.click()}
                  className="text-sm bg-black"
                >
                  Cambiar imagen
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-600 mb-4">{description}</p>
                <Button
                  onClick={() => document.getElementById(`file-${type}`)?.click()}
                  className="inline-flex items-center gap-2 px-6 py-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Seleccionar imagen
                </Button>
              </div>
            </div>
          )}
          
          <input
            id={`file-${type}`}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file, type);
            }}
            className="hidden"
          />
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Documentos de Identidad</h2>
        <p className="text-gray-600">Sube las imágenes de tu cédula de identidad</p>
      </div>

      {/* Información del usuario */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {personalData.primerNombre} {personalData.primerApellido}
            </p>
            <p className="text-sm text-gray-600">Cédula: {personalData.cedula}</p>
          </div>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-semibold text-amber-800 mb-2">Recomendaciones</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Asegúrate de que la imagen sea clara y legible</li>
              <li>• La cédula debe estar completamente visible</li>
              <li>• Evita sombras y reflejos</li>
              <li>• Tamaño máximo: 5MB por imagen</li>
              <li>• Las imágenes se optimizan automáticamente</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Áreas de subida */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderUploadArea(
          'frontal',
          'Anverso de la Cédula',
          'Sube la parte frontal de tu cédula donde aparece tu foto'
        )}
        
        {renderUploadArea(
          'reverso',
          'Reverso de la Cédula',
          'Sube la parte trasera de tu cédula con la información adicional'
        )}
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="px-6 py-3 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Atrás
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!data.cedulaFrontalUri || !data.cedulaReversoUri}
          className="px-8 py-3 flex items-center gap-2"
        >
          Continuar
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
}

// Componente para el Paso 3: Verificación Facial
function VerificationStep({ data, setData, documentData, onBack, onSubmit, isLoading, showToast }: any) {
  const [showCamera, setShowCamera] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isMatch: boolean;
    confidence: number;
  } | null>(null);
  const [error, setError] = useState('');

  // Función para optimizar imagen antes de subirla
  const optimizeImageFile = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Configurar dimensiones máximas para Face++ API
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        const MAX_FILE_SIZE = 1.5 * 1024 * 1024; // 1.5MB
        
        let { width, height } = img;
        
        // Redimensionar si es necesario
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const aspectRatio = width / height;
          
          if (width > height) {
            width = MAX_WIDTH;
            height = MAX_WIDTH / aspectRatio;
          } else {
            height = MAX_HEIGHT;
            width = MAX_HEIGHT * aspectRatio;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Optimizar calidad de redimensionamiento
        ctx!.imageSmoothingEnabled = true;
        ctx!.imageSmoothingQuality = 'high';
        ctx!.drawImage(img, 0, 0, width, height);
        
        // Función para crear archivo con calidad específica
        const createOptimizedFile = (quality: number) => {
          canvas.toBlob((blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name, { type: 'image/jpeg' });
              
              console.log('Image optimization result:', {
                originalSize: `${img.width}x${img.height}`,
                optimizedSize: `${width}x${height}`,
                originalFileSize: `${(file.size / 1024).toFixed(1)}KB`,
                optimizedFileSize: `${(blob.size / 1024).toFixed(1)}KB`,
                quality: quality
              });
              
              // Si aún es muy grande, reducir más la calidad
              if (blob.size > MAX_FILE_SIZE && quality > 0.3) {
                createOptimizedFile(quality - 0.2);
              } else {
                resolve(optimizedFile);
              }
            }
          }, 'image/jpeg', quality);
        };
        
        // Comenzar con calidad alta y reducir si es necesario
        createOptimizedFile(0.8);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Función para subir selfie
  const uploadSelfie = async (file: File): Promise<string> => {
    const { uploadImageToSupabase, generateUniqueFileName } = await import('@/lib/supabase');
    
    // Optimizar imagen antes de subir
    const optimizedFile = await optimizeImageFile(file);
    
    const fileName = generateUniqueFileName(
      data.cedula || 'temp',
      'selfie',
      optimizedFile.name
    );

    const bucketName = 'selfies';
    // No eliminar selfies existentes (deleteExisting: false) porque son usuarios anónimos diferentes
    const publicUrl = await uploadImageToSupabase(optimizedFile, bucketName, fileName, false);
    return publicUrl;
  };



  // Verificación facial usando la API con URLs
  const performFaceVerification = async (cedulaUrl: string, selfieUrl: string): Promise<{ isMatch: boolean; confidence: number }> => {
    try {
      const response = await fetch('/api/face-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cedulaUrl: cedulaUrl,
          selfieUrl: selfieUrl
        })
      });

      if (!response.ok) {
        throw new Error('Error en la verificación facial');
      }

      const result = await response.json();
      return {
        isMatch: result.isMatch || false,
        confidence: result.confidence || 0
      };
    } catch (error) {
      console.error('Error in face verification:', error);
      throw new Error('Error al verificar la identidad facial');
    }
  };

  const handleSelfieCapture = async (file: File) => {
    try {
      setUploading(true);
      setError('');

      // Subir selfie
      const uploadedUrl = await uploadSelfie(file);
      
      // Actualizar datos
      setData({
        ...data,
        selfie: file,
        selfieUri: uploadedUrl
      });

      // Verificar con la cédula frontal usando URLs
      if (documentData.cedulaFrontalUri) {
        setVerifying(true);
        const verification = await performFaceVerification(documentData.cedulaFrontalUri, uploadedUrl);
        setVerificationResult(verification);
        
        // Actualizar estado de verificación
        setData({
          ...data,
          selfie: file,
          selfieUri: uploadedUrl,
          isVerified: verification.isMatch && verification.confidence > 70
        });
      }

      setShowCamera(false);
    } catch (error: any) {
      console.error('Error processing selfie:', error);
      const errorMessage = error.message || 'Error al procesar la selfie';
      setError(errorMessage);
      showToast('error', errorMessage);
    } finally {
      setUploading(false);
      setVerifying(false);
    }
  };

  const handleRetakeSelfie = () => {
    setData({ ...data, selfie: null, selfieUri: '', isVerified: false });
    setVerificationResult(null);
    setShowCamera(true);
  };

  const canProceed = data.selfieUri && data.isVerified;

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verificación Facial</h2>
        <p className="text-gray-600">Toma una selfie para verificar tu identidad</p>
      </div>

      {/* Estado actual */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Documentos subidos correctamente</h3>
              <p className="text-sm text-gray-600">Cédula frontal y reverso verificados</p>
            </div>
          </div>
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      {/* Área principal de selfie */}
      {!showCamera ? (
        <div className="space-y-6">
          {data.selfieUri ? (
            // Selfie tomada
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center">
              <div className="space-y-6">
                <div className="relative inline-block">
                  <img 
                    src={data.selfieUri} 
                    alt="Selfie capturada"
                    className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-lg"
                  />
                  {data.isVerified && (
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>

                {verificationResult && (
                  <div className={`p-4 rounded-xl border-2 ${
                    data.isVerified 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {data.isVerified ? (
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      <span className={`font-semibold ${
                        data.isVerified ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {data.isVerified ? 'Identidad Verificada' : 'Verificación Fallida'}
                      </span>
                    </div>

                    {!data.isVerified && (
                      <p className="text-red-700 text-sm mt-2">
                        La foto no coincide con la cédula. Por favor, toma otra selfie.
                      </p>
                    )}
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={handleRetakeSelfie}
                  className="px-6 py-3 flex items-center gap-2 mx-auto text-black"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Tomar otra foto
                </Button>
              </div>
            </div>
          ) : (
            // Sin selfie
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-all">
              <div className="space-y-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Toma tu Selfie</h3>
                  <p className="text-gray-600 mb-6">
                    Necesitamos verificar que eres la misma persona de la cédula
                  </p>
                  <Button
                    onClick={() => setShowCamera(true)}
                    size="lg"
                    className="inline-flex items-center gap-3 px-8 py-4 font-semibold shadow-lg transform hover:scale-105 transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2-2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Abrir Cámara
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Instrucciones */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-amber-800 mb-2">Consejos para una buena selfie</h3>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Asegúrate de tener buena iluminación</li>
                  <li>• Mira directamente a la cámara</li>
                  <li>• Mantén una expresión neutra</li>
                  <li>• Evita usar accesorios que cubran tu rostro</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Componente de cámara real
        <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
          <div className="space-y-4 mb-6">
            <div className="text-center">
              <h3 className="text-white text-xl font-semibold mb-2">Captura tu Selfie</h3>
              <p className="text-gray-300 text-sm">Posiciona tu rostro en el centro del recuadro</p>
            </div>
          </div>
          <SelfieCapture
            onCapture={handleSelfieCapture}
            onCancel={() => setShowCamera(false)}
            isUploading={uploading || verifying}
          />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800 font-medium">{error}</span>
          </div>
        </div>
      )}

      {uploading && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Subiendo selfie...
          </div>
        </div>
      )}

      {verifying && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-lg">
            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            Verificando identidad...
          </div>
        </div>
      )}

      {/* Botones de navegación */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="px-6 py-3 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Atrás
        </Button>
        
        <Button
          onClick={onSubmit}
          disabled={!canProceed || isLoading}
          className="px-8 py-3 bg-green-600 hover:bg-green-700 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Registrando...
            </>
          ) : (
            <>
              Completar Registro
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}