import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Flex, StackDivider, Text, VStack } from '@chakra-ui/react';
import {
    createMemeComment,
    getMemeComments,
    GetMemeCommentsResponse,
    getMemes,
    GetMemesResponse,
    getUserById,
    // GetUserByIdResponse,
} from '../../api';
import { useAuthToken } from '../../contexts/authentication';
import { Loader } from '../../components/loader';
import { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { stringsRes } from '../../resources/strings';
import { MemeItem } from '../../components/memeItem';

//======================================//
//=============== Fetchs ===============//
//======================================//

// Fetch memes with authors cached separately to avoid redundant calls
const fetchMemes = (token: string, queryClient: QueryClient) => async () => {
    const memes: GetMemesResponse['results'] = [];
    const firstPage = await getMemes(token, 1);
    memes.push(...firstPage.results);

    // Removed cause we don't need to charge all the pages at first
    // const remainingPages = Math.ceil(firstPage.total / firstPage.pageSize) - 1;
    // for (let i = 0; i < remainingPages; i++) {
    //     const page = await getMemes(token, i + 2);
    //     memes.push(...page.results);
    // }

    // Map over memes to retrieve or cache authors and comments
    return Promise.all(
        memes.map(async (meme) => {
            // Retrieve cached author or fetch if not available
            const author = await queryClient.fetchQuery({
                queryKey: ['user', meme.authorId],
                queryFn: () => getUserById(token, meme.authorId),
                staleTime: 1000 * 60 * 60 * 24, // 24 hours
            });

            // Fetch comments for the meme
            const comments = await fetchComments(token, meme.id, queryClient);
            return { ...meme, author, comments };
        }),
    );
};

// Fetch comments for a meme
const fetchComments = async (token: string, memeId: string, queryClient: QueryClient) => {
    const comments: GetMemeCommentsResponse['results'] = [];
    const firstPage = await getMemeComments(token, memeId, 1);
    comments.push(...firstPage.results);

    const remainingCommentPages = Math.ceil(firstPage.total / firstPage.pageSize) - 1;
    for (let i = 0; i < remainingCommentPages; i++) {
        const page = await getMemeComments(token, memeId, i + 2);
        comments.push(...page.results);
    }

    return Promise.all(
        comments.map(async (comment) => {
            const author = await queryClient.fetchQuery({
                queryKey: ['user', comment.authorId],
                queryFn: () => getUserById(token, comment.authorId),
                staleTime: 1000 * 60 * 60 * 24, // 24 hours
            });
            return { ...comment, author };
        }),
    );
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
    });

    // Query for current user data with a 24-hour stale time
    const { data: user } = useQuery({
        queryKey: ['user', id],
        queryFn: () => getUserById(token, id),
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
    });

    const [openedCommentSection, setOpenedCommentSection] = useState<string | null>(null);
    const [commentContent, setCommentContent] = useState<{ [key: string]: string }>({});

    const { mutate } = useMutation({
        mutationFn: async (data: { memeId: string; content: string }) => {
            await createMemeComment(token, data.memeId, data.content);
        },
    });

    if (isLoading) {
        return <Loader data-testid="meme-feed-loader" />;
    }

    return (
        <Flex width="full" height="full" justifyContent="center" overflowY="auto">
            <VStack p={4} width="full" maxWidth={800} divider={<StackDivider border="gray.200" />}>
                {memes?.length ? (
                    memes.map((meme) => (
                        <MemeItem
                            key={meme.id}
                            meme={meme}
                            user={user}
                            commentContent={commentContent}
                            setCommentContent={setCommentContent}
                            openedCommentSection={openedCommentSection}
                            setOpenedCommentSection={setOpenedCommentSection}
                            mutate={mutate}
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
