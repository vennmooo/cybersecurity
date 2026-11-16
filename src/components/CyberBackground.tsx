export function CyberBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Floating orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-cyber-cyan/10 blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-cyber-purple/10 blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-cyber-teal/8 blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,240,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.08) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Top scan line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyber-cyan to-transparent opacity-60" />
    </div>
  );
}
