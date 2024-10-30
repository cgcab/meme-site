import {
    CreateCommentResponse,
    LoginResponse,
    GetUserByIdResponse,
    GetMemesResponse,
    GetMemeCommentsResponse,
    CreateMemeResponse,
    Picture,
} from './apiTypes';
import { MemePictureProps } from './components/meme-picture';

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

// Error handling classes
export class UnauthorizedError extends Error {
    constructor() {
        super('Unauthorized');
    }
}

export class NotFoundError extends Error {
    constructor() {
        super('Not Found');
    }
}

// Check response status and handle specific errors
function checkStatus(response: Response) {
    switch (response.status) {
        case 401:
            throw new UnauthorizedError();
        case 404:
            throw new NotFoundError();
        default:
            return response;
    }
}

// ============================= //
// =========== API ============= //
// ============================= //

/**
 * Authenticate user and retrieve JWT token
 * @param username - User's username
 * @param password - User's password
 * @returns JWT token in response
 */
export async function login(username: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${BASE_URL}/authentication/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    return checkStatus(response).json();
}

/**
 * Fetch user data by user ID
 * @param token - JWT token for authorization
 * @param id - User's unique ID
 * @returns User data
 */
export async function getUserById(token: string, id: string): Promise<GetUserByIdResponse> {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
    return checkStatus(response).json();
}

/**
 * Fetch a paginated list of memes
 * @param token - JWT token for authorization
 * @param page - Page number to retrieve
 * @returns Memes data for the given page
 */
export async function getMemes(token: string, page: number): Promise<GetMemesResponse> {
    const response = await fetch(`${BASE_URL}/memes?page=${page}`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
    return checkStatus(response).json();
}

/**
 * Fetch comments for a specific meme
 * @param token - JWT token for authorization
 * @param memeId - ID of the meme to fetch comments for
 * @param page - Page number of comments to retrieve
 * @returns Comments data for the specified meme
 */
export async function getMemeComments(token: string, memeId: string, page: number): Promise<GetMemeCommentsResponse> {
    const response = await fetch(`${BASE_URL}/memes/${memeId}/comments?page=${page}`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
    return checkStatus(response).json();
}

/**
 * Create a new comment on a meme
 * @param token - JWT token for authorization
 * @param memeId - ID of the meme to comment on
 * @param content - Content of the comment
 * @returns The newly created comment data
 */
export async function createMemeComment(
    token: string,
    memeId: string,
    content: string,
): Promise<CreateCommentResponse> {
    const response = await fetch(`${BASE_URL}/memes/${memeId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
    });
    return checkStatus(response).json();
}

/**
 * Creates a new meme by sending a POST request with image data, text annotations,
 * and metadata in a multipart/form-data format.
 *
 * @async
 * @function createMeme
 * @param {string} token - The authorization token to access the meme creation API.
 * @param {Picture} picture - The binary data of the meme image or a file Blob
 *                                      representing the image to be uploaded.
 * @param {MemePictureProps['texts']} texts - An array of text objects to be added to the meme,
 *                                            each containing content, x, and y properties.
 *                                            Each text object should follow the structure:
 *                                            { content: string, x: number, y: number }.
 * @returns {Promise<CreateMemeResponse>} A promise that resolves to a `CreateMemeResponse` object,
 *                                        which contains the response from the server, including
 *                                        the new meme ID and status.
 *
 * @throws {Error} Throws an error if the request fails or if the server response
 *                 indicates an error status.
 *
 * @example
 * const token = "your-auth-token";
 * const picture = new Blob([...], { type: 'image/jpeg' }); // Your image data here
 * const texts = [
 *   { content: "Caption 1", x: 100, y: 50 },
 *   { content: "Caption 2", x: 42, y: 84 }
 * ];
 *
 * createMeme(token, picture, texts)
 *   .then(response => console.log("Meme created:", response))
 *   .catch(error => console.error("Error creating meme:", error));
 */
export async function createMeme(
    token: string,
    picture: Picture,
    texts: MemePictureProps['texts'],
    description?: string,
): Promise<CreateMemeResponse> {
    const formData = new FormData();

    // Add binary picture data
    formData.append('Picture', picture.file);

    // Add a description, or default
    formData.append('Description', description || 'Super Meme');

    // Add text data with positions
    texts.forEach((text, index) => {
        formData.append(`Texts[${index}][Content]`, text.content);
        formData.append(`Texts[${index}][X]`, '' + Math.floor(text.x));
        formData.append(`Texts[${index}][Y]`, '' + Math.floor(text.y));
    });

    const response = await fetch(`${BASE_URL}/memes`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`, // only add Authorization header; Content-Type will be set automatically
        },
        body: formData,
    });

    return checkStatus(response).json();
}
