import { Box, Heading } from '@chakra-ui/react';
import { stringsRes } from '../resources/strings';
import { MemeEditor } from './meme-editor';
import { MemePictureProps } from './meme-picture';

// Creator upload section component
export const UploadSection = ({
    onDrop,
    memePicture,
    onUpdateTexts,
}: {
    onDrop: (file: File) => void;
    memePicture: MemePictureProps | undefined;
    onUpdateTexts?: (updatedTexts: { content: string; x: number; y: number }[]) => void;
}) => (
    <Box>
        <Heading as="h2" size="md" mb={2}>
            {stringsRes.create.uploadPicture}
        </Heading>
        <MemeEditor onDrop={onDrop} memePicture={memePicture} onUpdateTexts={onUpdateTexts} />
    </Box>
);
