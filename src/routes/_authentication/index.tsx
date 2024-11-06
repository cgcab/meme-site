import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { ButtonGroup, Flex, IconButton, StackDivider, Text, VStack, useToast } from '@chakra-ui/react';
import { CaretLeft, CaretRight, ArrowCircleLeft, ArrowCircleRight } from '@phosphor-icons/react'; // Import Phosphor icons
import { createMemeComment, getMemeComments, getMemes, getUserById } from '../../api';
import { useAuthToken } from '../../contexts/authentication';
import { Loader } from '../../components/loader';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { stringsRes } from '../../resources/strings';
import { MemeItem } from '../../components/memeItem';
import {
    Comment,
    CommentExtended,
    GetMemeCommentsResponse,
    GetMemesResponse,
    Meme,
    MemeDatas,
    User,
} from '../../apiTypes';
import { HOUR_MS, MINUTE_MS, TOAST_DURATION } from '../../utils/constants';

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
        ).then((enhancedMemes) => ({
            memes: enhancedMemes,
            total: firstPage.total,
            pageSize: firstPage.pageSize,
        }));
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

export const MemeFeedPage: React.FC = () => {
    const token = useAuthToken();
    const { id } = jwtDecode<{ id: string }>(token);

    const toast = useToast();

    const queryClient = useQueryClient();

    // useState
    const [currentPage, setCurrentPage] = useState(1);
    const [openedCommentSection, setOpenedCommentSection] = useState<string | null>(null);
    const [commentContent, setCommentContent] = useState<{ [key: string]: string }>({});

    //===========================================//
    //=============== React-Query ===============//
    //==========================================//
    // Query for memes, with author data loaded separately
    const {
        isLoading,
        isFetching,
        data: memesData,
        refetch,
    } = useQuery({
        queryKey: ['memes'],
        queryFn: fetchMemes(token, queryClient, currentPage),
        staleTime: MINUTE_MS * 5, // 5 minutes
    });

    // Query for current user data with a 24-hour stale time
    const { data: user } = useQuery({
        queryKey: ['user', id],
        queryFn: () => getUserById(token, id),
        staleTime: HOUR_MS * 24, // 24 hours
    });

    useEffect(() => {
        if (currentPage) {
            refetch();
        }
    }, [currentPage, refetch]);

    //========================================//
    //=============== Comments ===============//
    //========================================//

    // Load comments when opening a comment section
    const loadComments = async (memeId: string) => {
        const commentsData = await fetchComments(token, memeId, queryClient);
        queryClient.setQueryData(['memes'], (oldMemes: MemeDatas) => {
            const memes = oldMemes?.memes?.map((meme) => (meme.id === memeId ? { ...meme, ...commentsData } : meme));
            return { ...oldMemes, memes };
        });
    };

    const loadMoreComments = async (memeId: string, page: number) => {
        const commentsData = await fetchComments(token, memeId, queryClient, page);
        queryClient.setQueryData(['memes'], (oldMemes: MemeDatas) => {
            const memes = oldMemes?.memes?.map((meme) =>
                meme.id === memeId ? { ...meme, comments: [...(meme.comments || []), ...commentsData.comments] } : meme,
            );
            return { ...oldMemes, memes };
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
            queryClient.setQueryData(['memes'], (oldMemes: MemeDatas) => {
                const memes = oldMemes?.memes?.map((meme) =>
                    meme.id === memeId
                        ? {
                              ...meme,
                              comments: [newCommentExtended, ...(meme.comments || [])],
                              commentsCount: meme.commentsCount + 1,
                          }
                        : meme,
                );
                return { ...oldMemes, memes };
            });
            setCommentContent((prev) => ({ ...prev, [memeId]: '' }));
        },
        onError: (error) => {
            toast({
                title: stringsRes.error.generic,
                status: 'error',
                duration: TOAST_DURATION,
                isClosable: true,
            });
            console.error('Error creating comment:', error);
        },
    });

    const goToPage = (page: number) => {
        setCurrentPage(page);
    };

    if (isLoading || isFetching) {
        return <Loader data-testid="meme-feed-loader" />;
    }

    let totalPages = 1;
    if (memesData) {
        totalPages = Math.ceil(memesData?.total / memesData?.pageSize);
    }

    return (
        <Flex
            width="full"
            minHeight="100vh" // Set to 100vh or adjust based on your needs
            alignItems="center" // Center horizontally
            direction="column" // Stack elements vertically
        >
            <VStack p={4} width="full" maxWidth={800} divider={<StackDivider border="gray.200" />}>
                {memesData?.memes?.length ? (
                    memesData.memes?.map((meme) => (
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
            {/* Pagination Controls */}
            <ButtonGroup spacing={4} mt={4} paddingBottom={8}>
                <IconButton
                    aria-label={stringsRes.page.first}
                    icon={<CaretLeft size={24} />}
                    onClick={() => goToPage(1)}
                    isDisabled={currentPage === 1}
                />
                <IconButton
                    aria-label={stringsRes.page.prev}
                    icon={<ArrowCircleLeft size={24} />}
                    onClick={() => goToPage(currentPage - 1)}
                    isDisabled={currentPage === 1}
                />
                <Text fontWeight="bold" alignSelf="center">
                    {`${stringsRes.page.title} ${currentPage} / ${totalPages}`}
                </Text>
                <IconButton
                    aria-label={stringsRes.page.next}
                    icon={<ArrowCircleRight size={24} />}
                    onClick={() => goToPage(currentPage + 1)}
                    isDisabled={currentPage === totalPages}
                />
                <IconButton
                    aria-label={stringsRes.page.last}
                    icon={<CaretRight size={24} />}
                    onClick={() => goToPage(totalPages)}
                    isDisabled={currentPage === totalPages}
                />
            </ButtonGroup>
        </Flex>
    );
};

export const Route = createFileRoute('/_authentication/')({
    component: MemeFeedPage,
});
