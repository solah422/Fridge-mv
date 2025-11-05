// FIX: Populate the empty storageService.ts file to resolve module import errors.
// This provides a concrete implementation for storing and retrieving user session data.
export const storageService = {
  getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage for key "${key}"`, error);
      return defaultValue;
    }
  },
  setItem<T>(key: string, value: T): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage for key "${key}"`, error);
    }
  },
};
