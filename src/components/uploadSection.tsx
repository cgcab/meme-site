import { Box, Heading } from '@chakra-ui/react';
import { stringsRes } from '../resources/strings';
import { MemeEditor } from './meme-editor';
import { MemePictureProps } from './meme-picture';

// Creator upload section component
export const UploadSection = ({
    onDrop,
    memePicture,
}: {
    onDrop: (file: File) => void;
    memePicture: MemePictureProps | undefined;
}) => (
    <Box>
        <Heading as="h2" size="md" mb={2}>
            {stringsRes.create.uploadPicture}
        </Heading>
        <MemeEditor onDrop={onDrop} memePicture={memePicture} />
    </Box>
);
