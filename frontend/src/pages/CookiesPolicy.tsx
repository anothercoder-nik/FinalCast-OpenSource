import React from "react";

export default function CookiesPolicy() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold mb-6">Cookies Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2026</p>
        
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">What Are Cookies?</h2>
          <p className="mb-2">
            Cookies are small text files that are placed on your device by websites you visit. They are widely used to make websites work more efficiently, as well as to provide information to the owners of the site.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">How We Use Cookies</h2>
          <p className="mb-2">
            We use cookies to improve your experience on our website, including:
          </p>
          <ul className="list-disc list-inside mb-2 space-y-1">
            <li>Keeping you signed in and managing your session.</li>
            <li>Remembering your preferences and settings.</li>
            <li>Analyzing site traffic and performance to improve our services.</li>
            <li>Delivering personalized content and recommendations.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Types of Cookies We Use</h2>
          <ul className="list-disc list-inside mb-2 space-y-1">
            <li><strong>Essential Cookies:</strong> Required for the website to function properly.</li>
            <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with the site.</li>
            <li><strong>Functional Cookies:</strong> Remember your preferences and improve user experience.</li>
            <li><strong>Advertising Cookies:</strong> Track browsing activity to show relevant ads (if applicable).</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Your Cookie Choices</h2>
          <p className="mb-2">
            Most browsers automatically accept cookies, but you can usually modify your browser settings to decline cookies if you prefer. Please note that some parts of the site may not function properly if cookies are disabled.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Third-Party Cookies</h2>
          <p className="mb-2">
            Some cookies on our website may be set by third parties (for example, analytics services or embedded content providers). These cookies are subject to the respective third-party privacy policies.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">More Information</h2>
          <p className="mb-2">
            If you have any questions about our use of cookies, please contact us at 
            <a href="mailto:support@finalcast.com" className="text-primary underline"> support@finalcast.com</a>.
          </p>
        </section>

        <p className="text-sm text-muted-foreground mt-12">
          By continuing to use our website, you agree to the use of cookies as described in this Cookies Policy.
        </p>
      </div>
    </main>
  );
}
