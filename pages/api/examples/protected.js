import { getSession } from 'next-auth/client';

export default async (req, res) => {
    const session = await getSession({ req });

    if (session) {
        res.send({ content: 'this is protected content. you can access this content because you are signed in' });
    } else {
        res.send({ error: 'you must be sign in to view the protected content on this page' });
    }
}