# Checkout and order management plan

The expanded studio is implemented. Checkout and shared order management are not yet implemented. GitHub Pages only hosts the frontend; deploy a separate backend before taking payments. Do not put payment secrets or customer records in this repository.

## Proposed flow

1. Customer completes a design, selects a real garment size and quantity, and approves a production proof. Current figure poses are illustrations, not size or fit predictions. Production artwork needs printable dimensions, placement in millimetres, approved fonts converted to paths, and a maker-reviewed proof.
2. POST /api/designs validates the design and uploaded SVG again on the server, creates an immutable version, and stores a preview and sanitized artwork in private object storage. The browser sanitizer alone is not sufficient for server uploads. Use file-size/complexity limits, upload quotas and authenticated ownership checks.
3. POST /api/checkout accepts designVersionId, garment variant, size and quantity, plus an idempotency key. The server validates stock and calculates an integer amount in paise from the product catalogue, customization charges, shipping and taxes. Never accept the browser's displayed estimate as the payable price. Save an order with payment status pending and reserve stock with an expiry.
4. The server creates a Razorpay order or Stripe Checkout Session linked to the internal order ID. Send only the public checkout fields to the browser. Keep SVG contents, customer addresses and secrets out of payment metadata.
5. Customer pays through the provider's checkout. Verify payment callbacks on the server and process signed webhooks. Match order ID, amount, currency and successful capture/payment status before marking paid. A browser success screen does not prove payment.
6. Record provider event IDs uniquely; process retries idempotently and handle out-of-order events. In one database transaction, update payment status and enqueue the fulfilment job once. Reconcile pending orders against the provider if callbacks are missed. Handle delayed success, failed payment, cancelled checkout and expired stock reservations.
7. A protected maker dashboard shows paid orders, approved artwork and production details. Track fulfilment independently: proof_pending -> approved -> making -> quality_check -> shipped -> delivered. Restrict transitions and record who changed each status. Store tracking data and notify the customer after committed changes.

## Suggested data model

- products / variants: catalogue prices, sizes, availability and stock.
- designs / design_versions: customer owner, schema version, garment choices, sanitized asset key/hash, text, font identifier, coordinates, preview, production measurements and proof approval.
- orders / order_items: immutable design version, size, quantity, price breakdown, currency, shipping address, payment state and fulfilment state.
- payment_attempts / payment_events: provider order/session ID, payment ID, unique event ID, amounts and verified result. Keep refunds separate from fulfilment status.
- order_events: timestamp, actor, previous and new state, reason and tracking reference.

Use customer-scoped access for order history and role-based access for the maker/admin dashboard. Private storage downloads should use short-lived signed URLs. Never store card numbers or security codes. Use a server-generated proof to ensure artwork and font rendering match production.

## Provider choice and rollout

Razorpay Standard Checkout is a natural option to evaluate for the current INR-based store; Stripe Checkout is an alternative if the business is eligible. Start in test mode with a merchant account and backend deployment. Confirm supported payment methods and business onboarding with the chosen provider before implementing live checkout.

First milestone: test-mode checkout, immutable design records, verified webhooks and a small authenticated order list. Second: maker approvals, shipment tracking, cancellation/refund handling and customer notifications. Live launch follows stock, pricing, shipping and production approval.

Acceptance tests: tampered prices rejected; invalid artwork rejected server-side; duplicate checkout requests create one logical order; wrong webhook signature rejected; replayed events do not duplicate fulfilment; delayed payments reconcile; customers cannot read another customer's order; failed payments cannot enter production; changing a saved design cannot alter an already-paid order.

## Official references

- https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/
- https://docs.stripe.com/payments/checkout
- https://docs.stripe.com/checkout/fulfillment
