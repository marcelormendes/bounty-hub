import React from 'react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#f9f5e6]">
      <div className="wanted-poster">
        <div className="wanted-poster-outer">
          <div className="wanted-headline">WANTED</div>
          
          <div className="wanted-poster-inner">
            <p className="wanted-text">
              Saddle up, partner! At Bounty Hub, you can hunt down tasks, claim rewards, and ride off into the sunset with your earnings. No bureaucracy, just pure bounty action.
            </p>
            
            <h2 className="wanted-section-title">Why ride with Bounty Hub?</h2>
            
            <div className="wanted-list-container">
              <p><strong>No Red Tape:</strong> See a bounty? Claim it and get to work. No interviews, no auctions, just action.</p>
              <p><strong>Fair for All Outlaws:</strong> Newcomers and veterans alike get a fair shot at every bounty.</p>
              <p><strong>Focus on the Hunt:</strong> Skip the hassle, go straight to the task, and show your skills.</p>
              <p><strong>Fast Gold Payouts:</strong> Get paid quick as a whip via Stripe when your work is approved.</p>
            </div>
            
            <button className="wanted-button">
              VIEW BOUNTIES
            </button>
          </div>
          
          <div className="reward-row">
            <span className="reward-label">REWARD</span>
            <span className="reward-amount">$10,000</span>
          </div>
        </div>
      </div>
    </main>
  )
}