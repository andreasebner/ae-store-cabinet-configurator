import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy — YourCabinet Pro',
};

export default function CookiesPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Cookie Policy</h1>
      <p className="text-sm text-slate-500">Last updated: April 2026</p>

      <h2>1. What Are Cookies?</h2>
      <p>
        Cookies are small text files stored on your device when you visit a website. They help the
        website remember your preferences and improve your browsing experience. Cookies may be set by
        the website you are visiting (&quot;first-party cookies&quot;) or by third-party services embedded in the
        page (&quot;third-party cookies&quot;).
      </p>

      <h2>2. How We Use Cookies</h2>
      <p>
        We use cookies and similar technologies (such as localStorage) on our website
        for the purposes described below.
      </p>

      <h3>2.1 Strictly Necessary Cookies</h3>
      <p>
        These cookies are essential for the website to function and cannot be switched off. They are
        usually set only in response to actions you take, such as setting your privacy preferences,
        logging in, or filling in forms.
      </p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Purpose</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>cart-storage</code></td>
              <td>Stores your shopping cart contents</td>
              <td>Persistent (localStorage)</td>
            </tr>
            <tr>
              <td><code>auth-storage</code></td>
              <td>Maintains your login session</td>
              <td>Persistent (localStorage)</td>
            </tr>
            <tr>
              <td><code>cookie-consent</code></td>
              <td>Stores your cookie preferences</td>
              <td>1 year</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>2.2 Functional Cookies</h3>
      <p>
        These cookies enable enhanced functionality such as remembering your last configurator project,
        preferred cabinet model, and editor settings.
      </p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Purpose</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>recent-projects</code></td>
              <td>Stores your recent configurator projects for quick access</td>
              <td>Persistent (localStorage)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>2.3 Analytics Cookies</h3>
      <p>
        We currently do not use analytics or tracking cookies. Should this change in the future, we
        will update this policy and request your consent before setting any analytics cookies.
      </p>

      <h3>2.4 Marketing Cookies</h3>
      <p>
        We do not use marketing or advertising cookies.
      </p>

      <h2>3. Managing Cookies</h2>
      <p>
        You can control and manage cookies through your browser settings. Most browsers allow you to:
      </p>
      <ul>
        <li>View which cookies are stored and delete them individually</li>
        <li>Block third-party cookies</li>
        <li>Block cookies from specific sites</li>
        <li>Block all cookies</li>
        <li>Delete all cookies when you close your browser</li>
      </ul>
      <p>
        Please note that blocking all cookies may affect the functionality of our website, particularly
        the configurator and shopping cart.
      </p>

      <h2>4. Local Storage</h2>
      <p>
        In addition to cookies, we use the browser&apos;s localStorage API to persist your configurator
        projects, cart items, and session data. This data remains on your device and is never transmitted
        to our servers unless you explicitly place an order.
      </p>

      <h2>5. Your Consent</h2>
      <p>
        When you first visit our website, you will be shown a cookie consent banner. You may choose to
        accept all cookies, only necessary cookies, or configure your preferences. You can change your
        preferences at any time by clearing your browser&apos;s cookies and revisiting the site.
      </p>

      <h2>6. Changes to This Policy</h2>
      <p>
        We may update this Cookie Policy from time to time to reflect changes in our practices or for
        operational, legal, or regulatory reasons. The updated version will be indicated by the
        &quot;last updated&quot; date at the top of this page.
      </p>

      <h2>7. Contact</h2>
      <p>
        If you have questions about our use of cookies, please contact us at{' '}
        <a href="mailto:privacy@defctory.de">privacy@defctory.de</a>.
      </p>
    </article>
  );
}
