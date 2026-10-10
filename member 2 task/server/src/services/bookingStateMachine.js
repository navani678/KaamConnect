import { ApiError } from '../utils/ApiError.js';

export const ALLOWED_TRANSITIONS = [
  {
    from: 'pending',
    action: 'accept',
    actorRole: 'worker',
    to: 'accepted'
  },
  {
    from: 'pending',
    action: 'reject',
    actorRole: 'worker',
    to: 'rejected'
  },
  {
    from: 'pending',
    action: 'counter',
    actorRole: 'worker',
    to: 'countered'
  },
  {
    from: 'pending',
    action: 'cancel',
    actorRole: 'customer',
    to: 'cancelled'
  },
  {
    from: 'countered',
    action: 'confirm',
    actorRole: 'customer',
    to: 'accepted'
  },
  {
    from: 'countered',
    action: 'decline-counter',
    actorRole: 'customer',
    to: 'cancelled'
  },
  {
    from: 'accepted',
    action: 'cancel',
    actorRole: 'customer',
    to: 'cancelled'
  },
  {
    from: 'accepted',
    action: 'complete',
    actorRole: 'customer',
    to: 'completed'
  }
];

/**
 * Pure transition function for booking state machine
 * @param {string} currentStatus - 'pending' | 'countered' | 'accepted' | 'rejected' | 'cancelled' | 'completed'
 * @param {string} action - 'accept' | 'reject' | 'counter' | 'confirm' | 'decline-counter' | 'cancel' | 'complete'
 * @param {string} actorRole - 'customer' | 'worker'
 * @returns {string} nextStatus
 * @throws {ApiError} 409 INVALID_TRANSITION if invalid
 */
export const transition = (currentStatus, action, actorRole) => {
  const match = ALLOWED_TRANSITIONS.find(
    (t) =>
      t.from === currentStatus &&
      t.action === action &&
      t.actorRole === actorRole
  );

  if (!match) {
    throw new ApiError(
      409,
      'INVALID_TRANSITION',
      `Cannot perform action "${action}" as "${actorRole}" on booking in status "${currentStatus}".`
    );
  }

  return match.to;
};
