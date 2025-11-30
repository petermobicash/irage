import CommentSystem from '../components/chat/CommentSystem';
import Section from '../components/ui/Section';
import Card from '../components/ui/Card';

const About = () => {
  return (
    <div className="w-full">
      {/* Hero Section - Enhanced with Home page style background */}
      <section className="relative min-h-[60vh] lg:min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Dynamic Background - Dark Teal/Navy like Home page */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A3D5C] via-[#0D4A6B] to-[#0A3D5C]">
          <div className="absolute inset-0 bg-[url('/benirage.jpeg')] bg-cover bg-center opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>
        
        {/* Floating Animated Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-blue-400/10 rounded-full blur-xl animate-bounce"></div>
          <div className="absolute bottom-40 left-32 w-40 h-40 bg-yellow-400/5 rounded-full blur-3xl animate-ping"></div>
          <div className="absolute bottom-20 right-20 w-20 h-20 bg-yellow-400/10 rounded-full blur-lg animate-pulse"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="text-4xl lg:text-5xl mb-4 lg:mb-6 animate-fade-in-up">🏛️</div>
            <h1 className="content-hero-title">
              About <span className="text-yellow-400">BENIRAGE</span>
            </h1>
            <p className="content-body-text" style={{color: 'var(--color-white)'}}>
              A legally registered non-governmental organization founded in May 2024, operating under
              legal personality number <span className="font-semibold text-yellow-400">000070|RGB|NGO|LP|01|2025</span> as granted by the Rwanda Governance Board
            </p>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 lg:p-6 inline-block animate-fade-in-up animation-delay-300 hover:bg-white/20 transition-all duration-300">
              <p className="content-small-text" style={{color: 'var(--color-white)'}}>
                🇷🇼 Officially Registered NGO in Rwanda | May 2024 | Legal Personality 000070
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Organization Overview */}
      <Section background="cultural" padding="xl">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="content-section-header">
            Our Commitment
          </h2>
          <div className="bg-white rounded-3xl p-6 lg:p-12 shadow-xl">
            <p className="content-body-text">
              Our organization is dedicated to enhancing the well-being and development of communities
              through a deep commitment to Rwanda's distinctive heritage and cultural traditions.
            </p>
          </div>
        </div>
      </Section>

      {/* Four Interconnected Pillars */}
      <Section background="white" padding="xl">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="content-section-header">
              Our Four Interconnected Pillars
            </h2>
            <p className="content-body-text">
              We pursue our mission through four interconnected pillars that form the foundation of our work
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card variant="premium" className="text-center hover:scale-105 transition-transform">
              <div className="text-3xl lg:text-4xl mb-4 lg:mb-6">🏺</div>
              <h3 className="content-subsection">
                Cultural Values & Practices
              </h3>
              <p className="content-body-text" style={{color: 'var(--color-medium-gray)'}}>
                The preservation and revitalization of cultural values and practices that define
                Rwanda's unique identity and heritage for future generations.
              </p>
            </Card>

            <Card variant="premium" className="text-center hover:scale-105 transition-transform">
              <div className="text-3xl lg:text-4xl mb-4 lg:mb-6">🎓</div>
              <h3 className="content-subsection">
                Education & Research
              </h3>
              <p className="content-body-text" style={{color: 'var(--color-medium-gray)'}}>
                The advancement of education and academic research to deepen understanding
                of Rwanda's history, culture, and development path.
              </p>
            </Card>

            <Card variant="premium" className="text-center hover:scale-105 transition-transform">
              <div className="text-3xl lg:text-4xl mb-4 lg:mb-6">🤝</div>
              <h3 className="content-subsection">
                Knowledge Transfer & Capacity Building
              </h3>
              <p className="content-body-text" style={{color: 'var(--color-medium-gray)'}}>
                The facilitation of knowledge transfer and capacity building to empower
                communities with the skills and understanding needed for sustainable development.
              </p>
            </Card>

            <Card variant="premium" className="text-center hover:scale-105 transition-transform">
              <div className="text-3xl lg:text-4xl mb-4 lg:mb-6">🏛️</div>
              <h3 className="content-subsection">
                Historic Site Stewardship
              </h3>
              <p className="content-body-text" style={{color: 'var(--color-medium-gray)'}}>
                The stewardship of historically significant sites that embody our national
                memory and identity, preserving them for future generations.
              </p>
            </Card>
          </div>
        </div>
      </Section>

      {/* Mission & Vision */}
      <Section background="blue" padding="xl">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white p-4 lg:p-8 rounded-2xl shadow-lg text-center">
              <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                <span className="text-2xl lg:text-3xl">🎯</span>
              </div>
              <h3 className="content-subsection">Our Mission</h3>
              <p className="content-body-text" style={{color: 'var(--color-medium-gray)'}}>
                To enhance the well-being and development of communities through deep commitment
                to Rwanda's distinctive heritage and cultural traditions, working across our four
                interconnected pillars to create lasting positive impact.
              </p>
            </div>

            <div className="bg-white p-4 lg:p-8 rounded-2xl shadow-lg text-center">
              <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-br from-brand-accent to-brand-accent-400 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                <span className="text-2xl lg:text-3xl">👁️</span>
              </div>
              <h3 className="content-subsection">Our Vision</h3>
              <p className="content-body-text" style={{color: 'var(--color-medium-gray)'}}>
                A Rwanda and a world where heritage, culture, wisdom, and spirituality form
                the foundation of peace, resilience, and sustainable development for all communities.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Organization Details */}
      <Section background="cultural" padding="xl">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="content-section-header">
            Legal Foundation
          </h2>
          <div className="bg-white rounded-3xl p-6 lg:p-12 shadow-xl">
            <div className="space-y-6">
              <div className="flex items-center justify-center space-x-3 lg:space-x-4">
                <span className="text-2xl lg:text-3xl">📋</span>
                <div className="text-left">
                  <h4 className="content-subsection" style={{fontSize: 'var(--text-base)'}}>Legal Registration</h4>
                  <p className="content-body-text" style={{color: 'var(--color-medium-gray)'}}>Legal Personality Number: 000070|RGB|NGO|LP|01|2025</p>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-3 lg:space-x-4">
                <span className="text-2xl lg:text-3xl">🏛️</span>
                <div className="text-left">
                  <h4 className="content-subsection" style={{fontSize: 'var(--text-base)'}}>Regulatory Authority</h4>
                  <p className="content-body-text" style={{color: 'var(--color-medium-gray)'}}>Rwanda Governance Board</p>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-3 lg:space-x-4">
                <span className="text-2xl lg:text-3xl">📅</span>
                <div className="text-left">
                  <h4 className="content-subsection" style={{fontSize: 'var(--text-base)'}}>Founded</h4>
                  <p className="content-body-text" style={{color: 'var(--color-medium-gray)'}}>May 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Comments Section */}
      <Section background="white" padding="xl">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="content-section-header">
              Join Our Mission
            </h2>
            <p className="content-body-text">
              Share your thoughts and help us strengthen our community
            </p>
          </div>
          <CommentSystem contentSlug="about-page" allowComments={true} />
        </div>
      </Section>
    </div>
  );
};

export default About;
