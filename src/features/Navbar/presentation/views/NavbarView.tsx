// src/features/Navbar/presentation/views/NavbarView.tsx
'use client';

import { useMemo } from 'react';
import { useNavbar } from '../../hooks/useNavbar';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { MenuItem } from '../../types';
import { Logo } from '../components/Logo';
import { MenuButton } from '../components/MenuButton';
import { MobileMenu } from '../components/MobileMenu';
import { AuthButtons } from '../components/AuthButtons';

export function NavbarView() {
  const { isMenuOpen, activeSubmenu, toggleMenu, closeMenu, toggleSubmenu } = useNavbar();
  const { isAuthenticated, user, logout } = useAuth();

  // Generar menú dinámicamente según el rol del usuario
  const menuItems: MenuItem[] = useMemo(() => {
    // Menú para administradores
    if (isAuthenticated && user?.role === 'admin') {
      return [
        {
          label: 'Dashboard',
          href: '/admin',
          description: 'Panel principal de administración',
        },
        {
          label: 'Configuración',
          subItems: [
            {
              label: 'Información de la Institución',
              href: '/admin/config/institution',
              description: 'Configurar datos de la institución financiera',
            },
            {
              label: 'Gestión de Créditos',
              href: '/admin/config/loan-types',
              description: 'Agregar y gestionar tipos de crédito',
            },
              {
              label: 'Cobros Indirectos',
              href: '/admin/config/indirects',
              description: 'Agregar y gestionar tipos de crédito',
            },
          ],
        },
        {
          label: 'Créditos',
          subItems: [
            {
              label: 'Simulador de Créditos',
              href: '/loans',
              description: 'Simulador de créditos para administración',
            },
          ],
        },
        {
          label: 'Inversiones',
          subItems: [
            {
              label: 'Configurar Inversiones',
              href: '/admin/investments',
              description: 'Gestionar productos de inversión',
            },
            {
              label: 'Solicitudes de Inversión',
              href: '/admin/request-investments',
              description: 'Revisar y gestionar solicitudes de inversión',
            },
          ],
        },
        {
          label: 'Usuarios',
          href: '/admin/users',
          description: 'Gestión de usuarios del sistema',
        },
      ];
    }

    // Menú para clientes autenticados
    if (isAuthenticated && user?.role === 'client') {
      return [
        {
          label: 'Dashboard',
          href: '/client/dashboard',
          description: 'Mi panel principal',
        },
        {
          label: 'Créditos',
          subItems: [
            {
              label: 'Simulador de Créditos',
              href: '/loans',
              description: 'Calcula tu tabla de amortización',
            },
          ],
        },
        {
          label: 'Inversiones',
          subItems: [
            {
              label: 'Simulador de Inversiones',
              href: '/investments',
              description: 'Planifica tu inversión',
            },
            {
              label: 'Mis Inversiones',
              href: '/client/investments/my-investments',
              description: 'Ver mis inversiones activas',
            },
          ],
        },
        {
          label: 'Mi Perfil',
          href: '/client/profile',
          description: 'Gestionar mi información personal',
        },
      ];
    }

    // Menú para usuarios no autenticados (público)
    return [
      {
        label: 'Créditos',
        subItems: [
            {
              label: 'Simulador de Créditos',
              href: '/loans',
              description: 'Calcula tu tabla de amortización',
            },
          ],
      },
      {
        label: 'Inversiones',
        subItems: [
          {
            label: 'Simulador de Inversiones',
            href: '/investments',
            description: 'Planifica tu inversión',
          },
        ],
      },
    ];
  }, [isAuthenticated, user?.role]);

  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 sticky top-0 z-30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Logo /> 
          </div>

          {/* Center: Desktop Navigation Menu */}
          <nav className="hidden lg:flex items-center space-x-1">
            {menuItems.map((item, index) => (
              <div key={index} className="relative group">
                {item.subItems ? (
                  <div className="relative">
                    <button
                      className="flex items-center px-4 py-2 text-slate-300 hover:text-white transition-colors duration-200 font-medium group"
                      onClick={() => toggleSubmenu(item.label)}
                    >
                      {item.label}
                      <svg 
                        className="ml-1 w-4 h-4 transform group-hover:rotate-180 transition-transform duration-200" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Dropdown Menu */}
                    {activeSubmenu === item.label && (
                      <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
                        <div className="p-2">
                          {item.subItems.map((subItem, subIndex) => (
                            <a
                              key={subIndex}
                              href={subItem.href}
                              className="flex flex-col p-3 rounded-lg hover:bg-slate-50 transition-colors duration-150 group"
                              onClick={closeMenu}
                            >
                              <span className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                                {subItem.label}
                              </span>
                              {subItem.description && (
                                <span className="text-sm text-slate-600 mt-1">
                                  {subItem.description}
                                </span>
                              )}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <a
                    href={item.href}
                    className="flex items-center px-4 py-2 text-slate-300 hover:text-white transition-colors duration-200 font-medium"
                  >
                    {item.label}
                  </a>
                )}
              </div>
            ))}
          </nav>

          {/* Right: Auth Buttons + Mobile Menu Button */}
          <div className="flex items-center gap-4">
            {/* Auth Buttons */}
            <AuthButtons
              isAuthenticated={isAuthenticated}
              userName={user?.name}
              userRole={user?.role} 
              onLogout={logout}
            />
            
            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <MenuButton isOpen={isMenuOpen} onClick={toggleMenu} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMenuOpen}
        menuItems={menuItems}
        activeSubmenu={activeSubmenu}
        onToggleSubmenu={toggleSubmenu}
        onClose={closeMenu}
      />
    </header>
  );
}
