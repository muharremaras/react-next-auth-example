import { Provider } from 'next-auth/client'

export default function App({ Component, pageProps }) {
    return (
        <Provider
            options={{
                clientMaxAge: 1 * 1 * 5 * 60,
                keepAlive: 1 * 1 * 1 * 60
            }}
            session={pageProps.session} >
            <Component {...pageProps} />
        </Provider>
    );
}