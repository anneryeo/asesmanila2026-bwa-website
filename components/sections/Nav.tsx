'use client';

import { useState, useEffect, type MouseEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const SECTION_HREFS = {
  sessions: '#sessions',
  form: '#form',
  gallery: '#gallery',
} as const;

const NAV_LINKS = [
  { label: 'Sessions', href: SECTION_HREFS.sessions },
  { label: 'Form',     href: SECTION_HREFS.form },
  { label: 'Gallery',  href: SECTION_HREFS.gallery },
] as const;

const NAV_COLORS = {
  // Desktop/mobile header text colors. light is used over light sections; dark is used over dark sections.
  light: '#112F7F',
  dark: '#ffffff',
} as const;

const NAV_SIZES = {
  // Header height: increase/decrease this to make the fixed top nav taller or shorter.
  // Keep this close to the logo height so the logo has enough vertical breathing room.
  headerHeight: '76px',

  // Logo sizes: desktop is the fixed header logo, mobileDrawer is the logo inside the opened hamburger menu.
  desktopLogoHeight: '40px',
  desktopLogoMaxWidth: '170px',
  mobileDrawerLogoHeight: '34px',

  // Desktop nav text buttons: affects the anchor links only.
  // Raise fontSize for larger text; raise gap to spread the desktop nav items apart.
  desktopTextFontSize: '16px',
  desktopButtonGap: '50px',

  // Desktop CTA button: change width to scale it.
  desktopCtaWidth: '139px',

  // Desktop nav group offset: more negative moves the link group left toward center.
  desktopGroupOffsetX: '-140px',

  // Hamburger drawer links: mobileTextFontSize affects the drawer anchor links and Register.
  mobileTextFontSize: '42px',
  mobileMenuButtonSize: '44px',
  mobileMenuBarWidth: '20px',
  mobileMenuBarHeight: '2px',
  mobileMenuBarGap: '5px',
  mobileDrawerSidePadding: '24px',
  mobileDrawerContentPaddingX: '40px',
  mobileDrawerLinkGap: '28px',
  mobileDrawerActionGap: '28px',
} as const;

const NAV_TEXT = {
  // Link text box/line controls.
  desktopLineHeight: 1,
  mobileDrawerLineHeight: 1,
  mobileDrawerTextColor: '#ffffff',
} as const;

export function Nav() {
  const [open, setOpen] = useState(false);
  const [atTop, setAtTop] = useState(true);
  // White-primary site: the light color set (#112F7F text, blue wordmark) is
  // the DEFAULT state. Dark sections can still flip it via data-nav-theme="dark".
  const [overLightSection, setOverLightSection] = useState(true);

  const scrollToSection = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    const targetId = href.replace('#', '');
    const target = document.getElementById(targetId);

    if (!target) return;

    event.preventDefault();
    setOpen(false);
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', href);
  };

  // Close drawer when resizing to desktop
  useEffect(() => {
    const h = () => { if (window.innerWidth >= 1024) setOpen(false); };
    window.addEventListener('resize', h, { passive: true });
    return () => window.removeEventListener('resize', h);
  }, []);

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Keep the fixed nav visually absent at the very top of the page (this
  // site has no hero section — scroll position stands in for the parent's
  // hero probe). Switch nav colors when the header hovers over sections
  // marked data-nav-theme; the default here is the light set.
  useEffect(() => {
    const updateNavTheme = () => {
      const headerHeight = Number.parseFloat(NAV_SIZES.headerHeight);
      const navProbeY = Number.isFinite(headerHeight) ? headerHeight / 2 : 45;

      setAtTop(window.scrollY <= 8);

      const themedSections = Array.from(
        document.querySelectorAll<HTMLElement>('[data-nav-theme]')
      );
      const currentTheme = themedSections.find(section => {
        const rect = section.getBoundingClientRect();
        return rect.top <= navProbeY && rect.bottom >= navProbeY;
      })?.dataset.navTheme;

      // White-primary default: only an explicit dark section flips the nav.
      setOverLightSection(currentTheme !== 'dark');
    };

    updateNavTheme();
    window.addEventListener('scroll', updateNavTheme, { passive: true });
    window.addEventListener('resize', updateNavTheme, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateNavTheme);
      window.removeEventListener('resize', updateNavTheme);
    };
  }, []);

  const navColor = overLightSection ? NAV_COLORS.light : NAV_COLORS.dark;
  const logoSrc = overLightSection ? '/images/ases-logotext-blue.png' : '/images/ases-logotext-white.png';
  const scrolledBorder = overLightSection ? 'rgba(7,31,107,0.08)' : 'rgba(255,255,255,0.08)';

  return (
    <>
      <motion.nav
        style={{
          position: 'fixed',
          inset: '0 0 auto 0',
          zIndex: 50,
          background: 'transparent',
          backdropFilter: atTop ? 'none' : 'blur(16px)',
          WebkitBackdropFilter: atTop ? 'none' : 'blur(16px)',
          borderBottom: atTop ? '1px solid transparent' : `1px solid ${scrolledBorder}`,
        }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
      >
        <div
          className="px-[24px] sm:px-[48px] md:pl-[8%] lg:pl-[15%] lg:pr-[80px] xl:pl-[17%] xl:pr-[112px]"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: NAV_SIZES.headerHeight,
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            aria-label="Build with ASES - back to top"
            onClick={event => {
              event.preventDefault();
              setOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
              window.history.replaceState(null, '', '/');
            }}
            className="flex items-center no-underline shrink-0"
          >
            <Image
              src={logoSrc}
              alt="ASES Manila"
              width={1541}
              height={512}
              style={{
                height: NAV_SIZES.desktopLogoHeight,
                width: 'auto',
                maxWidth: NAV_SIZES.desktopLogoMaxWidth,
                objectFit: 'contain',
                filter: 'none',
                transition: 'filter 0.2s ease, opacity 0.2s ease',
              }}
            />
          </Link>

          {/* Desktop links — hidden below lg */}
          <div
            className="hidden lg:flex"
            style={{
              alignItems: 'center',
              gap: NAV_SIZES.desktopButtonGap,
              transform: `translateX(${NAV_SIZES.desktopGroupOffsetX})`,
            }}
          >
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={scrollToSection(href)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontFamily: 'var(--font-display)',
                  fontSize: NAV_SIZES.desktopTextFontSize,
                  fontWeight: 300,
                  textDecoration: 'none',
                  color: navColor,
                  lineHeight: NAV_TEXT.desktopLineHeight,
                  transition: 'color 0.2s ease, opacity 0.2s ease',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.opacity = '0.72';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.opacity = '1';
                }}
              >
                {label}
              </Link>
            ))}

            {/* Direct Register CTA — hard-edged red button matching the
                brand SVG buttons (#D33C24 fill, white Cocogoose text). */}
            <Link
              className="button-float-hover"
              href={SECTION_HREFS.form}
              onClick={scrollToSection(SECTION_HREFS.form)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: NAV_SIZES.desktopCtaWidth,
                padding: '13px 0',
                background: '#D33C24',
                fontFamily: 'var(--font-cocogoose)',
                fontSize: 14,
                fontWeight: 350,
                letterSpacing: '0.02em',
                textDecoration: 'none',
                color: '#ffffff',
                borderRadius: 0,
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#BF351E'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#D33C24'; }}
            >
              Register
            </Link>
          </div>

          {/* Hamburger — mobile only, hidden at lg+ */}
          <button
            className="button-float-hover flex lg:hidden"
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            style={{
              alignItems: 'center',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: NAV_SIZES.mobileMenuBarGap,
              width: NAV_SIZES.mobileMenuButtonSize,
              height: NAV_SIZES.mobileMenuButtonSize,
              padding: 0,
              background: atTop ? 'rgba(12,20,63,0.24)' : 'rgba(12,20,63,0.42)',
              border: `1px solid ${atTop ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.14)'}`,
              borderRadius: '999px',
              boxShadow: atTop ? 'none' : '0 10px 30px rgba(4, 10, 32, 0.18)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              cursor: 'pointer',
              color: '#ffffff',
            }}
          >
            <motion.span
              style={{
                display: 'block',
                width: NAV_SIZES.mobileMenuBarWidth,
                height: NAV_SIZES.mobileMenuBarHeight,
                borderRadius: 999,
                background: 'currentColor',
                transformOrigin: 'center',
              }}
              animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
            />
            <motion.span
              style={{
                display: 'block',
                width: NAV_SIZES.mobileMenuBarWidth,
                height: NAV_SIZES.mobileMenuBarHeight,
                borderRadius: 999,
                background: 'currentColor',
              }}
              animate={{ opacity: open ? 0 : 1, scaleX: open ? 0.3 : 1 }}
              transition={{ duration: 0.18 }}
            />
            <motion.span
              style={{
                display: 'block',
                width: NAV_SIZES.mobileMenuBarWidth,
                height: NAV_SIZES.mobileMenuBarHeight,
                borderRadius: 999,
                background: 'currentColor',
                transformOrigin: 'center',
              }}
              animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
            />
          </button>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 90,
                background: 'rgba(12,20,63,0.6)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 100,
                background: '#0C143F',
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.32, ease: [0.32, 0, 0.67, 0] }}
            >
              {/* Corner marks */}
              {[
                { top: 20, left: 20 },
                { top: 20, right: 20 },
                { bottom: 20, left: 20 },
                { bottom: 20, right: 20 },
              ].map((pos, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    fontFamily: 'monospace',
                    fontSize: 20,
                    color: 'rgba(255,255,255,0.15)',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    ...pos,
                  }}
                >+</span>
              ))}

              {/* Drawer header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: NAV_SIZES.headerHeight, padding: `0 ${NAV_SIZES.mobileDrawerSidePadding}` }}>
                <Link
                  href="/"
                  aria-label="Build with ASES - back to top"
                  onClick={event => {
                    event.preventDefault();
                    setOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    window.history.replaceState(null, '', '/');
                  }}
                  className="flex items-center no-underline"
                >
                  <Image
                    src="/images/ases-logotext-white.png"
                    alt="ASES Manila"
                    width={1541}
                    height={512}
                    style={{ height: NAV_SIZES.mobileDrawerLogoHeight, width: 'auto', maxWidth: '170px', objectFit: 'contain' }}
                  />
                </Link>
                <button
                  className="button-float-hover"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: NAV_SIZES.mobileMenuButtonSize,
                    height: NAV_SIZES.mobileMenuButtonSize,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.16)',
                    borderRadius: '999px',
                    color: '#ffffff',
                    fontSize: 16,
                    boxShadow: '0 10px 30px rgba(4, 10, 32, 0.22)',
                    backdropFilter: 'blur(14px)',
                    WebkitBackdropFilter: 'blur(14px)',
                    cursor: 'pointer',
                  }}
                >✕</button>
              </div>

              {/* Links */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: `0 ${NAV_SIZES.mobileDrawerContentPaddingX}`, gap: NAV_SIZES.mobileDrawerLinkGap }}>
                {NAV_LINKS.map(({ label, href }, i) => (
                  <motion.div
                    key={href}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 + i * 0.07, duration: 0.3, ease: 'easeOut' }}
                  >
                    <Link
                      href={href}
                      onClick={scrollToSection(href)}
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: NAV_SIZES.mobileTextFontSize,
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        textDecoration: 'none',
                        color: NAV_TEXT.mobileDrawerTextColor,
                        letterSpacing: '-0.01em',
                        lineHeight: NAV_TEXT.mobileDrawerLineHeight,
                        transition: 'color 0.2s ease',
                        display: 'block',
                      }}
                    >
                      {label}
                    </Link>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 + NAV_LINKS.length * 0.07, duration: 0.3, ease: 'easeOut' }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: NAV_SIZES.mobileDrawerActionGap }}
                >
                  <Link
                    href={SECTION_HREFS.form}
                    onClick={scrollToSection(SECTION_HREFS.form)}
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: NAV_SIZES.mobileTextFontSize,
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                      color: NAV_TEXT.mobileDrawerTextColor,
                      letterSpacing: '-0.01em',
                      lineHeight: NAV_TEXT.mobileDrawerLineHeight,
                      transition: 'color 0.2s ease',
                      display: 'block',
                      cursor: 'pointer',
                    }}
                  >
                    Register
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
