## Stripe Integration Checklist

### Objects to map
- Product ↔ billing.products (+ provider_links)
- Price ↔ billing.prices (+ provider_links)
- Customer ↔ billing.customers (+ provider_links)
- Subscription ↔ billing.subscriptions (+ provider_links)
- PaymentIntent/Charge ↔ billing.payments (+ provider_links)

### Webhooks (subscribe and handle)
- customer.created / updated (optional)
- product.created / updated
- price.created / updated
- checkout.session.completed (create subscription/payment)
- customer.subscription.created / updated / deleted
- invoice.paid / payment_intent.succeeded
- invoice.payment_failed / payment_intent.payment_failed

### Signature verification
- Use Stripe-Signature header and endpoint secret per environment.
- Reject if timestamp skewed or signature mismatch. Log minimal metadata, no card data.

### Sync flow
1) On webhook, upsert product/price to billing.*; store mapping in billing.provider_links.
2) On checkout.session.completed / subscription events:
   - Upsert billing.customers for user_id, link external customer id.
   - Upsert billing.subscriptions: status, current_period_end, cancel flags.
3) On invoice/payment events: insert billing.payments with status.
4) Emit ops.outbox events if you need to notify app or analytics.

### Entitlements
- Frontend queries public.get_my_entitlements(); gate features by product_key and is_active.

### Retries and idempotency
- Webhooks are retried by Stripe; make handlers idempotent via external_id uniqueness in provider_links.
- For server-initiated actions, pass Idempotency-Key header.

### Testing
- Use Stripe CLI to forward webhooks.
- Seed products/prices in test mode first. Verify subscription status changes reflect in user_entitlements.

### Security
- Store secrets in Edge Function env, never in client. Use service_role for admin RPCs only.
- Audit logs contain no PII or card data.





