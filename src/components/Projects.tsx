import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiExternalLink, FiGithub } from 'react-icons/fi';
import '../styles/projects.css';

interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  github: string;
  live: string;
  category: 'data' | 'dev';
}

const Projects = () => {
  const [filter, setFilter] = useState<'all' | 'data' | 'dev'>('all');

  const projects: Project[] = [
    {
      id: 1,
      title: 'Customer Shopping Behavior Analysis',
      description: 'Designed a Star Schema data model and wrote 10+ SQL queries using CTEs and Window Functions to analyze 3,900+ transactions. Built interactive Power BI dashboards to analyze revenue trends, customer segmentation, and subscription behavior. Young Adults drove $62K in revenue, and 73% were non-subscribers, which informed targeted marketing strategies.',
      tags: ['Python', 'PostgreSQL', 'Pandas', 'Power BI', 'SQL', 'Star Schema'],
      github: 'https://github.com/ashishkumarblog6783-code/customer_behavior-data-analyst-',
      live: '#',
      category: 'data',
    },
    {
      id: 2,
      title: 'End-to-End Azure Data Pipeline',
      description: 'Built an end-to-end Azure data pipeline processing 30,000+ records from ingestion to dashboard visualization. Used Azure Data Factory and Synapse Analytics to perform SQL-based transformations and load data into reporting layers, connecting Power BI dashboards to Synapse Analytics for interactive reporting and performance metrics.',
      tags: ['Azure Data Factory', 'Azure Data Lake', 'Azure Synapse', 'Power BI', 'SQL'],
      github: 'https://github.com/ashishkumarblog6783-code/azure-end-to-end-project',
      live: '#',
      category: 'data',
    },
    {
      id: 3,
      title: 'AI-Powered Tender Evaluation Portal (CRPF)',
      description: 'Developed a FastAPI backend to extract and parse unstructured text from PDF tender documents using Gemini API. Implemented automated decision logic to compare bidder specifications against tender criteria, generating eligibility reports and an interactive React frontend showing evaluation summaries.',
      tags: ['FastAPI', 'React', 'Gemini API', 'PDF Parsing', 'Python'],
      github: 'https://github.com/ashishkumarblog6783-code/CRPF-TENDER-PORTAL',
      live: '#',
      category: 'dev',
    },
    {
      id: 4,
      title: 'Civic Complaint Analysis System',
      description: 'Developed a web application (Civic Connect) that directly connects citizens to concerned government authorities for civic complaint lodging, tracking, and resolution. Designed a dashboard to analyze municipal case status and dispatch assignments.',
      tags: ['JavaScript', 'HTML/CSS', 'Node.js', 'Express', 'SQL'],
      github: 'https://github.com/ashishkumarblog6783-code/civic-connect',
      live: '#',
      category: 'dev',
    },
    {
      id: 5,
      title: 'CinePaper Dynamic Wallpaper App',
      description: 'Built a Windows desktop app (wallpaper engine) using Python and CustomTkinter that automatically queries TMDB API for trending movies/TV shows and dynamically updates the desktop background using native Windows APIs.',
      tags: ['Python', 'TMDB API', 'Windows API', 'GUI', 'CustomTkinter'],
      github: 'https://github.com/ashishkumarblog6783-code/cine-wallaper',
      live: '#',
      category: 'dev',
    },
    {
      id: 6,
      title: 'Sales Performance Dashboard',
      description: 'Created an interactive Sales Performance Dashboard in Power BI with insights on trends, regional performance, and top products. Handled data prep using Pandas and designed clean KPI layouts.',
      tags: ['Power BI', 'Jupyter Notebook', 'Data Visualization', 'Pandas', 'Excel'],
      github: 'https://github.com/ashishkumarblog6783-code/sales-performance-dashboard-powerbi',
      live: '#',
      category: 'data',
    },
    {
      id: 7,
      title: 'Netflix Movie & TV Show Analysis',
      description: 'Cleaned and transformed Netflix library dataset to uncover key insights about movie trends, content additions, and audience engagement, building an interactive dashboard for visual exploration.',
      tags: ['Jupyter Notebook', 'Pandas', 'Power BI', 'Data Cleansing', 'Matplotlib'],
      github: 'https://github.com/ashishkumarblog6783-code/Netflix-movie_analysis',
      live: '#',
      category: 'data',
    },
    {
      id: 8,
      title: 'Banking Transaction Analytics',
      description: 'Developed a transaction analytics dashboard and workbook, analyzing transaction volumes, fraud detection cues, and account structures to deliver meaningful, actionable banking performance insights.',
      tags: ['Jupyter Notebook', 'Pandas', 'Matplotlib', 'Exploratory Data Analysis'],
      github: 'https://github.com/ashishkumarblog6783-code/banking_analytics',
      live: '#',
      category: 'data',
    },
    {
      id: 9,
      title: 'Human Resource Management System',
      description: 'Designed a database system and CLI management tool to handle employee onboarding, record updates, salary tracking, and attendance logging, using SQLite for structured data management.',
      tags: ['Jupyter Notebook', 'Python', 'SQLite', 'DBMS'],
      github: 'https://github.com/ashishkumarblog6783-code/HumanResourceManagementSystem',
      live: '#',
      category: 'dev',
    },
  ];

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.category === filter);

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
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
    exit: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.3 } }
  };

  return (
    <section id="projects" className="projects">
      <div className="container">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          My Technical Projects
        </motion.h2>

        {/* Category Filters */}
        <div className="project-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Projects
          </button>
          <button 
            className={`filter-btn ${filter === 'data' ? 'active' : ''}`}
            onClick={() => setFilter('data')}
          >
            Data Analytics & BI
          </button>
          <button 
            className={`filter-btn ${filter === 'dev' ? 'active' : ''}`}
            onClick={() => setFilter('dev')}
          >
            AI, Software & Web Dev
          </button>
        </div>

        <motion.div
          className="projects-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          layout
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                className="project-card"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="project-header">
                  <h3>{project.title}</h3>
                  <div className="project-links">
                    <motion.a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      title="View on GitHub"
                    >
                      <FiGithub size={20} />
                    </motion.a>
                    {project.live !== '#' && (
                      <motion.a
                        href={project.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        title="View Live"
                      >
                        <FiExternalLink size={20} />
                      </motion.a>
                    )}
                  </div>
                </div>

                <p className="project-description">{project.description}</p>

                <div className="project-tags">
                  {project.tags.map((tag) => (
                    <motion.span
                      key={tag}
                      className="tag"
                      whileHover={{ scale: 1.05 }}
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
