// type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export enum Language {
    FR = 'fr',
    EN = 'en',
}

export interface User {
    id: string;
    username: string;
    pictureUrl: string;
}

export interface Meme {
    id: string;
    authorId: string;
    pictureUrl: string;
    description: string;
    commentsCount: string;
    texts: { content: string; x: number; y: number }[];
    createdAt: string;
}

export interface MemeExtended extends Meme {
    author: User;
    comments?: CommentExtended[];
    total?: number;
    pageSize?: number;
}

export interface Comment {
    id: string;
    authorId: string;
    memeId: string;
    content: string;
    createdAt: string;
}

export interface CommentExtended extends Comment {
    author: User;
}

export interface Picture {
    url: string;
    file: File;
}

// ============================= //
// =========== API ============= //
// ============================= //

// Login response type
export type LoginResponse = { jwt: string };

// GetUserById response type
export type GetUserByIdResponse = User;

// GetMemes response type
export type GetMemesResponse = {
    total: number;
    pageSize: number;
    results: Meme[];
};

// GetMemeComments response type
export type GetMemeCommentsResponse = {
    total: number;
    pageSize: number;
    results: Comment[];
};

// CreateComment response type
export type CreateCommentResponse = Comment;

export type CreateMemeResponse = Meme;
