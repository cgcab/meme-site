import { Avatar, Box, Button, Collapse, Flex, Icon, LinkBox, LinkOverlay, Text, VStack } from '@chakra-ui/react';
import { CaretDown, CaretUp, Chat } from '@phosphor-icons/react';
import { format } from 'timeago.js';
import { MemePicture } from './meme-picture';
import { CommentSection } from './commentSection';
import { stringsRes } from '../resources/strings';
import { MemeExtended, User } from '../apiTypes';
import { useEffect, useState } from 'react';

// Individual Meme item component
export const MemeItem = ({
    meme,
    user,
    commentContent,
    setCommentContent,
    openedCommentSection,
    setOpenedCommentSection,
    createCommentMutate,
    loadMoreComments,
}: {
    meme: MemeExtended;
    user: User;
    commentContent: { [key: string]: string };
    setCommentContent: (content: { [key: string]: string }) => void;
    openedCommentSection: string | null;
    setOpenedCommentSection: (id: string | null) => void;
    createCommentMutate: (data: { memeId: string; content: string }) => void;
    loadMoreComments: (memeId: string, page: number) => void;
}) => {
    const { id: memeId, total, pageSize } = meme;

    let maxPage = 0;
    if (total && pageSize) {
        maxPage = Math.ceil(total / pageSize);
    }

    const [currentPage, setCurrentPage] = useState<number>(1);

    // Reset pages when closed
    useEffect(() => {
        if (!openedCommentSection) {
            setCurrentPage(1);
        }
    }, [openedCommentSection]);

    return (
        <VStack p={4} width="full" align="stretch">
            <Flex justifyContent="space-between" alignItems="center">
                <Flex>
                    <Avatar
                        borderWidth="1px"
                        borderColor="gray.300"
                        size="xs"
                        name={meme.author.username}
                        src={meme.author.pictureUrl}
                    />
                    <Text ml={2} data-testid={`meme-author-${meme.id}`}>
                        {meme.author.username}
                    </Text>
                </Flex>
                <Text fontStyle="italic" color="gray.500" fontSize="small">
                    {format(meme.createdAt)}
                </Text>
            </Flex>
            <MemePicture pictureUrl={meme.pictureUrl} texts={meme.texts} dataTestId={`meme-picture-${meme.id}`} />
            <Box>
                <Text fontWeight="bold" fontSize="medium" mb={2}>
                    {stringsRes.common.description}
                </Text>
                <Box p={2} borderRadius={8} border="1px solid" borderColor="gray.100">
                    <Text color="gray.500" whiteSpace="pre-line" data-testid={`meme-description-${meme.id}`}>
                        {meme.description}
                    </Text>
                </Box>
            </Box>
            <LinkBox as={Box} py={2} borderBottom="1px solid black">
                <Flex justifyContent="space-between" alignItems="center">
                    <Flex alignItems="center">
                        <LinkOverlay
                            data-testid={`meme-comments-section-${meme.id}`}
                            cursor="pointer"
                            onClick={() => setOpenedCommentSection(openedCommentSection === meme.id ? null : meme.id)}
                        >
                            <Text data-testid={`meme-comments-count-${meme.id}`}>{meme.commentsCount} comments</Text>
                        </LinkOverlay>
                        <Icon as={openedCommentSection !== meme.id ? CaretDown : CaretUp} ml={2} mt={1} />
                    </Flex>
                    <Icon as={Chat} />
                </Flex>
            </LinkBox>
            <Collapse in={openedCommentSection === meme.id} animateOpacity>
                <CommentSection
                    memeId={meme.id}
                    comments={meme.comments}
                    user={user}
                    commentContent={commentContent}
                    setCommentContent={setCommentContent}
                    createCommentMutate={createCommentMutate}
                    loadMoreComments={loadMoreComments}
                />
                {maxPage > 1 && currentPage < maxPage && (
                    <Button
                        width="100%"
                        onClick={() => {
                            loadMoreComments(memeId, currentPage + 1); // Load new comments
                            setCurrentPage((prev: number) => prev + 1);
                        }}
                    >
                        {stringsRes.common.loadMore}
                    </Button>
                )}
            </Collapse>
        </VStack>
    );
};
