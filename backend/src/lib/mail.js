import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Generates the welcome email HTML for a new user.
 * @param {string} name - The user's business name or display name.
 * @param {string} email - The user's email address.
 * @returns {string} - Full HTML string for the email.
 */
function buildWelcomeEmailHtml(name, email) {
  const firstName = name.split(' ')[0] || name;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Welcome to Swastik Fashion</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f2f0ec; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
  .wrap { padding: 2rem 1rem; }
  .email { max-width: 580px; margin: 0 auto; border: 0.5px solid rgba(0,0,0,.1); border-radius: 14px; overflow: hidden; }

  /* Header */
  .eml-banner { background: #8A2410; padding: 10px 28px; display: flex; align-items: center; gap: 8px; }
  .eml-banner-text { font-size: 11px; color: rgba(255,255,255,.7); letter-spacing: .04em; }
  .eml-hero { background: #B5391A; padding: 2.5rem 2rem 2rem; text-align: center; position: relative; overflow: hidden; }
  .eml-logo-outer { width: 70px; height: 70px; border-radius: 50%; border: 2px solid rgba(255,255,255,.3); display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; background: rgba(255,255,255,.1); }
  .eml-logo-inner { width: 52px; height: 52px; border-radius: 50%; background: rgba(255,255,255,.15); border: 1.5px solid rgba(255,255,255,.25); display: flex; align-items: center; justify-content: center; }
  .eml-logo-text { font-size: 22px; color: #fff; font-weight: 700; }
  .eml-co { font-size: 22px; font-weight: 600; color: #fff; letter-spacing: .04em; }
  .eml-co-sub { font-size: 11px; color: rgba(255,255,255,.65); text-transform: uppercase; letter-spacing: .12em; margin-top: 3px; }
  .eml-rule { height: 1px; background: rgba(255,255,255,.15); margin: 1.25rem 0 0; }

  /* Body */
  .eml-body { background: #ffffff; padding: 2rem 2rem 1.5rem; }
  .eml-welcome-chip { display: inline-flex; align-items: center; gap: 6px; background: #FEF3C7; border: .5px solid #FDE68A; border-radius: 20px; padding: 4px 12px; font-size: 11px; font-weight: 600; color: #92400E; text-transform: uppercase; letter-spacing: .07em; margin-bottom: 14px; }
  .eml-h1 { font-size: 24px; font-weight: 600; color: #1a1a18; line-height: 1.3; margin-bottom: 10px; }
  .eml-h1 span { color: #B5391A; }
  .eml-para { font-size: 14px; color: #5a5a56; line-height: 1.75; margin-bottom: 1.5rem; }
  .eml-cta-wrap { margin-bottom: 1.75rem; }
  .eml-cta { display: inline-flex; align-items: center; gap: 8px; background: #B5391A; color: #fff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 13px 28px; border-radius: 8px; letter-spacing: .02em; }
  .eml-cta-note { font-size: 11px; color: #9a9a94; margin-top: 8px; }
  .eml-divider { height: .5px; background: rgba(0,0,0,.08); margin: 1.5rem 0; }
  .eml-eyebrow { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .09em; color: #B5391A; margin-bottom: 12px; }

  /* Steps */
  .steps { display: flex; flex-direction: column; gap: 0; margin-bottom: 1.5rem; }
  .step { display: flex; gap: 14px; align-items: flex-start; padding: 12px 0; border-bottom: .5px solid rgba(0,0,0,.06); }
  .step:last-child { border-bottom: none; }
  .step-num { width: 28px; height: 28px; border-radius: 50%; background: #B5391A; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: #fff; flex-shrink: 0; margin-top: 1px; }
  .step-title { font-size: 13px; font-weight: 600; color: #1a1a18; margin-bottom: 2px; }
  .step-desc { font-size: 12px; color: #5a5a56; line-height: 1.55; }

  /* Feature Grid */
  .feat-table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
  .feat-td { width: 50%; padding: 5px; vertical-align: top; }
  .feat-card { background: #fafaf8; border: .5px solid rgba(0,0,0,.08); border-radius: 10px; padding: 14px; }
  .feat-icon { width: 36px; height: 36px; border-radius: 8px; background: #FEF0ED; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; font-size: 20px; }
  .feat-title { font-size: 12px; font-weight: 600; color: #1a1a18; margin-bottom: 3px; }
  .feat-desc { font-size: 11px; color: #5a5a56; line-height: 1.5; }

  /* Account Box */
  .acct-box { border-radius: 10px; overflow: hidden; border: .5px solid rgba(0,0,0,.08); margin-bottom: 1.5rem; }
  .acct-head { background: #B5391A; padding: 10px 16px; }
  .acct-head-label { font-size: 11px; font-weight: 600; color: #fff; text-transform: uppercase; letter-spacing: .08em; }
  .acct-rows { background: #fafaf8; }
  .acct-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; border-bottom: .5px solid rgba(0,0,0,.06); }
  .acct-row:last-child { border-bottom: none; }
  .acct-k { font-size: 12px; color: #5a5a56; }
  .acct-v { font-size: 12px; font-weight: 500; color: #1a1a18; }
  .badge-pending { font-size: 11px; font-weight: 600; background: #FEF3C7; color: #92400E; border: .5px solid #FDE68A; padding: 3px 10px; border-radius: 20px; }

  /* Quote */
  .eml-quote { border-left: 3px solid #B5391A; padding: 12px 16px; background: #fafaf8; margin-bottom: 1.5rem; }
  .eml-quote p { font-size: 13px; color: #5a5a56; line-height: 1.65; font-style: italic; }
  .eml-quote cite { font-size: 11px; color: #9a9a94; font-style: normal; display: block; margin-top: 6px; }

  /* Help */
  .eml-help { background: #fafaf8; border: .5px solid rgba(0,0,0,.08); border-radius: 10px; padding: 14px 16px; margin-bottom: 1.5rem; }
  .eml-help-text { font-size: 12px; color: #5a5a56; line-height: 1.6; }
  .eml-help-text a { color: #B5391A; text-decoration: none; font-weight: 500; }
  .eml-note { text-align: center; font-size: 11.5px; color: #9a9a94; line-height: 1.7; }

  /* Footer */
  .eml-footer { background: #f5f4f1; border-top: .5px solid rgba(0,0,0,.08); padding: 1.5rem 2rem; }
  .eml-footer-name { font-size: 13px; font-weight: 600; color: #1a1a18; }
  .eml-footer-tag { font-size: 10px; color: #9a9a94; text-transform: uppercase; letter-spacing: .07em; }
  .eml-footer-links { display: flex; flex-wrap: wrap; gap: 4px 14px; margin: 12px 0 10px; }
  .eml-footer-links a { font-size: 11px; color: #9a9a94; text-decoration: none; }
  .eml-footer-copy { font-size: 11px; color: #9a9a94; line-height: 1.6; }
</style>
</head>
<body>
<div class="wrap">
<div class="email">

  <!-- Header -->
  <div class="eml-banner">
    <span class="eml-banner-text">&#x2705; Secure communication from Swastik Fashion &nbsp;&middot;&nbsp; swastikfashion.com</span>
  </div>
  <div class="eml-hero">
    <div class="eml-logo-outer">
      <div class="eml-logo-inner">
        <span class="eml-logo-text">&#x25C6;</span>
      </div>
    </div>
    <div class="eml-co">Swastik Fashion</div>
    <div class="eml-co-sub">Wholesale Sarees &amp; Fabrics</div>
    <div class="eml-rule"></div>
  </div>

  <!-- Body -->
  <div class="eml-body">
    <div class="eml-welcome-chip">&#x1F389; Account created</div>

    <p class="eml-h1">Welcome to Swastik Fashion, <span>${firstName}!</span></p>
    <p class="eml-para">
      Your wholesale buyer account has been registered successfully. We&rsquo;re thrilled to welcome you to our network of trusted retailers across India.<br><br>
      Our team is reviewing your business details. You&rsquo;ll receive a confirmation within <strong style="color:#1a1a18">24 hours</strong>, after which you&rsquo;ll have full access to our exclusive catalogue and wholesale pricing.
    </p>

    <div class="eml-cta-wrap">
      <a class="eml-cta" href="https://swastikfashion.com">
        &#x1F6CD; Explore the catalogue &#x2192;
      </a>
      <p class="eml-cta-note">Available once your account is approved</p>
    </div>

    <div class="eml-divider"></div>
    <div class="eml-eyebrow">&#x2714; What happens next</div>

    <div class="steps">
      <div class="step">
        <div class="step-num">1</div>
        <div>
          <div class="step-title">Business verification</div>
          <div class="step-desc">Our team reviews your business details and GSTIN to ensure eligibility for wholesale access.</div>
        </div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div>
          <div class="step-title">Account activation email</div>
          <div class="step-desc">You&rsquo;ll receive an approval email within 24 hours with your login credentials and buyer ID.</div>
        </div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div>
          <div class="step-title">Start ordering</div>
          <div class="step-desc">Browse thousands of sarees at wholesale rates, place orders, and track them in real time.</div>
        </div>
      </div>
    </div>

    <div class="eml-divider"></div>
    <div class="eml-eyebrow">&#x2B50; What you get as a buyer</div>

    <table class="feat-table">
      <tr>
        <td class="feat-td">
          <div class="feat-card">
            <div class="feat-icon">&#x1F3F7;</div>
            <div class="feat-title">Exclusive wholesale rates</div>
            <div class="feat-desc">Prices unavailable to retail buyers, direct from the mill.</div>
          </div>
        </td>
        <td class="feat-td">
          <div class="feat-card">
            <div class="feat-icon">&#x1F69A;</div>
            <div class="feat-title">Pan-India delivery</div>
            <div class="feat-desc">Fast, fully tracked dispatch to any city in India.</div>
          </div>
        </td>
      </tr>
      <tr>
        <td class="feat-td">
          <div class="feat-card">
            <div class="feat-icon">&#x1F9FE;</div>
            <div class="feat-title">GST-compliant invoices</div>
            <div class="feat-desc">Automated tax invoices sent with every order confirmation.</div>
          </div>
        </td>
        <td class="feat-td">
          <div class="feat-card">
            <div class="feat-icon">&#x1F3A7;</div>
            <div class="feat-title">Dedicated support</div>
            <div class="feat-desc">Your personal account manager reachable on WhatsApp.</div>
          </div>
        </td>
      </tr>
    </table>

    <div class="eml-divider"></div>
    <div class="eml-eyebrow">&#x1F4CB; Your account summary</div>

    <div class="acct-box">
      <div class="acct-head">
        <span class="acct-head-label">&#x1F464; Buyer profile</span>
      </div>
      <div class="acct-rows">
        <div class="acct-row">
          <span class="acct-k">Name</span>
          <span class="acct-v">${name}</span>
        </div>
        <div class="acct-row">
          <span class="acct-k">Email</span>
          <span class="acct-v">${email}</span>
        </div>
        <div class="acct-row">
          <span class="acct-k">Status</span>
          <span class="badge-pending">Pending review</span>
        </div>
      </div>
    </div>

    <div class="eml-quote">
      <p>&ldquo;From Banaras silks to Surat synthetics &mdash; our collection of 8,000+ sarees is built for buyers who take their inventory seriously.&rdquo;</p>
      <cite>&mdash; The Swastik Fashion team</cite>
    </div>

    <div class="eml-help">
      <div class="eml-help-text">
        <strong style="color:#1a1a18;font-size:12px">Need help or have questions?</strong><br>
        WhatsApp us at <a href="https://wa.me/919876543210">+91 98765 43210</a> or email <a href="mailto:support@swastikfashion.com">support@swastikfashion.com</a>. We typically respond within 2 hours on business days.
      </div>
    </div>

    <p class="eml-note">
      Didn&rsquo;t create this account? <a href="mailto:support@swastikfashion.com" style="color:#5a5a56;text-decoration:underline">Click here to report it.</a><br>
      This email was sent to ${email} because you registered on swastikfashion.com
    </p>
  </div>

  <!-- Footer -->
  <div class="eml-footer">
    <div class="eml-footer-name">Swastik Fashion</div>
    <div class="eml-footer-tag">Wholesale Sarees &middot; Surat, Gujarat</div>
    <div class="eml-footer-links">
      <a href="#">Privacy policy</a>
      <a href="#">Terms of use</a>
      <a href="mailto:support@swastikfashion.com">Contact us</a>
    </div>
    <p class="eml-footer-copy">&copy; 2026 Swastik Fashion. All rights reserved.<br>Ring Road, Surat &ndash; 395003, Gujarat, India</p>
  </div>

</div>
</div>
</body>
</html>`;
}

/**
 * Sends a welcome email to a newly registered user.
 * @param {string} toEmail - Recipient's email address.
 * @param {string} businessName - Recipient's business name.
 */
export async function sendWelcomeEmail(toEmail, businessName) {
  try {
    await transporter.sendMail({
      from: `"Swastik Fashion" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `Welcome to Swastik Fashion, ${businessName.split(' ')[0]}! 🎉`,
      html: buildWelcomeEmailHtml(businessName, toEmail),
    });
    console.log(`[mail] Welcome email sent to ${toEmail}`);
  } catch (err) {
    // Non-fatal: log the error but don't block registration
    console.error(`[mail] Failed to send welcome email to ${toEmail}:`, err.message);
  }
}
