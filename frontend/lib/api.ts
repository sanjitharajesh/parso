import axios from 'axios';
import { ExpenseRequest, ExpenseResponse, ParsedReceipt, SplitwiseGroup, SplitwiseMember } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const uploadReceipt = async (files: File[]): Promise<ParsedReceipt> => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));

  const response = await api.post('/api/receipts/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getGroups = async (): Promise<SplitwiseGroup[]> => {
  const response = await api.get('/api/splitwise/groups');
  return response.data;
};

export const getMembers = async (groupId: number): Promise<SplitwiseMember[]> => {
  const response = await api.get(`/api/splitwise/groups/${groupId}/members`);
  return response.data;
};

export const createExpense = async (data: ExpenseRequest): Promise<ExpenseResponse> => {
  const response = await api.post('/api/splitwise/expense', data);
  return response.data;
};
