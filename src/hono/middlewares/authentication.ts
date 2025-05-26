import { createClient } from '@/utils/supabase/server';
import { MiddlewareHandler } from 'hono';

const authentication: MiddlewareHandler = async (c, next) => {
    const supabase = await createClient();

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
        return c.json({ message: 'Unauthorized' }, 401);
    }

    c.set('user', authData.user);
    await next();
};

export { authentication };
