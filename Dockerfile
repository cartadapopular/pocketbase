# ── Build PocketBase from source ──────────────────────────────
# go.mod requires Go 1.25, so the builder image must match.
FROM golang:1.25-alpine AS builder
WORKDIR /app
RUN apk add --no-cache git
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# The repo root is a library (package pocketbase). The runnable
# program is examples/base (package main) — build that.
# CGO_ENABLED=0: PocketBase uses pure-Go SQLite (modernc), no cgo needed.
RUN CGO_ENABLED=0 go build -o pocketbase ./examples/base

# ── Runtime image ─────────────────────────────────────────────
FROM alpine:3.20
WORKDIR /pb
# ca-certificates: needed for outbound TLS (e.g. sending verification mail).
RUN apk add --no-cache ca-certificates
COPY --from=builder /app/pocketbase /pb/pocketbase
# JS migrations (auto-applied on start) — creates the `waitlist` collection.
COPY pb_migrations /pb/pb_migrations
# JS hooks (e.g. the waitlist welcome email)
COPY pb_hooks /pb/pb_hooks
EXPOSE 8080
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080"]
