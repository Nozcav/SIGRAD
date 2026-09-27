import { SVGProps } from "react";

// Set de iconos propio (SVG en linea, sin dependencias externas), estilo
// "outline" consistente en toda la app: mismo grosor de trazo (1.75) y
// mismo viewBox, para que cualquier icono nuevo encaje sin desentonar.
type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const HomeIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5.5 10v9a1 1 0 0 0 1 1h4v-6h3v6h4a1 1 0 0 0 1-1v-9" />
  </svg>
);

export const DocumentIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7 3.5Z" />
    <path d="M14 3.5V8h4.5" />
    <path d="M9 12.5h6M9 16h6" />
  </svg>
);

export const BellIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M6 10.5a6 6 0 1 1 12 0c0 3.4 1 5 1.8 6H4.2c.8-1 1.8-2.6 1.8-6Z" />
    <path d="M10 19.5a2 2 0 0 0 4 0" />
  </svg>
);

export const ClockIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="8.25" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const UsersIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
    <circle cx="17" cy="8.5" r="2.3" />
    <path d="M15.8 14.2c2.3.3 4.2 2.1 4.2 4.8" />
  </svg>
);

export const ChatIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5v-7Z" />
  </svg>
);

export const UserCircleIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="10" r="2.6" />
    <path d="M6.7 18.2a5.8 5.8 0 0 1 10.6 0" />
  </svg>
);

export const PlusCircleIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 8.5v7M8.5 12h7" />
  </svg>
);

export const CheckCircleIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M8.5 12.3 11 14.8l4.5-5.6" />
  </svg>
);

export const InboxIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M4 12.5 6.2 5.8A1.5 1.5 0 0 1 7.6 4.8h8.8a1.5 1.5 0 0 1 1.4 1L20 12.5" />
    <path d="M4 12.5h4.3l1 2.2h5.4l1-2.2H20V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18v-5.5Z" />
  </svg>
);

export const KeyIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <circle cx="8" cy="15" r="3.5" />
    <path d="M10.5 12.5 17 6M14.5 8.5 17 6l2 2-2.2 2.2M20.5 9.5 19 11" />
  </svg>
);

export const LogoutIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M9 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3" />
    <path d="M16 16l4-4-4-4M20 12H9" />
  </svg>
);

export const ChevronRightIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M9 5.5 15.5 12 9 18.5" />
  </svg>
);

export const SparklesIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M12 3.5 13.3 8l4.5 1.3-4.5 1.3L12 15l-1.3-4.4L6.2 9.3l4.5-1.3L12 3.5Z" />
    <path d="M19 15.5 19.7 18l2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z" />
  </svg>
);

export const XIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const AlertCircleIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 8v4.5" />
    <circle cx="12" cy="15.8" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export const GripIcon = (props: IconProps) => (
  <svg {...base} {...props} strokeWidth={0} fill="currentColor">
    <circle cx="9" cy="6" r="1.4" />
    <circle cx="15" cy="6" r="1.4" />
    <circle cx="9" cy="12" r="1.4" />
    <circle cx="15" cy="12" r="1.4" />
    <circle cx="9" cy="18" r="1.4" />
    <circle cx="15" cy="18" r="1.4" />
  </svg>
);
