import { motion } from 'framer-motion';
import { FiAward, FiExternalLink } from 'react-icons/fi';
import '../styles/certifications.css';

const Certifications = () => {
  const certifications = [
    {
      title: 'SQL (Advanced)',
      issuer: 'HackerRank',
      date: 'Verified',
      credentialUrl: 'https://www.hackerrank.com/certificates/c2d2001552a4', // placeholder or real if we have, otherwise '#'
      color: '#2ec866',
      description: 'Demonstrated advanced SQL skills including subqueries, CTEs, window functions, query optimization, and schema design.',
    },
    {
      title: 'Microsoft Power BI Data Analyst',
      issuer: 'Microsoft Learn',
      date: 'Verified',
      credentialUrl: '#',
      color: '#f2c811',
      description: 'Validated expertise in data modeling, DAX expressions, cleaning/transforming data, and designing high-impact interactive dashboards.',
    },
    {
      title: 'Python for Data Science',
      issuer: 'IBM SkillsBuild',
      date: 'Verified',
      credentialUrl: '#',
      color: '#0530ad',
      description: 'Certified in Python programming fundamentals, data structures, data analysis with Pandas & NumPy, and data visualization.',
    },
    {
      title: 'Data Analytics Job Simulation',
      issuer: 'Deloitte (via Forage)',
      date: 'Verified',
      credentialUrl: '#',
      color: '#86bc25',
      description: 'Completed simulated client projects involving telemetry data analysis, dashboard building, and presenting business insights.',
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  };

  return (
    <section id="certifications" className="certifications">
      <div className="container">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="section-title-center"
        >
          Certifications & Achievements
        </motion.h2>

        <motion.div
          className="certs-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {certifications.map((cert, index) => (
            <motion.div
              key={index}
              className="cert-card"
              variants={itemVariants}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              style={{ '--accent-color': cert.color } as React.CSSProperties}
            >
              <div className="cert-card-bg" />
              <div className="cert-header">
                <div className="cert-icon-wrapper">
                  <FiAward className="cert-icon" />
                </div>
                {cert.credentialUrl !== '#' && (
                  <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="cert-link" title="Verify Credential">
                    <FiExternalLink />
                  </a>
                )}
              </div>

              <div className="cert-body">
                <h3>{cert.title}</h3>
                <span className="cert-issuer">{cert.issuer}</span>
                <span className="cert-date">{cert.date}</span>
                <p>{cert.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Certifications;
