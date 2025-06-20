export default async function handler(req, res) {
  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: "Missing session_id" });
  }

  try {
    const stripeRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${session_id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data = await stripeRes.json();

    if (stripeRes.ok) {
      res.status(200).json(data);
    } else {
      res.status(500).json({ error: data.error });
    }
  } catch (err) {
    res.status(500).json({ error: 'Stripe request failed' });
  }
}
