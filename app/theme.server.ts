import { createThemeSessionResolver } from 'remix-themes';
import invariant from 'tiny-invariant';

import { createCookieSessionStorage } from '@remix-run/node';

invariant(process.env.SESSION_SECRET, 'SESSION_SECRET must be set');

const themeSessionStorage = createCookieSessionStorage({
	cookie: {
		name: 'theme',
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secrets: [process.env.SESSION_SECRET],
		secure: process.env.NODE_ENV === 'production',
	},
});

export const themeSessionResolver =
	createThemeSessionResolver(themeSessionStorage);
