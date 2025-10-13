'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface Institution {
  id_info: number;
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
  estado: boolean | number;
}

// Función helper para convertir hex a RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export default function PublicPage() {
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchInstitution = async () => {
      try {
        const res = await fetch('/api/admin/institution');
        const data = await res.json();
        console.log('Respuesta de la API:', data);
        setInstitution(data);
      } catch (error) {
        console.error('Error al obtener la institución:', error);
      }
    };
    fetchInstitution();
  }, []);

  // Carousel automático para servicios
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (!institution) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-t-transparent border-emerald-400 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-r-transparent border-blue-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-xl font-medium text-emerald-400 animate-pulse">
            Iniciando plataforma financiera...
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Preparando sus servicios de inversión
          </p>
        </div>
      </div>
    );
  }

  const rgb = hexToRgb(institution.color_primario);
  const accentRgb = hexToRgb(institution.color_secundario);

  const services = [
    {
      title: "Simuladores de Inversión",
      description: "Calcule el rendimiento de sus inversiones con nuestras herramientas avanzadas",
      icon: "📈"
    },
    {
      title: "Simuladores de Crédito", 
      description: "Planifique sus préstamos y créditos con simulaciones precisas",
      icon: "💳"
    },
    {
      title: "Asesoría Personalizada",
      description: "Reciba orientación experta para sus decisiones financieras",
      icon: "🎯"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white">
      {/* Hero Section Revolucionario */}
      <section className="relative overflow-hidden py-24">
        {/* Efectos de fondo */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <motion.main
          className="relative z-10 container mx-auto px-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
                <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Estamos a Sus
                </span>
                <br />
                <span className="text-white">
                  Servicios Financieros
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                Contamos con <span className="text-emerald-400 font-semibold">simuladores de inversiones</span> y 
                <span className="text-blue-400 font-semibold"> simuladores de créditos</span> de última generación. 
                <span className="block mt-4 text-lg">
                  🚀 <strong className="text-white">¡Te invitamos a registrarte</strong> y descubrir el futuro de las finanzas digitales
                </span>
              </p>
            </motion.div>

            {/* Carousel de Servicios */}
            <motion.div
              className="grid md:grid-cols-3 gap-8 mb-16"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  className={`relative group cursor-pointer ${index === currentIndex ? 'scale-105' : 'scale-100'} transition-transform duration-500`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                    <div className="text-4xl mb-4 text-center">{service.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-4 text-center">{service.title}</h3>
                    <p className="text-gray-300 text-center leading-relaxed">{service.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Llamada a la Acción Principal */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-6 py-3 mb-8">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="text-sm text-emerald-400 font-medium">Plataforma activa • {institution.estado ? 'Servicios disponibles 24/7' : 'En mantenimiento'}</span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <Link href="/register">
                  <motion.button
                    className="w-full px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl text-white font-semibold text-lg shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300"
                    whileHover={{ scale: 1.02, boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.25)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    🚀 Comenzar Ahora
                  </motion.button>
                </Link>
                
                <Link href="/investments">
                  <motion.button
                    className="w-full px-8 py-4 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl text-white font-semibold text-lg hover:bg-white/20 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    📈 Ver Simuladores
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.main>
      </section>

      {/* Sección de Estadísticas */}
      <section className="py-20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <motion.div
            className="grid md:grid-cols-4 gap-8 text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <div className="space-y-2">
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">1000+</div>
              <div className="text-sm text-gray-400">Simulaciones Realizadas</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">50+</div>
              <div className="text-sm text-gray-400">Productos Financieros</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">24/7</div>
              <div className="text-sm text-gray-400">Servicio Disponible</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-emerald-400 bg-clip-text text-transparent">100%</div>
              <div className="text-sm text-gray-400">Seguro y Confiable</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Futurista */}
      <footer className="relative overflow-hidden py-16 bg-gradient-to-t from-black to-gray-900">
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* Información de Contacto */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">Contacto Directo</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center">
                    <span>📍</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{institution.direccion}</p>
                    <p className="text-gray-400 text-sm">{institution.pais}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <span>📞</span>
                  </div>
                  <a href={`tel:${institution.telefono}`} className="text-white font-medium hover:text-emerald-400 transition-colors">
                    {institution.telefono}
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <span>✉️</span>
                  </div>
                  <a href={`mailto:${institution.correo}`} className="text-white font-medium hover:text-emerald-400 transition-colors">
                    {institution.correo}
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Enlaces Rápidos */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">Servicios</h3>
              <div className="space-y-3">
                <Link href="/investments" className="block text-gray-300 hover:text-emerald-400 transition-colors">
                  📈 Simulador de Inversiones
                </Link>
                <Link href="/loans" className="block text-gray-300 hover:text-emerald-400 transition-colors">
                  💳 Simulador de Créditos
                </Link>
                <Link href="/register" className="block text-gray-300 hover:text-emerald-400 transition-colors">
                  🚀 Crear Cuenta
                </Link>
                <Link href="/login" className="block text-gray-300 hover:text-emerald-400 transition-colors">
                  🔐 Acceso Cliente
                </Link>
              </div>
            </motion.div>

            {/* Información Institucional */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.6 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">Institución</h3>
              <div className="space-y-4">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-4">
                  <p className="text-sm text-gray-300 mb-2">Dirigido por:</p>
                  <p className="text-white font-medium">{institution.owner}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-emerald-400 text-sm font-medium">
                    {institution.estado ? 'Entidad Regulada y Activa' : 'En Proceso de Regulación'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Plataforma financiera digital autorizada para brindar servicios de simulación y asesoría en inversiones y créditos.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Copyright */}
          <motion.div
            className="border-t border-white/10 pt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.6 }}
          >
            <p className="text-gray-400 mb-4">
              © {new Date().getFullYear()} {institution.nombre}. Todos los derechos reservados.
            </p>
            <div className="flex flex-wrap justify-center space-x-6 text-sm">
              <Link href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                Términos de Servicio
              </Link>
              <Link href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                Política de Privacidad
              </Link>
              <Link href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                Marco Legal
              </Link>
              <Link href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                Soporte
              </Link>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}