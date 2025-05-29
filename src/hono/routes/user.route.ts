import { Hono } from 'hono';
import { AuthenticationContext } from '../context/hono';

const userRoute = new Hono();

userRoute.get('/currentUser', async (c: AuthenticationContext) => {
    const user = c.get('user');

    try {
        if (user) {
            return c.json({ message: 'Get Current User Successfully', user: user }, 200);
        }
    } catch (error) {
        return c.json({ error: error instanceof Error ? error.message : 'Server Internal Error' }, 500);
    }
});

export default userRoute;
