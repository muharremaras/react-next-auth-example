import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/client';

export default function Page() {
    const [mail, setMail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginStarted, setIsLoginStarted] = useState(false);
    const [loginError, setLoginError] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (router.query.error) {
            setLoginError(router.query.error);
            setMail(router.query.email);
        }
    }, [router]);

    const handleLogin = (e) => {
        const callbackUrl = router.query.callbackUrl === undefined ? window.location.origin : router.query.callbackUrl;

        e.preventDefault();
        setIsLoginStarted(true);

        signIn('credentials',
            {
                mail,
                password,
                callbackUrl
            }
        );
    }

    const handleGoogleLogin = (e) => {
        const callbackUrl = router.query.callbackUrl === undefined ? window.location.origin : router.query.callbackUrl;

        e.preventDefault();

        signIn('google',
            {
                callbackUrl: callbackUrl
            }
        );
    }

    return (
        <div>
            <span>{loginError}</span>

            <form onSubmit={(e) => handleLogin(e)}>
                <input type="email" value={mail || ''} onChange={(e) => setMail(e.target.value)} />
                <input type="password" value={password || ''} onChange={(e) => setPassword(e.target.value)} />
                <button type='submit' disabled={isLoginStarted || false}>login</button>
                <br /><br /><br />
                <button type='submit' onClick={(e) => handleGoogleLogin(e)}>google</button>
            </form>
        </div>
    );
}
