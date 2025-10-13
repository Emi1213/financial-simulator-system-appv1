'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { InstitutionConfig, InstitutionContextType } from '../types';
import { fetchInstitutionConfig, updateInstitutionConfig } from '../services/institutionService';
import { getContrastTextColor } from '../utils/colorUtils';
import defaultConfig from '../mocks/defaultConfig.json';

export const InstitutionContext = createContext<InstitutionContextType | undefined>(
  undefined
);

interface InstitutionProviderProps {
  children: ReactNode;
}

/**
 * Convierte color HEX a formato OKLCH compatible con shadcn/ui
 */
function hexToOklch(hex: string): string {
  // Eliminar # si existe
  const cleanHex = hex.replace('#', '');
  
  // Convertir a RGB
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  // Convertir RGB a valores lineales
  const rLinear = r / 255;
  const gLinear = g / 255;
  const bLinear = b / 255;
  
  // Calcular luminancia aproximada
  const luminance = 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  
  // Calcular croma aproximado basado en saturación
  const max = Math.max(rLinear, gLinear, bLinear);
  const min = Math.min(rLinear, gLinear, bLinear);
  const chroma = (max - min) * 0.4; // Factor de ajuste para OKLCH
  
  // Calcular hue aproximado
  let hue = 0;
  if (max !== min) {
    if (max === rLinear) {
      hue = 60 * (((gLinear - bLinear) / (max - min)) % 6);
    } else if (max === gLinear) {
      hue = 60 * (((bLinear - rLinear) / (max - min)) + 2);
    } else {
      hue = 60 * (((rLinear - gLinear) / (max - min)) + 4);
    }
  }
  
  if (hue < 0) hue += 360;
  
  // Retornar en formato OKLCH
  return `oklch(${(luminance * 100).toFixed(1)}% ${chroma.toFixed(3)} ${Math.round(hue)})`;
}

/**
 * Inyecta las variables CSS personalizadas manteniendo el tema dark
 * Solo actualiza los colores primario y secundario configurables
 */
function applyThemeColors(colors: InstitutionConfig['colors']) {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    
    // Asegurar que el tema dark esté activo
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    
    // Calcular colores de texto óptimos según luminancia
    const primaryForeground = getContrastTextColor(colors.primary);
    const secondaryForeground = getContrastTextColor(colors.secondary);
    
    // Solo actualizar las variables personalizables (primary y secondary)
    // El resto de las variables dark se mantienen del CSS
    root.style.setProperty('--primary', hexToOklch(colors.primary));
    root.style.setProperty('--secondary', hexToOklch(colors.secondary));
    root.style.setProperty('--primary-foreground', hexToOklch(primaryForeground));
    root.style.setProperty('--secondary-foreground', hexToOklch(secondaryForeground));
    
    // Usar el color primario para ring (focus states)
    root.style.setProperty('--ring', hexToOklch(colors.primary));
    
    // También podemos usar el color primario para sidebar-primary si existe
    root.style.setProperty('--sidebar-primary', hexToOklch(colors.primary));
    root.style.setProperty('--sidebar-primary-foreground', hexToOklch(primaryForeground));
  }
}

export function InstitutionProvider({ children }: InstitutionProviderProps) {
  const [config, setConfig] = useState<InstitutionConfig>(defaultConfig as InstitutionConfig);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar configuración al montar el componente
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        
        // Aplicar tema dark inmediatamente
        if (typeof document !== 'undefined') {
          document.documentElement.classList.add('dark');
          document.documentElement.setAttribute('data-theme', 'dark');
        }
        
        const data = await fetchInstitutionConfig();
        setConfig(data);
        
        // Aplicar colores personalizados al tema dark
        applyThemeColors(data.colors);
      } catch (error) {
        console.error('Error loading institution config:', error);
        // Aplica colores por defecto en caso de error
        applyThemeColors(defaultConfig.colors);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  // Función para actualizar la configuración
  const handleUpdateConfig = async (newConfig: InstitutionConfig) => {
    try {
      const updatedConfig = await updateInstitutionConfig(newConfig);
      setConfig(updatedConfig);
      
      // Aplicar nuevos colores al tema
      applyThemeColors(updatedConfig.colors);
    } catch (error) {
      console.error('Error updating config:', error);
      throw error;
    }
  };

  return (
    <InstitutionContext.Provider
      value={{
        config,
        updateConfig: handleUpdateConfig,
        isLoading,
      }}
    >
      {children}
    </InstitutionContext.Provider>
  );
}
