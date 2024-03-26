import Stripe from "stripe";

async function payment({
  stripe = new Stripe(process.env.SK_STRIPE),
  payment_method_types = ["card"],
  mode = "payment",
  success_url = process.env.SUCCESS_URL_STRIPE,
  cancel_url = process.env.CANCEL_URL_STRIPE,
  discounts = [],
  metadata = {},
  customer_email,
  line_items = [],
} = {}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types,
    mode,
    success_url,
    cancel_url,
    discounts,
    metadata,
    customer_email,
    line_items,
  });
  return session;
}

export default payment;

// {
//     price_data: {
//       currency : 'egp',
//       product_data: {
//           name,
//       },
//       unit_amount,
//     },
// },
