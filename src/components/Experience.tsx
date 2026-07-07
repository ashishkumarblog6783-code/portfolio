import { motion } from 'framer-motion';
import { FiBriefcase, FiBookOpen } from 'react-icons/fi';
import '../styles/experience.css';

const Experience = () => {
  const experiences = [
    {
      role: 'Web Development Intern',
      company: 'UpToSkill',
      duration: 'Nov 2025 – Jan 2026',
      type: 'Remote',
      description: [
        'Built Flask web applications integrated with PostgreSQL for structured, secure data storage and retrieval.',
        'Wrote and optimized SQL queries to fetch, insert, and update records efficiently.',
        'Collaborated with a remote cross-functional team using Git and GitHub, ensuring timely delivery of clean code.'
      ]
    }
  ];

  const education = [
    {
      degree: 'Bachelor of Engineering (B.E.) in Computer Science',
      specialization: 'Specialization in Data Science',
      school: 'Sai Vidya Institute of Technology, Bangalore',
      duration: '2023 – 2027',
      cgpa: 'CGPA: 8/10',
      description: [
        'Focused on core concepts: Data Structures & Algorithms, Database Management Systems (DBMS), SQL, Python, Machine Learning, Data Analytics, and Azure Cloud services.',
        'Actively participated in project building, developing full-stack applications and analytics pipelines.'
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const },
    },
  };

  return (
    <section id="experience" className="experience">
      <div className="container">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="section-title-center"
        >
          Experience & Education
        </motion.h2>

        <motion.div
          className="experience-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Experience Column */}
          <motion.div className="timeline-column" variants={itemVariants}>
            <div className="column-header">
              <FiBriefcase className="header-icon" />
              <h3>Work Experience</h3>
            </div>

            <div className="timeline-list">
              {experiences.map((exp, idx) => (
                <div key={idx} className="timeline-card">
                  <div className="timeline-marker" />
                  <div className="card-header">
                    <h4>{exp.role}</h4>
                    <span className="duration-tag">{exp.duration}</span>
                  </div>
                  <div className="card-subheader">
                    <span className="company-name">{exp.company}</span>
                    <span className="location-tag">{exp.type}</span>
                  </div>
                  <ul className="details-list">
                    {exp.description.map((desc, i) => (
                      <li key={i}>{desc}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Education Column */}
          <motion.div className="timeline-column" variants={itemVariants}>
            <div className="column-header">
              <FiBookOpen className="header-icon" />
              <h3>Education</h3>
            </div>

            <div className="timeline-list">
              {education.map((edu, idx) => (
                <div key={idx} className="timeline-card">
                  <div className="timeline-marker" />
                  <div className="card-header">
                    <h4>{edu.degree}</h4>
                    <span className="duration-tag">{edu.duration}</span>
                  </div>
                  <div className="card-subheader">
                    <span className="school-name">{edu.school}</span>
                    <span className="cgpa-tag">{edu.cgpa}</span>
                  </div>
                  {edu.specialization && (
                    <div className="specialization-tag">{edu.specialization}</div>
                  )}
                  <ul className="details-list">
                    {edu.description.map((desc, i) => (
                      <li key={i}>{desc}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Experience;
