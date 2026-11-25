import React from 'react';
import { Link } from 'react-router-dom';

export default function ServiceCard({ service }) {
  const isSpeciality = service.category === 'Special Services' || service.category === 'Speciality Care' || service.isSpecialService;

  return (
    <Link 
      to={`/services/${service.id}`}
      className={`category-service-card compact-service-card service-card ${isSpeciality ? 'special-service-card is-speciality' : ''}`}
      title={`Open details for ${service.name}`}
    >
      {isSpeciality && (
        <div className="special-service-box-tag">
          <span>Special Service</span>
        </div>
      )}
      
      <div className={`category-card-img-wrap compact-img-wrap ${isSpeciality ? 'special-img-wrap' : ''}`}>
        <img 
          src={service.image} 
          alt={service.name} 
          className="category-card-img compact-img"
          loading="lazy"
        />
      </div>

      <div className="category-card-body compact-body">
        <h3 className="category-card-title compact-title">{service.name}</h3>
      </div>
    </Link>
  );
}
