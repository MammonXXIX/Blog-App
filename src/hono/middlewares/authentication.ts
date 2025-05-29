import { createClient } from '@/utils/supabase/server';
import { PrismaClient } from '@prisma/client';
import { MiddlewareHandler } from 'hono';

const authentication: MiddlewareHandler = async (c, next) => {
    const supabase = await createClient();
    const prisma = new PrismaClient();

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return c.json({ message: 'Unauthorized' }, 401);

    const user = await prisma.user.findUnique({ where: { id: authData.user.id } });

    c.set('user', user);
    await next();
};

export { authentication };
