FROM golang:1.20-alpine

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY cmd ./cmd
WORKDIR ./cmd/api

RUN go build -o /api

CMD ["/api"]
