import { Box, Heading, Textarea } from '@chakra-ui/react';
import { stringsRes } from '../resources/strings';

type DescriptionSectionProps = {
    description: string;
    setDescription: (description: string) => void;
};

// Creator description section component
export const DescriptionSection = ({ description, setDescription }: DescriptionSectionProps) => (
    <Box>
        <Heading as="h2" size="md" mb={2}>
            {stringsRes.create.describeMeme}
        </Heading>
        <Textarea
            placeholder={stringsRes.create.describeMemePlaceholder}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
        />
    </Box>
);
