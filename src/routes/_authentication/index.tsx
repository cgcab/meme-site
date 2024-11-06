import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Flex, StackDivider, Text, VStack } from '@chakra-ui/react';
import { createMemeComment, getMemeComments, getMemes, getUserById } from '../../api';
import { useAuthToken } from '../../contexts/authentication';
import { Loader } from '../../components/loader';
import { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { stringsRes } from '../../resources/strings';
import { MemeItem } from '../../components/memeItem';
import {
    Comment,
    CommentExtended,
    GetMemeCommentsResponse,
    GetMemesResponse,
    Meme,
    MemeExtended,
    User,
} from '../../apiTypes';

//======================================//
//=============== Fetchs ===============//
//======================================//

// Fetch memes with authors cached separately to avoid redundant calls
const fetchMemes =
    (token: string, queryClient: QueryClient, page: number = 1) =>
    async () => {
        const memes: GetMemesResponse['results'] = [];
        const firstPage = await getMemes(token, page);
        memes.push(...firstPage.results);

        // Removed cause we don't need to charge all the pages at first
        // const remainingPages = Math.ceil(firstPage.total / firstPage.pageSize) - 1;
        // for (let i = 0; i < remainingPages; i++) {
        //     const page = await getMemes(token, i + 2);
        //     memes.push(...page.results);
        // }

        // Map over memes to retrieve or cache authors and comments
        return Promise.all(
            memes.map(async (meme: Meme) => {
                // Retrieve cached author or fetch if not available
                const author = await queryClient.fetchQuery({
                    queryKey: ['user', meme.authorId],
                    queryFn: () => getUserById(token, meme.authorId),
                    staleTime: 1000 * 60 * 60 * 24, // 24 hours
                });

                // Fetch comments for the meme
                // const comments = await fetchComments(token, meme.id, queryClient);
                // return { ...meme, author, comments };
                return { ...meme, author };
            }),
        );
    };

// Fetch comments for a meme
const fetchComments = async (token: string, memeId: string, queryClient: QueryClient, page: number = 1) => {
    const comments: GetMemeCommentsResponse['results'] = [];
    const firstPage = await getMemeComments(token, memeId, page);
    comments.push(...firstPage.results);

    return Promise.all(
        comments.map(async (comment: Comment) => {
            const author = await queryClient.fetchQuery({
                queryKey: ['user', comment.authorId],
                queryFn: () => getUserById(token, comment.authorId),
                staleTime: 1000 * 60 * 60 * 24, // 24 hours
            });
            return { ...comment, author };
        }),
    ).then((enhancedComments) => ({
        comments: enhancedComments,
        total: firstPage.total,
        pageSize: firstPage.pageSize,
    }));
};

//=========================================//
//=============== Component ===============//
//=========================================//

const MemeFeedPage: React.FC = () => {
    const token = useAuthToken();
    const { id } = jwtDecode<{ id: string }>(token);

    const queryClient = useQueryClient();

    // Query for memes, with author data loaded separately
    const { isLoading, data: memes } = useQuery({
        queryKey: ['memes'],
        queryFn: fetchMemes(token, queryClient),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Query for current user data with a 24-hour stale time
    const { data: user } = useQuery({
        queryKey: ['user', id],
        queryFn: () => getUserById(token, id),
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
    });

    const [openedCommentSection, setOpenedCommentSection] = useState<string | null>(null);
    const [commentContent, setCommentContent] = useState<{ [key: string]: string }>({});

    // Load comments when opening a comment section
    const loadComments = async (memeId: string) => {
        const commentsData = await fetchComments(token, memeId, queryClient);
        queryClient.setQueryData(['memes'], (oldMemes: MemeExtended[] | undefined) => {
            return oldMemes?.map((meme) => (meme.id === memeId ? { ...meme, ...commentsData } : meme));
        });
    };

    const loadMoreComments = async (memeId: string, page: number) => {
        const commentsData = await fetchComments(token, memeId, queryClient, page);
        queryClient.setQueryData(['memes'], (oldMemes: MemeExtended[] | undefined) => {
            return oldMemes?.map((meme) =>
                meme.id === memeId ? { ...meme, comments: [...(meme.comments || []), ...commentsData.comments] } : meme,
            );
        });
    };

    const { mutate: createCommentMutate } = useMutation({
        mutationFn: async (data: { memeId: string; content: string }) => {
            return await createMemeComment(token, data.memeId, data.content);
        },
        onSuccess: (newComment, { memeId }) => {
            const newCommentExtended: CommentExtended = newComment as CommentExtended;
            if (user) {
                newCommentExtended.author = user;
            }

            // Add new comment to the correct meme in the cache
            queryClient.setQueryData(['memes'], (oldMemes: MemeExtended[] | undefined) => {
                return oldMemes?.map((meme) =>
                    meme.id === memeId
                        ? {
                              ...meme,
                              comments: [newCommentExtended, ...(meme.comments || [])],
                              commentsCount: meme.commentsCount + 1,
                          }
                        : meme,
                );
            });
            setCommentContent((prev) => ({ ...prev, [memeId]: '' }));
        },
        onError: (error) => {
            console.error('Error creating comment:', error);
        },
    });

    if (isLoading) {
        return <Loader data-testid="meme-feed-loader" />;
    }

    console.log({ memes });
    return (
        <Flex width="full" height="full" justifyContent="center" overflowY="auto">
            <VStack p={4} width="full" maxWidth={800} divider={<StackDivider border="gray.200" />}>
                {memes?.length ? (
                    memes.map((meme) => (
                        <MemeItem
                            key={meme.id}
                            meme={meme}
                            user={user as User}
                            commentContent={commentContent}
                            setCommentContent={setCommentContent}
                            openedCommentSection={openedCommentSection}
                            setOpenedCommentSection={(memeId) => {
                                setOpenedCommentSection(memeId);
                                if (memeId) {
                                    loadComments(memeId);
                                }
                            }}
                            createCommentMutate={createCommentMutate}
                            loadMoreComments={loadMoreComments}
                        />
                    ))
                ) : (
                    <Text>{stringsRes.home.noMeme}</Text>
                )}
            </VStack>
        </Flex>
    );
};

export default MemeFeedPage;

export const Route = createFileRoute('/_authentication/')({
    component: MemeFeedPage,
});
