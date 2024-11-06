import { useDropzone } from 'react-dropzone';
import { MemePicture, MemePictureProps } from './meme-picture';
import { AspectRatio, Box, Button, Flex, Icon, Text } from '@chakra-ui/react';
import { Image, Pencil } from '@phosphor-icons/react';
import { stringsRes } from '../resources/strings';

export type MemeEditorProps = {
    onDrop: (file: File) => void;
    memePicture?: MemePictureProps | undefined;
    onDragStop?: (index: number, x: number, y: number) => void;
};

function renderNoPicture() {
    return (
        <Flex flexDir="column" width="full" height="full" alignItems="center" justifyContent="center">
            <Icon as={Image} color="black" boxSize={16} />
            <Text>{stringsRes.editor.selectPicture}</Text>
            <Text color="gray.400" fontSize="sm">
                {stringsRes.editor.dropPicture}
            </Text>
        </Flex>
    );
}

function renderMemePicture(
    memePicture: MemePictureProps,
    open: () => void,
    onDragStop?: (index: number, x: number, y: number) => void,
) {
    return (
        <Box
            width="full"
            height="full"
            position="relative"
            __css={{
                '&:hover .change-picture-button': {
                    display: 'inline-block',
                },
                '& .change-picture-button': {
                    display: 'none',
                },
            }}
        >
            <MemePicture {...memePicture} onDragStop={onDragStop} />
            <Button
                className="change-picture-button"
                leftIcon={<Icon as={Pencil} boxSize={4} />}
                colorScheme="cyan"
                color="white"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                position="absolute"
                onClick={open}
            >
                {stringsRes.editor.changePicture}
            </Button>
        </Box>
    );
}

export const MemeEditor: React.FC<MemeEditorProps> = ({ onDrop, memePicture, onDragStop }) => {
    const { getRootProps, getInputProps, open } = useDropzone({
        onDrop: (files: File[]) => {
            if (files.length === 0) {
                return;
            }
            onDrop(files[0]);
        },
        noClick: memePicture !== undefined,
        accept: { 'image/png': ['.png'], 'image/jpg': ['.jpg'] },
    });

    return (
        <AspectRatio ratio={16 / 9}>
            <Box
                {...getRootProps()}
                width="full"
                position="relative"
                border={!memePicture ? '1px dashed' : undefined}
                borderColor="gray.300"
                borderRadius={9}
                px={1}
            >
                <input {...getInputProps()} />
                {memePicture ? renderMemePicture(memePicture, open, onDragStop) : renderNoPicture()}
            </Box>
        </AspectRatio>
    );
};
