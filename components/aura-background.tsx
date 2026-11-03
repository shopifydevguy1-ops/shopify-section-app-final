export function AuraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#07060d]" aria-hidden>
      <div className="aura-orb aura-orb-a" />
      <div className="aura-orb aura-orb-b" />
      <div className="aura-orb aura-orb-c" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_15%,#07060d_74%)]" />
      <div className="aura-grid absolute inset-0" />
    </div>
  )
}
