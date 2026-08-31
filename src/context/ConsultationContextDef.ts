import { createContext } from 'react';

export interface ConsultationContextType {
  isOpen: boolean;
  selectedService: string;
  openConsultation: (service?: string) => void;
  closeConsultation: () => void;
}

export const ConsultationContext = createContext<ConsultationContextType | undefined>(undefined);
