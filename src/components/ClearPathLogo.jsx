/* Geometric wireframe logo SVG */
export default function ClearPathLogo({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Back face */}
      <polygon points="32,12 48,20 48,40 32,48 16,40 16,20" />

      {/* Front depth lines */}
      <line x1="32" y1="12" x2="32" y2="4" />
      <line x1="48" y1="20" x2="54" y2="16" />
      <line x1="48" y1="40" x2="54" y2="44" />
      <line x1="32" y1="48" x2="32" y2="56" />
      <line x1="16" y1="40" x2="10" y2="44" />
      <line x1="16" y1="20" x2="10" y2="16" />

      {/* Front face */}
      <polygon points="32,4 54,16 54,44 32,56 10,44 10,16" />

      {/* Internal connecting lines for 3D effect */}
      <line x1="32" y1="12" x2="32" y2="30" />
      <line x1="32" y1="30" x2="48" y2="40" />
      <line x1="32" y1="30" x2="16" y2="40" />
    </svg>
  );
}
