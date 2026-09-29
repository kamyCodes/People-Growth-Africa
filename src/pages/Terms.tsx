import { Link } from 'react-router-dom';
import LegalPage from '../components/LegalPage';

export default function Terms() {
  return (
    <LegalPage
      title="Terms of use"
      description="The rules for using a People Growth Africa account, what we promise and what we do not."
      url="/terms"
      updated="29 September 2026"
      intro="These terms cover the accounts people create on this website. They are written in plain language so you can tell what you are agreeing to before you tick the box."
    >
      <div>
        <h2>Your account</h2>
        <ul>
          <li>You must be 18 or older to create an account.</li>
          <li>Give accurate details. Employers rely on talent profiles being truthful.</li>
          <li>
            Keep your password to yourself. You are responsible for what happens through your account
            until you log out everywhere or delete it.
          </li>
          <li>
            One account per person, and one employer account per organisation. Choose the correct
            account type, because the two see different things.
          </li>
          <li>
            Tell us at once if you think someone else has your password, by resetting it and then
            using log out on all devices.
          </li>
        </ul>
      </div>

      <div>
        <h2>What we provide</h2>
        <p>
          We match talent profiles with employers who are hiring, and we prepare consultations from
          what an employer tells us their organisation needs. Creating an account does not guarantee
          an interview, a placement or a consultation, and we do not promise any particular outcome.
        </p>
      </div>

      <div>
        <h2>Acceptable use</h2>
        <p>Do not use the site or your account to:</p>
        <ul>
          <li>post anything false, misleading or unlawful about yourself or an organisation;</li>
          <li>harass, discriminate against or mislead other people, including in a hiring decision;</li>
          <li>
            scrape, resell or bulk copy talent details, or share them outside your organisation
            without our written permission;
          </li>
          <li>
            break into, overload or probe the service, including by trying to guess passwords or work
            around the rate limits.
          </li>
        </ul>
        <p>
          We may suspend or delete an account that breaks these rules. We will say why unless doing so
          would put someone else at risk or break the law.
        </p>
      </div>

      <div>
        <h2>Your content</h2>
        <p>
          The details you put in your profile stay yours. You give us permission to store and show
          them to the employers or talent we are matching, and to use them to prepare a consultation.
          That permission ends when you delete the account, apart from records we must keep for legal
          or security reasons.
        </p>
      </div>

      <div>
        <h2>Privacy</h2>
        <p>
          What we collect, why, and how to delete it is set out in the{' '}
          <Link to="/privacy">privacy policy</Link>, which forms part of these terms.
        </p>
      </div>

      <div>
        <h2>Ending your use</h2>
        <p>
          You can delete your account at any time from your dashboard, and it takes effect
          immediately. We may close an account that breaks these terms, that we are legally required
          to close, or that has been inactive for a long period, and we will give notice by email
          where we can.
        </p>
      </div>

      <div>
        <h2>Limits of our responsibility</h2>
        <p>
          We run the service with reasonable care, but we provide it as it is. We are not responsible
          for hiring decisions made by an employer, for the accuracy of details another user
          supplied, or for indirect losses. Nothing here limits rights you have under Nigerian law
          that cannot be limited by agreement.
        </p>
      </div>

      <div>
        <h2>Changes to these terms</h2>
        <p>
          We may update these terms as the service changes. The date at the top shows the current
          version, and if a change materially affects you we will email account holders. Continuing to
          use the account after a change means you accept it.
        </p>
      </div>

      <div>
        <h2>Contact and governing law</h2>
        <p>
          Questions about these terms go to{' '}
          <a href="mailto:hello@peoplegrowthafrica.com">hello@peoplegrowthafrica.com</a>. These terms
          are governed by the laws of the Federal Republic of Nigeria.
        </p>
      </div>
    </LegalPage>
  );
}
