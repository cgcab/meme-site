import { Box, Button, Flex, HStack, Heading, Icon, IconButton, Input, VStack } from '@chakra-ui/react';
import { MemePictureProps } from './meme-picture';
import { Plus, Trash } from '@phosphor-icons/react';
import { stringsRes } from '../resources/strings';
import { Link } from '@tanstack/react-router';

export const CaptionSidebar = ({
    texts,
    onAddCaption,
    onDeleteCaption,
    onEditCaption,
    onSubmit,
    memePicture,
}: {
    texts: MemePictureProps['texts'];
    onAddCaption: () => void;
    onDeleteCaption: (index: number) => void;
    onEditCaption: (index: number, newContent: string) => void;
    onSubmit: () => void;
    memePicture: { pictureUrl: string; texts: MemePictureProps['texts'] } | undefined;
}) => (
    <Flex flexDir="column" width="30%" minW="250" height="full" boxShadow="lg">
        <Heading as="h2" size="md" mb={2} p={4}>
            {stringsRes.create.addCaptions}
        </Heading>
        <Box p={4} flexGrow={1} height={0} overflowY="auto">
            <VStack spacing={3}>
                {texts.map((text, index) => (
                    <Flex key={index} width="full">
                        <Input value={text.content} onChange={(e) => onEditCaption(index, e.target.value)} mr={1} />
                        <IconButton
                            onClick={() => onDeleteCaption(index)}
                            aria-label={stringsRes.create.deleteCaption}
                            icon={<Icon as={Trash} />}
                        />
                    </Flex>
                ))}
                <Button
                    colorScheme="cyan"
                    leftIcon={<Icon as={Plus} />}
                    variant="ghost"
                    size="sm"
                    width="full"
                    onClick={onAddCaption}
                    isDisabled={memePicture === undefined}
                >
                    {stringsRes.create.addCaption}
                </Button>
            </VStack>
        </Box>
        <HStack p={4}>
            <Button as={Link} to="/" colorScheme="cyan" variant="outline" size="sm" width="full">
                {stringsRes.common.cancel}
            </Button>
            <Button
                colorScheme="cyan"
                size="sm"
                width="full"
                color="white"
                isDisabled={memePicture === undefined}
                onClick={onSubmit}
            >
                {stringsRes.common.submit}
            </Button>
        </HStack>
    </Flex>
);
