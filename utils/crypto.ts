// Using SubtleCrypto API for hashing
export async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // convert bytes to hex string
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generates a random 6-digit code in "123-456" format
export function generateOneTimeCode(): string {
    const part1 = Math.floor(100 + Math.random() * 900);
    const part2 = Math.floor(100 + Math.random() * 900);
    // Ensure it's padded, though Math.random should handle it
    return `${part1.toString().padStart(3, '0')}-${part2.toString().padStart(3, '0')}`;
}
