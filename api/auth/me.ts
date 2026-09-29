import { endpoint, sendJson } from '../_lib/http.js';
import { requireSession } from '../_lib/current-user.js';
import { getEmployerProfile, getTalentProfile } from '../_lib/db.js';

export default endpoint({ methods: ['GET'] }, async (req, res) => {
  const user = await requireSession(req, res);

  const profile =
    user.role === 'talent' ? await getTalentProfile(user.id) : await getEmployerProfile(user.id);

  sendJson(res, 200, {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.email_verified,
      profile,
    },
  });
});
