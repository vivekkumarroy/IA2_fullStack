import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#e8f0ed] text-[#286050] shadow-inner">
        <FileQuestion className="h-10 w-10" />
      </div>
      <h1 className="font-serif text-5xl font-bold tracking-tight text-[#1d2c34]">404</h1>
      <h2 className="mt-2 text-xl font-semibold text-[#4f5c61]">Page not found</h2>
      <p className="mt-2 max-w-sm text-sm text-[#74807f]">
        The catalog route or page you are looking for does not exist or has been moved.
      </p>
      <div className="mt-6">
        <Link to="/">
          <Button variant="primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Catalog
          </Button>
        </Link>
      </div>
    </div>
  );
};
