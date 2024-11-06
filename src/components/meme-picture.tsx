import { Box, Text, useDimensions } from '@chakra-ui/react';
import React, { useMemo, useRef } from 'react';
import Draggable from 'react-draggable';

export type MemePictureProps = {
    pictureUrl: string;
    texts: {
        content: string;
        x: number;
        y: number;
    }[];
    onDragStop?: (index: number, x: number, y: number) => void;
    dataTestId?: string;
};

const REF_WIDTH = 800;
const REF_HEIGHT = 450;
const REF_FONT_SIZE = 36;

export const MemePicture: React.FC<MemePictureProps> = ({
    pictureUrl,
    texts: initialTexts,
    onDragStop,
    dataTestId = '',
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const dimensions = useDimensions(containerRef, true);
    const boxWidth = dimensions?.borderBox.width;

    const isEditable = !!onDragStop;

    const { height, fontSize, texts } = useMemo(() => {
        if (!boxWidth) {
            return { height: 0, fontSize: 0, texts: initialTexts };
        }

        const scaleFactor = boxWidth / REF_WIDTH;
        return {
            height: scaleFactor * REF_HEIGHT,
            fontSize: scaleFactor * REF_FONT_SIZE,
            texts: initialTexts.map((text) => ({
                ...text,
                x: scaleFactor * text.x,
                y: scaleFactor * text.y,
            })),
        };
    }, [boxWidth, initialTexts]);

    return (
        <Box
            width="full"
            height={height}
            ref={containerRef}
            backgroundImage={pictureUrl}
            backgroundColor="gray.100"
            backgroundPosition="center"
            backgroundRepeat="no-repeat"
            backgroundSize="contain"
            overflow="hidden"
            position="relative"
            borderRadius={8}
            data-testid={dataTestId}
        >
            {texts.map((text, index) => (
                <React.Fragment key={index}>
                    {!isEditable ? (
                        <Text
                            position="absolute"
                            left={text.x}
                            top={text.y}
                            fontSize={fontSize}
                            color="white"
                            fontFamily="Impact"
                            fontWeight="bold"
                            userSelect="none"
                            textTransform="uppercase"
                            style={{ WebkitTextStroke: '1px black' }}
                            data-testid={`${dataTestId}-text-${index}`}
                        >
                            {text.content}
                        </Text>
                    ) : (
                        <Draggable
                            bounds="parent"
                            position={{ x: text.x, y: text.y }}
                            onStop={(_, data) => {
                                if (boxWidth) {
                                    const scaleFactor = boxWidth / REF_WIDTH;
                                    onDragStop?.(index, data.x / scaleFactor, data.y / scaleFactor);
                                }
                            }}
                        >
                            <Text
                                fontSize={fontSize}
                                color="white"
                                fontFamily="Impact"
                                fontWeight="bold"
                                userSelect="none"
                                textTransform="uppercase"
                                position="absolute"
                                style={{ WebkitTextStroke: '1px black', cursor: 'move' }}
                                data-testid={`${dataTestId}-text-${index}`}
                            >
                                {text.content}
                            </Text>
                        </Draggable>
                    )}
                </React.Fragment>
            ))}
        </Box>
    );
};
