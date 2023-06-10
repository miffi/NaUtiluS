set dotenv-load

serve:
  cd backend/cmd/api; go run . -localCORS

deploy:
  gcloud run deploy nautilus-backend --source backend/cmd/api

