import { useEffect } from 'react';
import './PrivacyPolicy.css';

export function PrivacyPolicy() {
  useEffect(() => {
    // Set page title and meta tags
    document.title = 'Privacy Policy | FairFare';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'FairFare Privacy Policy - Learn how we collect, use, and protect your personal information.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'FairFare Privacy Policy - Learn how we collect, use, and protect your personal information.';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
  }, []);

  return (
    <div className="privacy-policy">
      <div className="privacy-container">
        <h1>Privacy Policy</h1>
        <p className="privacy-updated">
          <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="privacy-content">
          <p className="privacy-intro">
            FairFare ("FairFare", "we", "us", or "our") is committed to protecting your privacy.
            This Privacy Policy explains how your personal information is collected, used, and
            disclosed by FairFare.
          </p>

          <p className="privacy-intro">
            This Privacy Policy applies to the FairFare website and the FairFare mobile applications
            (the "Service"), including:
          </p>

          <ul>
            <li>iOS Driver App</li>
            <li>iOS Customer App</li>
            <li>Android Driver App</li>
            <li>Android Customer App</li>
          </ul>

          <p className="privacy-intro">
            By accessing or using our Service, you agree to the collection, storage, use, and disclosure
            of your personal information as described in this Privacy Policy.
          </p>

          {/* Zero Tolerance Policy Section */}
          <section className="zero-tolerance-section">
            <h2>
              🚗 Zero Tolerance Policy{' '}
              <small className="zero-tolerance-citation">
                (City of Dallas Ord. 29696; Sec. 47A-2.1.6 & 47A-2.1.7)
              </small>
            </h2>
            <div className="zero-tolerance-alert">
              <p>
                FairFare Transportation maintains an <strong>operating authority zero-tolerance policy</strong> for intoxicating substances.
                <strong> Drivers are strictly prohibited</strong> from using drugs or alcohol while providing transportation services
                or immediately before operating a vehicle.
              </p>
              <p>
                If you suspect your driver is under the influence of drugs or alcohol, <strong>end the trip immediately</strong>.
                To report a complaint to the City of Dallas, dial <strong>3-1-1</strong> (or <strong>214-670-3111</strong> from outside Dallas)
                pursuant to <strong>Ord. 29696</strong>. In an emergency, call <strong>911</strong>.
              </p>
              <p>
                Any violation of this Zero Tolerance Policy will result in <strong>immediate suspension</strong> of the driver and an internal
                investigation consistent with City of Dallas Transportation-for-Hire regulations.
              </p>
            </div>
          </section>

          <section>
            <h2>Definitions</h2>
            <div className="definitions-list">
              <p>
                <strong>Account</strong> means a unique account created to access the Service.
              </p>
              <p>
                <strong>Personal Data</strong> means any information relating to an identifiable individual.
              </p>
              <p>
                <strong>Usage Data</strong> refers to data collected automatically when using the Service.
              </p>
            </div>
          </section>

          <section>
            <h2>Information We Collect</h2>

            <h3>Personal Data</h3>
            <ul>
              <li>Email address</li>
              <li>First and last name</li>
              <li>Phone number</li>
              <li>Address, city, state, ZIP/postal code</li>
            </ul>

            <h3>Usage Data</h3>
            <p>
              Usage Data may include IP address, browser type, device identifiers, pages visited,
              and diagnostic data.
            </p>
          </section>

          <section>
            <h2>Tracking Technologies</h2>
            <p>
              We use cookies, web beacons, and similar technologies to track activity on our Service
              and improve functionality.
            </p>
          </section>

          <section>
            <h2>Use of Personal Data</h2>
            <ul>
              <li>To provide and maintain the Service</li>
              <li>To manage user accounts</li>
              <li>To perform contractual obligations</li>
              <li>To communicate service-related updates</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2>Third-Party Services</h2>
            <p>
              We may share data with trusted service providers such as hosting, dispatch, mapping,
              and payment processors, solely to operate the Service.
            </p>
          </section>

          <section>
            <h2>Data Retention</h2>
            <p>
              Personal Data is retained only as long as necessary to fulfill the purposes outlined
              in this Privacy Policy and comply with legal requirements.
            </p>
          </section>

          <section>
            <h2>Deletion of Personal Data</h2>
            <p>
              Users may request deletion or transfer of their personal data by contacting us.
              Requests are handled within one month.
            </p>
          </section>

          <section>
            <h2>International Data Transfers</h2>
            <p>
              Your information may be processed outside your jurisdiction. By using the Service,
              you consent to such transfers.
            </p>
          </section>

          <section>
            <h2>Disclosure of Personal Data</h2>
            <p>
              Personal Data may be disclosed to comply with legal obligations, protect rights,
              or ensure user safety.
            </p>
          </section>

          <section>
            <h2>Security</h2>
            <p>
              We implement commercially reasonable safeguards, but no method of transmission
              or storage is 100% secure.
            </p>
          </section>

          <section>
            <h2>Links to Other Websites</h2>
            <p>
              We are not responsible for third-party websites linked from our Service.
            </p>
          </section>

          <section>
            <h2>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. Changes are effective when posted
              on this page.
            </p>
          </section>

          <section>
            <h2>Contact Us</h2>
            <p>
              Email: <a href="mailto:support@fairfaretransportation.app" className="privacy-link">support@fairfaretransportation.app</a>
              <br />
              Website: <a href="https://fairfaretransportation.app" className="privacy-link" target="_blank" rel="noopener noreferrer">https://fairfaretransportation.app</a>
            </p>
          </section>

          <div className="privacy-footer">
            <p>Last Updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
