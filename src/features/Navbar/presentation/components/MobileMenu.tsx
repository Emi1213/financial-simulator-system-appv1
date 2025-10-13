'use client';

import Link from 'next/link';
import { MenuItem } from '../../types';

interface MobileMenuProps {
  isOpen: boolean;
  menuItems: MenuItem[];
  activeSubmenu: string | null;
  onToggleSubmenu: (label: string) => void;
  onClose: () => void;
}

export function MobileMenu({
  isOpen,
  menuItems,
  activeSubmenu,
  onToggleSubmenu,
  onClose,
}: MobileMenuProps) {
  return (
    <>
      {/* Overlay con animación de fade */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Menu con animación de slide desde la derecha */}
      <div
        className={`fixed top-0 right-0 w-80 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 z-50 shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out border-l border-slate-700 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <h2 className="text-xl font-bold text-white">Navegación</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white w-8 h-8 rounded-lg hover:bg-slate-700/50 flex items-center justify-center transition-all duration-200"
            aria-label="Cerrar menú"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <div key={item.label} className="mb-1">
              {item.subItems ? (
                <div>
                  <button
                    onClick={() => onToggleSubmenu(item.label)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-700/50 rounded-xl transition-all duration-200 group"
                  >
                    <span className="font-medium text-slate-200 group-hover:text-white">{item.label}</span>
                    <svg
                      className={`w-5 h-5 text-slate-400 group-hover:text-white transform transition-all duration-200 ${
                        activeSubmenu === item.label ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Submenu con animación mejorada */}
                  <div
                    className={`ml-2 space-y-1 overflow-hidden transition-all duration-300 ${
                      activeSubmenu === item.label
                        ? 'max-h-96 mt-2 opacity-100'
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    {item.subItems?.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        onClick={onClose}
                        className="flex flex-col p-3 ml-4 text-sm border-l-2 border-slate-700 hover:border-blue-500 hover:bg-slate-700/30 rounded-r-lg transition-all duration-200 group"
                      >
                        <span className="text-slate-300 group-hover:text-white font-medium">
                          {subItem.label}
                        </span>
                        {subItem.description && (
                          <span className="text-slate-500 text-xs mt-1 group-hover:text-slate-400">
                            {subItem.description}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  href={item.href || '#'}
                  onClick={onClose}
                  className="flex items-center p-4 text-slate-200 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200 group"
                >
                  <span className="font-medium">{item.label}</span>
                  <svg
                    className="w-4 h-4 ml-auto text-slate-400 group-hover:text-white transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-900/50">
          <p className="text-slate-400 text-xs text-center">
            Sistema Financiero v2.0
          </p>
        </div>
      </div>
    </>
  );
}
