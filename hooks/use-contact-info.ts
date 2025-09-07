import { useState, useEffect } from 'react';

interface ContactInfo {
  id?: string;
  primaryPhone: string;
  secondaryPhone?: string;
  email: string;
  address: string;
  supportHours: string;
  updatedAt?: string;
}

export function useContactInfo() {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/contact-info');
        if (!response.ok) {
          throw new Error('Failed to fetch contact information');
        }
        
        const data = await response.json();
        setContactInfo(data.contactInfo);
      } catch (err) {
        console.error('Error fetching contact info:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch contact information');
        
        // Fallback to default values
        setContactInfo({
          primaryPhone: '+233 XX XXX XXXX',
          email: 'info@alpharescue.com',
          address: 'Accra, Ghana',
          supportHours: 'Mon-Fri, 8AM-6PM',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  return { contactInfo, isLoading, error };
}
