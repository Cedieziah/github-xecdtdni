import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Award, 
  BookOpen, 
  Users, 
  Globe, 
  Shield, 
  Cpu, 
  Zap,
  CheckCircle,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Target,
  Play,
  Monitor,
  UserCheck,
  CreditCard,
  GraduationCap,
  Menu,
  X
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleViewCourses = () => {
    navigate('/courses');
  };

  const features = [
    {
      icon: Award,
      title: "Certified Excellence",
      description: "CompTIA authorized training center with PRC-accredited CPD provider status and internationally recognized certifications.",
      highlights: ["CompTIA Partner", "PRC Accredited", "Global Recognition"]
    },
    {
      icon: Cpu,
      title: "Specialized Programs",
      description: "Comprehensive training in cutting-edge technologies that drive the future of tech industry.",
      highlights: ["Electronics & PCB Design", "Robotics & Automation", "Cybersecurity & IT"]
    },
    {
      icon: Globe,
      title: "Flexible Learning",
      description: "Choose from multiple learning formats designed to fit your schedule and learning preferences.",
      highlights: ["Online Courses", "Blended Learning", "Face-to-Face Training"]
    }
  ];

  const courses = [
    {
      title: "CompTIA Security+",
      category: "Cybersecurity",
      price: "₱35,000",
      duration: "40 hours",
      startDate: "Feb 15, 2025",
      outcomes: ["Industry-standard security certification", "Hands-on security tools training", "Career advancement opportunities"],
      featured: true
    },
    {
      title: "PCB Design Fundamentals",
      category: "Electronics",
      price: "₱28,000",
      duration: "32 hours",
      startDate: "Mar 1, 2025",
      outcomes: ["Professional PCB design skills", "Industry software proficiency", "Project portfolio development"]
    },
    {
      title: "Robotics Programming",
      category: "Robotics",
      price: "₱42,000",
      duration: "48 hours",
      startDate: "Feb 22, 2025",
      outcomes: ["Robot programming expertise", "Automation system design", "Industry 4.0 readiness"]
    }
  ];

  const partners = [
    { name: "CompTIA", logo: "🏆" },
    { name: "DOST", logo: "🔬" },
    { name: "LPU", logo: "🎓" },
    { name: "Linux Institute", logo: "🐧" },
    { name: "Python Institute", logo: "🐍" },
    { name: "PRC", logo: "📋" }
  ];

  const enrollmentSteps = [
    {
      step: 1,
      title: "Register",
      description: "Create your account with basic information",
      icon: UserCheck
    },
    {
      step: 2,
      title: "Login",
      description: "Access your personalized dashboard",
      icon: Monitor
    },
    {
      step: 3,
      title: "Pay via E-wallet",
      description: "Secure payment through digital wallets",
      icon: CreditCard
    },
    {
      step: 4,
      title: "Access LMS",
      description: "Start learning immediately",
      icon: GraduationCap
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary-black to-primary-dark">
      {/* Navigation */}
      <nav className="bg-primary-black/90 backdrop-blur-sm border-b border-primary-gray/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-orange rounded-lg flex items-center justify-center">
                <Zap size={24} className="text-white" />
              </div>
              <span className="text-2xl font-bold text-primary-white">EIRA</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button 
                onClick={handleViewCourses}
                className="text-primary-white/70 hover:text-primary-orange transition-colors"
              >
                Courses
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className="text-primary-white/70 hover:text-primary-orange transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-primary-white/70 hover:text-primary-orange transition-colors"
              >
                Contact
              </button>
              <Button variant="primary" size="sm" onClick={handleGetStarted}>
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="!p-2"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-primary-gray/30 py-4"
            >
              <div className="flex flex-col space-y-4">
                <button 
                  onClick={handleViewCourses}
                  className="text-primary-white/70 hover:text-primary-orange transition-colors text-left"
                >
                  Courses
                </button>
                <button 
                  onClick={() => scrollToSection('about')}
                  className="text-primary-white/70 hover:text-primary-orange transition-colors text-left"
                >
                  About
                </button>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="text-primary-white/70 hover:text-primary-orange transition-colors text-left"
                >
                  Contact
                </button>
                <Button variant="primary" size="sm" onClick={handleGetStarted} className="w-full">
                  Get Started
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-12 lg:py-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-32 lg:w-64 h-32 lg:h-64 bg-primary-orange/5 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 lg:w-96 h-48 lg:h-96 bg-robotic-blue/5 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-primary-white mb-4 lg:mb-6 leading-tight">
                Advance Your Tech Career with 
                <span className="text-primary-orange"> Industry-Recognized</span> Certifications
              </h1>
              <p className="text-lg lg:text-xl text-primary-white/80 mb-6 lg:mb-8 leading-relaxed">
                Join the leading Philippine academy for Electronics, Robotics, and Cybersecurity training. 
                Transform your career with world-class education and industry partnerships.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8 lg:mb-12">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={handleViewCourses}
                  className="w-full sm:w-auto"
                >
                  <BookOpen size={20} />
                  Explore Courses
                  <ArrowRight size={20} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="lg"
                  className="w-full sm:w-auto border-primary-orange text-primary-orange hover:bg-primary-orange hover:text-white"
                >
                  <Play size={20} />
                  Watch Demo
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                <div className="flex items-center gap-2 text-primary-white/90">
                  <Award size={16} lg:size={20} className="text-primary-orange" />
                  <span className="text-xs lg:text-sm font-medium">CompTIA Partner</span>
                </div>
                <div className="flex items-center gap-2 text-primary-white/90">
                  <Shield size={16} lg:size={20} className="text-robotic-green" />
                  <span className="text-xs lg:text-sm font-medium">PRC Accredited</span>
                </div>
                <div className="flex items-center gap-2 text-primary-white/90">
                  <Globe size={16} lg:size={20} className="text-robotic-blue" />
                  <span className="text-xs lg:text-sm font-medium">Python Institute Partner</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <Card className="bg-primary-black/50 backdrop-blur-sm border-primary-gray/30" glow>
                <div className="grid grid-cols-2 gap-4 lg:gap-6">
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-primary-white">5,000+</div>
                    <div className="text-primary-white/70 text-sm">Students Trained</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-primary-white">95%</div>
                    <div className="text-primary-white/70 text-sm">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-primary-white">50+</div>
                    <div className="text-primary-white/70 text-sm">Industry Partners</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-primary-white">15+</div>
                    <div className="text-primary-white/70 text-sm">Years Experience</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section id="about" className="py-12 lg:py-20 bg-primary-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 lg:mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-primary-white mb-4">
              Why Choose EIRA Academy?
            </h2>
            <p className="text-lg lg:text-xl text-primary-white/70 max-w-3xl mx-auto">
              We combine industry expertise, cutting-edge curriculum, and flexible learning options 
              to deliver world-class technology education.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full bg-primary-black/50 border-primary-gray/30 hover:border-primary-orange/50 transition-all duration-300">
                    <div className="w-12 lg:w-16 h-12 lg:h-16 bg-primary-orange/20 rounded-2xl flex items-center justify-center mb-4 lg:mb-6">
                      <Icon size={24} lg:size={32} className="text-primary-orange" />
                    </div>
                    <h3 className="text-xl lg:text-2xl font-bold text-primary-white mb-3 lg:mb-4">{feature.title}</h3>
                    <p className="text-primary-white/70 mb-4 lg:mb-6 leading-relaxed">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle size={14} lg:size={16} className="text-robotic-green" />
                          <span className="text-primary-white/80 text-sm">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 lg:py-16 bg-primary-gray/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 lg:mb-12"
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-primary-white mb-4">Trusted by Industry Leaders</h2>
            <p className="text-primary-white/70">Our partnerships and recognitions speak to our commitment to excellence</p>
          </motion.div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 lg:gap-8 items-center">
            {partners.map((partner, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 lg:w-20 h-16 lg:h-20 bg-primary-black/50 rounded-xl border border-primary-gray/30 flex items-center justify-center mx-auto mb-2 lg:mb-3 hover:border-primary-orange/50 transition-colors">
                  <span className="text-2xl lg:text-3xl">{partner.logo}</span>
                </div>
                <p className="text-xs lg:text-sm font-medium text-primary-white/80">{partner.name}</p>
              </motion.div>
            ))}
          </div>

          {/* Awards */}
          <div className="mt-12 lg:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <Card className="text-center bg-primary-orange/10 border-primary-orange/30">
              <Star size={24} lg:size={32} className="text-primary-orange mx-auto mb-3" />
              <h3 className="font-bold text-primary-white">Q Asia Excellence Award</h3>
              <p className="text-sm text-primary-white/70 mt-2">Outstanding Training Provider 2023</p>
            </Card>
            <Card className="text-center bg-robotic-blue/10 border-robotic-blue/30">
              <Award size={24} lg:size={32} className="text-robotic-blue mx-auto mb-3" />
              <h3 className="font-bold text-primary-white">Philippine Social Media Awards</h3>
              <p className="text-sm text-primary-white/70 mt-2">Best Educational Content 2023</p>
            </Card>
            <Card className="text-center bg-robotic-green/10 border-robotic-green/30">
              <Shield size={24} lg:size={32} className="text-robotic-green mx-auto mb-3" />
              <h3 className="font-bold text-primary-white">ISO 9001:2015 Certified</h3>
              <p className="text-sm text-primary-white/70 mt-2">Quality Management System</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Course Catalog Preview */}
      <section id="courses" className="py-12 lg:py-20 bg-primary-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 lg:mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-primary-white mb-4">Featured Courses</h2>
            <p className="text-lg lg:text-xl text-primary-white/70 max-w-3xl mx-auto">
              Comprehensive certification programs designed to advance your career in technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {courses.map((course, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className={`h-full bg-primary-black/50 border-primary-gray/30 hover:border-primary-orange/50 transition-all duration-300 ${
                  course.featured ? 'ring-2 ring-primary-orange/50 bg-primary-orange/5' : ''
                }`}>
                  {course.featured && (
                    <div className="bg-primary-orange text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                      MOST POPULAR
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <span className="text-sm font-medium text-robotic-blue bg-robotic-blue/20 px-2 py-1 rounded">
                      {course.category}
                    </span>
                  </div>
                  
                  <h3 className="text-xl lg:text-2xl font-bold text-primary-white mb-3">{course.title}</h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl lg:text-3xl font-bold text-primary-orange">{course.price}</div>
                    <div className="text-right">
                      <div className="text-sm text-primary-white/70">Duration</div>
                      <div className="font-semibold text-primary-white">{course.duration}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-6">
                    <Calendar size={16} className="text-primary-white/70" />
                    <span className="text-sm text-primary-white/70">Starts {course.startDate}</span>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-primary-white mb-3">Learning Outcomes:</h4>
                    <ul className="space-y-2">
                      {course.outcomes.map((outcome, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Target size={14} className="text-robotic-green mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-primary-white/70">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    variant={course.featured ? "primary" : "secondary"} 
                    className="w-full"
                    onClick={handleGetStarted}
                  >
                    Enroll Now
                    <ArrowRight size={16} />
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8 lg:mt-12">
            <Button variant="ghost" size="lg" onClick={handleViewCourses} className="border-primary-orange text-primary-orange hover:bg-primary-orange hover:text-white">
              View All Courses
              <ArrowRight size={20} />
            </Button>
          </div>
        </div>
      </section>

      {/* Enrollment Steps */}
      <section className="py-12 lg:py-20 bg-primary-gray/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 lg:mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-primary-white mb-4">Simple Enrollment Process</h2>
            <p className="text-lg lg:text-xl text-primary-white/70">Get started in just 4 easy steps</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {enrollmentSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="relative mb-4 lg:mb-6">
                    <div className="w-16 lg:w-20 h-16 lg:h-20 bg-primary-orange rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon size={24} lg:size={32} className="text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 lg:w-8 h-6 lg:h-8 bg-robotic-green rounded-full flex items-center justify-center">
                      <span className="text-xs lg:text-sm font-bold text-white">{step.step}</span>
                    </div>
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold text-primary-white mb-2 lg:mb-3">{step.title}</h3>
                  <p className="text-primary-white/70 text-sm lg:text-base">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 lg:py-20 bg-primary-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-primary-white mb-4 lg:mb-6">Get in Touch</h2>
              <p className="text-lg lg:text-xl text-primary-white/70 mb-6 lg:mb-8">
                Ready to advance your tech career? Contact us today to learn more about our programs.
              </p>

              <div className="space-y-4 lg:space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-primary-orange/20 rounded-lg flex items-center justify-center">
                    <MapPin size={18} lg:size={20} className="text-primary-orange" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-white">Makati City Office</h3>
                    <p className="text-primary-white/70 text-sm lg:text-base">123 Tech Hub Street, Makati City, Metro Manila</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-primary-orange/20 rounded-lg flex items-center justify-center">
                    <Phone size={18} lg:size={20} className="text-primary-orange" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-white">Phone</h3>
                    <p className="text-primary-white/70 text-sm lg:text-base">+63 2 8123 4567</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-primary-orange/20 rounded-lg flex items-center justify-center">
                    <Mail size={18} lg:size={20} className="text-primary-orange" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-white">Email</h3>
                    <p className="text-primary-white/70 text-sm lg:text-base">info@eira.academy</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-primary-black/50 border-primary-gray/30">
                <h3 className="text-xl lg:text-2xl font-bold text-primary-white mb-4 lg:mb-6">Send us a Message</h3>
                <form className="space-y-4 lg:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary-white mb-2">First Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 lg:px-4 lg:py-3 bg-primary-black border border-primary-gray rounded-lg text-primary-white placeholder-primary-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-white mb-2">Last Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 lg:px-4 lg:py-3 bg-primary-black border border-primary-gray rounded-lg text-primary-white placeholder-primary-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-white mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 lg:px-4 lg:py-3 bg-primary-black border border-primary-gray rounded-lg text-primary-white placeholder-primary-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-white mb-2">Course Interest</label>
                    <select className="w-full px-3 py-2 lg:px-4 lg:py-3 bg-primary-black border border-primary-gray rounded-lg text-primary-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent">
                      <option>Select a course</option>
                      <option>CompTIA Security+</option>
                      <option>PCB Design Fundamentals</option>
                      <option>Robotics Programming</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-white mb-2">Message</label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 lg:px-4 lg:py-3 bg-primary-black border border-primary-gray rounded-lg text-primary-white placeholder-primary-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                      placeholder="Tell us about your learning goals..."
                    ></textarea>
                  </div>
                  <Button variant="primary" className="w-full" size="lg" onClick={handleGetStarted}>
                    Send Message
                    <ArrowRight size={20} />
                  </Button>
                </form>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-black border-t border-primary-gray/30 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4 lg:mb-6">
                <div className="w-10 h-10 bg-primary-orange rounded-lg flex items-center justify-center">
                  <Zap size={24} className="text-white" />
                </div>
                <span className="text-2xl font-bold text-primary-white">EIRA</span>
              </div>
              <p className="text-primary-white/70 mb-4 lg:mb-6 text-sm lg:text-base">
                Erovoutika International Academy - Leading the future of technology education in the Philippines.
              </p>
              <div className="flex gap-3 lg:gap-4">
                <div className="w-8 lg:w-10 h-8 lg:h-10 bg-primary-gray/20 rounded-lg flex items-center justify-center hover:bg-primary-orange transition-colors cursor-pointer">
                  <span className="text-sm">f</span>
                </div>
                <div className="w-8 lg:w-10 h-8 lg:h-10 bg-primary-gray/20 rounded-lg flex items-center justify-center hover:bg-primary-orange transition-colors cursor-pointer">
                  <span className="text-sm">t</span>
                </div>
                <div className="w-8 lg:w-10 h-8 lg:h-10 bg-primary-gray/20 rounded-lg flex items-center justify-center hover:bg-primary-orange transition-colors cursor-pointer">
                  <span className="text-sm">in</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-primary-white mb-4 lg:mb-6">Quick Links</h3>
              <ul className="space-y-2 lg:space-y-3">
                <li><a href="#" className="text-primary-white/70 hover:text-primary-orange transition-colors text-sm lg:text-base">About Us</a></li>
                <li><button onClick={handleViewCourses} className="text-primary-white/70 hover:text-primary-orange transition-colors text-sm lg:text-base">Courses</button></li>
                <li><a href="#" className="text-primary-white/70 hover:text-primary-orange transition-colors text-sm lg:text-base">Certifications</a></li>
                <li><a href="#" className="text-primary-white/70 hover:text-primary-orange transition-colors text-sm lg:text-base">Student Portal</a></li>
                <li><a href="#" className="text-primary-white/70 hover:text-primary-orange transition-colors text-sm lg:text-base">Career Services</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-primary-white mb-4 lg:mb-6">Programs</h3>
              <ul className="space-y-2 lg:space-y-3">
                <li><a href="#" className="text-primary-white/70 hover:text-primary-orange transition-colors text-sm lg:text-base">Cybersecurity</a></li>
                <li><a href="#" className="text-primary-white/70 hover:text-primary-orange transition-colors text-sm lg:text-base">Electronics</a></li>
                <li><a href="#" className="text-primary-white/70 hover:text-primary-orange transition-colors text-sm lg:text-base">Robotics</a></li>
                <li><a href="#" className="text-primary-white/70 hover:text-primary-orange transition-colors text-sm lg:text-base">IT Fundamentals</a></li>
                <li><a href="#" className="text-primary-white/70 hover:text-primary-orange transition-colors text-sm lg:text-base">Professional Development</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-primary-white mb-4 lg:mb-6">Newsletter</h3>
              <p className="text-primary-white/70 mb-4 text-sm lg:text-base">
                Stay updated with the latest courses and industry insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 lg:px-4 lg:py-2 bg-primary-gray/20 border border-primary-gray/30 rounded-lg text-primary-white placeholder-primary-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent text-sm lg:text-base"
                />
                <Button variant="primary" size="sm" className="w-full sm:w-auto">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-primary-gray/30 mt-8 lg:mt-12 pt-6 lg:pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-white/70 text-sm text-center md:text-left">
              © 2025 Erovoutika International Academy. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4 lg:gap-6">
              <a href="#" className="text-primary-white/70 hover:text-primary-orange text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-primary-white/70 hover:text-primary-orange text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-primary-white/70 hover:text-primary-orange text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;