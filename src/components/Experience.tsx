import { motion } from 'framer-motion';
import { FiBriefcase, FiBookOpen } from 'react-icons/fi';
import '../styles/experience.css';

const Experience = () => {
  const experiences = [
    {
      role: 'Data Analytics Intern',
      company: 'Thiranex',
      duration: 'Aug 2026 – Sep 2026',
      type: 'Internship',
      technologies: ['Python', 'Power BI', 'Excel', 'scikit-learn', 'Predictive Modeling', 'Customer Segmentation'],
      description: [
        'Completed a 4-project data analytics internship covering dashboarding, customer segmentation, predictive modeling, and reporting automation using Python, Power BI, and Excel.',
        'Built a revenue analysis dashboard and segmented customers by behavior/demographics using clustering (Python/scikit-learn, Power BI) to surface purchase patterns and data-driven insights.',
        'Built regression and time-series forecasting models to predict trends, and automated data cleaning and reporting workflows to improve efficiency.'
      ]
    },
    {
      role: 'Data Analytics Intern',
      company: 'IBM SkillsBuild — AICTE — BharatCares Internship',
      duration: 'Jul 2026 – Aug 2026',
      type: 'Remote',
      technologies: ['Microsoft Excel', 'Tableau Public', 'Data Visualization', 'Business Analytics'],
      description: [
        'Cleaned, validated, and preprocessed 10,000+ retail transaction records using Microsoft Excel, engineering custom metrics like Shipping Days, Profit Margin (%), and Product Category.',
        'Designed an interactive Tableau Public dashboard featuring KPI cards, scatter plots, and treemaps to analyze business trends, regional performance, and discount-profit tradeoffs.',
        'Identified key business findings (Technology sector leading revenue, West region as top-performing region) and documented end-to-end analytics workflow on Tableau Public for stakeholder reporting.'
      ]
    },
    {
      role: 'Web Development Intern',
      company: 'UpToSkill',
      duration: 'Nov 2025 – Jan 2026',
      type: 'Remote',
      technologies: ['Flask', 'PostgreSQL', 'SQL', 'Git & GitHub'],
      description: [
        'Built Flask applications with PostgreSQL for structured data storage and retrieval, writing SQL queries for efficient data management.',
        'Collaborated with a distributed team using Git, delivering production-ready features within sprint deadlines.'
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
        'Focused on core concepts: Data Structures & Algorithms, Database Management Systems (DBMS), SQL, Python, Machine Learning, Data Analytics, and Cloud services.',
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
                  {exp.technologies && (
                    <div className="card-tech-stack">
                      {exp.technologies.map((tech, tIdx) => (
                        <span key={tIdx} className="tech-badge">{tech}</span>
                      ))}
                    </div>
                  )}
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
