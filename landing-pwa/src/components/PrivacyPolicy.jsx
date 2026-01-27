import './PrivacyPolicy.css'

export function PrivacyPolicy() {
  return (
    <div className="privacy-policy">
      <div className="privacy-container">
        <h1>Privacy Policy</h1>
        
        <div className="privacy-content">
          <section>
            <h2>1. Introduction</h2>
            <p>
              FairFare Transportation ("we," "our," or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
              when you use our rideshare platform.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            <p>We collect information that you provide directly to us, including:</p>
            <ul>
              <li>Personal identification information (name, email address, phone number)</li>
              <li>Payment information (credit card details, billing address)</li>
              <li>Location data when you use our services</li>
              <li>Driver license and vehicle information (for drivers)</li>
              <li>Communication data (messages, feedback, support requests)</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Match riders with drivers</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze trends and usage</li>
              <li>Detect, prevent, and address technical issues</li>
            </ul>
          </section>

          <section>
            <h2>4. Information Sharing and Disclosure</h2>
            <p>We may share your information in the following situations:</p>
            <ul>
              <li>With drivers/riders to facilitate ride matching</li>
              <li>With service providers who assist us in operating our platform</li>
              <li>When required by law or to protect our rights</li>
              <li>In connection with a business transfer or merger</li>
              <li>With your consent or at your direction</li>
            </ul>
          </section>

          <section>
            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your 
              personal information. However, no method of transmission over the Internet or electronic 
              storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2>6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access and receive a copy of your personal data</li>
              <li>Rectify inaccurate or incomplete data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to processing of your personal data</li>
              <li>Request restriction of processing</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section>
            <h2>7. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our platform and 
              hold certain information. You can instruct your browser to refuse all cookies or to 
              indicate when a cookie is being sent.
            </p>
          </section>

          <section>
            <h2>8. Children's Privacy</h2>
            <p>
              Our services are not intended for individuals under the age of 18. We do not knowingly 
              collect personal information from children under 18.
            </p>
          </section>

          <section>
            <h2>9. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          <section>
            <h2>10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p>
              Email: privacy@fairfaretransportation.app<br />
              Address: [Your Company Address]
            </p>
          </section>

          <div className="privacy-footer">
            <p>Last Updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}


