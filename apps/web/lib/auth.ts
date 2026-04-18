import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * SERVER-SIDE: Returns the current user's Clerk ID, or null when unauthenticated.
 * Safe to call from Server Actions and API route handlers.
 */
export async function getUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * SERVER-SIDE: Returns the full Clerk user object for the current request.
 * Clerk caches this within the request so calling it multiple times is free.
 */
export async function getFullUser() {
  return currentUser();
}
