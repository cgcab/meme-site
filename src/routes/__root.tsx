import { Flex, Heading, Button, Icon, HStack, StackDivider } from '@chakra-ui/react';
import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router';
import { AuthenticationState, useAuthentication } from '../contexts/authentication';
import { UserDropdown } from '../components/user-dropdown';
import { Plus } from '@phosphor-icons/react';
import { stringsRes } from '../resources/strings';

type RouterContext = {
    authState: AuthenticationState;
};

// Main functional component
const MainComponent = () => {
    const {
        state: { isAuthenticated },
    } = useAuthentication(); // Destructure for direct access

    return (
        <Flex direction="column" width="full" height="100vh">
            {/* Set full viewport height */}
            <Header isAuthenticated={isAuthenticated} />
            <Flex flexGrow={1} direction="column" overflowY="auto">
                {/* Make content scrollable */}
                <Outlet />
            </Flex>
        </Flex>
    );
};

// Header component
const Header = ({ isAuthenticated }: { isAuthenticated: boolean }) => (
    <Flex bgColor="cyan.600" p={2} justifyContent="space-between" boxShadow="md" position="sticky" top="0" zIndex={10}>
        <Heading size="lg" color="white" as={Link} to="/">
            {stringsRes.header.title}
        </Heading>
        {isAuthenticated && (
            <HStack alignItems="center" divider={<StackDivider borderColor="white" />}>
                <Button as={Link} size="sm" leftIcon={<Icon as={Plus} />} to="/create">
                    {stringsRes.header.createMeme}
                </Button>
                <UserDropdown />
            </HStack>
        )}
    </Flex>
);

// Define the route with the component
export const Route = createRootRouteWithContext<RouterContext>()({
    component: MainComponent,
});
