import { useEffect, useId, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import './TicketraLandingFooter.css';

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260503_104800_bc43ae09-f494-43e3-97d7-2f8c1692cfd7.mp4';

const NAV_LINKS = [
  { label: 'Features', to: '/#features' },
  { label: 'Service Desk', to: '/#features' },
  { label: 'Pricing', to: '/contact-sales' },
  { label: 'Security', to: '/security-standards' },
  { label: 'FAQ', to: '/#faq' },
];

const COMPANY_LINKS = [
  { label: 'About', to: '/about' },
  { label: 'Enterprise SLA', to: '/enterprise-sla' },
  { label: 'Terms & Conditions', to: '/enterprise-sla' },
  { label: 'Privacy Policy', to: '/security-standards' },
];

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.445.865-.608 1.25-1.845-.276-3.68-.276-5.487 0-.164-.393-.406-.874-.618-1.25a.077.077 0 0 0-.078-.037 19.736 19.736 0 0 0-4.885 1.515.07.07 0 0 0-.032.028C.533 9.046-.319 13.58.099 18.058a.082.082 0 0 0 .031.056c2.053 1.508 4.041 2.423 5.993 3.029a.078.078 0 0 0 .084-.028c.462-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.042-.106 12.3 12.3 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.099.246.198.373.292a.077.077 0 0 1-.007.127 12.299 12.299 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.211 0 2.176 1.095 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.095 2.157 2.419 0 1.334-.955 2.419-2.157 2.419z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.082 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { label: 'Discord', href: 'https://discord.com', icon: DiscordIcon },
  { label: 'X', href: 'https://twitter.com', icon: XIcon },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: LinkedInIcon },
  { label: 'GitHub', href: 'https://github.com', icon: GitHubIcon },
];

function FooterLink({ to, label }: { to: string; label: string }) {
  const focusClass = 'focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none rounded';
  if (to.includes('#')) {
    return <a href={to} className={focusClass}>{label}</a>;
  }
  return <Link to={to} className={focusClass}>{label}</Link>;
}

export function TicketraLandingFooter() {
  const svgId = useId().replace(/:/g, '');
  const watermarkSvgId = `watermarkSvg-${svgId}`;
  const watermarkTextId = `watermarkText-${svgId}`;

  const fitWatermark = useCallback(() => {
    const svg = document.getElementById(watermarkSvgId);
    const text = document.getElementById(watermarkTextId);
    if (!svg || !text) return;
    try {
      const bbox = (text as SVGGraphicsElement).getBBox();
      svg.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
    } catch {
      // SVG not ready
    }
  }, [watermarkSvgId, watermarkTextId]);

  useEffect(() => {
    if (document.fonts?.ready) {
      document.fonts.ready.then(fitWatermark);
    } else {
      window.addEventListener('load', fitWatermark);
    }
    window.addEventListener('resize', fitWatermark);
    return () => window.removeEventListener('resize', fitWatermark);
  }, [fitWatermark]);

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = new FormData(form).get('email');
    if (email && String(email).includes('@')) {
      toast.success('Thanks — we will keep you updated on Ticketra.');
      form.reset();
    } else {
      toast.error('Please enter a valid email address.');
    }
  };

  return (
    <section className="footer-section" aria-label="Site footer">
      <div className="footer-wrapper">
        <div className="footer-left">
          <video className="footer-left-video" autoPlay muted loop playsInline preload="auto">
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>

          <Link to="/" className="footer-logo focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none rounded-lg">
            <span className="footer-logo-mark" aria-hidden="true">
              T
            </span>
            <span className="footer-logo-name">Ticketra</span>
          </Link>

          <div className="footer-tagline-container">
            <p className="footer-tagline">
              Smarter service desk operations,
              <br />
              <span>built for enterprise teams.</span>
            </p>
          </div>

          <div className="footer-social-row">
            <span className="footer-social-label">Stay in touch!</span>
            <div className="footer-social-icons">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  className="social-icon focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-right">
          <div className="footer-lucky-graphic" aria-hidden="true">
            <div className="lucky-cube">
              <span className="lucky-cube-mark">T</span>
            </div>
            <div className="lucky-text-row">
              <span className="lucky-arrow">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 20 C 6 14, 10 9, 18 5" />
                  <path d="M18 5 L 12 5" />
                  <path d="M18 5 L 18 11" />
                </svg>
              </span>
              <span className="lucky-text">Need a demo?</span>
            </div>
          </div>

          <div className="footer-right-top">
            <div className="footer-nav-cols">
              <div className="footer-col">
                <p className="footer-col-title">Navigation</p>
                {NAV_LINKS.map((link) => (
                  <FooterLink key={link.label} to={link.to} label={link.label} />
                ))}
              </div>
              <div className="footer-col">
                <p className="footer-col-title">Company</p>
                {COMPANY_LINKS.map((link) => (
                  <FooterLink key={link.label} to={link.to} label={link.label} />
                ))}
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copyright">© 2026 Ticketra. All rights reserved.</p>
            <div className="footer-cta-mini">
              <h4>
                Tickets move fast.
                <br />
                <strong>Stay ahead with Ticketra.</strong>
              </h4>
              <form className="footer-subscribe-row" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  aria-label="Email address"
                  className="focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none rounded-md"
                />
                <button type="submit" className="focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-watermark" aria-hidden="true">
        <svg id={watermarkSvgId} viewBox="62 95 876 175" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
          <text id={watermarkTextId} x="500" y="240" textAnchor="middle" fontSize="320">
            Ticketra
          </text>
        </svg>
      </div>
    </section>
  );
}

export default TicketraLandingFooter;
