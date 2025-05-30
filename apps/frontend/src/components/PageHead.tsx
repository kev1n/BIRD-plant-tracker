import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface PageHeadProps {
  title: string;
  description?: string;
}

export default function PageHead({ title, description }: PageHeadProps) {
  const fullTitle = `${title} | BIRD Plant Tracker`;
  
  useEffect(() => {
    // Force update the document title when component mounts or title changes
    document.title = fullTitle;
  }, [fullTitle]);
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
    </Helmet>
  );
} 