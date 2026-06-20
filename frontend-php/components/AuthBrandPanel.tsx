/** Desktop-only brand panel for auth pages (hidden below lg). */
export function AuthBrandPanel() {
  return (
    <div className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-gradient-to-br from-maroon-dark via-maroon to-[#8B1A2A] p-12 text-white lg:flex lg:w-1/2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
          Wholesale buyers
        </p>
        <img
          src="/logo.jpg"
          alt="Swastik Fashion"
          className="mt-4 h-24 w-auto object-contain"
        />
        <p className="mt-6 max-w-md text-lg leading-relaxed text-white/75">
          Browse today&apos;s drop, build your cart, and place wholesale orders
          directly with the shop via WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { value: '10%', label: 'Wholesale discount' },
          { value: '500+', label: 'Saree styles' },
          { value: '24h', label: 'Order support' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/15 bg-white/10 px-4 py-5 backdrop-blur"
          >
            <div className="text-2xl font-bold text-gold">{stat.value}</div>
            <div className="mt-1 text-xs uppercase tracking-wider text-white/60">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
