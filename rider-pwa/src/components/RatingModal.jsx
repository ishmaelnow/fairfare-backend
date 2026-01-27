import { useState } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import './RatingModal.css';

export function RatingModal({ onSubmit, onSkip, title, subtitle }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(rating, comment);
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingLabel = (rating) => {
    if (rating === 1) return 'Poor';
    if (rating === 2) return 'Fair';
    if (rating === 3) return 'Good';
    if (rating === 4) return 'Very Good';
    if (rating === 5) return 'Excellent';
    return '';
  };

  return (
    <div className="rating-modal-overlay">
      <Card className="rating-modal">
        <h3 className="rating-modal-title">{title}</h3>
        {subtitle && <p className="rating-modal-subtitle">{subtitle}</p>}

        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="rating-star-btn"
            >
              <span className={`rating-star ${star <= (hoveredRating || rating) ? 'rating-star-filled' : 'rating-star-empty'}`}>
                ★
              </span>
            </button>
          ))}
        </div>

        {rating > 0 && (
          <div className="rating-label">
            {getRatingLabel(rating)}
          </div>
        )}

        <div className="rating-comment-section">
          <label className="rating-comment-label">
            Comments (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            className="rating-comment-input"
            rows={3}
          />
        </div>

        <div className="rating-actions">
          <Button
            onClick={onSkip}
            variant="secondary"
            fullWidth
            disabled={submitting}
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            variant="primary"
            fullWidth
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </div>
      </Card>
    </div>
  );
}


