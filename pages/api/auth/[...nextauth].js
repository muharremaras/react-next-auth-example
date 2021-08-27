import NextAuth from "next-auth";
import Providers from "next-auth/providers";

async function refreshAccessToken(token) {
  try {
    // Api'ye git

    return {
      ...token,
      accessToken: "elma" + (Math.random() * 100),
      refreshToken: "armut" + (Math.random() * 100),
      accessTokenExpires: Math.now() + 5 * 1000,
      refresh: true
    }
  }
  catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
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
        // api'ye git

        const user = {
          name: "Muharrem",
          email: "muharrem.aras@trtworld.com",
          accessToken: "elma",
          refreshToken: "armut",
          image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Gentile_Bellini_003.jpg/800px-Gentile_Bellini_003.jpg",
          customField: "custom added field",
          accessTokenExpires: Date.now() + 5 * 1000
        };

        return Promise.resolve(user);
      }
    }),
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
    encryption: true,
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
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = user.accessTokenExpires;
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