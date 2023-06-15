set dotenv-load

serve:
  cd backend/cmd/api; go run . -localCORS

deploy:
  gcloud run deploy nautilus-backend --source backend/cmd/api

debug-backend:
  cd backend/cmd/api; dlv debug -- -localCORS

update:
  cd backend/cmd/courseSync; go run .
