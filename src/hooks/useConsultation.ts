import { useContext } from 'react';
import { ConsultationContext } from '../context/ConsultationContextDef';

export function useConsultation() {
  const context = useContext(ConsultationContext);
  if (!context) {
    throw new Error('useConsultation must be used within a ConsultationProvider');
  }
  return context;
}
