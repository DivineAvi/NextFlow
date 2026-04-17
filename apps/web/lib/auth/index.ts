import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * SERVER-SIDE: Get the current user ID or null.
 * Use this in Server Actions or API routes.
 */
export const getUserId = async () => {
  const { userId } = await auth();
  return userId;
};

/**
 * SERVER-SIDE: Get full user profile.
 * High-performance: Clerk caches this within the request.
 */
export const getFullUser = async () => {
  return await currentUser();
};