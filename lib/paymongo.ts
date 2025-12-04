// PayMongo API integration
const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY!
const PAYMONGO_PUBLIC_KEY = process.env.PAYMONGO_PUBLIC_KEY!
const PAYMONGO_API_URL = 'https://api.paymongo.com/v1'

export interface PayMongoPaymentMethod {
  id: string
  type: string
  attributes: {
    type: string
    details: {
      card_number?: string
      exp_month?: number
      exp_year?: number
      cvc?: string
    }
  }
}

export interface PayMongoPaymentIntent {
  id: string
  type: string
  attributes: {
    amount: number
    currency: string
    status: string
    payment_method_allowed: string[]
    payment_method_options: any
    metadata: any
  }
}

export interface PayMongoSubscription {
  id: string
  type: string
  attributes: {
    amount: number
    currency: string
    status: string
    billing: {
      interval: string
      interval_count: number
    }
    cancel_at_period_end: boolean
    current_period_end: number
    current_period_start: number
    customer_id: string
    items: any[]
    latest_invoice_id: string
    metadata: any
  }
}

// Create payment intent
export async function createPaymentIntent(amount: number, metadata: any = {}) {
  const response = await fetch(`${PAYMONGO_API_URL}/payment_intents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
    },
    body: JSON.stringify({
      data: {
        attributes: {
          amount: amount * 100, // Convert to cents
          payment_method_allowed: ['card'],
          currency: 'PHP',
          metadata,
        },
      },
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.errors?.[0]?.detail || 'Failed to create payment intent')
  }

  return response.json()
}

// Attach payment method to payment intent
export async function attachPaymentMethod(paymentIntentId: string, paymentMethodId: string) {
  const response = await fetch(`${PAYMONGO_API_URL}/payment_intents/${paymentIntentId}/attach`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
    },
    body: JSON.stringify({
      data: {
        attributes: {
          payment_method: paymentMethodId,
          return_url: process.env.NEXT_PUBLIC_APP_URL + '/dashboard?payment=success',
        },
      },
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.errors?.[0]?.detail || 'Failed to attach payment method')
  }

  return response.json()
}

// Create subscription
export async function createSubscription(customerId: string, amount: number, metadata: any = {}) {
  const response = await fetch(`${PAYMONGO_API_URL}/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
    },
    body: JSON.stringify({
      data: {
        attributes: {
          amount: amount * 100, // Convert to cents
          currency: 'PHP',
          billing: {
            interval: 'month',
            interval_count: 1,
          },
          customer: customerId,
          metadata,
        },
      },
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.errors?.[0]?.detail || 'Failed to create subscription')
  }

  return response.json()
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string) {
  const response = await fetch(`${PAYMONGO_API_URL}/subscriptions/${subscriptionId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.errors?.[0]?.detail || 'Failed to cancel subscription')
  }

  return response.json()
}

// Get subscription
export async function getSubscription(subscriptionId: string) {
  const response = await fetch(`${PAYMONGO_API_URL}/subscriptions/${subscriptionId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.errors?.[0]?.detail || 'Failed to get subscription')
  }

  return response.json()
}

