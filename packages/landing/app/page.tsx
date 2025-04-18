import React from 'react';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-western-paper">
      {/* Background silhouettes - with transparent backgrounds */}
      <div className="bg-silhouette silhouette-1"></div>
      <div className="bg-silhouette silhouette-2"></div>
      <div className="bg-silhouette silhouette-3"></div>
      <div className="bg-silhouette silhouette-4"></div>
      <div className="bg-silhouette silhouette-5"></div>
      <div className="bg-silhouette silhouette-6"></div>
      <div className="bg-silhouette silhouette-7"></div>
      <div className="bg-silhouette silhouette-8"></div>
      <div className="bg-silhouette silhouette-9"></div>
      <div className="bg-silhouette silhouette-10"></div>
      <div className="bg-silhouette silhouette-11"></div>
      <div className="bg-silhouette silhouette-12"></div>
      
      <div className="wanted-poster">
        <div className="wanted-poster-outer">
          <div className="wanted-decoration top-decoration"></div>
          
          <div className="logo-decoration">
            <div className="cowboy-skull" style={{ transform: 'scale(1.5)', margin: '10px 0' }}></div>
          </div>
          
          <div className="wanted-headline">WANTED</div>
          
          <div className="wanted-poster-inner">
            <div className="corner-decoration top-left"></div>
            <div className="corner-decoration top-right"></div>
            <div className="badge-icon"></div>
            
            <p className="wanted-text">
              Saddle up, partner! At Bounty Hub, you can hunt down tasks, claim rewards, and ride off into the sunset with your earnings. No bureaucracy, just pure bounty action.
            </p>
            
            <div className="divider">
              <span className="divider-icon">★</span>
            </div>
            
            <h2 className="wanted-section-title">Why ride with Bounty Hub?</h2>
            
            <div className="wanted-list-container">
              <div className="feature-item">
                <div className="feature-icon icon-no-tape"></div>
                <p><strong>No Red Tape:</strong> See a bounty? Claim it and get to work. No interviews, no auctions, just action.</p>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon icon-outlaws"></div>
                <p><strong>Fair for All Outlaws:</strong> Newcomers and veterans alike get a fair shot at every bounty.</p>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon icon-hunt"></div>
                <p><strong>Focus on the Hunt:</strong> Skip the hassle, go straight to the task, and show your skills.</p>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon icon-payouts"></div>
                <p><strong>Fast Gold Payouts:</strong> Get paid quick as a whip via Stripe when your work is approved.</p>
              </div>
            </div>
            
            <button className="wanted-button">
              <span className="gun-icon"></span>
              <span className="button-text">VIEW BOUNTIES</span>
            </button>
            
            <div className="corner-decoration bottom-left"></div>
            <div className="corner-decoration bottom-right"></div>
          </div>
          
          <div className="reward-section">
            <div className="reward-decoration"></div>
            <span className="reward-label">REWARD</span>
            <span className="reward-amount">$10,000</span>
            <div className="reward-decoration"></div>
            <div className="horseshoe"></div>
          </div>
          
          <div className="wanted-decoration bottom-decoration"></div>
          
          <div className="western-credits">
            <a href="http://www.freepik.com" target="_blank" rel="noopener noreferrer">Images designed by Freepik</a>
          </div>
        </div>
      </div>
    </main>
  )
}