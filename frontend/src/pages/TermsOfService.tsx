import React from "react";

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">
          Last updated: January 2026
        </p>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Introduction</h2>
          <p>
            Welcome to FinalCast. These Terms of Service govern your access to
            and use of our website, products, and services. By accessing or
            using our platform, you agree to be bound by these terms.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Eligibility</h2>
          <p>
            You must be at least 13 years old to use our services. By using
            FinalCast, you represent and warrant that you meet this requirement
            and have the legal capacity to enter into these terms.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Account Responsibilities</h2>
          <p className="mb-2">
            When creating an account, you agree to:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Provide accurate and complete information.</li>
            <li>Maintain the security of your account credentials.</li>
            <li>Notify us immediately of any unauthorized use of your account.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Acceptable Use</h2>
          <p className="mb-2">
            You agree not to misuse the platform. Prohibited activities include,
            but are not limited to:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Violating any applicable laws or regulations.</li>
            <li>Uploading malicious code or attempting to disrupt the service.</li>
            <li>Infringing upon the rights of others.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Intellectual Property</h2>
          <p>
            All content, trademarks, logos, and software on the platform are the
            property of FinalCast or its licensors. You may not copy, modify, or
            distribute any content without prior written permission.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">
            Limitation of Liability
          </h2>
          <p>
            To the fullest extent permitted by law, FinalCast shall not be
            liable for any indirect, incidental, or consequential damages
            arising out of your use of the platform.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Termination</h2>
          <p>
            We reserve the right to suspend or terminate your access to the
            platform at any time, without prior notice, if you violate these
            Terms of Service.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Changes to These Terms</h2>
          <p>
            We may update these Terms of Service from time to time. Any changes
            will be effective immediately upon posting on this page.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Contact Us</h2>
          <p>
            If you have any questions about these Terms of Service, please
            contact us at{" "}
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
          By using FinalCast, you acknowledge that you have read, understood,
          and agreed to these Terms of Service.
        </p>
      </div>
    </main>
  );
}
