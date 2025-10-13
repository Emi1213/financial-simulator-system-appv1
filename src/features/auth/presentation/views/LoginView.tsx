'use client';

import { useAuth } from '../../hooks/useAuth';
import { LoginForm } from '../components/LoginForm';

export function LoginView() {
  const { login, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
      </div>
      
      {/* Layout de dos columnas */}
      <div className="relative z-10 min-h-screen flex">
        {/* Columna izquierda - Imagen */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 flex flex-col justify-center items-center p-12 text-center">
            <div className="mb-8">
              <img 
                src="https://pcjrjqlmepgyqujuwzig.supabase.co/storage/v1/object/public/savingsbucket/moneyIncome2.svg"
                alt="Gestión Financiera"
                className="w-80 h-80 object-contain drop-shadow-2xl"
              />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Gestión Financiera Inteligente
            </h1>
            <p className="text-xl text-slate-300 max-w-md leading-relaxed">
              Administra tus finanzas de manera segura y eficiente con nuestro sistema integral
            </p>
            <div className="mt-8 flex items-center gap-4 text-slate-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Confiable</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Eficiente</span>
              </div>
            </div>
          </div>
          {/* Elementos decorativos */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 left-10 w-24 h-24 bg-blue-500/10 rounded-full blur-xl"></div>
        </div>

        {/* Columna derecha - Formulario */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md">
            <LoginForm onSubmit={login} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
