import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './PaymentForm.css';

export default function PaymentForm({ fare, onSuccess, onBack }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {},
      redirect: 'if_required',
    });

    if (stripeError) {
      setError(stripeError.message);
      setLoading(false);
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <div className="payment-form-wrapper">
      <div className="payment-summary">
        <span className="payment-summary-label">Total due</span>
        <span className="payment-summary-amount">${fare.toFixed(2)}</span>
      </div>

      <form onSubmit={handleSubmit} className="payment-form">
        <PaymentElement />

        {error && <div className="payment-error">{error}</div>}

        <div className="payment-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onBack}
            disabled={loading}
          >
            ← Back
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={!stripe || loading}
          >
            {loading ? 'Processing...' : `Pay $${fare.toFixed(2)}`}
          </button>
        </div>
      </form>
    </div>
  );
}
