import React from 'react';
import { 
  Star, 
  Heart, 
  Sparkles, 
  Zap, 
  Shield, 
  Award,
  ArrowRight,
  Mail,
  Phone,
  Globe
} from 'lucide-react';

// Import our new professional components
import WaveDivider from './WaveDivider';
import ProfessionalCard from './ProfessionalCard';
import { ProfessionalText, IconText } from './ProfessionalText';
import GradientOverlay, { GradientText, GlassOverlay } from './GradientOverlay';
import Button from './Button';

const ProfessionalTouchesDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Wave Divider */}
      <section className="relative bg-gradient-to-br from-brand-main-900 via-brand-main-700 to-teal-800 text-white overflow-hidden">
        <GradientOverlay variant="hero" colors="premium" opacity={30} />
        
        <div className="relative container-modern py-20 lg:py-32">
          <div className="text-center space-y-8">
            <GradientText variant="gold" size="4xl" weight="bold">
              Professional Design System
            </GradientText>
            
            <ProfessionalText 
              variant="subheading" 
              size="xl" 
              color="white" 
              align="center"
              className="max-w-3xl mx-auto opacity-90"
            >
              Showcasing the complete professional touch package with wave dividers, 
              gradient overlays, enhanced cards, consistent typography, and icon integration.
            </ProfessionalText>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button 
                variant="gradient" 
                size="lg" 
                icon={Sparkles}
                className="shadow-2xl"
              >
                Explore Features
              </Button>
              
              <Button 
                variant="glass" 
                size="lg" 
                icon={ArrowRight}
                iconPosition="right"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
        
        {/* Wave Divider at bottom */}
        <WaveDivider direction="down" height="lg" />
      </section>

      {/* Wave Divider Section */}
      <section className="py-16 bg-white">
        <div className="container-modern">
          <div className="text-center space-y-4">
            <ProfessionalText variant="heading" size="3xl">
              Wave SVG Dividers
            </ProfessionalText>
            <ProfessionalText variant="body" color="secondary" align="center">
              Elegant wave separators for professional section transitions
            </ProfessionalText>
          </div>
        </div>
        
        <WaveDivider direction="down" height="md" className="mt-16" color="brand" />
        <WaveDivider direction="up-down" height="sm" className="mt-8" color="gold" />
      </section>

      {/* Professional Cards Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container-modern">
          <div className="text-center space-y-4 mb-12">
            <ProfessionalText variant="heading" size="3xl">
              Enhanced Card Components
            </ProfessionalText>
            <ProfessionalText variant="body" color="secondary" align="center">
              Professional cards with gradients, shadows, and icon integration
            </ProfessionalText>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ProfessionalCard 
              gradient="brand"
              shadow="premium"
              hover="lift"
              icon={Star}
              iconPosition="top"
              iconColor="gold"
              animation="fade-in"
              delay={100}
            >
              <ProfessionalText variant="heading" size="lg" align="center">
                Premium Features
              </ProfessionalText>
              <ProfessionalText variant="body" align="center" className="mt-2">
                Experience the elegance of professionally designed cards with 
                gradient backgrounds and sophisticated hover effects.
              </ProfessionalText>
            </ProfessionalCard>

            <ProfessionalCard 
              gradient="gold"
              shadow="gold-glow"
              hover="glow"
              icon={Heart}
              iconPosition="left"
              iconColor="brand"
              animation="slide-up"
              delay={200}
            >
              <IconText 
                icon={Award}
                text="Award Winning Design"
                variant="heading"
                iconColor="brand"
                className="mb-3"
              />
              <ProfessionalText variant="body">
                Beautifully crafted with attention to detail, featuring glass morphism 
                effects and smooth animations for a premium user experience.
              </ProfessionalText>
            </ProfessionalCard>

            <ProfessionalCard 
              gradient="premium"
              shadow="brand-glow"
              hover="3d"
              icon={Shield}
              iconPosition="right"
              iconColor="teal"
              background="glass"
              animation="scale-in"
              delay={300}
            >
              <ProfessionalText variant="heading" size="lg" align="center">
                3D Hover Effects
              </ProfessionalText>
              <ProfessionalText variant="body" align="center" className="mt-2">
                Interactive cards with depth and dimension that respond beautifully 
                to user interactions.
              </ProfessionalText>
            </ProfessionalCard>
          </div>
        </div>
      </section>

      {/* Gradient Overlays Section */}
      <section className="py-16 bg-gradient-to-br from-brand-main-900 to-teal-800 text-white relative overflow-hidden">
        <GradientOverlay variant="section" colors="oceanic" opacity={20} />
        
        <div className="relative container-modern">
          <div className="text-center space-y-4 mb-12">
            <ProfessionalText variant="heading" size="3xl" color="white">
              Gradient Overlay System
            </ProfessionalText>
            <ProfessionalText variant="body" color="white" align="center" className="opacity-90">
              Multiple gradient styles for different use cases
            </ProfessionalText>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <GlassOverlay variant="brand" className="p-6">
              <IconText 
                icon={Zap}
                text="Brand Glass"
                variant="heading"
                iconColor="brand"
                direction="vertical"
                className="text-center"
              />
            </GlassOverlay>
            
            <GlassOverlay variant="gold" className="p-6">
              <IconText 
                icon={Star}
                text="Gold Glass"
                variant="heading"
                iconColor="gold"
                direction="vertical"
                className="text-center"
              />
            </GlassOverlay>
            
            <GlassOverlay variant="light" className="p-6">
              <IconText 
                icon={Shield}
                text="Light Glass"
                variant="heading"
                iconColor="white"
                direction="vertical"
                className="text-center"
              />
            </GlassOverlay>
            
            <GlassOverlay variant="dark" className="p-6">
              <IconText 
                icon={Heart}
                text="Dark Glass"
                variant="heading"
                iconColor="white"
                direction="vertical"
                className="text-center"
              />
            </GlassOverlay>
          </div>
        </div>
        
        <WaveDivider direction="up" height="lg" />
      </section>

      {/* Typography System Section */}
      <section className="py-16 bg-white">
        <div className="container-modern">
          <div className="text-center space-y-4 mb-12">
            <ProfessionalText variant="heading" size="3xl">
              Typography System
            </ProfessionalText>
            <ProfessionalText variant="body" color="secondary" align="center">
              Consistent typography with multiple variants and weights
            </ProfessionalText>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div>
                <ProfessionalText variant="display" size="4xl" color="brand">
                  Display Heading
                </ProfessionalText>
                <ProfessionalText variant="caption">
                  Font: Playfair Display, Weight: Bold
                </ProfessionalText>
              </div>
              
              <div>
                <ProfessionalText variant="heading" size="2xl" color="teal">
                  Section Heading
                </ProfessionalText>
                <ProfessionalText variant="caption">
                  Font: Inter, Weight: Semibold
                </ProfessionalText>
              </div>
              
              <div>
                <ProfessionalText variant="subheading" size="xl" color="gold">
                  Subsection Heading
                </ProfessionalText>
                <ProfessionalText variant="caption">
                  Font: Inter, Weight: Medium
                </ProfessionalText>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <ProfessionalText variant="body" size="base">
                  Body text with consistent spacing and readability. 
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </ProfessionalText>
                <ProfessionalText variant="caption">
                  Font: Inter, Weight: Normal, Line Height: Normal
                </ProfessionalText>
              </div>
              
              <div>
                <ProfessionalText variant="label" color="brand">
                  LABEL TEXT
                </ProfessionalText>
                <ProfessionalText variant="caption">
                  Font: Inter, Weight: Medium, Uppercase, Tracked
                </ProfessionalText>
              </div>
              
              <div>
                <ProfessionalText variant="caption" color="gray">
                  Caption text for supporting information and metadata.
                </ProfessionalText>
                <ProfessionalText variant="caption">
                  Font: Inter, Weight: Normal, Size: Small
                </ProfessionalText>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Button Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-modern">
          <div className="text-center space-y-4 mb-12">
            <ProfessionalText variant="heading" size="3xl">
              Enhanced Button System
            </ProfessionalText>
            <ProfessionalText variant="body" color="secondary" align="center">
              Professional buttons with multiple variants and icon integration
            </ProfessionalText>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <ProfessionalText variant="subheading">Primary Variants</ProfessionalText>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" icon={Star}>Primary</Button>
                <Button variant="secondary" icon={Heart}>Secondary</Button>
                <Button variant="gradient" icon={Sparkles}>Gradient</Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <ProfessionalText variant="subheading">Outline & Ghost</ProfessionalText>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline" icon={Shield}>Outline</Button>
                <Button variant="glass" icon={Award}>Glass</Button>
                <Button variant="ghost" icon={Zap}>Ghost</Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <ProfessionalText variant="subheading">Icon Positions</ProfessionalText>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" icon={Mail} iconPosition="left">Left Icon</Button>
                <Button variant="primary" icon={Phone} iconPosition="right">Right Icon</Button>
                <Button variant="primary" icon={Globe}>Icon Only</Button>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12 space-y-4">
            <Button 
              variant="gradient" 
              size="lg" 
              loading={false}
              icon={ArrowRight}
              className="shadow-2xl"
            >
              Experience Professional Design
            </Button>
          </div>
        </div>
      </section>

      {/* Final Wave Divider */}
      <WaveDivider direction="up" height="xl" color="gradient" />
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container-modern text-center">
          <ProfessionalText variant="heading" size="2xl" color="white" className="mb-4">
            Professional Touches Package
          </ProfessionalText>
          <ProfessionalText variant="body" color="white" className="opacity-75 mb-8">
            Complete design system with wave dividers, gradient overlays, enhanced cards, 
            consistent typography, and professional icon integration.
          </ProfessionalText>
          
          <div className="flex justify-center space-x-6">
            <IconText 
              icon={Star}
              text="Wave SVG Dividers"
              iconColor="gold"
              variant="caption"
            />
            <IconText 
              icon={Heart}
              text="Gradient Overlays"
              iconColor="teal"
              variant="caption"
            />
            <IconText 
              icon={Shield}
              text="Enhanced Cards"
              iconColor="brand"
              variant="caption"
            />
            <IconText 
              icon={Award}
              text="Typography System"
              iconColor="white"
              variant="caption"
            />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProfessionalTouchesDemo;