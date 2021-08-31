import NextAuth from "next-auth";
import Providers from "next-auth/providers";

async function refreshAccessToken(token) {
  if (token.provider === 'credentials') {
    // GO REFRESH TOKEN API
    try {
      return {
        ...token,
        accessToken: "apple-" + (Math.random() * 100),
        refreshToken: "pear-" + (Math.random() * 100),
        accessTokenExpires: Date.now() + 60 * 60 * 1000,
        refresh: true
      }
    }
    catch (error) {
      return {
        ...token,
        error: "RefreshAccessTokenError"
      };
    }
  }

  if (token.provider === 'google') {
    try {
      const url =
        "https://oauth2.googleapis.com/token?" +
        new URLSearchParams({
          client_id: process.env.GOOGLE_ID,
          client_secret: process.env.GOOGLE_SECRET,
          grant_type: "refresh_token",
          refresh_token: token.refreshToken,
        });

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST"
      });

      const refreshedTokens = await response.json();

      if (!response.ok) {
        throw refreshedTokens;
      }

      return {
        ...token,
        accessToken: refreshedTokens.access_token,
        accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
        refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
      };
    } catch (error) {
      return {
        ...token,
        error: "RefreshAccessTokenError"
      };
    }
  }
}

export default NextAuth({
  providers: [
    Providers.Credentials({
      name: 'Credentials',
      credentials: {
        mail: { label: "E-mail", type: "text", placeholder: "john@doe.com" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        // GO LOGIN API with credentials

        const user = {
          name: "John Doe",
          email: "john@doe.com",
          accessToken: "apple",
          refreshToken: "pear",
          image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Gentile_Bellini_003.jpg/800px-Gentile_Bellini_003.jpg",
          customField: "custom added field",
          accessTokenExpires: Date.now() + 60 * 60 * 1000
        };

        return Promise.resolve(user);
      }
    }),
    Providers.Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth?prompt=consent&access_type=offline&response_type=code'
    })
  ],

  // The secret should be set to a reasonably long random string.
  // It is used to sign cookies and to sign and encrypt JSON Web Tokens, unless
  // a separate secret is defined explicitly for encrypting the JWT.
  secret: process.env.SECRET,
  session: {
    jwt: true,
    maxAge: 1 * 1 * 60 * 60
  },

  // JSON Web tokens are only used for sessions if the `jwt: true` session
  // option is set - or by default if no database is specified.
  // https://next-auth.js.org/configuration/options#jwt
  jwt: {
    secret: process.env.SECRET,
    encryption: true
    // You can define your own encode/decode functions for signing and encryption
    // if you want to override the default behaviour.
    // encode: async ({ secret, token, maxAge }) => {},
    // decode: async ({ secret, token, maxAge }) => {},
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/login',
    // verifyRequest: '/auth/verify-request', // Used for check email page
    // newUser: null // If set, new users will be directed here on first sign in
  },
  callbacks: {
    async jwt(token, user, account) {
      if (user && account) {
        if (account.id === 'credentials') {
          token.accessToken = user.accessToken;
          token.refreshToken = user.refreshToken;
          token.accessTokenExpires = user.accessTokenExpires;
          token.provider = account.id;
        }

        if (account.provider === 'google') {
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
          token.accessTokenExpires = Date.now() + user.expires_in * 1000;
          token.provider = account.provider;
        }

        token.refresh = false;
        token.user = user;

        return Promise.resolve(token);
      }

      if (Date.now() < token.accessTokenExpires) {
        return Promise.resolve(token);
      }

      return refreshAccessToken(token);
    },
    async session(session, token) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.provider = token.provider;
      session.accessTokenExpires = token.accessTokenExpires;
      session.error = token.error;

      if (!token.refresh) {
        session.user = token.user;
      }

      return Promise.resolve(session);
    }
  },
  debug: false
});