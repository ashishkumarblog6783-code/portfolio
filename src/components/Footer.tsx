import { motion } from 'framer-motion';
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import '../styles/footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: FiGithub, label: 'GitHub', url: 'https://github.com/ashishkumarblog6783-code' },
    { icon: FiLinkedin, label: 'LinkedIn', url: 'https://www.linkedin.com/in/ashish-kumar-yadav-ba36802b9/' },
    { icon: FiMail, label: 'Email', url: 'https://mail.google.com/mail/?view=cm&fs=1&to=ashishky0904@gmail.com' },
  ];

  return (
    <footer className="footer">
      <div className="container">
        <motion.div
          className="footer-content"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="footer-section">
            <h3>Ashish Kumar Yadav</h3>
            <p>
              Aspiring Data Analyst | B.Tech Data Science | Data-Driven Problem Solver
            </p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <a href="#home">Home</a>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <a href="#projects">Projects</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Connect</h4>
            <div className="social-icons">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <motion.a
                    key={link.label}
                    href={link.url}
                    title={link.label}
                    whileHover={{ scale: 1.2, y: -5 }}
                    whileTap={{ scale: 0.9 }}
                    target={link.label === 'Email' ? undefined : '_blank'}
                    rel={link.label === 'Email' ? undefined : 'noopener noreferrer'}
                  >
                    <Icon size={24} />
                  </motion.a>
                );
              })}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="footer-bottom"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          viewport={{ once: true }}
        >
          <p>
            &copy; {currentYear} Ashish Kumar Yadav. All rights reserved. | Designed with{' '}
            <span className="heart">❤️</span> using React & Framer Motion
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
