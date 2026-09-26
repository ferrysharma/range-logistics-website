export function Brand({ href = "/" }: { href?: string }) {
  return <a href={href} className="brand brand-refined" aria-label="Range Logistics home">
    <img className="brand-symbol" src="/images/range-logomark.webp" alt="" width={256} height={256} />
    <span className="brand-wordmark">
      <span className="brand-name">RANGE</span>
      <span className="brand-sub">LOGISTICS INC.</span>
    </span>
  </a>;
}
