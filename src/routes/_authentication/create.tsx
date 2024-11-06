import { Box, Flex, VStack, useToast } from '@chakra-ui/react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { MemePictureProps } from '../../components/meme-picture';
import { DescriptionSection } from '../../components/descriptionSection';
import { UploadSection } from '../../components/uploadSection';
import { CaptionSidebar } from '../../components/captionSidebar';
import { createMeme } from '../../api';
import { useAuthToken } from '../../contexts/authentication';
import { Picture } from '../../apiTypes';
import { stringsRes } from '../../resources/strings';
import { TOAST_DURATION } from '../../utils/constants';

const CreateMemePage = () => {
    const token = useAuthToken();
    const navigate = useNavigate();
    const toast = useToast();

    const [picture, setPicture] = useState<Picture | null>(null);
    const [description, setDescription] = useState<string>('');
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
                content: `${stringsRes.editor.defaultCaption} ${prevTexts.length + 1}`,
                x: Math.floor(Math.random() * 400),
                y: Math.floor(Math.random() * 225),
            },
        ]);
    };

    const handleDragStop = (index: number, x: number, y: number) => {
        const updatedTexts = texts.map((text, i) =>
            i === index
                ? {
                      ...text,
                      x,
                      y,
                  }
                : text,
        );
        setTexts(updatedTexts);
    };

    const handleDeleteCaption = (index: number) => {
        setTexts((prevTexts) => prevTexts.filter((_, i) => i !== index));
    };

    const handleEditCaption = (index: number, newContent: string) => {
        setTexts((prevTexts) => prevTexts.map((text, i) => (i === index ? { ...text, content: newContent } : text)));
    };

    const handleSubmit = async () => {
        if (picture) {
            await createMeme(token, picture, texts, description)
                .then(() => {
                    toast({
                        title: stringsRes.create.created,
                        status: 'success',
                        duration: TOAST_DURATION,
                        isClosable: true,
                    });
                    navigate({ to: '/' });
                })
                .catch((error) => {
                    toast({
                        title: stringsRes.error.generic,
                        status: 'error',
                        duration: TOAST_DURATION,
                        isClosable: true,
                    });
                    console.error('Error creating meme:', error);
                });
        }
    };

    const memePicture = useMemo(() => (picture ? { pictureUrl: picture.url, texts } : undefined), [picture, texts]);

    return (
        <Flex width="full" height="full">
            <Box flexGrow={1} height="full" p={4} overflowY="auto">
                <VStack spacing={5} align="stretch">
                    <UploadSection onDrop={handleDrop} memePicture={memePicture} onDragStop={handleDragStop} />
                    <DescriptionSection description={description} setDescription={setDescription} />
                </VStack>
            </Box>
            <CaptionSidebar
                texts={texts}
                onAddCaption={handleAddCaption}
                onDeleteCaption={handleDeleteCaption}
                onEditCaption={handleEditCaption}
                onSubmit={handleSubmit}
                memePicture={memePicture}
            />
        </Flex>
    );
};

export const Route = createFileRoute('/_authentication/create')({
    component: CreateMemePage,
});
