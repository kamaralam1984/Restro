# UAE / Dubai Mode

For targeting UAE/Dubai restaurants:

## Backend

- **Currency**: Set `Restaurant.currency` to `AED` for AED pricing.
- **VAT**: Set `Restaurant.taxRate` to `5` for 5% VAT (UAE standard).
- **Region**: Set `Restaurant.region` to `AE` for region-specific logic or display.
- **Multi-branch**: Use `Restaurant.parentRestaurantId` to link branches to a parent restaurant.

Existing billing and order flows use `restaurant.currency` and `restaurant.taxRate`, so no code change is required beyond setting these fields (e.g. in Super Admin when creating/editing a restaurant, or in restaurant onboarding for UAE).

## Frontend (future)

- **Arabic toggle**: Add i18n (e.g. next-intl or next-i18next) and an Arabic locale; use `region === 'AE'` or a user preference to switch language.
- **AED display**: Format prices with `restaurant.currency` (already supported when backend returns AED).
