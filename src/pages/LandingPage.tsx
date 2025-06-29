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
  Target,
  Play,
  Monitor,
  UserCheck,
  CreditCard,
  GraduationCap,
  Menu,
  X,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleEnrollNow = () => {
    navigate('/auth');
  };

  const features = [
    {
      icon: Award,
      title: "Certified Excellence",
      description: "CompTIA authorized training center with PRC-accredited CPD provider status and internationally recognized certifications."
    },
    {
      icon: Cpu,
      title: "Specialized Programs",
      description: "Comprehensive training in cutting-edge technologies that drive the future of tech industry."
    },
    {
      icon: Globe,
      title: "Flexible Learning",
      description: "Choose from multiple learning formats designed to fit your schedule and learning preferences."
    }
  ];

  // Minimalist course catalog data
  const courses = [
    {
      id: '1',
      title: "CompTIA Security+",
      category: "Cybersecurity",
      price: "₱35,000",
      duration: "40 hours",
      startDate: "Feb 15, 2025",
      featured: true,
      rating: 4.8,
      students: 1250
    },
    {
      id: '2',
      title: "PCB Design Fundamentals",
      category: "Electronics",
      price: "₱28,000",
      duration: "32 hours",
      startDate: "Mar 1, 2025",
      featured: false,
      rating: 4.6,
      students: 890
    },
    {
      id: '3',
      title: "Robotics Programming",
      category: "Robotics",
      price: "₱42,000",
      duration: "48 hours",
      startDate: "Feb 22, 2025",
      featured: false,
      rating: 4.9,
      students: 567
    },
    {
      id: '4',
      title: "Python for Data Science",
      category: "Programming",
      price: "₱32,000",
      duration: "36 hours",
      startDate: "Mar 15, 2025",
      featured: true,
      rating: 4.7,
      students: 2100
    },
    {
      id: '5',
      title: "Cloud Computing Essentials",
      category: "Cloud Computing",
      price: "₱38,000",
      duration: "44 hours",
      startDate: "Apr 1, 2025",
      featured: false,
      rating: 4.5,
      students: 1450
    },
    {
      id: '6',
      title: "IoT Development Bootcamp",
      category: "IoT",
      price: "₱35,000",
      duration: "40 hours",
      startDate: "Mar 20, 2025",
      featured: true,
      rating: 4.6,
      students: 780
    }
  ];

  const categories = ['All', 'Cybersecurity', 'Electronics', 'Robotics', 'Programming', 'Cloud Computing', 'IoT'];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
                onClick={() => scrollToSection('courses')}
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
                  onClick={() => scrollToSection('courses')}
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
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-32 lg:w-64 h-32 lg:h-64 bg-primary-orange/5 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 lg:w-96 h-48 lg:h-96 bg-robotic-blue/5 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-white mb-6 leading-tight">
                Advance Your Tech Career with 
                <span className="text-primary-orange"> Industry-Recognized</span> Certifications
              </h1>
              <p className="text-xl text-primary-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
                Join the leading Philippine academy for Electronics, Robotics, and Cybersecurity training. 
                Transform your career with world-class education and industry partnerships.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={() => scrollToSection('courses')}
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
              <div className="flex flex-wrap justify-center items-center gap-6">
                <div className="flex items-center gap-2 text-primary-white/90">
                  <Award size={20} className="text-primary-orange" />
                  <span className="text-sm font-medium">CompTIA Partner</span>
                </div>
                <div className="flex items-center gap-2 text-primary-white/90">
                  <Shield size={20} className="text-robotic-green" />
                  <span className="text-sm font-medium">PRC Accredited</span>
                </div>
                <div className="flex items-center gap-2 text-primary-white/90">
                  <Globe size={20} className="text-robotic-blue" />
                  <span className="text-sm font-medium">Python Institute Partner</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Course Catalog Section - Relocated from Dashboard */}
      <section id="courses" className="py-20 bg-primary-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-primary-white mb-4">Course Catalog</h2>
            <p className="text-xl text-primary-white/70 max-w-3xl mx-auto mb-8">
              Discover our comprehensive collection of technology courses designed to advance your career
            </p>

            {/* Minimalist Search and Filter */}
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-gray" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-primary-black/50 border border-primary-gray/30 rounded-lg text-primary-white placeholder-primary-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  />
                </div>

                {/* Category Filter */}
                <div className="relative">
                  <Filter size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-gray" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-10 pr-8 py-3 bg-primary-black/50 border border-primary-gray/30 rounded-lg text-primary-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent appearance-none cursor-pointer"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Clean Grid Layout with Consistent Spacing */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="h-full"
              >
                <Card className={`h-full bg-primary-black/50 border-primary-gray/30 hover:border-primary-orange/50 transition-all duration-300 flex flex-col ${
                  course.featured ? 'ring-2 ring-primary-orange/50' : ''
                }`}>
                  {/* Featured Badge */}
                  {course.featured && (
                    <div className="bg-primary-orange text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-4 self-start">
                      FEATURED
                    </div>
                  )}
                  
                  {/* Category Tag */}
                  <div className="mb-4">
                    <span className="text-sm font-medium text-robotic-blue bg-robotic-blue/20 px-3 py-1 rounded-full">
                      {course.category}
                    </span>
                  </div>
                  
                  {/* Course Title */}
                  <h3 className="text-xl font-bold text-primary-white mb-4 flex-grow-0">
                    {course.title}
                  </h3>
                  
                  {/* Course Details Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6 flex-grow">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-primary-orange flex-shrink-0" />
                      <span className="text-sm text-primary-white">{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-robotic-blue flex-shrink-0" />
                      <span className="text-sm text-primary-white">{course.startDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star size={16} className="text-yellow-400 flex-shrink-0" />
                      <span className="text-sm text-primary-white">{course.rating}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-robotic-green flex-shrink-0" />
                      <span className="text-sm text-primary-white">{course.students}</span>
                    </div>
                  </div>

                  {/* Price and Enroll Button */}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-primary-gray/20">
                    <div className="text-2xl font-bold text-primary-orange">
                      {course.price}
                    </div>
                    <Button 
                      variant={course.featured ? "primary" : "secondary"} 
                      onClick={handleEnrollNow}
                      className="flex-shrink-0"
                    >
                      Enroll Now
                      <ArrowRight size={16} />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Removed View All Courses Button */}
        </div>
      </section>

      {/* Key Features */}
      <section id="about" className="py-20 bg-primary-gray/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-primary-white mb-4">
              Why Choose EIRA Academy?
            </h2>
            <p className="text-xl text-primary-white/70 max-w-3xl mx-auto">
              We combine industry expertise, cutting-edge curriculum, and flexible learning options 
              to deliver world-class technology education.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full bg-primary-black/50 border-primary-gray/30 hover:border-primary-orange/50 transition-all duration-300 text-center">
                    <div className="w-16 h-16 bg-primary-orange/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Icon size={32} className="text-primary-orange" />
                    </div>
                    <h3 className="text-2xl font-bold text-primary-white mb-4">{feature.title}</h3>
                    <p className="text-primary-white/70 leading-relaxed">{feature.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-primary-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-primary-white mb-4">Trusted by Industry Leaders</h2>
            <p className="text-primary-white/70">Our partnerships and recognitions speak to our commitment to excellence</p>
          </motion.div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center">
            {partners.map((partner, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-primary-black/50 rounded-xl border border-primary-gray/30 flex items-center justify-center mx-auto mb-3 hover:border-primary-orange/50 transition-colors">
                  <span className="text-3xl">{partner.logo}</span>
                </div>
                <p className="text-sm font-medium text-primary-white/80">{partner.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enrollment Steps */}
      <section className="py-20 bg-primary-gray/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-primary-white mb-4">Simple Enrollment Process</h2>
            <p className="text-xl text-primary-white/70">Get started in just 4 easy steps</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-primary-orange rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon size={32} className="text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-robotic-green rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{step.step}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-primary-white mb-3">{step.title}</h3>
                  <p className="text-primary-white/70">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-primary-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-primary-white mb-6">Get in Touch</h2>
              <p className="text-xl text-primary-white/70 mb-8">
                Ready to advance your tech career? Contact us today to learn more about our programs.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-orange/20 rounded-lg flex items-center justify-center">
                    <MapPin size={20} className="text-primary-orange" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-white">Makati City Office</h3>
                    <p className="text-primary-white/70">123 Tech Hub Street, Makati City, Metro Manila</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-orange/20 rounded-lg flex items-center justify-center">
                    <Phone size={20} className="text-primary-orange" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-white">Phone</h3>
                    <p className="text-primary-white/70">+63 2 8123 4567</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-orange/20 rounded-lg flex items-center justify-center">
                    <Mail size={20} className="text-primary-orange" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-white">Email</h3>
                    <p className="text-primary-white/70">info@eira.academy</p>
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
                <h3 className="text-2xl font-bold text-primary-white mb-6">Send us a Message</h3>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary-white mb-2">First Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-primary-black border border-primary-gray rounded-lg text-primary-white placeholder-primary-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-white mb-2">Last Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-primary-black border border-primary-gray rounded-lg text-primary-white placeholder-primary-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-white mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-primary-black border border-primary-gray rounded-lg text-primary-white placeholder-primary-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-white mb-2">Course Interest</label>
                    <select className="w-full px-4 py-3 bg-primary-black border border-primary-gray rounded-lg text-primary-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent">
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
                      className="w-full px-4 py-3 bg-primary-black border border-primary-gray rounded-lg text-primary-white placeholder-primary-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
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
      <footer className="bg-primary-black border-t border-primary-gray/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-orange rounded-lg flex items-center justify-center">
                  <Zap size={24} className="text-white" />
                </div>
                <span className="text-2xl font-bold text-primary-white">EIRA</span>
              </div>
              <p className="text-primary-white/70 mb-6">
                Erovoutika International Academy - Leading the future of technology education in the Philippines.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-primary-gray/20 rounded-lg flex items-center justify-center hover:bg-primary-orange transition-colors cursor-pointer">
                  <span className="text-sm">f</span>
                </div>
                <div className="w-10 h-10 bg-primary-gray/20 rounded-lg flex items-center justify-center hover:bg-primary-orange transition-colors cursor-pointer">
                  <span className="text-sm">t</span>
                </div>
                <div className="w-10 h-10 bg-primary-gray/20 rounded-lg flex items-center justify-center hover:bg-primary-orange transition-colors cursor-pointer">
                  <span className="text-sm">in</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-primary-white mb-6">Quick Links</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-primary-white/70 hover:text-primary-orange transition-colors">About Us</a></li>
                <li><button onClick={() => scrollToSection('courses')} className="text-primary-white/70 hover:text-primary-orange transition-colors">Courses</button></li>
                <li><a href="#" className="text-primary-white/70 hover:text-primary-orange transition-colors">Certifications</a></li>
                <li><a href="#" className="text-primary-white/70 hover:text-primary-orange transition-colors">Student Portal</a></li>
                <li><a href="#" className="text-primary-white/70 hover:text-primary-orange transition-colors">Career Services</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-primary-white mb-6">Programs</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-primary-white/70 hover:text-primary-orange transition-colors">Cybersecurity</a></li>
                <li><a href="#" className="text-primary-white/70 hover:text-primary-orange transition-colors">Electronics</a></li>
                <li><a href="#" className="text-primary-white/70 hover:text-primary-orange transition-colors">Robotics</a></li>
                <li><a href="#" className="text-primary-white/70 hover:text-primary-orange transition-colors">IT Fundamentals</a></li>
                <li><a href="#" className="text-primary-white/70 hover:text-primary-orange transition-colors">Professional Development</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-primary-white mb-6">Newsletter</h3>
              <p className="text-primary-white/70 mb-4">
                Stay updated with the latest courses and industry insights.
              </p>
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-2 bg-primary-gray/20 border border-primary-gray/30 rounded-lg text-primary-white placeholder-primary-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                />
                <Button variant="primary" size="sm">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-primary-gray/30 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-white/70 text-sm text-center md:text-left">
              © 2025 Erovoutika International Academy. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
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