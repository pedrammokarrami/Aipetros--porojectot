import type { AmbientGlowSpec, RoomLightMode } from '../utils/media';

interface RoomEnvironmentProps {
  roomMode: RoomLightMode;
  ambientGlow: AmbientGlowSpec;
}

const DUST_MOTES = [
  { cx: 318, cy: 34, r: 1.5, cls: 'dust-mote-a', delay: '0s' },
  { cx: 364, cy: 52, r: 1.2, cls: 'dust-mote-b', delay: '1.2s' },
  { cx: 290, cy: 68, r: 1.8, cls: 'dust-mote-b', delay: '0.6s' },
  { cx: 404, cy: 78, r: 1.3, cls: 'dust-mote-a', delay: '2.1s' },
  { cx: 256, cy: 96, r: 1.4, cls: 'dust-mote-a', delay: '0.9s' },
  { cx: 346, cy: 108, r: 1.9, cls: 'dust-mote-b', delay: '2.7s' },
  { cx: 446, cy: 112, r: 1.4, cls: 'dust-mote-a', delay: '1.8s' },
  { cx: 215, cy: 124, r: 1.2, cls: 'dust-mote-b', delay: '3.1s' },
  { cx: 392, cy: 136, r: 1.6, cls: 'dust-mote-a', delay: '0.4s' },
  { cx: 298, cy: 144, r: 1.3, cls: 'dust-mote-b', delay: '2.2s' },
  { cx: 482, cy: 140, r: 1.5, cls: 'dust-mote-a', delay: '1.5s' },
  { cx: 184, cy: 148, r: 1.2, cls: 'dust-mote-a', delay: '2.9s' },
] as const;

export function RoomEnvironment({ roomMode, ambientGlow }: RoomEnvironmentProps) {
  const isClassroom = roomMode === 'classroom';

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
        aria-hidden="true"
      >
      {/* 1. Brighter, realistic warm-gray/charcoal seminar room backdrop */}
      <div
        className="absolute inset-0 transition-all duration-700 ease-out"
        style={{
          background: isClassroom
            ? 'radial-gradient(ellipse 92% 78% at 50% 42%, #40444e 0%, #2d313a 52%, #1d2027 100%)'
            : 'radial-gradient(ellipse 88% 72% at 50% 42%, #292c34 0%, #1c1f26 52%, #12141a 100%)',
        }}
      />

      {/* Architectural vertical warm-charcoal acoustic slatted wall panels spanning the wall */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: isClassroom ? 0.92 : 0.78,
          backgroundImage: isClassroom
            ? 'repeating-linear-gradient(90deg, rgba(255,248,238,0.06) 0px, rgba(255,248,238,0.02) 9px, rgba(10,12,16,0.34) 9px, rgba(10,12,16,0.34) 13px)'
            : 'repeating-linear-gradient(90deg, rgba(255,248,238,0.042) 0px, rgba(255,248,238,0.012) 9px, rgba(8,10,14,0.44) 9px, rgba(8,10,14,0.44) 13px)',
        }}
      />

      {/* Subtle architectural horizontal panel seam reveals */}
      <div className="absolute inset-x-0 top-[28%] h-px bg-black/35" />
      <div className="absolute inset-x-0 top-[62%] h-px bg-black/35" />

      {/* Tactile acoustic wall grain */}
      <div
        className="acoustic-wall-grain absolute inset-0 transition-opacity duration-700"
        style={{ opacity: isClassroom ? 0.55 : 0.42 }}
      />

      {/* Architectural wall-washer downlights grazing the left, center-flanks, and right walls */}
      <div
        className="absolute inset-0 transition-opacity duration-700 ease-out"
        style={{
          opacity: isClassroom ? 1 : 0.72,
          background: isClassroom
            ? 'radial-gradient(ellipse 26% 58% at 14% 0%, rgba(255, 240, 218, 0.24) 0%, rgba(255, 240, 218, 0.06) 45%, transparent 75%), radial-gradient(ellipse 26% 58% at 86% 0%, rgba(255, 240, 218, 0.24) 0%, rgba(255, 240, 218, 0.06) 45%, transparent 75%), radial-gradient(ellipse 30% 42% at 50% 0%, rgba(220, 234, 255, 0.14) 0%, transparent 70%)'
            : 'radial-gradient(ellipse 24% 52% at 14% 0%, rgba(255, 232, 200, 0.14) 0%, rgba(255, 232, 200, 0.03) 45%, transparent 74%), radial-gradient(ellipse 24% 52% at 86% 0%, rgba(255, 232, 200, 0.14) 0%, rgba(255, 232, 200, 0.03) 45%, transparent 74%)',
        }}
      />

      {/* Recessed ceiling soffit overhang & warm shadow trim */}
      <div
        className="absolute top-0 inset-x-0 h-[44px] sm:h-[52px] transition-colors duration-700"
        style={{
          background: isClassroom
            ? 'linear-gradient(180deg, rgba(22,25,31,0.92) 0%, rgba(36,40,49,0.58) 58%, transparent 100%)'
            : 'linear-gradient(180deg, rgba(13,15,20,0.94) 0%, rgba(24,27,34,0.52) 58%, transparent 100%)',
        }}
      >
        {/* Crisp ceiling cove molding line */}
        <div className="absolute inset-x-0 top-[14px] h-px bg-white/[0.08]" />
      </div>
      </div>

      {/* Foreground architectural elements (ceiling projector + volumetric beam + bottom instructor desk) */}
      <div
        className="pointer-events-none fixed inset-0 z-20 overflow-hidden select-none"
        aria-hidden="true"
      >
      {/* 2. Detailed 3D-style ceiling-mounted projector chassis + glowing blue/white lens + crepuscular volumetric beam */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <svg
          width="216"
          height="58"
          viewBox="0 0 216 58"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[172px] sm:w-[216px] h-auto drop-shadow-[0_10px_22px_rgba(0,0,0,0.75)]"
        >
          <defs>
            <linearGradient id="mountStem" x1="108" y1="0" x2="108" y2="14" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#171920" />
              <stop offset="50%" stopColor="#353a46" />
              <stop offset="100%" stopColor="#1e222b" />
            </linearGradient>
            <linearGradient id="chassisTop" x1="108" y1="10" x2="108" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={isClassroom ? '#5c6373' : '#454b58'} />
              <stop offset="100%" stopColor={isClassroom ? '#3c424f' : '#2c313b'} />
            </linearGradient>
            <linearGradient id="chassisFront" x1="108" y1="20" x2="108" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={isClassroom ? '#363c48' : '#272b34'} />
              <stop offset="55%" stopColor={isClassroom ? '#262a33' : '#1b1e25'} />
              <stop offset="100%" stopColor="#12141a" />
            </linearGradient>
            <linearGradient id="lensBezel" x1="108" y1="22" x2="108" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <radialGradient id="blueWhiteLens" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="28%" stopColor="#e0f2fe" stopOpacity="0.96" />
              <stop offset="56%" stopColor="#60a5fa" stopOpacity="0.82" />
              <stop offset="82%" stopColor="#1d4ed8" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#0b1120" stopOpacity="0.95" />
            </radialGradient>
            <radialGradient id="lensHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#7dd3fc" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Ceiling mounting flange + short 3D suspension column */}
          <rect x="78" y="0" width="60" height="4" rx="1.5" fill="#181b22" stroke="rgba(255,255,255,0.14)" strokeWidth="0.6" />
          <rect x="96" y="3" width="24" height="10" fill="url(#mountStem)" />

          {/* 3D Perspective Top Shell (angled trapezoid suggesting depth toward the viewer) */}
          <polygon
            points="32,12 184,12 198,21 18,21"
            fill="url(#chassisTop)"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="0.8"
          />

          {/* Main Front Anodized Gunmetal Faceplate */}
          <path
            d="M18 21 H198 V43 C198 46.8 194.8 50 191 50 H25 C21.2 50 18 46.8 18 43 V21 Z"
            fill="url(#chassisFront)"
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="0.85"
          />

          {/* Subtle metallic top edge highlight */}
          <line x1="22" y1="21.5" x2="194" y2="21.5" stroke="rgba(255,255,255,0.26)" strokeWidth="0.8" />

          {/* Left & Right 3D Cooling Louver Grilles */}
          <g opacity="0.72">
            <rect x="30" y="28" width="44" height="2.4" rx="1.2" fill="#0d0f14" />
            <rect x="30" y="33.5" width="44" height="2.4" rx="1.2" fill="#0d0f14" />
            <rect x="30" y="39" width="44" height="2.4" rx="1.2" fill="#0d0f14" />
            <rect x="142" y="28" width="44" height="2.4" rx="1.2" fill="#0d0f14" />
            <rect x="142" y="33.5" width="44" height="2.4" rx="1.2" fill="#0d0f14" />
            <rect x="142" y="39" width="44" height="2.4" rx="1.2" fill="#0d0f14" />
          </g>

          {/* Subtle IR sensor window & cool-white power pinhole */}
          <circle cx="84" cy="35" r="2.2" fill="#090b10" stroke="rgba(255,255,255,0.12)" strokeWidth="0.6" />
          <circle cx="132" cy="35" r="1.4" fill="#bae6fd" opacity="0.85" />

          {/* Sculpted Recessed Optical Lens Barrel */}
          <circle cx="108" cy="35.5" r="13.5" fill="#090c12" stroke="url(#lensBezel)" strokeWidth="2.1" />
          <circle cx="108" cy="35.5" r="10.2" fill="url(#blueWhiteLens)" />

          {/* Anamorphic Blue/White Optical Lens Flare & Bright Hot Core */}
          <ellipse cx="108" cy="35.5" rx="36" ry="8.5" fill="url(#lensHalo)" />
          <ellipse cx="108" cy="35.5" rx="54" ry="2.2" fill="rgba(186, 230, 253, 0.42)" />
          <circle cx="108" cy="35.5" r="3.4" fill="#ffffff" />
        </svg>

        {/* Distinct, visible volumetric light beam cone with crepuscular rays + subtle floating dust motes */}
        <svg
          width="680"
          height="170"
          viewBox="0 0 680 170"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="-mt-[22px] w-[96vw] max-w-[780px] h-[125px] sm:h-[168px] transition-opacity duration-700"
          style={{ opacity: ambientGlow.beamOpacity }}
        >
          <defs>
            <linearGradient id="mainBeamV" x1="340" y1="0" x2="340" y2="170" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f0f9ff" stopOpacity="0.64" />
              <stop offset="22%" stopColor="#bae6fd" stopOpacity="0.32" />
              <stop offset="60%" stopColor="#e0f2fe" stopOpacity="0.11" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="crepuscularRay" x1="340" y1="0" x2="340" y2="165" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.42" />
              <stop offset="45%" stopColor="#bae6fd" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="beamMaskH" x1="20" y1="85" x2="660" y2="85" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="18%" stopColor="white" stopOpacity="0.55" />
              <stop offset="50%" stopColor="white" stopOpacity="1" />
              <stop offset="82%" stopColor="white" stopOpacity="0.55" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <mask id="volumetricFeather">
              <rect x="0" y="0" width="680" height="170" fill="url(#beamMaskH)" />
            </mask>
          </defs>

          <g mask="url(#volumetricFeather)">
            {/* Primary broad volumetric light cone */}
            <polygon points="326,0 354,0 660,170 20,170" fill="url(#mainBeamV)" />

            {/* Distinct crepuscular light shafts fanning downward */}
            <polygon points="334,0 342,0 198,170 112,170" fill="url(#crepuscularRay)" opacity="0.65" />
            <polygon points="338,0 344,0 368,170 288,170" fill="url(#crepuscularRay)" opacity="0.85" />
            <polygon points="341,0 348,0 562,170 468,170" fill="url(#crepuscularRay)" opacity="0.65" />
            <polygon points="330,0 335,0 102,170 52,170" fill="url(#crepuscularRay)" opacity="0.4" />
            <polygon points="345,0 350,0 632,170 578,170" fill="url(#crepuscularRay)" opacity="0.4" />
          </g>

          {/* Subtle floating illuminated dust particles suspended in the beam */}
          {DUST_MOTES.map((mote, i) => (
            <circle
              key={i}
              cx={mote.cx}
              cy={mote.cy}
              r={mote.r}
              fill="#f0f9ff"
              className={mote.cls}
              style={{ animationDelay: mote.delay }}
            />
          ))}
        </svg>
      </div>

      {/* 3. Bottom Edge: Visible wooden / dark-matte instructor desk silhouette + glowing architect lamp + laptop edge */}
      <div className="absolute right-0 bottom-0 left-0 h-[78px]">
        {/* Warm 2700K tungsten desk lamp pool radiating across the left desk & lower-left acoustic wall */}
        <div
          className="absolute -bottom-6 left-0 h-[175px] w-[360px] sm:w-[440px] transition-opacity duration-700"
          style={{
            opacity: isClassroom ? 0.82 : 0.94,
            background:
              'radial-gradient(ellipse 68% 64% at 24% 72%, rgba(255, 198, 122, 0.42) 0%, rgba(245, 162, 74, 0.18) 38%, rgba(217, 119, 46, 0.04) 68%, transparent 86%)',
          }}
        />

        {/* Subtle cool-slate glow from the open laptop screen on the right side of the desk */}
        <div
          className="absolute -bottom-2 right-[5vw] h-[74px] w-[200px] transition-opacity duration-700"
          style={{
            opacity: isClassroom ? 0.42 : 0.58,
            background:
              'radial-gradient(ellipse at 50% 80%, rgba(147, 197, 253, 0.24) 0%, rgba(96, 165, 250, 0.06) 52%, transparent 78%)',
          }}
        />

        {/* Articulated Architect Desk Lamp silhouette on the left side of the desk */}
        <svg
          width="136"
          height="78"
          viewBox="0 0 156 92"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute bottom-[25px] sm:bottom-[28px] left-[3.2vw] w-[108px] sm:w-[118px] h-auto"
        >
          <defs>
            <linearGradient id="lampBeam" x1="94" y1="30" x2="114" y2="92" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffe7ba" stopOpacity="0.62" />
              <stop offset="45%" stopColor="#fdba74" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Warm downward tungsten cone from lamp shade */}
          <polygon points="74,30 116,28 152,92 48,92" fill="url(#lampBeam)" />
          {/* Weighted matte-black base */}
          <path d="M16 90 C18 82 28 79 42 79 C56 79 66 82 68 90 Z" fill="#16181e" stroke="rgba(255,214,158,0.22)" strokeWidth="0.8" />
          {/* Articulated lower & upper steel arms */}
          <path d="M40 80 L28 46 L76 22" stroke="#1e222b" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M40 80 L28 46 L76 22" stroke="rgba(255,214,158,0.22)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="28" cy="46" r="3.4" fill="#2c313d" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" />
          <circle cx="76" cy="22" r="3.2" fill="#2c313d" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" />
          {/* Conical architect shade */}
          <path d="M72 20 L88 15 L116 28 L74 32 Z" fill="#1b1f27" stroke="rgba(255,216,162,0.34)" strokeWidth="0.85" />
          {/* Glowing warm bulb rim */}
          <ellipse cx="95" cy="30" rx="18" ry="3.2" fill="#fff1d6" opacity="0.92" />
        </svg>

        {/* Sleek Instructor Laptop Edge silhouette resting on the right side of the desk */}
        <svg
          width="154"
          height="48"
          viewBox="0 0 172 54"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute bottom-[25px] sm:bottom-[28px] right-[4vw] w-[118px] sm:w-[144px] h-auto"
        >
          <defs>
            <linearGradient id="laptopLid" x1="86" y1="6" x2="86" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={isClassroom ? '#3c4352' : '#2a2f3b'} />
              <stop offset="100%" stopColor={isClassroom ? '#222630' : '#171a22'} />
            </linearGradient>
            <linearGradient id="laptopBase" x1="86" y1="44" x2="86" y2="52" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#475061" />
              <stop offset="100%" stopColor="#1b1f27" />
            </linearGradient>
          </defs>
          {/* Soft screen light spill on back bezel */}
          <path d="M22 6 H150 L144 44 H28 Z" fill="url(#laptopLid)" stroke="rgba(186,230,253,0.28)" strokeWidth="1" />
          {/* Subtle top chamfer specular */}
          <line x1="26" y1="7" x2="146" y2="7" stroke="rgba(224,242,254,0.42)" strokeWidth="1" />
          {/* Minimal brushed aluminum lid emblem dot */}
          <circle cx="86" cy="24" r="3" fill="rgba(255,255,255,0.14)" />
          {/* Laptop wedge deck resting on desk */}
          <path d="M12 44 H160 L166 51 H6 Z" fill="url(#laptopBase)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" />
        </svg>

        {/* Solid Wooden / Dark-Matte Instructor Desk Surface spanning the full bottom edge */}
        <div
          className="absolute inset-x-0 bottom-0 h-[27px] sm:h-[30px] transition-all duration-700"
          style={{
            background: isClassroom
              ? 'linear-gradient(180deg, #4b3d33 0%, #362c25 22%, #241d19 65%, #161210 100%)'
              : 'linear-gradient(180deg, #352b25 0%, #241e1a 26%, #181412 68%, #0f0d0c 100%)',
            boxShadow: isClassroom
              ? 'inset 0 1.5px 0 rgba(255,235,210,0.24), 0 -10px 28px rgba(0,0,0,0.45)'
              : 'inset 0 1.5px 0 rgba(255,232,204,0.18), 0 -10px 30px rgba(0,0,0,0.68)',
          }}
        >
          {/* Subtle warm wood-grain horizontal sheen */}
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(255,220,185,0.08) 0px, transparent 2px, rgba(0,0,0,0.16) 5px, transparent 8px)',
            }}
          />

          {/* Warm tungsten highlight pool on the left tabletop surface */}
          <div
            className="absolute inset-y-0 left-0 w-[340px]"
            style={{
              background:
                'radial-gradient(ellipse 85% 100% at 32% 0%, rgba(255, 206, 138, 0.38) 0%, rgba(245, 165, 82, 0.14) 55%, transparent 100%)',
            }}
          />

          {/* Projected screen reflection strip along center of tabletop */}
          <div
            className="absolute top-0 left-1/2 h-[2px] w-[68vw] -translate-x-1/2 transition-all duration-700"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${ambientGlow.primaryRgba} 50%, transparent 100%)`,
            }}
          />

          {/* Subtle cool specular rim under the laptop on the right */}
          <div
            className="absolute top-0 right-[4.5vw] h-[2px] w-[180px]"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(186, 230, 253, 0.45) 50%, transparent 100%)',
            }}
          />
        </div>
      </div>
      </div>
    </>
  );
}
