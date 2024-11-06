import { Avatar, Box, Flex, Text, Input, VStack } from '@chakra-ui/react';
import { format } from 'timeago.js';
import { stringsRes } from '../resources/strings';
import { MemeExtended, User } from '../apiTypes';

// Comment section component
export const CommentSection = ({
    meme,
    user,
    commentContent,
    setCommentContent,
    createCommentMutate,
}: {
    meme: MemeExtended;
    user: User;
    commentContent: { [key: string]: string };
    setCommentContent: (content: { [key: string]: string }) => void;
    createCommentMutate: (data: { memeId: string; content: string }) => void;
    loadMoreComments: (memeId: string, page: number) => void;
}) => {
    const { id: memeId, comments } = meme;

    return (
        <Box mb={6}>
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    if (commentContent[memeId]) {
                        createCommentMutate({ memeId, content: commentContent[memeId] });
                    }
                }}
            >
                <Flex alignItems="center">
                    <Avatar
                        borderWidth="1px"
                        borderColor="gray.300"
                        name={user?.username}
                        src={user?.pictureUrl}
                        size="sm"
                        mr={2}
                    />
                    <Input
                        placeholder={stringsRes.home.comment}
                        onChange={(event) => setCommentContent({ ...commentContent, [memeId]: event.target.value })}
                        value={commentContent[memeId] || ''}
                    />
                </Flex>
            </form>
            <VStack align="stretch" spacing={4}>
                {comments?.map((comment) => (
                    <Flex key={comment.id}>
                        <Avatar
                            borderWidth="1px"
                            borderColor="gray.300"
                            size="sm"
                            name={comment.author?.username}
                            src={comment.author?.pictureUrl}
                            mr={2}
                        />
                        <Box p={2} borderRadius={8} bg="gray.50" flexGrow={1}>
                            <Flex justifyContent="space-between" alignItems="center">
                                <Text data-testid={`meme-comment-author-${memeId}-${comment.id}`}>
                                    {comment.author?.username}
                                </Text>
                                <Text fontStyle="italic" color="gray.500" fontSize="small">
                                    {format(comment.createdAt)}
                                </Text>
                            </Flex>
                            <Text
                                color="gray.500"
                                whiteSpace="pre-line"
                                data-testid={`meme-comment-content-${memeId}-${comment.id}`}
                            >
                                {comment.content}
                            </Text>
                        </Box>
                    </Flex>
                ))}
            </VStack>
        </Box>
    );
};
