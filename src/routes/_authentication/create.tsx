import { Box, Button, Flex, Heading, HStack, Icon, IconButton, Input, Textarea, VStack } from '@chakra-ui/react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { MemeEditor } from '../../components/meme-editor';
import { useMemo, useState } from 'react';
import { MemePictureProps } from '../../components/meme-picture';
import { Plus, Trash } from '@phosphor-icons/react';
import { stringsRes } from '../../resources/strings';

type Picture = {
    url: string;
    file: File;
};

const CreateMemePage = () => {
    const [picture, setPicture] = useState<Picture | null>(null);
    const [texts, setTexts] = useState<MemePictureProps['texts']>([]);

    const handleDrop = (file: File) => {
        setPicture({
            url: URL.createObjectURL(file),
            file,
        });
    };

    const handleAddCaption = () => {
        setTexts((prevTexts) => [
            ...prevTexts,
            {
                content: `New caption ${prevTexts.length + 1}`,
                x: Math.random() * 400,
                y: Math.random() * 225,
            },
        ]);
    };

    const handleDeleteCaption = (index: number) => {
        setTexts((prevTexts) => prevTexts.filter((_, i) => i !== index));
    };

    const memePicture = useMemo(() => (picture ? { pictureUrl: picture.url, texts } : undefined), [picture, texts]);

    return (
        <Flex width="full" height="full">
            <Box flexGrow={1} height="full" p={4} overflowY="auto">
                <VStack spacing={5} align="stretch">
                    <UploadSection onDrop={handleDrop} />
                    <DescriptionSection />
                </VStack>
            </Box>
            <CaptionSidebar
                texts={texts}
                onAddCaption={handleAddCaption}
                onDeleteCaption={handleDeleteCaption}
                memePicture={memePicture}
            />
        </Flex>
    );
};

const UploadSection = ({ onDrop }: { onDrop: (file: File) => void }) => (
    <Box>
        <Heading as="h2" size="md" mb={2}>
            {stringsRes.create.uploadPicture}
        </Heading>
        <MemeEditor onDrop={onDrop} />
    </Box>
);

const DescriptionSection = () => (
    <Box>
        <Heading as="h2" size="md" mb={2}>
            {stringsRes.create.describeMeme}
        </Heading>
        <Textarea placeholder={stringsRes.create.describeMemePlaceholder} />
    </Box>
);

const CaptionSidebar = ({
    texts,
    onAddCaption,
    onDeleteCaption,
    memePicture,
}: {
    texts: MemePictureProps['texts'];
    onAddCaption: () => void;
    onDeleteCaption: (index: number) => void;
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
                        <Input value={text.content} mr={1} />
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
            <Button colorScheme="cyan" size="sm" width="full" color="white" isDisabled={memePicture === undefined}>
                {stringsRes.common.submit}
            </Button>
        </HStack>
    </Flex>
);

export const Route = createFileRoute('/_authentication/create')({
    component: CreateMemePage,
});