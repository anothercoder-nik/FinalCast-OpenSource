import React from "react";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">
          Last updated: January 2026
        </p>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Introduction</h2>
          <p>
            At FinalCast, we value your privacy and are committed to protecting
            your personal information. This Privacy Policy explains how we
            collect, use, disclose, and safeguard your data when you use our
            website and services.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">
            Information We Collect
          </h2>
          <p className="mb-2">
            We may collect the following types of information:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Personal Information:</strong> Name, email address, and
              account details when you register or contact us.
            </li>
            <li>
              <strong>Usage Data:</strong> Pages visited, features used, and
              interactions with the platform.
            </li>
            <li>
              <strong>Technical Data:</strong> IP address, browser type, device
              information, and operating system.
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">
            How We Use Your Information
          </h2>
          <p className="mb-2">
            We use the collected information for purposes including:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Providing and maintaining our services.</li>
            <li>Improving website performance and user experience.</li>
            <li>Communicating with you regarding updates or support.</li>
            <li>Ensuring platform security and preventing misuse.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">
            Sharing of Information
          </h2>
          <p>
            We do not sell or rent your personal data. Your information may be
            shared only with trusted third-party services that help us operate
            the platform, comply with legal obligations, or protect our rights.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to
            protect your personal information from unauthorized access,
            alteration, disclosure, or destruction.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Your Rights</h2>
          <p className="mb-2">
            Depending on your location, you may have the right to:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Access the personal data we hold about you.</li>
            <li>Request correction or deletion of your data.</li>
            <li>Withdraw consent for data processing.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">
            Changes to This Privacy Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will
            be posted on this page with an updated revision date.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy,
            please contact us at{" "}
            <a
              href="mailto:support@finalcast.com"
              className="text-primary underline"
            >
              support@finalcast.com
            </a>
            .
          </p>
        </section>

        <p className="text-sm text-muted-foreground mt-12">
          By using our website and services, you agree to the terms of this
          Privacy Policy.
        </p>
      </div>
    </main>
  );
}
