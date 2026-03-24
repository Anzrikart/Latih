/**
 * modules/auth.js
 * Session management and role guards for Project Latih.
 * Import this module (via <script src="modules/auth.js">) on every page
 * that needs role-based access control.
 *
 * Depends on: assets/js/latih.js (for Store)
 */

const Auth = {
  /**
   * Returns the current session object, or null.
   */
  session() {
    return Store.get('session');
  },

  /**
   * Returns the current role: 'admin' | 'student' | null
   */
  role() {
    return Store.currentRole();
  },

  /**
   * Returns the current user id (students only), or null.
   */
  userId() {
    return Store.currentUser();
  },

  /**
   * Redirect to index.html if the current role doesn't match.
   * Call at the very top of every page script.
   * @param {'admin'|'student'} expectedRole
   */
  require(expectedRole) {
    if (this.role() !== expectedRole) {
      location.href = 'index.html';
    }
  },

  /**
   * Logs the user out: clears session and goes to index.html.
   */
  logout() {
    Store.del('session');
    location.href = 'index.html';
  },

  /**
   * Sets an admin session (no user_id).
   */
  loginAdmin() {
    Store.set('session', { role: 'admin' });
  },

  /**
   * Sets a student session.
   * @param {string} userId
   */
  loginStudent(userId) {
    Store.set('session', { current_user: userId, role: 'student' });
  },

  /**
   * Hash a PIN using the project's salt.
   * @param {string} pin
   * @returns {string}
   */
  hashPin(pin) {
    return btoa(pin + 'latih_salt_2026');
  },

  /**
   * Verify a PIN against the stored hash.
   * @param {string} pin
   * @returns {boolean}
   */
  verifyPin(pin) {
    const stored = Store.get('admin_pin');
    return stored && stored === this.hashPin(pin);
  },

  /**
   * Save a new admin PIN (hashed).
   * @param {string} pin
   */
  savePin(pin) {
    Store.set('admin_pin', this.hashPin(pin));
  },

  /**
   * Returns true if an admin PIN has been configured.
   */
  hasPinSet() {
    return !!Store.get('admin_pin');
  }
};
