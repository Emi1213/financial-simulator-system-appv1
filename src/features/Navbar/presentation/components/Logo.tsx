import Link from 'next/link';
import { useInstitution } from '@/features/institution/hooks/useInstitution';

export function Logo() {
  const { config } = useInstitution();
  
  return (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="relative">
        <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300 group-hover:scale-105">
          {config.logo ? (
            <img
              src={config.logo}
              alt={config.institutionName}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <span className="text-white font-bold text-xl">
              {config.institutionName.charAt(0)}
            </span>
          )}
        </div>
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
      </div>
      <div className="flex flex-col">
        <span className="text-white font-bold text-xl tracking-tight hidden sm:block group-hover:text-blue-300 transition-colors duration-300">
          {config.institutionName}
        </span>
        <span className="text-slate-400 text-xs hidden lg:block">
          Sistema Financiero
        </span>
      </div>
    </Link>
  );
}
