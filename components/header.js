import { useEffect } from 'react';
import { signOut, useSession } from 'next-auth/client';

export default function Header() {
    const [session, loading] = useSession();

    const handleLogout = (e) => {
        e.preventDefault();

        signOut({
            callbackUrl: e.target.href
        });
    }

    useEffect(() => {
        if (session?.error === "RefreshAccessTokenError") {
            signOut({
                callbackUrl: `${window.location.origin}/login?callbackUrl=${window.location.href}`
            });
        }
    }, [session]);

    if (typeof window === 'undefined' || loading || session?.error) return <header>loading...</header>;

    return (
        <header>
            <h2>Header</h2>
            <p>
                {!session && <>
                    <span>You are not signed in</span>
                    <br />
                    <a href={"/login?callbackUrl=" + window.location.href}>Sign in</a>
                </>}
                {session && <>
                    {session.user.image && <img src={session.user.image} width={50} />}
                    <br />
                    <span>
                        <small>Signed in as</small><br />
                        <strong>{session.user.name}</strong>
                    </span>
                    <br />
                    <a href="/logout" onClick={(e) => handleLogout(e)}>Sign out</a>
                </>}
            </p>
        </header>
    );
}