import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — YourCabinet Pro',
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-slate-500">Last updated: April 2026</p>

      <h2>1. Overview</h2>
      <p>
        We, DeFctory GmbH (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;), take the protection of your personal data very seriously.
        This privacy policy informs you about how we collect, process, and use your personal data when
        you visit our website and use our cabinet configurator service, in accordance with the EU General
        Data Protection Regulation (GDPR) and the German Federal Data Protection Act (BDSG).
      </p>

      <h2>2. Controller</h2>
      <p>
        DeFctory GmbH<br />
        Musterstraße 42<br />
        10115 Berlin, Germany<br />
        Email: privacy@defctory.de<br />
        Phone: +49 (0) 30 123 456 78
      </p>

      <h2>3. Data We Collect</h2>

      <h3>3.1 Automatically Collected Data</h3>
      <p>When you visit our website, our server automatically collects:</p>
      <ul>
        <li>IP address (anonymized)</li>
        <li>Date, time and duration of the visit</li>
        <li>Pages visited and referrer URL</li>
        <li>Browser type and version, operating system</li>
        <li>Device type and screen resolution</li>
      </ul>
      <p>
        This data is processed based on our legitimate interest (Art. 6 (1)(f) GDPR) to ensure the
        security and functionality of our website.
      </p>

      <h3>3.2 Account Data</h3>
      <p>
        When you register for an account, we collect your name, email address, and optionally your
        company name and phone number. This data is processed to fulfil our contract with you
        (Art. 6 (1)(b) GDPR).
      </p>

      <h3>3.3 Order and Configuration Data</h3>
      <p>
        When you create a cabinet configuration or place an order, we collect your configuration
        details, shipping address, and payment information. This processing is necessary for contract
        performance (Art. 6 (1)(b) GDPR).
      </p>

      <h2>4. Cookies</h2>
      <p>
        We use cookies and similar technologies. For details, please refer to our{' '}
        <a href="/cookies">Cookie Policy</a>.
      </p>

      <h2>5. Data Sharing</h2>
      <p>We may share your data with:</p>
      <ul>
        <li>
          <strong>Payment processors</strong> — to process your transactions securely (e.g., Stripe,
          PayPal).
        </li>
        <li>
          <strong>Shipping providers</strong> — to deliver your orders.
        </li>
        <li>
          <strong>Hosting providers</strong> — our website is hosted on servers within the EU.
        </li>
      </ul>
      <p>
        We do not sell your personal data to third parties. We do not transfer data outside the
        EU/EEA without adequate safeguards.
      </p>

      <h2>6. Data Retention</h2>
      <p>
        We retain your personal data only as long as necessary for the purposes described above, or
        as required by law (e.g., tax records are retained for 10 years pursuant to § 147 AO, business
        correspondence for 6 years pursuant to § 257 HGB).
      </p>

      <h2>7. Your Rights</h2>
      <p>Under the GDPR, you have the right to:</p>
      <ul>
        <li><strong>Access</strong> your personal data (Art. 15 GDPR)</li>
        <li><strong>Rectification</strong> of inaccurate data (Art. 16 GDPR)</li>
        <li><strong>Erasure</strong> of your data (Art. 17 GDPR)</li>
        <li><strong>Restriction</strong> of processing (Art. 18 GDPR)</li>
        <li><strong>Data portability</strong> (Art. 20 GDPR)</li>
        <li><strong>Object</strong> to processing based on legitimate interest (Art. 21 GDPR)</li>
        <li><strong>Withdraw consent</strong> at any time (Art. 7 (3) GDPR)</li>
      </ul>
      <p>
        To exercise these rights, please contact us at <a href="mailto:privacy@defctory.de">privacy@defctory.de</a>.
      </p>

      <h2>8. Right to Lodge a Complaint</h2>
      <p>
        You have the right to lodge a complaint with a supervisory authority (Art. 77 GDPR). The
        competent authority for us is:<br />
        Berliner Beauftragte für Datenschutz und Informationsfreiheit<br />
        Alt-Moabit 59–61, 10555 Berlin
      </p>

      <h2>9. Security</h2>
      <p>
        We employ appropriate technical and organizational measures to protect your data against
        unauthorized access, alteration, disclosure, or destruction. Our website uses TLS/SSL encryption
        for all data transfers.
      </p>

      <h2>10. Changes to This Policy</h2>
      <p>
        We may update this privacy policy from time to time. We will notify you of significant changes
        by posting the updated policy on this page with a revised &quot;last updated&quot; date.
      </p>
    </article>
  );
}
