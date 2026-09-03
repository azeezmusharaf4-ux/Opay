import React from 'react';
import { 
  Smartphone, 
  Wifi, 
  Zap, 
  Tv, 
  Briefcase, 
  Gift, 
  CalendarCheck, 
  Grid 
} from 'lucide-react';

interface OPayServicesGridProps {
  onSelectService: (serviceName: string) => void;
}

export const OPayServicesGrid: React.FC<OPayServicesGridProps> = ({ onSelectService }) => {
  const services = [
    {
      id: 'airtime',
      name: 'Airtime',
      icon: Smartphone,
      badge: 'Up to 6%',
    },
    {
      id: 'data',
      name: 'Data',
      icon: Wifi,
    },
    {
      id: 'electricity',
      name: 'Electricity',
      icon: Zap,
    },
    {
      id: 'tv',
      name: 'TV',
      icon: Tv,
    },
    {
      id: 'safebox',
      name: 'Safebox',
      icon: Briefcase,
    },
    {
      id: 'refer',
      name: 'Refer & Earn',
      icon: Gift,
      badge: '₦6,300',
    },
    {
      id: 'checkin',
      name: 'Check-In',
      icon: CalendarCheck,
    },
    {
      id: 'more',
      name: 'More',
      icon: Grid,
    },
  ];

  return (
    <div id="opay-services-grid" className="rounded-2xl bg-[#1B1E24] p-3 border border-slate-800/80 shadow-sm">
      <div className="grid grid-cols-4 gap-y-3 gap-x-1">
        {services.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              id={`service-btn-${item.id}`}
              onClick={() => onSelectService(item.name)}
              className="relative flex flex-col items-center justify-center gap-1 py-0.5 group focus:outline-none"
            >
              {item.badge && (
                <span className="absolute -top-1 right-0.5 z-10 rounded-full bg-[#FF3B69] px-1 py-0.2 text-[7.5px] font-bold text-white shadow-sm whitespace-nowrap">
                  {item.badge}
                </span>
              )}
              {/* Circular dark disc icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#14161B] border border-slate-800/80 text-slate-200 group-hover:border-emerald-500/50 group-hover:text-[#00D589] group-active:scale-90 transition-all shadow-inner">
                <Icon className="h-4.5 w-4.5 stroke-[2]" />
              </div>
              <span className="text-[11px] font-medium text-slate-300 group-hover:text-white transition-colors">
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
