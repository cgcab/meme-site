import { Box, Heading } from '@chakra-ui/react';
import { stringsRes } from '../resources/strings';
import { MemeEditor } from './meme-editor';

// Creator upload section component
export const UploadSection = ({ onDrop }: { onDrop: (file: File) => void }) => (
    <Box>
        <Heading as="h2" size="md" mb={2}>
            {stringsRes.create.uploadPicture}
        </Heading>
        <MemeEditor onDrop={onDrop} />
    </Box>
);
