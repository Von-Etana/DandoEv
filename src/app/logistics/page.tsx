'use client';

import './styles.css';

export default function LogisticsLandingPage() {
    return (
        <div className="logistics-wrapper">
            <header className="logistics-header" id="site-header">
                <div className="header-top-bar">
                    <div className="container layout-flex-between">
                        <div className="corporate-contact-matrix">
                            <span className="contact-node">
                                <span className="icon-span">📍</span>
                                374 William S Canning Blvd, Fall River MA
                            </span>
                            <span className="contact-node">
                                <span className="icon-span">📞</span>
                                888 999 0000
                            </span>
                            <span className="contact-node">
                                <span className="icon-span">✉️</span>
                                logitic@example.com
                            </span>
                        </div>
                        <div className="social-networking-nodes" style={{ display: 'flex', gap: '1rem' }}>
                            <a href="#" aria-label="Facebook Profile">FB</a>
                            <a href="#" aria-label="LinkedIn Profile">LI</a>
                            <a href="#" aria-label="X Profile">X</a>
                            <a href="#" aria-label="YouTube Channel">YT</a>
                        </div>
                    </div>
                </div>

                <div className="header-main-nav">
                    <div className="container layout-flex-between">
                        <div className="corporate-branding">
                            <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--color-primary-navy)' }}>LOGITIC</h1>
                        </div>
                        <nav className="desktop-navigation-matrix" aria-label="Main menu">
                            <ul className="nav-list">
                                <li className="nav-item"><a href="#home">Home</a></li>
                                <li className="nav-item"><a href="#pages">Pages</a></li>
                                <li className="nav-item"><a href="#services">Services</a></li>
                                <li className="nav-item"><a href="#case-study">Case Study</a></li>
                                <li className="nav-item"><a href="#blog">Blog</a></li>
                                <li className="nav-item"><a href="#contact">Contact</a></li>
                            </ul>
                        </nav>
                        <div className="navigation-actions">
                            <a href="#quote-engine" class="btn-primary">Get a Free Quote</a>
                        </div>
                    </div>
                </div>
            </header>

            <main id="main-content">
                <section className="hero-deployment-zone" id="home">
                    <div className="container hero-grid-architecture">
                        <div className="hero-marketing-copy">
                            <h1 className="display-heading">Fast & Reliable Air Freight Services</h1>
                            <p className="hero-subtext">Track and manage your shipments across our global network with precision supply chain technology. Optimizing delivery rates and expanding modernized fleets.</p>
                            <div className="action-button-group">
                                <a href="#about-us" className="btn-secondary">About us More</a>
                                <a href="#quote-engine" className="btn-primary">Get a Free Quote</a>
                            </div>
                        </div>

                        <div className="shipment-tracking-widget">
                            <div className="widget-visual-header">
                                <div style={{ background: '#ddd', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>[Image: Global Logistics]</div>
                            </div>
                            <div className="widget-interactive-body">
                                <h3 className="widget-title">Global shipment made easy</h3>
                                <p className="widget-description">Air freight terminals and facilities are subject to strict security measures and we take all necessary precautions to ensure cargo safety.</p>
                                <form className="tracking-input-form" onSubmit={(e) => e.preventDefault()}>
                                    <div className="input-append-group">
                                        <input type="text" placeholder="Enter Waybill or Tracking ID" required />
                                        <button type="submit" className="btn-primary input-append-btn">Track</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="industrial-ticker-tape" aria-hidden="true">
                        <div className="ticker-content-track">
                            <span>Explore More - </span><span>Explore More - </span>
                            <span>Explore More - </span><span>Explore More - </span>
                            <span>Explore More - </span><span>Explore More - </span>
                        </div>
                    </div>
                </section>

                <section className="service-matrix-section" id="services">
                    <div className="container">
                        <div className="section-header" style={{ textAlign: 'center' }}>
                            <span className="sub-heading-badge" style={{ background: 'var(--color-surface-alt)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: 'var(--text-size-xs)' }}>What we do</span>
                            <h2 className="section-heading">Boost Your Business Efficiency</h2>
                            <p className="section-description">Digital & Trusted Transport Logistic Company</p>
                        </div>

                        <div className="css-grid-quadrant">
                            <article className="service-feature-card">
                                <div className="card-icon-node">✈️</div>
                                <h4 className="card-title">Airline Freight</h4>
                                <p className="card-text">Flexible shipment options with rapid distribution plans designed for total cost optimization.</p>
                                <a href="#" className="readon-link">Read More &rarr;</a>
                            </article>

                            <article className="service-feature-card">
                                <div className="card-icon-node">🚢</div>
                                <h4 className="card-title">Container Shipping</h4>
                                <p className="card-text">Secure container transit backed by real-time GPS tracking and supply chain visibility.</p>
                                <a href="#" className="readon-link">Read More &rarr;</a>
                            </article>

                            <article className="service-feature-card">
                                <div className="card-icon-node">🌍</div>
                                <h4 className="card-title">International Logistics</h4>
                                <p className="card-text">Global supply chain technology implementations and strategic fleet expansion.</p>
                                <a href="#" className="readon-link">Read More &rarr;</a>
                            </article>

                            <article className="service-feature-card">
                                <div className="card-icon-node">🚛</div>
                                <h4 className="card-title">Multi Model Freight</h4>
                                <p className="card-text">Seamlessly integrated flexible road, rail, and cargo services across vast global networks.</p>
                                <a href="#" className="readon-link">Read More &rarr;</a>
                            </article>
                        </div>
                    </div>
                </section>

                <section className="team-deployment-section">
                    <div className="container">
                        <div className="section-header">
                            <h2 className="section-heading">Meet Our Professional Staff For Logitic</h2>
                        </div>
                        <div className="css-grid-trio">
                            <div className="team-profile-card">
                                <h1 className="team-member-name">Esther Howard</h1>
                                <h3 className="team-member-role">Front Desk Manager</h3>
                                <p className="team-experience">Experience: 10 Years</p>
                            </div>
                            <div className="team-profile-card">
                                <h1 className="team-member-name">Steward Steward</h1>
                                <h3 className="team-member-role">Admin / Field Ranger</h3>
                                <p className="team-experience">Experience: 8 Years</p>
                            </div>
                            <div className="team-profile-card">
                                <h1 className="team-member-name">Leslie Alexander</h1>
                                <h3 className="team-member-role">Marketing Coordinator</h3>
                                <p className="team-experience">Experience: 12 Years</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
