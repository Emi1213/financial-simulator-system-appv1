"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

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

// Función helper para agregar opacidad a colores hexadecimales
const withOpacity = (hexColor: string, opacity: number) => {
  // Remover el # si está presente
  const hex = hexColor.replace("#", "");

  // Convertir a rgba
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export default function PublicPage() {
  const [institution, setInstitution] = useState<Institution | null>(null);

  useEffect(() => {
    const fetchInstitution = async () => {
      try {
        const res = await fetch("/api/admin/institution");
        const data = await res.json();
        console.log("Respuesta de la API:", data);
        setInstitution(data);
      } catch (error) {
        console.error("Error al obtener la institución:", error);
      }
    };
    fetchInstitution();
  }, []);

  if (!institution) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-light text-white">
            Cargando información institucional...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <motion.main
        className="container mx-auto px-6 py-20"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Header con logo institucional */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="flex justify-center mb-8">
              <div className="relative">
                <Image
                  src={institution.logo}
                  alt={institution.nombre}
                  width={120}
                  height={120}
                  className="rounded-2xl bg-white p-4 shadow-2xl border-4 border-white"
                />
                <div
                  className="absolute -inset-2 rounded-2xl border-2 opacity-20"
                  style={{ borderColor: institution.color_secundario }}
                ></div>
              </div>
            </div>

            <h1 className="text-6xl font-bold mb-4 tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              {institution.nombre}
            </h1>
            <p className="text-2xl font-light text-slate-600 mb-8 max-w-3xl mx-auto">
              {institution.slogan}
            </p>

            {/* Estado institucional */}
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              {institution.estado
                ? "Institución Activa"
                : "Institución Inactiva"}
            </div>
          </motion.div>

          {/* Tarjetas de información institucional */}
          <motion.div
            className="grid md:grid-cols-2 gap-8 mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {/* Tarjeta de Información de Contacto */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl">📞</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  Información de Contacto
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">📍</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      {institution.direccion}
                    </p>
                    <p className="text-sm text-slate-600">{institution.pais}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">📞</span>
                  </div>
                  <p className="font-semibold text-slate-800">
                    {institution.telefono}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">✉️</span>
                  </div>
                  <p className="font-semibold text-slate-800">
                    {institution.correo}
                  </p>
                </div>
              </div>
            </div>

            {/* Tarjeta de Dirección Institucional */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl">🏛️</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  Dirección Institucional
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">👤</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Propietario</p>
                    <p className="text-sm text-slate-600">
                      {institution.owner}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🏛️</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      Estado Regulatorio
                    </p>
                    <p className="text-sm text-slate-600">
                      {institution.estado
                        ? "Completamente Regulado"
                        : "En Proceso de Regulación"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Botones de acción */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <motion.a
              href={`mailto:${institution.correo}`}
              className="px-10 py-4 bg-blue-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:bg-blue-700 flex items-center justify-center space-x-3 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-xl">✉️</span>
              <span>Contactar Ejecutivo</span>
            </motion.a>
            <motion.a
              href={`tel:${institution.telefono}`}
              className="px-10 py-4 bg-white text-slate-700 font-semibold rounded-xl border-2 border-slate-300 transition-all duration-300 shadow-lg hover:shadow-xl hover:border-blue-500 hover:text-blue-600 flex items-center justify-center space-x-3 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-xl">📞</span>
              <span>Llamar Ahora</span>
            </motion.a>
          </motion.div>
        </div>
      </motion.main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <p className="text-lg font-semibold mb-2">
                © {new Date().getFullYear()} {institution.nombre}
              </p>
              <p className="text-sm text-slate-400">
                Todos los derechos reservados. Entidad financiera regulada.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <a
                href="#"
                className="text-sm text-slate-300 hover:text-white transition-colors duration-200 hover:underline"
              >
                Aviso Legal
              </a>
              <a
                href="#"
                className="text-sm text-slate-300 hover:text-white transition-colors duration-200 hover:underline"
              >
                Política de Privacidad
              </a>
              <a
                href="#"
                className="text-sm text-slate-300 hover:text-white transition-colors duration-200 hover:underline"
              >
                Términos y Condiciones
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
