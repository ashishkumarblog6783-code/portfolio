import { motion } from 'framer-motion';
import '../styles/about.css';

const About = () => {
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <section id="about" className="about">
      <div className="container">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          About Me
        </motion.h2>

        <motion.div
          className="about-content"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.div variants={itemVariants} className="about-text">
            <p>
              I'm a detail-oriented Bachelor of Engineering (B.E.) Computer Science student specializing in Data Science at Sai Vidya Institute of Technology (CGPA: 8/10). I build robust data pipelines on Azure and create interactive dashboards in Power BI and Tableau.
            </p>
            <p>
              I'm highly proficient in SQL (CTEs, window functions, query optimization) and Python (Pandas, NumPy, Matplotlib, Seaborn) for conducting exploratory data analysis, data cleansing, and feature engineering.
            </p>
            <p>
              Currently seeking Data Analyst and Business Intelligence roles where I can apply my analytical skills, SQL querying expertise, and visualization capabilities to extract valuable insights and drive data-driven decision making.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="about-stats">
            <div className="stat">
              <motion.div
                className="stat-number"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <span>9</span>
              </motion.div>
              <p>Key Projects Completed</p>
            </div>
            <div className="stat">
              <motion.div
                className="stat-number"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <span>5+</span>
              </motion.div>
              <p>Interactive Dashboards</p>
            </div>
            <div className="stat">
              <motion.div
                className="stat-number"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <span>45,000+</span>
              </motion.div>
              <p>Total Records Processed</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
