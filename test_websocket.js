#!/usr/bin/env node

// Test WebSocket connection to Supabase realtime
import WebSocket from 'ws';

const SUPABASE_URL = 'wss://sshguczouozvsdwzfcbx.supabase.co/realtime/v1/websocket';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaGd1Y3pvdW96dnNkd3pmY2J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Nzk2ODEsImV4cCI6MjA3OTA1NTY4MX0.ooh5NGBqv6U0MLcwvURzcf-DVx_qvpYobdjy-ukpKbw';

const wsUrl = `${SUPABASE_URL}?apikey=${API_KEY}&eventsPerSecond=10&vsn=1.0.0`;

console.log('🔌 Testing WebSocket connection to Supabase realtime...');
console.log('URL:', wsUrl);

const ws = new WebSocket(wsUrl);

ws.on('open', () => {
  console.log('✅ WebSocket connection established successfully!');
  
  // Send a join message to subscribe to a channel
  const joinMessage = {
    topic: 'realtime:public',
    event: 'phx_join',
    payload: {},
    ref: '1'
  };
  
  ws.send(JSON.stringify(joinMessage));
  console.log('📤 Sent join message:', joinMessage);
});

ws.on('message', (data) => {
  console.log('📨 Received message:', data.toString());
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error.message);
  console.error('Error details:', error);
});

ws.on('close', (code, reason) => {
  console.log('🔌 WebSocket connection closed:', code, reason.toString());
});

// Set timeout to close connection after 10 seconds
setTimeout(() => {
  console.log('⏰ Timeout reached, closing connection');
  ws.close();
}, 10000);