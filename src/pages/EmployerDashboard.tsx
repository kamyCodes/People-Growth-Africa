import SEO from '../components/SEO';
import RequireAuth from '../components/RequireAuth';
import DashboardPanel from '../components/DashboardPanel';
import { useAuth } from '../hooks/useAuth';
import { needLabel, type AuthUser, type EmployerProfile } from '../lib/authClient';

function employerProfile(user: AuthUser | null): EmployerProfile | null {
  if (!user || user.role !== 'employer') return null;
  const profile = user.profile;
  return profile && 'company' in profile ? profile : null;
}

export default function EmployerDashboard() {
  const { user } = useAuth();
  const profile = employerProfile(user);

  return (
    <>
      <SEO
        title="Your employer dashboard"
        description="Your People Growth Africa employer account."
        url="/employer/dashboard"
      />
      <RequireAuth role="employer">
        <DashboardPanel
          eyebrow="Employer account"
          title={`Hello ${profile?.name ?? user?.name ?? 'there'}`}
          intro="This is the brief our advisory team works from when you ask for talent or a consultation."
          details={[
            { label: 'Contact person', value: profile?.name ?? 'Not set' },
            { label: 'Email', value: user?.email ?? 'Not set' },
            { label: 'Company or organisation', value: profile?.company ?? 'Not set' },
            {
              label: 'What you need',
              value: profile?.needs?.length
                ? profile.needs.map((need) => needLabel(need)).join(', ')
                : 'Not set',
            },
          ]}
        />
      </RequireAuth>
    </>
  );
}
