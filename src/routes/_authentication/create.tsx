import { Box, Flex, VStack } from '@chakra-ui/react';
import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { MemePictureProps } from '../../components/meme-picture';
import { DescriptionSection } from '../../components/descriptionSection';
import { UploadSection } from '../../components/uploadSection';
import { CaptionSidebar } from '../../components/captionSidebar';

type Picture = {
    url: string;
    file: File;
};

const CreateMemePage = () => {
    const [picture, setPicture] = useState<Picture | null>(null);
    const [texts, setTexts] = useState<MemePictureProps['texts']>([]);

    console.log({ picture, texts });

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

export const Route = createFileRoute('/_authentication/create')({
    component: CreateMemePage,
});
