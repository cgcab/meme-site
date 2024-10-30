import { Box, Heading, Textarea } from '@chakra-ui/react';
import { stringsRes } from '../resources/strings';

// Creator description section component
export const DescriptionSection = () => (
    <Box>
        <Heading as="h2" size="md" mb={2}>
            {stringsRes.create.describeMeme}
        </Heading>
        <Textarea placeholder={stringsRes.create.describeMemePlaceholder} />
    </Box>
);
