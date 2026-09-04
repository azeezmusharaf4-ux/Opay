import React from 'react';

interface OPayServicesGridProps {
  onSelectService: (serviceName: string) => void;
}

export const OPayServicesGrid: React.FC<OPayServicesGridProps> = ({ onSelectService }) => {
  const services = [
    {
      id: 'airtime',
      name: 'Airtime',
      renderIcon: () => (
        <svg className="h-5 w-5 fill-white" viewBox="0 0 24 24">
          <path d="M16 2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-3 18h-2v-1h2v1zm3-3H8V5h8v12zm-6-2h1.5v1.5H10V15zm2-3h1.5v4.5H12V12zm2-2.5h1.5v7H14v-7z" />
        </svg>
      ),
    },
    {
      id: 'data',
      name: 'Data',
      renderIcon: () => (
        <svg className="h-5 w-5 fill-white" viewBox="0 0 24 24">
          <path d="M16 2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-5.5 13.5v-5h1.2v5h1.8l-2.4 3-2.4-3h1.8zm3.5-3v-5h1.8l-2.4-3-2.4 3h1.8v5h1.2z" />
        </svg>
      ),
    },
    {
      id: 'electricity',
      name: 'Electricity',
      renderIcon: () => (
        <svg className="h-5 w-5 fill-white" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm-1 18h2v1a1 1 0 0 1-1 1h0a1 1 0 0 1-1-1v-1zm1.5-13.5l-2.5 4h2l-1 3.5 3-4.5h-2.5l1-3z" />
        </svg>
      ),
    },
    {
      id: 'tv',
      name: 'TV',
      renderIcon: () => (
        <svg className="h-5 w-5 fill-white" viewBox="0 0 24 24">
          <path d="M21 6h-7.586l2.293-2.293-1.414-1.414L11.586 5H8.707L5.999 2.293 4.585 3.707 6.878 6H3a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-11 9.5v-6l5 3-5 3z" />
        </svg>
      ),
    },
    {
      id: 'safebox',
      name: 'Safebox',
      renderIcon: () => (
        <svg className="h-5 w-5 fill-white" viewBox="0 0 24 24">
          <path d="M19 6h-3V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-9-2h4v2h-4V4zm2 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm4-2H8v-1h8v1z" />
        </svg>
      ),
    },
    {
      id: 'refer',
      name: 'Refer & Earn',
      renderIcon: () => (
        <svg className="h-5 w-5 fill-white" viewBox="0 0 24 24">
          <path d="M16 8.5a1.5 1.5 0 0 0-1.4-1H14V5a2 2 0 0 0-4 0v2.5H9.4A1.5 1.5 0 0 0 8 8.5C5.8 12.2 4 15.5 4 19a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3c0-3.5-1.8-6.8-4-10.5zm-3 8.5h-2v1.5H9.5V17H8v-1.5h1.5v-3H8V11h1.5V9.5H11V11h2v-1.5h1.5V11H16v1.5h-1.5v3H16V17h-1.5v1.5H13V17zm0-1.5v-3h-2v3h2z"/>
        </svg>
      ),
    },
    {
      id: 'checkin',
      name: 'Check-In',
      renderIcon: () => (
        <svg className="h-5 w-5 fill-white" viewBox="0 0 24 24">
          <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V9h14v11zm-8-3l-2.5-2.5 1.41-1.41L11 14.17l4.59-4.59 1.41 1.41L11 17z" />
        </svg>
      ),
    },
    {
      id: 'more',
      name: 'More',
      renderIcon: () => (
        <svg className="h-5 w-5 fill-white" viewBox="0 0 24 24">
          <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 13.73l-7-3.82v4.54c0 2.22 3.13 4.05 7 4.05s7-1.83 7-4.05v-4.54l-7 3.82z" />
        </svg>
      ),
    },
  ];

  return (
    <div id="opay-services-grid" className="rounded-2xl bg-[#1E1F24] p-3 border border-slate-800/60 shadow-sm">
      <div className="grid grid-cols-4 gap-y-3.5 gap-x-1">
        {services.map((item) => {
          return (
            <button
              key={item.id}
              id={`service-btn-${item.id}`}
              onClick={() => onSelectService(item.name)}
              className="relative flex flex-col items-center justify-center gap-1.5 py-0.5 group focus:outline-none cursor-pointer"
            >
              {/* Circular dark #2A2B31 disc container with solid filled white icon */}
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2A2B31] text-white shadow group-hover:scale-105 group-active:scale-95 transition-transform">
                {item.renderIcon()}
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
