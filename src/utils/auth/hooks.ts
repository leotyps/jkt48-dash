import { useMutation, useQuery } from '@tanstack/react-query';
import { client, Keys } from '@/api/hooks';
import { AccessToken } from './server';
import { callReturn, callDefault } from '@/utils/fetch/core';
import Router from 'next/router';

/**
 * Get discord oauth2 access token if logged in, otherwise return null
 */
async function auth() {
  try {
    return await callReturn<AccessToken>('/api/auth', {
      request: {
        method: 'GET',
      },
    });
  } catch (error) {
    // Handle the case where the user is not authenticated, or there is an error
    return null;
  }
}

export async function logout() {
  await callDefault(`/api/auth/signout`, {
    request: {
      method: 'POST',
    },
  });

  await client.invalidateQueries(Keys.login);
  await Router.push('/auth/signin');
}

type SessionResult =
  | {
      status: 'authenticated';
      session: AccessToken;
    }
  | {
      status: 'unauthenticated';
      session: null;
    }
  | {
      status: 'loading';
      session: null;
    };

export function useSession(): SessionResult {
  const { isError, isLoading, data } = useQuery(Keys.login, () => auth(), {
    retry: false, // Prevent retries if the session fetch fails (e.g., user not logged in)
    staleTime: Infinity, // Ensure the data remains in cache as long as possible
  });

  if (isLoading) {
    return {
      status: 'loading',
      session: null,
    };
  }

  if (isError || !data) {
    return {
      status: 'unauthenticated',
      session: null,
    };
  }

  return {
    status: 'authenticated',
    session: data,
  };
}

export function useAccessToken() {
  const { session } = useSession();
  return session?.access_token || null; // Return null if not authenticated
}

export function useLogoutMutation() {
  return useMutation(['logout'], () => logout());
}
