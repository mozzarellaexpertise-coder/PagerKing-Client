import { writable } from 'svelte/store';

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string | null;
  text: string;
  created_at: string;
};

export const messages = writable<Message[]>([]);