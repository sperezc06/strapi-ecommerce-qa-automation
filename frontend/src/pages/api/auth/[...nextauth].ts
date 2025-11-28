import NextAuth, { User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { signInWithCredential, signInWithProviders } from "@/services/auth";
import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_KEY as string,
      clientSecret: process.env.GOOGLE_SECRET_KEY as string,
    }),
    CredentialsProvider({
      name: "Sign in with Email",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        /**
         * This function is used to define if the user is authenticated or not.
         * If authenticated, the function should return an object contains the user data.
         * If not, the function should return `null`.
         */
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        /**
         * credentials is defined in the config above.
         * We can expect it contains two properties: `email` and `password`
         */
        try {
          const response = await signInWithCredential({
            email: credentials.email,
            password: credentials.password,
          });

          if (response && response.user && response.jwt) {
            const userId = typeof response.user.id === 'number' 
              ? response.user.id.toString() 
              : response.user.id;
            
            return {
              id: userId,
              email: response.user.email,
              name: response.user.name || response.user.username || response.user.email,
              jwt: response.jwt,
            };
          } else {
            console.error('Invalid response from auth service:', response);
            return null;
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          // Sign In Fail - Log error for debugging
          console.error('NextAuth login error:', {
            message: error?.message,
            response: error?.response?.data,
            stack: error?.stack,
          });
          
          // Return null instead of throwing to show proper error message
          // NextAuth will handle the null return and show error
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // The session callback is called whenever a session is checked.
    // By default, only a subset of the token is returned for increased security.
    session: async ({ session, token }: { session: Session; token: JWT }) => {
      // Send properties to the client, like an access_token from a provider.
      session.id = token.id;
      session.jwt = token.jwt;
      return Promise.resolve(session);
    },

    // This callback is called whenever a JSON Web Token is created (i.e. at sign in)
    // or updated (i.e whenever a session is accessed in the client).
    // TODO: CHECKING IF USER IS BLOCKED OR NOT
    jwt: async ({
      token,
      user,
      account,
    }: {
      token: JWT;
      user: User;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      account: any;
    }) => {
      // Persist the OAuth access_token to the token right after signin
      const isSignIn = user ? true : false;

      if (isSignIn) {
        // If provider credential. just set the user id and jwt token because its already fetched
        if (account?.provider === "credentials") {
          token.id = user.id;
          token.jwt = user.jwt;
        }
        // else, you need to fetch to the backend with the access token
        else {
          const response = await signInWithProviders({
            provider: account?.provider,
            access_token: account?.access_token,
          });

          if (response) {
            console.log(response, "as");

            token.id = response.data.user?.id ? String(response.data.user.id) : undefined;
            token.jwt = response.data.jwt;
          }
        }
      }

      return Promise.resolve(token);
    },
  },
  pages: {
    signIn: "/login",
  },
});
