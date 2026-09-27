# UI and display fixes

This update includes:

- Shared safe date/time formatting for ISO dates and MySQL date/time values.
- A shared poster URL resolver for local `/uploads/...` paths and absolute image URLs.
- Poster images use compact landscape 16:9 frames and `object-fit: contain` to avoid cropping.
- Movie-details, seat-selection, and payment pages use the selected movie poster as a blurred backdrop with translucent glass panels.
- Numeric-only seat labels are split into rows of four; labeled seats such as A1/A2 remain grouped by row letter.
- Admin movie action is labeled **Delete**. The existing backend behavior is a soft delete (sets the movie inactive), preserving booking history and avoiding foreign-key breakage.
- The admin movie form already supports selecting an image file; its preview is retained and uses the same poster URL helper.

## Environment

The archive intentionally excludes the local `backend/.env` because it may contain database credentials and secrets. Use `backend/.env.example` to recreate your local environment file, then fill in your own values.

## Run locally

1. In `backend`, install dependencies and configure `.env`, then start the API using the project's existing start script.
2. In `frontend`, install dependencies and run `npm run dev`.


## Customer ticket cancellation

- Customers can cancel their own confirmed bookings from **My Bookings** before the show starts.
- Cancellation is authenticated and restricted to the booking owner; the backend changes the booking status to `cancelled`.
- Cancelled bookings no longer hold seats because seat availability checks only consider `pending` and `confirmed` bookings.
- The app uses demo payments; cancellation does not initiate an actual payment-provider refund.

## Duplicate-seat and booking consistency fix

- Seat availability now returns one active seat per normalized seat label (case/whitespace-insensitive), even if older database data contains duplicate seat rows.
- If any legacy duplicate seat label is actively booked for a show, the single displayed seat is marked booked.
- Booking creation checks booking status across all legacy rows sharing the selected seat label and locks the show row during booking to reduce simultaneous duplicate bookings.
- Seat selection and checkout defensively de-duplicate seat labels/IDs so the same label is not repeated in the selection or payment summary.
- Admin seat creation/editing trims and uppercases seat labels and rejects a duplicate label on the same screen.
- Existing booking history is preserved; this update does not delete legacy duplicate rows or booking records.
