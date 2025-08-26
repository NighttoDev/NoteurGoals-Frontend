import "../assets/css/home.css";
const HomeLayout = () => {
  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-container">
          <nav className="home-navbar">
            <a href="/" className="home-logo">
              <i className="fas fa-bullseye"></i> NoteurGoals
            </a>
            <div className="home-auth-buttons">
              <a href="/login" className="home-btn home-btn-outline">
                <i className="fas fa-right-to-bracket"></i> Log In
              </a>
              <a href="/register" className="home-btn home-btn-primary">
                <i className="fas fa-rocket"></i> Sign Up Free
              </a>
            </div>
          </nav>
        </div>
      </header>

      <main className="home-main">
        <section style={{ padding: "120px 0" }} className="home-hero">
          <div className="home-container">
            <h1>Achieve Your Ambitions with AI-Powered Precision</h1>
            <p>
              The all-in-one platform that transforms your goals into
              achievements. Harness the power of AI, seamless collaboration, and
              smart planning to unlock your full potential.
            </p>
            <div className="home-hero-buttons">
              <a
                href="/login"
                className="home-btn home-btn-primary home-btn-lg"
              >
                Start Your Free Trial
              </a>
            </div>
            <div className="home-hero-image">
              <img
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="NoteurGoals Dashboard Preview"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        <section className="home-power-features" id="features">
          <div className="home-container">
            <div className="home-section-title">
              <span className="home-tag">Our Features</span>
              <h2 style={{ color: "white" }}>Why NoteurGoals is Different</h2>
              <p>
                We provide a comprehensive suite of tools built for success, not
                just task management.
              </p>
            </div>

            <div className="home-feature-showcase">
              <div className="home-feature-content">
                <h3>Let AI Be Your Strategic Partner</h3>
                <p>
                  Stop guessing, start achieving. Our intelligent assistant
                  helps you craft perfect plans and stay on track.
                </p>
                <ul>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    <strong>Goal Breakdown:</strong> Automatically splits large
                    goals into manageable milestones.
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    <strong>Smart Prioritization:</strong> Suggests what to
                    focus on for maximum impact.
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    <strong>Completion Forecast:</strong> Predicts your success
                    timeline based on your progress.
                  </li>
                </ul>
              </div>
              <div className="home-feature-image">
                <img
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="AI-Powered Goal Suggestions"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="home-feature-showcase">
              <div className="home-feature-content">
                <h3>Achieve More, Together</h3>
                <p>
                  Collaboration is built into our core. Invite your team,
                  friends, or a mentor to share the journey and the success.
                </p>
                <ul>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    <strong>Team Workspaces:</strong> Create shared goals and
                    track group progress in real-time.
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    <strong>Roles & Permissions:</strong> Assign owners,
                    members, and viewers for clear accountability.
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    <strong>Friend System:</strong> Connect with peers, share
                    updates, and build a support network.
                  </li>
                </ul>
              </div>
              <div className="home-feature-image">
                <img
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Team Collaboration Dashboard"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="home-feature-showcase">
              <div className="home-feature-content">
                <h3>Integrate Plans Into Your Life</h3>
                <p>
                  Connect your goals to your daily schedule. NoteurGoals works
                  with your calendar to make planning and execution effortless.
                </p>
                <ul>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    <strong>Event Management:</strong> Create events and link
                    them directly to your goals or milestones.
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    <strong>Recurring Tasks:</strong> Set up daily, weekly, or
                    monthly habits to build consistency.
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    <strong>Google Calendar Sync (Premium):</strong> See your
                    goals alongside all your other appointments.
                  </li>
                </ul>
              </div>
              <div className="home-feature-image">
                <img
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Calendar Integration Preview"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="home-for-everyone" id="for-who">
          <div className="home-container">
            <div className="home-section-title">
              <span className="home-tag">For Everyone</span>
              <h2>A Perfect Fit for Your Ambition</h2>
              <p>
                Whether you're a student, a professional, or leading a team,
                NoteurGoals adapts to your needs.
              </p>
            </div>
            <div className="home-for-everyone-grid">
              <div className="home-audience-card">
                <div className="home-audience-image round">
                  <img
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                    alt="Students & Learners"
                    loading="lazy"
                  />
                </div>
                <h3>Students & Learners</h3>
                <p>
                  Organize your studies, track assignment deadlines, and link
                  your learning goals to our integrated courses to excel
                  academically.
                </p>
              </div>
              <div className="home-audience-card">
                <div className="home-audience-image round">
                  <img
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                    alt="Professionals"
                    loading="lazy"
                  />
                </div>
                <h3>Professionals</h3>
                <p>
                  Manage complex projects, track career development goals, and
                  collaborate with colleagues to drive results and growth.
                </p>
              </div>
              <div className="home-audience-card">
                <div className="home-audience-image round">
                  <img
                    src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                    alt="Teams & Groups"
                    loading="lazy"
                  />
                </div>
                <h3>Teams & Groups</h3>
                <p>
                  Align your entire team on key objectives, monitor progress
                  with shared dashboards, and foster a culture of accountability
                  and success.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="home-courses-section" id="courses">
          <div className="home-container">
            <div className="home-section-title">
              <span className="home-tag">Premium Courses</span>
              <h2>Learn and Grow with Integrated Courses</h2>
              <p>
                Don't just set goals—learn how to achieve them. Our curated
                courses provide step-by-step guidance for your biggest
                ambitions.
              </p>
            </div>
            <div className="home-course-highlight">
              <div className="home-course-image">
                <img
                  src="https://img.icons8.com/?size=100&id=Vi4yU3hEPGoI&format=png&color=FFFFFF"
                  alt="From Aspiration to Expertise"
                  style={{ maxWidth: "200px", height: "auto" }}
                  loading="lazy"
                />
              </div>
              <div className="home-course-content">
                <h3>From Aspiration to Expertise</h3>
                <p>
                  Choose from a library of courses on productivity, leadership,
                  fitness, and more. Each course is a pre-built goal template,
                  complete with milestones and resources, ready for you to
                  start.
                </p>
                <a href="#pricing" className="home-btn home-btn-primary">
                  Explore Premium Plans
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="home-testimonials" id="testimonials">
          <div className="home-container">
            <div className="home-section-title">
              <span className="home-tag">Testimonials</span>
              <h2>Loved by Ambitious People Worldwide</h2>
              <p>
                What our successful users are saying about their journey with
                NoteurGoals.
              </p>
            </div>
            <div className="home-testimonials-grid">
              <div className="home-testimonial-card">
                <div className="home-stars">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
                <p className="home-testimonial-text">
                  "The AI goal breakdown is pure magic. It took my vague idea of
                  'start a business' and turned it into a concrete, actionable
                  plan. I accomplished more in 3 months than I did in the past
                  year."
                </p>
                <div className="home-testimonial-header">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
                    alt="Jane D."
                    className="home-testimonial-avatar"
                    loading="lazy"
                  />
                  <div className="home-testimonial-author">
                    <h4>Jane D.</h4>
                    <p>Entrepreneur</p>
                  </div>
                </div>
              </div>
              <div className="home-testimonial-card">
                <div className="home-stars">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
                <p className="home-testimonial-text">
                  "As a project manager, the collaboration features are a
                  lifesaver. My team is finally on the same page, and I can see
                  who's doing what without endless meetings. Best tool we've
                  adopted."
                </p>
                <div className="home-testimonial-header">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
                    alt="John S."
                    className="home-testimonial-avatar"
                    loading="lazy"
                  />
                  <div className="home-testimonial-author">
                    <h4>John S.</h4>
                    <p>Project Manager</p>
                  </div>
                </div>
              </div>
              <div className="home-testimonial-card">
                <div className="home-stars">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
                <p className="home-testimonial-text">
                  "I used the 'Master Public Speaking' course and it was
                  phenomenal. The structured milestones and linked notes kept me
                  accountable. I aced my final presentation. Thank you,
                  NoteurGoals!"
                </p>
                <div className="home-testimonial-header">
                  <img
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
                    alt="Sarah L."
                    className="home-testimonial-avatar"
                    loading="lazy"
                  />
                  <div className="home-testimonial-author">
                    <h4>Sarah L.</h4>
                    <p>University Student</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="home-pricing" id="pricing">
          <div className="home-container">
            <div className="home-section-title">
              <span className="home-tag">Pricing</span>
              <h2>The Right Plan for Your Ambition</h2>
              <p>
                Start for free, no credit card required. Upgrade anytime to
                unlock your full potential.
              </p>
            </div>
            <div className="home-pricing-grid">
              <div className="home-pricing-card">
                <div className="home-pricing-image">
                  <img
                    src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                    alt="Free Plan Illustration"
                    loading="lazy"
                  />
                </div>
                <h3>Free</h3>
                <div className="home-price">
                  $0 <span>/ forever</span>
                </div>
                <p>Perfect for individuals starting their journey.</p>
                <ul className="home-pricing-features">
                  <li>
                    <i className="fas fa-check-circle"></i> 3 Active Goals
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i> 50 Notes &
                    Milestones
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i> Basic Collaboration
                    (1 user)
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i> Standard Email
                    Support
                  </li>
                </ul>
                <a href="#" className="home-btn home-btn-outline">
                  Start for Free
                </a>
              </div>
              <div className="home-pricing-card popular">
                <div className="home-pricing-image">
                  <img
                    src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                    alt="Premium Plan Illustration"
                    loading="lazy"
                  />
                </div>
                <h3>Premium</h3>
                <div className="home-price">
                  $5 <span>/ month</span>
                </div>
                <p>For individuals and teams serious about success.</p>
                <ul className="home-pricing-features">
                  <li>
                    <i className="fas fa-check-circle"></i>
                    <strong>Everything in Free, plus:</strong>
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    <strong>Unlimited</strong> Goals & Notes
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    <strong>Advanced AI</strong> Suggestions
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    <strong>Team Collaboration</strong> (up to 10)
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    <strong>Google Calendar</strong> Integration
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    <strong>Priority Support</strong>
                  </li>
                </ul>
                <a href="#" className="home-btn home-btn-primary">
                  Choose Premium
                </a>
              </div>
              <div className="home-pricing-card">
                <div className="home-pricing-image">
                  <img
                    src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                    alt="Premium Yearly Plan Illustration"
                    loading="lazy"
                  />
                </div>
                <h3>Premium Yearly</h3>
                <div className="home-price">
                  $50 <span>/ year</span>
                </div>
                <p>The best value. Get 2 months free!</p>
                <ul className="home-pricing-features">
                  <li>
                    <i className="fas fa-check-circle"></i>
                    <strong>Everything in Premium</strong>
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i> Save 20% Compared to
                    Monthly
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i> Access to all
                    <strong>Premium Courses</strong>
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i> Advanced Goal & File
                    Attachments
                  </li>
                </ul>
                <a href="#" className="home-btn home-btn-outline">
                  Go Yearly
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="home-faq-section" id="faq">
          <div className="home-container">
            <div className="home-section-title">
              <span className="home-tag">FAQ</span>
              <h2 style={{ color: "white" }}>Frequently Asked Questions</h2>
              <p>
                Have questions? We've got answers. If you can't find what you're
                looking for, feel free to contact us.
              </p>
            </div>
            <div className="home-faq-container">
              <details className="home-faq-item">
                <summary>
                  <i className="fas fa-question-circle"></i>
                  What sets NoteurGoals apart from other to-do apps?
                </summary>
                <div className="home-faq-content">
                  <p>
                    NoteurGoals is a comprehensive achievement platform, not
                    just a to-do list. It offers AI-powered planning, robust
                    collaboration with roles and permissions, and integrated
                    courses to guide your goals.
                  </p>
                </div>
              </details>
              <details className="home-faq-item">
                <summary>
                  <i className="fas fa-robot"></i>
                  How does the AI assistant work?
                </summary>
                <div className="home-faq-content">
                  <p>
                    Our AI analyzes your goals, breaks them into manageable
                    milestones, prioritizes tasks based on deadlines and
                    workload, and forecasts completion dates to keep you on
                    track.
                  </p>
                </div>
              </details>
              <details className="home-faq-item">
                <summary>
                  <i className="fas fa-users"></i>
                  Can I collaborate with non-Premium users?
                </summary>
                <div className="home-faq-content">
                  <p>
                    Yes, Premium users can invite anyone to collaborate on
                    shared goals. Non-Premium users can participate fully in
                    shared goals but are limited by their plan for creating
                    their own.
                  </p>
                </div>
              </details>
              <details className="home-faq-item">
                <summary>
                  <i className="fas fa-times-circle"></i>
                  Can I cancel my subscription anytime?
                </summary>
                <div className="home-faq-content">
                  <p>
                    Yes, you can cancel your subscription at any time from your
                    account settings. You'll retain premium features until the
                    end of your billing period.
                  </p>
                </div>
              </details>
            </div>
          </div>
        </section>

        <section className="home-cta">
          <div className="home-container">
            <h2>Ready to Unlock Your Full Potential?</h2>
            <p>
              Stop dreaming, start doing. Join thousands of achievers and turn
              your ambitions into reality with NoteurGoals. Your first 14 days
              of Premium are on us.
            </p>
            <a href="#" className="home-btn">
              Start Your Free Premium Trial
            </a>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="home-container">
          <div className="home-footer-main">
            <div className="home-footer-column">
              <a href="#" className="home-logo">
                NoteurGoals
              </a>
              <p>
                Empowering your ambitions with AI-driven goal achievement and
                collaboration.
              </p>
              <div
                className="home-footer-image"
                style={{ marginTop: "20px" }}
              ></div>
              <div
                className="home-social-links"
                style={{ marginTop: "16px", gap: "12px" }}
              >
                <a
                  href="https://www.facebook.com/nguyen.thanh.o.866884"
                  title="Facebook"
                >
                  <i
                    className="fab fa-facebook-f"
                    style={{ fontSize: "18px" }}
                  ></i>
                </a>
                <a href="#" title="Twitter">
                  <i
                    className="fab fa-twitter"
                    style={{ fontSize: "18px" }}
                  ></i>
                </a>
                <a href="#" title="Instagram">
                  <i
                    className="fab fa-instagram"
                    style={{ fontSize: "18px" }}
                  ></i>
                </a>
                <a href="#" title="LinkedIn">
                  <i
                    className="fab fa-linkedin-in"
                    style={{ fontSize: "18px" }}
                  ></i>
                </a>
              </div>
            </div>
            <div className="home-footer-column">
              <h3>Product</h3>
              <ul className="home-footer-links">
                <li>
                  <a href="#features">Features</a>
                </li>
                <li>
                  <a href="#pricing">Pricing</a>
                </li>
                <li>
                  <a href="#courses">Courses</a>
                </li>
                <li>
                  <a href="#">Log In</a>
                </li>
              </ul>
            </div>
            <div className="home-footer-column">
              <h3>Resources</h3>
              <ul className="home-footer-links">
                <li>
                  <a href="#">Blog</a>
                </li>
                <li>
                  <a href="#">Guides</a>
                </li>
                <li>
                  <a href="#faq">FAQ</a>
                </li>
                <li>
                  <a href="#">Support Center</a>
                </li>
              </ul>
            </div>
            <div className="home-footer-column">
              <h3>Company</h3>
              <ul className="home-footer-links">
                <li>
                  <a href="#">About Us</a>
                </li>
                <li>
                  <a href="#">Careers</a>
                </li>
                <li>
                  <a href="#">Contact</a>
                </li>
                <li>
                  <a href="#">Terms of Service</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="home-footer-lower">
            <div className="home-footer-sub-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Cookie Policy</a>
              <a href="#">
                <i
                  className="fas fa-envelope"
                  style={{ marginRight: "8px" }}
                ></i>
                support@noteurgoals.com
              </a>
            </div>
            <p>© 2025 NoteurGoals. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default HomeLayout;
