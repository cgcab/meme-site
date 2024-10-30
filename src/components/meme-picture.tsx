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
    onUpdateTexts?: (updatedTexts: { content: string; x: number; y: number }[]) => void;
    dataTestId?: string;
};

const REF_WIDTH = 800;
const REF_HEIGHT = 450;
const REF_FONT_SIZE = 36;

export const MemePicture: React.FC<MemePictureProps> = ({
    pictureUrl,
    texts: initialTexts,
    onUpdateTexts,
    dataTestId = '',
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const dimensions = useDimensions(containerRef, true);
    const boxWidth = dimensions?.borderBox.width;

    const isEditable = !!onUpdateTexts;

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
                x: (isEditable ? 1 : scaleFactor) * text.x,
                y: (isEditable ? 1 : scaleFactor) * text.y,
            })),
        };
    }, [isEditable, boxWidth, initialTexts]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDragStop = (index: number, _: any, data: { x: number; y: number }) => {
        if (!boxWidth) {
            return;
        }

        const updatedTexts = texts.map((text, i) =>
            i === index
                ? {
                      ...text,
                      x: data.x,
                      y: data.y,
                  }
                : text,
        );
        onUpdateTexts?.(updatedTexts);
    };

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
            {texts.map((text, index) => {
                return (
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
                                onStop={(e, data) => handleDragStop(index, e, data)}
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
                );
            })}
        </Box>
    );
};
