import { motion } from 'framer-motion';
import '../styles/skills.css';

interface Skill {
  category: string;
  skills: string[];
}

const Skills = () => {
  const skillsData: Skill[] = [
    {
      category: 'Programming Languages',
      skills: ['Python', 'SQL', 'HTML', 'CSS'],
    },
    {
      category: 'Python Libraries',
      skills: ['Pandas', 'NumPy', 'Matplotlib', 'Seaborn'],
    },
    {
      category: 'Data Visualization',
      skills: ['Power BI', 'Tableau', 'MS Excel', 'Jupyter Notebook'],
    },
    {
      category: 'Databases',
      skills: ['PostgreSQL', 'MySQL'],
    },
    {
      category: 'Cloud & Data Engineering',
      skills: ['Azure Data Factory', 'Azure Data Lake', 'Azure Synapse Analytics'],
    },
    {
      category: 'Analytics Skills',
      skills: ['Exploratory Data Analysis', 'Data Cleaning', 'Feature Engineering', 'SQL Querying', 'Dashboard Design'],
    },
    {
      category: 'Tools & Frameworks',
      skills: ['Git', 'GitHub', 'VS Code', 'Figma', 'Flask'],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="skills" className="skills">
      <div className="container">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Skills & Expertise
        </motion.h2>

        <motion.div
          className="skills-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {skillsData.map((skillGroup) => (
            <motion.div
              key={skillGroup.category}
              className="skill-category"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div className="category-header">
                <h3>{skillGroup.category}</h3>
              </div>

              <div className="skills-list">
                {skillGroup.skills.map((skill) => (
                  <motion.div
                    key={skill}
                    className="skill-item"
                    whileHover={{ scale: 1.1, x: 5 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <span className="skill-dot" />
                    {skill}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
