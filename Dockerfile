# Build PocketBase from source
FROM golang:1.22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache git
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o pocketbase .

# Runtime image
FROM alpine:3.20
WORKDIR /pb
COPY --from=builder /app/pocketbase /pb/pocketbase
# Copy migrations if they exist
COPY migrations /pb/pb_migrations
# Copy hooks if they exist
COPY pb_hooks /pb/pb_hooks
EXPOSE 8080
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080"]