
import React from 'react';

/**
 * Logo component
 * @param {Object} props
 * @param {number|string} [props.size] - Height of the logo in px or a string (e.g. '80px'). Defaults to 100 (large for landing), 48 for sidebar/auth. Ignored if height is provided.
 * @param {number|string} [props.height] - Explicit height for the logo (overrides size).
 * @param {number|string} [props.width] - Explicit width for the logo (optional).
 * @param {boolean} [props.hideText] - If true, hides the subtitle text.
 */
const Logo = ({ size = 100, height, width, hideText = false }) => {
  const imgHeight = height || size;
  const imgWidth = width || 'auto';
  return (
    <div className="logo">
      <img
        src="/logo.png"
        alt="MediSight Logo"
        style={{
          height: typeof imgHeight === 'number' ? imgHeight + 'px' : imgHeight,
          width: typeof imgWidth === 'number' ? imgWidth + 'px' : imgWidth,
          display: 'block',
          margin: '0 auto',
        }}
      />
    {/* Subtitle removed as requested */}
    </div>
  );
};

export default Logo;
