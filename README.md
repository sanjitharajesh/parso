# BillBuddy

AI-powered receipt splitting application that automates Splitwise expense creation using computer vision and GPT parsing.

## 🎯 Overview

BillBuddy streamlines bill splitting by automatically extracting items and prices from receipt photos, calculating splits, and creating Splitwise expenses - reducing manual entry time from 5+ minutes to under 30 seconds.

## ✨ Features

- **Multi-Image Receipt Processing**: Upload 1-5 images per receipt, perfect for long receipts
- **HEIC Support**: Automatically converts iPhone photos to JPEG
- **Intelligent OCR**: Extracts text using Azure Computer Vision
- **Smart Parsing**: GPT-4.1-mini structures receipt data with 85% accuracy
- **Flexible Splitting**: 
  - Shared items split equally among all participants
  - Individual item assignments
  - Partial splits between specific people
- **Splitwise Integration**: Direct API integration for automated expense creation
- **Production Ready**: Comprehensive logging, monitoring, and health checks

## 🛠️ Tech Stack

**Backend:**
- FastAPI (Python)
- Azure OpenAI (GPT-4.1-mini)
- Azure Computer Vision
- Splitwise REST API
- pytest (testing)

**Frontend:** *(In Progress)*
- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
