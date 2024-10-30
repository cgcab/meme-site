import {
    CreateCommentResponse,
    LoginResponse,
    GetUserByIdResponse,
    GetMemesResponse,
    GetMemeCommentsResponse,
} from './apiTypes';

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
