import SEO from '../components/SEO';
import RequireAuth from '../components/RequireAuth';
import DashboardPanel from '../components/DashboardPanel';
import { useAuth } from '../hooks/useAuth';
import { availabilityLabel, type AuthUser, type TalentProfile } from '../lib/authClient';

function talentProfile(user: AuthUser | null): TalentProfile | null {
  if (!user || user.role !== 'talent') return null;
  const profile = user.profile;
  return profile && 'field' in profile ? profile : null;
}

export default function TalentDashboard() {
  const { user } = useAuth();
  const profile = talentProfile(user);

  return (
    <>
      <SEO
        title="Your talent dashboard"
        description="Your People Growth Africa talent profile."
        url="/talent/dashboard"
      />
      <RequireAuth role="talent">
        <DashboardPanel
          eyebrow="Talent account"
          title={`Hello ${profile?.name ?? user?.name ?? 'there'}`}
          intro="This is the profile employers see when we match talent with open roles."
          details={[
            { label: 'Full name', value: profile?.name ?? 'Not set' },
            { label: 'Email', value: user?.email ?? 'Not set' },
            { label: 'Field or main skill', value: profile?.field ?? 'Not set' },
            { label: 'Country', value: profile?.country ?? 'Not set' },
            { label: 'Availability', value: availabilityLabel(profile?.availability ?? null) },
          ]}
        />
      </RequireAuth>
    </>
  );
}
