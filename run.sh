#!/bin/bash

echo "🚀 Starting CSA backend on http://localhost:8000"
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &

echo "🌐 Starting CSA frontend on http://localhost:3000"
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 3000
