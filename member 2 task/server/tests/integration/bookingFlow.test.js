import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import { transition } from '../../src/services/bookingStateMachine.js';

describe('Booking State Machine Lifecycle Integration Test', () => {
  test('Simulates complete customer and worker negotiation and completion lifecycle', () => {
    // 1. Customer creates booking -> initial status is pending
    let status = 'pending';
    let currentPrice = 2000;
    const negotiationHistory = [
      { by: 'customer', price: currentPrice, message: 'Initial offer' }
    ];

    // 2. Worker counters with a new price
    status = transition(status, 'counter', 'worker');
    expect(status).toBe('countered');
    currentPrice = 2400;
    negotiationHistory.push({
      by: 'worker',
      price: currentPrice,
      message: 'Includes parts'
    });

    // 3. Customer confirms counter offer
    status = transition(status, 'confirm', 'customer');
    expect(status).toBe('accepted');
    const finalPrice = negotiationHistory[negotiationHistory.length - 1].price;
    expect(finalPrice).toBe(2400);

    // 4. Customer completes the job
    status = transition(status, 'complete', 'customer');
    expect(status).toBe('completed');
  });

  test('Simulates rejection lifecycle', () => {
    let status = 'pending';
    status = transition(status, 'reject', 'worker');
    expect(status).toBe('rejected');
  });

  test('Simulates customer cancellation from pending', () => {
    let status = 'pending';
    status = transition(status, 'cancel', 'customer');
    expect(status).toBe('cancelled');
  });

  test('Simulates customer declining counter offer', () => {
    let status = 'pending';
    status = transition(status, 'counter', 'worker');
    expect(status).toBe('countered');
    status = transition(status, 'decline-counter', 'customer');
    expect(status).toBe('cancelled');
  });
});
