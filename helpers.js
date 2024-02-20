import {customAlphabet} from 'nanoid';

// Define the character set for the IDs
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

// Create a custom nanoid function with a specific size
export const getId = customAlphabet(alphabet, 8);
