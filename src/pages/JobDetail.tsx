import React from 'react';
import { useParams } from 'react-router-dom';

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Job Detail Page
        </h1>
        <p className="text-gray-600 mb-4">
          Job details for ID: {id}
        </p>
        <p className="text-gray-600">
          Detailed job view and application functionality coming soon...
        </p>
      </div>
    </div>
  );
};

export default JobDetail;
