import "../assets/css/home.css"; // Assuming you have a CSS file for styles
const HomeLayout = () => {
  return (
    <>
      <header>
        <div className="container">
          <nav className="navbar">
            <a href="/" className="logo">
              <i className="fas fa-bullseye"></i> NoteurGoals
            </a>
            <div className="auth-buttons">
              <a href="/login" className="btn btn-outline">
                <i className="fas fa-right-to-bracket"></i> Log In
              </a>
              <a href="/register" className="btn btn-primary">
                <i className="fas fa-rocket"></i> Sign Up Free
              </a>
            </div>
          </nav>
        </div>
      </header>

      <main>
        <section style={{ padding: "120px 0" }} className="hero">
          <div className="container">
            <h1>Achieve Your Ambitions with AI-Powered Precision</h1>
            <p>
              The all-in-one platform that transforms your goals into
              achievements. Harness the power of AI, seamless collaboration, and
              smart planning to unlock your full potential.
            </p>
            <div className="hero-buttons">
              <a href="/login" className="btn btn-primary btn-lg">
                Start Your Free Trial
              </a>
            </div>
            <div className="hero-image">
              <img
                src="https://i.imgur.com/GieB5fX.png"
                alt="NoteurGoals Dashboard"
              />
            </div>
          </div>
        </section>

        <section className="power-features" id="features">
          <div className="container">
            <div className="section-title">
              <span className="tag">Our Features</span>
              <h2>Why NoteurGoals is Different</h2>
              <p>
                We provide a comprehensive suite of tools built for success, not
                just task management.
              </p>
            </div>

            <div className="feature-showcase">
              <div className="feature-content">
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
              <div className="feature-image">
                <img
                  src="https://i.imgur.com/r62aHw1.png"
                  alt="AI powered suggestions"
                />
              </div>
            </div>

            <div className="feature-showcase">
              <div className="feature-content">
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
              <div className="feature-image">
                <img
                  src="https://i.imgur.com/2s45V6c.png"
                  alt="Team Collaboration"
                />
              </div>
            </div>

            <div className="feature-showcase">
              <div className="feature-content">
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
              <div className="feature-image">
                <img
                  src="https://i.imgur.com/gK2vW7S.png"
                  alt="Calendar Integration"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="for-everyone" id="for-who">
          <div className="container">
            <div className="section-title">
              <span className="tag">For Everyone</span>
              <h2>A Perfect Fit for Your Ambition</h2>
              <p>
                Whether you're a student, a professional, or leading a team,
                NoteurGoals adapts to your needs.
              </p>
            </div>
            <div className="for-everyone-grid">
              <div className="audience-card">
                <div className="audience-icon">
                  <i className="fas fa-user-graduate"></i>
                </div>
                <h3>Students & Learners</h3>
                <p>
                  Organize your studies, track assignment deadlines, and link
                  your learning goals to our integrated courses to excel
                  academically.
                </p>
              </div>
              <div className="audience-card">
                <div className="audience-icon">
                  <i className="fas fa-user-tie"></i>
                </div>
                <h3>Professionals</h3>
                <p>
                  Manage complex projects, track career development goals, and
                  collaborate with colleagues to drive results and growth.
                </p>
              </div>
              <div className="audience-card">
                <div className="audience-icon">
                  <i className="fas fa-users"></i>
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

        <section className="courses-section" id="courses">
          <div className="container">
            <div className="section-title">
              <span className="tag">Premium Courses</span>
              <h2>Learn and Grow with Integrated Courses</h2>
              <p>
                Don't just set goals—learn how to achieve them. Our curated
                courses provide step-by-step guidance for your biggest
                ambitions.
              </p>
            </div>
            <div className="course-highlight">
              <div className="course-image">
                <i className="fas fa-layer-group"></i>
              </div>
              <div className="course-content">
                <h3>From Aspiration to Expertise</h3>
                <p>
                  Choose from a library of courses on productivity, leadership,
                  fitness, and more. Each course is a pre-built goal template,
                  complete with milestones and resources, ready for you to
                  start.
                </p>
                <a href="#pricing" className="btn btn-primary">
                  Explore Premium Plans
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="testimonials" id="testimonials">
          <div className="container">
            <div className="section-title">
              <span className="tag">Testimonials</span>
              <h2>Loved by Ambitious People Worldwide</h2>
              <p>
                What our successful users are saying about their journey with
                NoteurGoals.
              </p>
            </div>
            <div className="testimonials-grid">
              <div className="testimonial-card">
                <div className="stars">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
                <p className="testimonial-text">
                  "The AI goal breakdown is pure magic. It took my vague idea of
                  'start a business' and turned it into a concrete, actionable
                  plan. I accomplished more in 3 months than I did in the past
                  year."
                </p>
                <div className="testimonial-header">
                  <img
                    src="https://randomuser.me/api/portraits/women/32.jpg"
                    alt="User"
                    className="testimonial-avatar"
                  />
                  <div className="testimonial-author">
                    <h4>Jane D.</h4>
                    <p>Entrepreneur</p>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="stars">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
                <p className="testimonial-text">
                  "As a project manager, the collaboration features are a
                  lifesaver. My team is finally on the same page, and I can see
                  who's doing what without endless meetings. Best tool we've
                  adopted."
                </p>
                <div className="testimonial-header">
                  <img
                    src="https://randomuser.me/api/portraits/men/45.jpg"
                    alt="User"
                    className="testimonial-avatar"
                  />
                  <div className="testimonial-author">
                    <h4>John S.</h4>
                    <p>Project Manager</p>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="stars">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
                <p className="testimonial-text">
                  "I used the 'Master Public Speaking' course and it was
                  phenomenal. The structured milestones and linked notes kept me
                  accountable. I aced my final presentation. Thank you,
                  NoteurGoals!"
                </p>
                <div className="testimonial-header">
                  <img
                    src="https://randomuser.me/api/portraits/women/68.jpg"
                    alt="User"
                    className="testimonial-avatar"
                  />
                  <div className="testimonial-author">
                    <h4>Sarah L.</h4>
                    <p>University Student</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pricing" id="pricing">
          <div className="container">
            <div className="section-title">
              <span className="tag">Pricing</span>
              <h2>The Right Plan for Your Ambition</h2>
              <p>
                Start for free, no credit card required. Upgrade anytime to
                unlock your full potential.
              </p>
            </div>
            <div className="pricing-grid">
              <div className="pricing-card">
                <h3>Free</h3>
                <div className="price">
                  $0 <span>/ forever</span>
                </div>
                <p>Perfect for individuals starting their journey.</p>
                <ul className="pricing-features">
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
                <a href="#" className="btn btn-outline">
                  Start for Free
                </a>
              </div>
              <div className="pricing-card popular">
                <h3>Premium</h3>
                <div className="price">
                  $5 <span>/ month</span>
                </div>
                <p>For individuals and teams serious about success.</p>
                <ul className="pricing-features">
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
                <a href="#" className="btn btn-primary">
                  Choose Premium
                </a>
              </div>
              <div className="pricing-card">
                <h3>Premium Yearly</h3>
                <div className="price">
                  $50 <span>/ year</span>
                </div>
                <p>The best value. Get 2 months free!</p>
                <ul className="pricing-features">
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
                <a href="#" className="btn btn-outline">
                  Go Yearly
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="faq-section" id="faq">
          <div className="container">
            <div className="section-title">
              <span className="tag">FAQ</span>
              <h2>Frequently Asked Questions</h2>
              <p>
                Have questions? We've got answers. If you can't find what you're
                looking for, feel free to contact us.
              </p>
            </div>
            <div className="faq-container">
              <details className="faq-item">
                <summary>
                  What makes NoteurGoals different from other to-do apps?
                </summary>
                <div className="faq-content">
                  <p>
                    NoteurGoals is more than a to-do list. It's a comprehensive
                    achievement system. Our key differentiators are the
                    AI-powered strategic planning, deep collaboration features
                    with roles and permissions, and integrated learning courses
                    that provide a roadmap for your goals.
                  </p>
                </div>
              </details>
              <details className="faq-item">
                <summary>How does the AI assistant actually work?</summary>
                <div className="faq-content">
                  <p>
                    Our AI analyzes the goal you set. For complex goals, it
                    suggests breaking them down into smaller, logical
                    milestones. It also looks at your deadlines and workload to
                    help you prioritize tasks and can even forecast your
                    completion date based on your ongoing progress, helping you
                    stay realistic and motivated.
                  </p>
                </div>
              </details>
              <details className="faq-item">
                <summary>
                  Can I collaborate with people who don't have a Premium plan?
                </summary>
                <div className="faq-content">
                  <p>
                    Yes! As a Premium user, you can invite anyone to collaborate
                    on your goals. They will be able to participate fully in the
                    goals you share with them, even if they are on the Free
                    plan. However, they will still be limited by their own
                    plan's restrictions for creating their own goals. “
                  </p>
                </div>
              </details>
              <details className="faq-item">
                <summary>Can I cancel my subscription at any time?</summary>
                <div className="faq-content">
                  <p>
                    Absolutely. You can cancel your subscription at any time
                    from your account settings. You will retain access to all
                    premium features until the end of your current billing
                    period.
                  </p>
                </div>
              </details>
            </div>
          </div>
        </section>

        <section className="cta">
          <div className="container">
            <h2>Ready to Unlock Your Full Potential?</h2>
            <p>
              Stop dreaming, start doing. Join thousands of achievers and turn
              your ambitions into reality with NoteurGoals. Your first 14 days
              of Premium are on us.
            </p>
            <a href="#" className="btn">
              Start Your Free Premium Trial
            </a>
          </div>
        </section>
      </main>

      <footer>
        <div className="container">
          <div className="footer-content">
            <div className="footer-column">
              <a href="#" className="logo">
                <i className="fas fa-bullseye"></i> NoteurGoals
              </a>
              <p>
                The AI-powered platform for goal achievement, team
                collaboration, and personal growth.
              </p>
              <div className="social-links">
                <a href="#" title="Facebook">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" title="Twitter">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" title="Instagram">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" title="LinkedIn">
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>
            <div className="footer-column">
              <h3>Product</h3>
              <ul className="footer-links">
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
            <div className="footer-column">
              <h3>Resources</h3>
              <ul className="footer-links">
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
            <div className="footer-column">
              <h3>Company</h3>
              <ul className="footer-links">
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
          <div className="footer-bottom">
            <p>© 2025 NoteurGoals. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};
export default HomeLayout;
