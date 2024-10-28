import { Flex, FormControl, FormLabel, Heading, Text, Input, Button, FormErrorMessage } from '@chakra-ui/react';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, Navigate } from '@tanstack/react-router';
import { SubmitHandler, useForm } from 'react-hook-form';
import { login, UnauthorizedError } from '../api';
import { useAuthentication } from '../contexts/authentication';
import { stringsRes } from '../resources/strings';

type SearchParams = {
    redirect?: string;
};

type Inputs = {
    username: string;
    password: string;
};

function renderError(error: Error) {
    if (error instanceof UnauthorizedError) {
        return <FormErrorMessage>{stringsRes.login.wrongCredentials}</FormErrorMessage>;
    }
    return <FormErrorMessage>{stringsRes.login.unknownError}</FormErrorMessage>;
}

export const LoginPage: React.FC = () => {
    const { redirect } = Route.useSearch();
    const { state, authenticate } = useAuthentication();
    const { mutate, isPending, error } = useMutation({
        mutationFn: (data: Inputs) => login(data.username, data.password),
        onSuccess: ({ jwt }) => authenticate(jwt),
    });
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Inputs>({
        defaultValues: { username: 'MemeMaster', password: 'password' }, //TODO: for Testing only
    });

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        mutate(data);
    };

    if (state.isAuthenticated) {
        return <Navigate to={redirect ?? '/'} />;
    }

    return (
        <Flex height="100vh" width="full" alignItems="center" justifyContent="center">
            <Flex
                direction="column"
                bgGradient="linear(to-br, cyan.100, cyan.200)"
                p={8}
                borderRadius="md"
                boxShadow="lg"
            >
                <Heading as="h2" size="md" textAlign="center" mb={4}>
                    {stringsRes.login.heading}
                </Heading>
                <Text textAlign="center" mb={4}>
                    {stringsRes.login.welcomeMessage}
                </Text>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <FormControl isInvalid={!!errors.username || !!error} mb={4}>
                        <FormLabel>{stringsRes.login.usernameLabel}</FormLabel>
                        <Input
                            bg="white"
                            size="sm"
                            type="text"
                            placeholder={stringsRes.login.usernamePlaceholder}
                            {...register('username', { required: stringsRes.login.usernameRequired })}
                        />
                        {errors.username && <FormErrorMessage>{errors.username.message}</FormErrorMessage>}
                    </FormControl>
                    <FormControl isInvalid={!!errors.password || !!error} mb={4}>
                        <FormLabel>{stringsRes.login.passwordLabel}</FormLabel>
                        <Input
                            size="sm"
                            bg="white"
                            type="password"
                            placeholder={stringsRes.login.passwordPlaceholder}
                            {...register('password', { required: stringsRes.login.passwordRequired })}
                        />
                        {error && renderError(error)}
                    </FormControl>
                    <Button colorScheme="cyan" mt={4} size="sm" type="submit" width="full" isLoading={isPending}>
                        {stringsRes.login.buttonText}
                    </Button>
                </form>
            </Flex>
        </Flex>
    );
};

export const Route = createFileRoute('/login')({
    validateSearch: (search): SearchParams => ({
        redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
    }),
    component: LoginPage,
});
