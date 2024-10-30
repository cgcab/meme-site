import { Box, Flex, VStack } from '@chakra-ui/react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { MemePictureProps } from '../../components/meme-picture';
import { DescriptionSection } from '../../components/descriptionSection';
import { UploadSection } from '../../components/uploadSection';
import { CaptionSidebar } from '../../components/captionSidebar';
import { createMeme } from '../../api';
import { useAuthToken } from '../../contexts/authentication';
import { Picture } from '../../apiTypes';

const CreateMemePage = () => {
    const token = useAuthToken();
    const navigate = useNavigate();

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
                content: `New caption ${prevTexts.length + 1}`,
                x: Math.floor(Math.random() * 400),
                y: Math.floor(Math.random() * 225),
            },
        ]);
    };

    const handleDeleteCaption = (index: number) => {
        setTexts((prevTexts) => prevTexts.filter((_, i) => i !== index));
    };

    const handleEditCaption = (index: number, newContent: string) => {
        setTexts((prevTexts) => prevTexts.map((text, i) => (i === index ? { ...text, content: newContent } : text)));
    };

    const handleUpdateTexts = (updatedTexts: { content: string; x: number; y: number }[]) => {
        setTexts(updatedTexts);
    };

    const handleSubmit = async () => {
        if (picture) {
            await createMeme(token, picture, texts, description)
                .then((response) => {
                    console.log('Meme created:', response);
                    navigate({ to: '/' });
                })
                .catch((error) => console.error('Error creating meme:', error));
        }
    };

    const memePicture = useMemo(() => (picture ? { pictureUrl: picture.url, texts } : undefined), [picture, texts]);

    return (
        <Flex width="full" height="full">
            <Box flexGrow={1} height="full" p={4} overflowY="auto">
                <VStack spacing={5} align="stretch">
                    <UploadSection onDrop={handleDrop} memePicture={memePicture} onUpdateTexts={handleUpdateTexts} />
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
