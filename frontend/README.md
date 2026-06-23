# BillBuddy Frontend

A Next.js frontend for BillBuddy — AI-powered receipt splitting with Splitwise integration.

## Prerequisites

- Node.js 18+
- npm or yarn
- BillBuddy backend running at `http://localhost:8000`

## Setup

```bash
# From the project root
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## Environment Variables

Copy `.env.local` (already included) or create it manually:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with ReceiptProvider
│   ├── globals.css         # Tailwind base styles
│   ├── page.tsx            # Upload page (/)
│   ├── review/
│   │   └── page.tsx        # Review parsed items (/review)
│   ├── assign/
│   │   └── page.tsx        # Assign splits (/assign)
│   └── success/
│       └── page.tsx        # Success page (/success)
├── components/
│   ├── ReceiptUpload.tsx   # Drag-and-drop file upload
│   ├── ItemsTable.tsx      # Editable items table
│   ├── SplitAssignment.tsx # Shared/individual item assignment
│   └── SuccessMessage.tsx  # Success confirmation
├── contexts/
│   └── ReceiptContext.tsx  # Global state for parsed receipt
├── lib/
│   ├── api.ts              # Axios API client
│   └── types.ts            # TypeScript interfaces
└── public/
```

## User Flow

1. **Upload** (`/`) — Drag-and-drop receipt images (JPG, PNG, HEIC). Supports up to 5 files.
2. **Review** (`/review`) — Edit parsed items: rename, reprice, delete, or add new items.
3. **Assign** (`/assign`) — Select Splitwise group, choose who paid, mark shared items, assign individual items.
4. **Success** (`/success`) — View the created expense ID and link to Splitwise.

## API Endpoints Used

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/receipts/upload` | Upload receipt images for parsing |
| GET | `/api/splitwise/groups` | List user's Splitwise groups |
| GET | `/api/splitwise/groups/{id}/members` | List group members |
| POST | `/api/splitwise/expense` | Create split expense |

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Axios** for API calls
- **react-dropzone** for file upload
