import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Imprint — YourCabinet Pro',
};

export default function ImprintPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Imprint</h1>
      <p className="text-sm text-slate-500">Information pursuant to § 5 TMG (German Telemedia Act)</p>

      <h2>Company</h2>
      <p>
        DeFctory GmbH<br />
        Musterstraße 42<br />
        10115 Berlin<br />
        Germany
      </p>

      <h2>Represented by</h2>
      <p>Managing Director: Max Mustermann</p>

      <h2>Contact</h2>
      <p>
        Phone: +49 (0) 30 123 456 78<br />
        Email: info@defctory.de<br />
        Website: <a href="https://defctory.de">https://defctory.de</a>
      </p>

      <h2>Commercial Register</h2>
      <p>
        Registered at: Amtsgericht Charlottenburg (Berlin)<br />
        Registration number: HRB 123456 B
      </p>

      <h2>VAT Identification Number</h2>
      <p>
        VAT ID pursuant to § 27a UStG: DE 123 456 789
      </p>

      <h2>Responsible for Content</h2>
      <p className="text-sm text-slate-500">
        Pursuant to § 55 (2) RStV (German Interstate Broadcasting Treaty)
      </p>
      <p>
        Max Mustermann<br />
        DeFctory GmbH<br />
        Musterstraße 42<br />
        10115 Berlin
      </p>

      <h2>EU Online Dispute Resolution</h2>
      <p>
        The European Commission provides a platform for online dispute resolution (ODR):{' '}
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
          https://ec.europa.eu/consumers/odr
        </a>.<br />
        We are not willing or obliged to participate in dispute resolution proceedings before a consumer
        arbitration board.
      </p>

      <h2>Liability for Content</h2>
      <p>
        As a service provider, we are responsible for our own content on these pages in accordance with
        § 7 (1) TMG. However, according to §§ 8–10 TMG, we are not obligated to monitor transmitted or
        stored third-party information or to investigate circumstances that indicate unlawful activity.
        Obligations to remove or block the use of information under general law remain unaffected.
        Liability in this regard is only possible from the point in time at which we become aware of a
        specific legal violation. Upon becoming aware of such violations, we will remove the content
        immediately.
      </p>

      <h2>Liability for Links</h2>
      <p>
        Our website contains links to external third-party websites over whose content we have no
        influence. We therefore cannot accept any liability for this external content. The respective
        provider or operator of the linked pages is always responsible for their content. The linked
        pages were checked for possible legal violations at the time of linking. No illegal content was
        discernible at the time of linking. Permanent monitoring of the linked pages' content is not
        reasonable without concrete evidence of a legal violation. Upon becoming aware of legal
        violations, we will remove such links immediately.
      </p>

      <h2>Copyright</h2>
      <p>
        The content and works on these pages created by the site operators are subject to German
        copyright law. Duplication, processing, distribution, and any form of commercialization of such
        material beyond the scope of copyright law require the prior written consent of the respective
        author or creator. Downloads and copies of this site are only permitted for private,
        non-commercial use.
      </p>
    </article>
  );
}
