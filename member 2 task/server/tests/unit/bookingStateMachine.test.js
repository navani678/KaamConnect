import { transition, ALLOWED_TRANSITIONS } from '../../src/services/bookingStateMachine.js';
import { ApiError } from '../../src/utils/ApiError.js';

describe('Booking State Machine Unit Tests', () => {
  describe('Valid Transitions', () => {
    test('worker can accept a pending booking', () => {
      const nextStatus = transition('pending', 'accept', 'worker');
      expect(nextStatus).toBe('accepted');
    });

    test('worker can reject a pending booking', () => {
      const nextStatus = transition('pending', 'reject', 'worker');
      expect(nextStatus).toBe('rejected');
    });

    test('worker can counter a pending booking', () => {
      const nextStatus = transition('pending', 'counter', 'worker');
      expect(nextStatus).toBe('countered');
    });

    test('customer can cancel a pending booking', () => {
      const nextStatus = transition('pending', 'cancel', 'customer');
      expect(nextStatus).toBe('cancelled');
    });

    test('customer can confirm a countered booking', () => {
      const nextStatus = transition('countered', 'confirm', 'customer');
      expect(nextStatus).toBe('accepted');
    });

    test('customer can decline a countered booking', () => {
      const nextStatus = transition('countered', 'decline-counter', 'customer');
      expect(nextStatus).toBe('cancelled');
    });

    test('customer can cancel an accepted booking', () => {
      const nextStatus = transition('accepted', 'cancel', 'customer');
      expect(nextStatus).toBe('cancelled');
    });

    test('customer can mark an accepted booking as complete', () => {
      const nextStatus = transition('accepted', 'complete', 'customer');
      expect(nextStatus).toBe('completed');
    });
  });

  describe('Invalid Transitions & Role Violations', () => {
    test('customer cannot accept a pending booking', () => {
      expect(() => transition('pending', 'accept', 'customer')).toThrow(ApiError);
      try {
        transition('pending', 'accept', 'customer');
      } catch (err) {
        expect(err.statusCode).toBe(409);
        expect(err.code).toBe('INVALID_TRANSITION');
      }
    });

    test('worker cannot confirm a countered booking', () => {
      expect(() => transition('countered', 'confirm', 'worker')).toThrow(ApiError);
    });

    test('worker cannot mark booking as complete', () => {
      expect(() => transition('accepted', 'complete', 'worker')).toThrow(ApiError);
    });

    test('cannot complete a rejected booking', () => {
      expect(() => transition('rejected', 'complete', 'customer')).toThrow(ApiError);
    });

    test('cannot cancel a completed booking', () => {
      expect(() => transition('completed', 'cancel', 'customer')).toThrow(ApiError);
    });

    test('cannot accept a completed booking', () => {
      expect(() => transition('completed', 'accept', 'worker')).toThrow(ApiError);
    });
  });

  test('ALLOWED_TRANSITIONS table has expected count of transitions', () => {
    expect(ALLOWED_TRANSITIONS.length).toBe(8);
  });
});
