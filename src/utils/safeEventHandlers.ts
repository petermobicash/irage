/**
 * Safe Event Handler Utilities
 * 
 * Provides standardized, safe event handlers that prevent e.target is undefined errors
 * by including proper null checks and consistent handling patterns.
 */

import React from 'react';

/**
 * Generic safe event handler for input elements
 * Safely extracts value from event target with null checks
 */
export const safeInputHandler = <T extends Record<string, any>, K extends keyof T>(
  setter: (field: K, value: any) => void,
  field: K
) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  if (e && e.target) {
    const { value } = e.target;
    setter(field, value);
  }
};

/**
 * Safe event handler for checkbox elements
 * Safely extracts checked state from event target
 */
export const safeCheckboxHandler = <T extends Record<string, any>, K extends keyof T>(
  setter: (field: K, value: any) => void,
  field: K
) => (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e && e.target) {
    const { checked } = e.target;
    setter(field, checked);
  }
};

/**
 * Safe event handler for radio button groups
 * Safely extracts value from selected radio button
 */
export const safeRadioHandler = <T extends Record<string, any>, K extends keyof T>(
  setter: (field: K, value: any) => void,
  field: K
) => (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e && e.target) {
    const { value, checked } = e.target;
    if (checked) {
      setter(field, value);
    }
  }
};

/**
 * Safe event handler for number inputs
 * Safely extracts and parses numeric values
 */
export const safeNumberHandler = <T extends Record<string, any>, K extends keyof T>(
  setter: (field: K, value: any) => void,
  field: K,
  defaultValue: number = 0
) => (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e && e.target) {
    const { value } = e.target;
    const parsedValue = parseFloat(value) || defaultValue;
    setter(field, parsedValue);
  }
};

/**
 * Safe event handler for file inputs
 * Safely extracts file from event target
 */
export const safeFileHandler = (
  setter: (file: File | null) => void
) => (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e && e.target && e.target.files && e.target.files[0]) {
    setter(e.target.files[0]);
  } else {
    setter(null);
  }
};

/**
 * Safe event handler for checkbox arrays (multiple selections)
 * Handles adding/removing values from array fields
 */
export const safeArrayCheckboxHandler = <T extends Record<string, any>, K extends keyof T>(
  setter: (field: K, value: any) => void,
  field: K,
  value: string
) => (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e && e.target) {
    const { checked } = e.target;
    // This assumes the current value is already in state
    // The actual implementation will depend on how the setter handles arrays
    setter(field, { action: checked ? 'add' : 'remove', value });
  }
};

/**
 * Legacy compatibility handler for components that expect direct value
 * This is for gradual migration from mixed patterns
 */
export const directValueHandler = <T extends Record<string, any>, K extends keyof T>(
  setter: (field: K, value: any) => void,
  field: K
) => (value: string | number | boolean) => {
  setter(field, value);
};

/**
 * Higher-order function to create a safe change handler with multiple safeguards
 */
export const createSafeChangeHandler = <T extends Record<string, any>, K extends keyof T>(
  setter: (field: K, value: any) => void,
  field: K,
  options: {
    type?: 'text' | 'number' | 'checkbox' | 'radio' | 'file' | 'array-checkbox';
    defaultValue?: any;
    transform?: (value: any) => any;
  } = {}
) => {
  const {
    type = 'text',
    defaultValue,
    transform
  } = options;

  return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | any) => {
    try {
      let safeValue: any;

      // Handle direct value calls (for compatibility)
      if (!e || !e.target) {
        safeValue = e;
      } else {
        // Handle different input types
        switch (type) {
          case 'checkbox':
            safeValue = e.target.checked;
            break;
          case 'number':
            safeValue = parseFloat(e.target.value) || defaultValue || 0;
            break;
          case 'file':
            safeValue = e.target.files?.[0] || null;
            break;
          default:
            safeValue = e.target.value;
        }
      }

      // Apply transformation if provided
      if (transform) {
        safeValue = transform(safeValue);
      }

      setter(field, safeValue);
    } catch (error) {
      console.warn(`Safe change handler error for field ${String(field)}:`, error);
      // Fallback to default value or no-op
      if (defaultValue !== undefined) {
        setter(field, defaultValue);
      }
    }
  };
};

/**
 * Type guard to check if an event has a valid target
 */
export const hasValidTarget = (e: any): e is React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> => {
  return e && typeof e === 'object' && e.target && typeof e.target === 'object' && 'value' in e.target;
};

/**
 * Type guard to check if an event is from a checkbox
 */
export const isCheckboxEvent = (e: any): e is React.ChangeEvent<HTMLInputElement> => {
  return hasValidTarget(e) && e.target.type === 'checkbox';
};