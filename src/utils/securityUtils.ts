/**
 * Security utilities for development and production safety checks
 */

// Check if the current page is served over HTTPS
export const isSecureContext = (): boolean => {
  return window.location.protocol === 'https:';
};

// Check if we're in development mode
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV || process.env.NODE_ENV === 'development';
};

// Warn about security issues in development
export const warnInsecurePasswordFields = (componentName: string): void => {
  if (isDevelopment() && !isSecureContext()) {
    console.warn('🔒 SECURITY WARNING');
    console.warn(`⚠️  ${componentName} contains password fields on an insecure (HTTP) page.`);
    console.warn('🚨 This is a security risk that allows user login credentials to be stolen.');
    console.warn('✅ In production, ensure your application is served over HTTPS.');
    console.warn('📖 Learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP');
  }
};

// Check for mixed content (HTTP resources on HTTPS page)
export const checkMixedContent = (): void => {
  if (isSecureContext() && isDevelopment()) {
    const insecureResources = Array.from(document.querySelectorAll('*'))
      .filter(element => {
        const src = element.getAttribute('src');
        const href = element.getAttribute('href');
        return (src && src.startsWith('http:')) || (href && href.startsWith('http:'));
      });
    
    if (insecureResources.length > 0) {
      console.warn('🔒 MIXED CONTENT WARNING');
      console.warn(`⚠️  Found ${insecureResources.length} HTTP resources on HTTPS page.`);
      console.warn('📖 This can trigger browser security warnings and block content.');
    }
  }
};

// Validate form security before submission
export const validateFormSecurity = (formName: string): boolean => {
  if (!isSecureContext()) {
    console.error('🔒 SECURITY ERROR');
    console.error(`❌ Cannot submit ${formName} on insecure connection.`);
    console.error('🔒 Please use HTTPS to submit sensitive data.');
    return false;
  }
  return true;
};

// Initialize security checks
export const initializeSecurityChecks = (): void => {
  if (isDevelopment()) {
    // Check mixed content on page load
    window.addEventListener('load', checkMixedContent);
    
    // Check protocol on page load
    if (!isSecureContext()) {
      console.warn('🔒 INSECURE CONNECTION DETECTED');
      console.warn(`⚠️  This application is running on ${window.location.protocol}.`);
      console.warn('🔒 For production, ensure HTTPS is used.');
    }
  }
};