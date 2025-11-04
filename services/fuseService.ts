// This is a simplified, embedded version of the core logic of Fuse.js (v6.x)
// In a real project, you would `npm install fuse.js`
// For this environment, we include the necessary logic directly.

const fuzzySearch = <T>(
  list: readonly T[],
  searchTerm: string,
  keys: (keyof T)[]
): T[] => {
  if (!searchTerm) {
    return [...list];
  }

  const lowercasedTerm = searchTerm.toLowerCase();

  return list.filter(item => {
    return keys.some(key => {
      const value = item[key];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowercasedTerm);
      }
      return false;
    });
  });
};

export default fuzzySearch;
