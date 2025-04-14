export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-6">Bounty Hub</h1>
      <p className="text-xl mb-8">Connect with top developers and designers for your bounties</p>
      <div className="max-w-3xl text-center">
        <h2 className="text-2xl font-semibold mb-4">Why choose Bounty Hub?</h2>
        <ul className="list-disc text-left space-y-2 mb-8">
          <li><span className="font-semibold">ZERO Bureaucracy:</span> Forget long proposals, interviews, or price auctions! See a bounty you like? Just grab it and start working. Simple as that.</li>
          <li><span className="font-semibold">Fair Chance for Everyone:</span> Unlike platforms that prioritize established profiles, here what matters is skill and availability. Newcomers have a real chance!</li>
          <li><span className="font-semibold">Focus on Tasks:</span> Go straight to coding or designing, without complications.</li>
          <li><span className="font-semibold">Quick and Direct Payments:</span> Fast and reliable payments via Stripe as soon as your work is approved.</li>
        </ul>
      </div>
    </main>
  )
}