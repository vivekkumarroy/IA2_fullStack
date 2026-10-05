/**
 * Date helper utilities for loan management.
 */

/**
 * Adds a given number of days to a date.
 * @param {Date} date - The starting date
 * @param {number} days - Number of days to add
 * @returns {Date}
 */
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Checks whether a borrow record is overdue.
 * A record is overdue if it has not been returned and the due date is in the past.
 * @param {Date|string} dueDate
 * @param {Date|string|null} returnDate
 * @returns {boolean}
 */
const isOverdue = (dueDate, returnDate) => {
  if (returnDate) return false;
  return new Date(dueDate) < new Date();
};

module.exports = { addDays, isOverdue };
