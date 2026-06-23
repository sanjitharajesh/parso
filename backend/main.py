import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import receipts, splits, splitwise_router

app = FastAPI(title="BillBuddy API", version="1.0.0")

_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
allowed_origins = [o.strip() for o in _origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(receipts.router, prefix="/api/receipts", tags=["receipts"])
app.include_router(splits.router, prefix="/api/splits", tags=["splits"])
app.include_router(splitwise_router.router, prefix="/api/splitwise", tags=["splitwise"])

@app.get("/")
def root():
    return {"message": "BillBuddy API", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy"}