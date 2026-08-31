import { useState, type ReactNode } from 'react';
import { ConsultationContext } from './ConsultationContextDef';

export function ConsultationProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('HR Advisory & Consulting');

  const openConsultation = (service?: string) => {
    if (service) {
      setSelectedService(service);
    }
    setIsOpen(true);
  };

  const closeConsultation = () => {
    setIsOpen(false);
  };

  return (
    <ConsultationContext.Provider
      value={{
        isOpen,
        selectedService,
        openConsultation,
        closeConsultation,
      }}
    >
      {children}
    </ConsultationContext.Provider>
  );
}
