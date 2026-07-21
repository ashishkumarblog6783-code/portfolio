import { motion } from 'framer-motion';
import { FiArrowRight, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import { useState } from 'react';
import '../styles/hero.css';

const Hero = () => {
  const [photoMissing, setPhotoMissing] = useState(false);

  const backgroundTags = ['AI', 'Data', 'ML', 'SQL', 'Python', 'BI', 'Cloud', 'Viz'];

  const socialLinks = [
    {
      label: 'GitHub',
      href: 'https://github.com/ashishkumarblog6783-code',
      icon: FiGithub,
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/ashish-kumar-yadav-ba36802b9/',
      icon: FiLinkedin,
    },
    {
      label: 'Email',
      href: 'https://mail.google.com/mail/?view=cm&fs=1&to=ashishky0904@gmail.com',
      icon: FiMail,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <section id="home" className="hero">
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-grid" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-stream hero-stream-1" />
        <div className="hero-stream hero-stream-2" />

        <div className="hero-tags">
          {backgroundTags.map((tag, index) => (
            <motion.span
              key={tag}
              className={`hero-tag hero-tag-${index + 1}`}
              animate={{ y: [0, -10, 0], opacity: [0.58, 0.95, 0.58] }}
              transition={{ repeat: Infinity, duration: 4 + index * 0.35, ease: 'easeInOut' }}
            >
              {tag}
            </motion.span>
          ))}
        </div>
      </div>

      <div className="container hero-content">
        <motion.div
          className="hero-text"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="greeting">
            <span>👋 Welcome to my portfolio</span>
          </motion.div>

          <motion.h1 variants={itemVariants}>
            Ashish Kumar Yadav
          </motion.h1>

          <motion.p variants={itemVariants} className="subtitle">
            Aspiring Data Analyst | B.E. Computer Science (Data Science) | Data-Driven Problem Solver
            Specialized in Python, SQL, Power BI & Tableau
          </motion.p>

          <motion.div variants={itemVariants} className="hero-buttons">
            <motion.a
              className="primary-btn"
              href="#projects"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View My Work <FiArrowRight />
            </motion.a>
            <motion.a
              className="secondary-btn"
              href="#contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get In Touch
            </motion.a>
          </motion.div>

          <motion.div variants={itemVariants} className="social-links">
            {socialLinks.map((link) => {
              const Icon = link.icon;

              return (
                <motion.a
                  key={link.label}
                  href={link.href}
                  whileHover={{ y: -5, scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  target={link.label === 'Email' ? undefined : '_blank'}
                  rel={link.label === 'Email' ? undefined : 'noopener noreferrer'}
                  aria-label={link.label}
                  title={link.label}
                >
                  <Icon size={24} />
                </motion.a>
              );
            })}
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-image"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="floating-shapes">
            <motion.div
              className="shape shape-1"
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
            />
            <motion.div
              className="shape shape-2"
              animate={{ y: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 5 }}
            />
            <motion.div
              className="shape shape-3"
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 6 }}
            />
          </div>

          <motion.div
            className="portrait-card"
            whileHover={{ y: -8, scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            <div className="portrait-frame">
              <img
                src={photoMissing ? "/avatar.png" : "/profile_new.jpg"}
                alt="Ashish Kumar Yadav portrait"
                onError={() => setPhotoMissing(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div className="portrait-note">
              <span>Open to data analyst roles</span>
              <p>Python, SQL, Power BI, Tableau</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="scroll-indicator"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <span>Scroll to explore</span>
      </motion.div>
    </section>
  );
};

export default Hero;
