import React from 'react';

interface StarRatingProps {
  rating: number; // 1~5
  onChange?: (rating: number) => void;
  size?: number;
  readOnly?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onChange, size = 24, readOnly = false }) => {
  const stars = [1, 2, 3, 4, 5];

  const handleClick = (star: number) => {
    if (readOnly) return;
    if (onChange) onChange(star);
  };

  return (
    <div style={{ display: 'inline-flex', cursor: readOnly ? 'default' : 'pointer' }}>
      {stars.map((star) => (
        <svg
          key={star}
          onClick={() => handleClick(star)}
          xmlns="http://www.w3.org/2000/svg"
          fill={star <= rating ? '#ffc107' : '#e4e5e9'}
          viewBox="0 0 24 24"
          stroke="#ffc107"
          strokeWidth="1"
          width={size}
          height={size}
          style={{ marginRight: 4 }}
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  );
};

export default StarRating;
