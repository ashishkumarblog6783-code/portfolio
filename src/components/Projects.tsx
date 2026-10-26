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
    {
      id: 10,
      title: 'Autonomous AI Job Application Cockpit',
      description: 'Built a full-stack, AI-powered job discovery and autofill pipeline. It automatically scrapes 8+ job boards (LinkedIn, RemoteOK, Indeed, Naukri, ZipRecruiter), scores descriptions against my resume, and uses Playwright to seamlessly autofill job application forms while preserving manual review capabilities.',
      tags: ['Node.js', 'Playwright', 'React', 'Web Scraping', 'AI Matching'],
      github: 'https://github.com/ashishkumarblog6783-code/job-app-automator',
      live: '#',
      category: 'dev',
    },
    {
      id: 11,
      title: 'Data Cleaning & Reporting Automation',
      description: 'Built a reusable Python pipeline that takes a messy raw dataset (878 rows), cleans it (missing values, duplicates, inconsistent formatting, invalid values, outliers), and generates a self-contained HTML report with embedded before/after charts — in one command. Reduced duplicates from 27 to 0, missing values from 171 to 0, and standardized 16+ category spelling variants.',
      tags: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Data Pipeline'],
      github: 'https://github.com/ashishkumarblog6783-code/Data-Cleaning-Reporting-Automation',
      live: '#',
      category: 'data',
    },
    {
      id: 12,
      title: 'Predictive Analytics Using Historical Data',
      description: 'Forecast future revenue trends from 60 months of historical sales data, comparing a Linear Regression model (with seasonal dummies) against a Holt-Winters time-series model. Holt-Winters achieved ~3% MAPE vs ~5% for regression. Generated a 12-month forward forecast with 95% confidence bands for inventory and staffing planning.',
      tags: ['Python', 'scikit-learn', 'statsmodels', 'Pandas', 'Matplotlib', 'Time Series'],
      github: 'https://github.com/ashishkumarblog6783-code/Predictive-Analytics-Using-Historical-Data',
      live: '#',
      category: 'data',
    },
    {
      id: 13,
      title: 'Customer Segmentation — K-Means Clustering',
      description: 'Segmented 600 customers based on purchasing behavior and demographics using K-Means clustering. Used Elbow method and Silhouette score to determine optimal clusters (k=5), applied PCA for 2D visualization, and profiled each segment into actionable marketing groups: High-Value Loyalists, Frequent Bargain Shoppers, Occasional Shoppers, New Signups, and At-Risk/Dormant.',
      tags: ['Python', 'scikit-learn', 'K-Means', 'PCA', 'Pandas', 'Seaborn'],
      github: 'https://github.com/ashishkumarblog6783-code/Customer-Segmentation-Project',
      live: '#',
      category: 'data',
    },
    {
      id: 14,
      title: 'Sales & Revenue Analysis Dashboard',
      description: 'Designed an interactive Excel dashboard analyzing FY2024 order-level data (320 orders) across 5 regions, 4 product categories, and multiple sales reps. Features KPI summary tiles, monthly revenue/profit trend charts, revenue breakdown by product, region, and category, plus a sales rep leaderboard.',
      tags: ['Excel', 'Data Visualization', 'KPI Dashboard', 'Data Analysis'],
      github: 'https://github.com/ashishkumarblog6783-code/Sales-Revenue-Analysis-Dashboard',
      live: '#',
      category: 'data',
    },
    {
      id: 15,
      title: 'Online Goods Sales Analysis',
      description: 'Data analysis project on 500+ product sales records to identify top revenue-driving categories and sales trends using Python and SQL. Built visualizations and dashboards to monitor sales KPIs, identified top 3 revenue-driving product categories, and analyzed monthly revenue trends and peak sales periods.',
      tags: ['Python', 'Pandas', 'Matplotlib', 'SQL', 'Jupyter Notebook'],
      github: 'https://github.com/ashishkumarblog6783-code/E-product-selling',
      live: '#',
      category: 'data',
    },
    {
      id: 16,
      title: 'AI Health Chatbot',
      description: 'Built a Python-based health chatbot application that provides intelligent health-related responses using natural language processing. The chatbot enables users to query symptoms, get preliminary health guidance, and receive informative medical insights through a conversational interface.',
      tags: ['Python', 'NLP', 'Machine Learning', 'Chatbot', 'AI'],
      github: 'https://github.com/ashishkumarblog6783-code/health-chatbot',
      live: '#',
      category: 'dev',
    },
    {
      id: 17,
      title: 'DSA Practice Collection',
      description: 'A comprehensive collection of Data Structures and Algorithms problems solved in Python using Jupyter Notebooks. Covers arrays, strings, linked lists, trees, sorting, searching, and dynamic programming — organized for quick revision and interview preparation.',
      tags: ['Python', 'Jupyter Notebook', 'DSA', 'Algorithms', 'Data Structures'],
      github: 'https://github.com/ashishkumarblog6783-code/dsa',
      live: '#',
      category: 'dev',
    },
    {
      id: 18,
      title: 'Python Fundamentals & Projects',
      description: 'A curated repository of Python programs and mini-projects covering core concepts, OOP, file handling, error handling, and scripting. Built as a structured learning resource with Jupyter Notebooks for hands-on practice.',
      tags: ['Python', 'Jupyter Notebook', 'OOP', 'Scripting'],
      github: 'https://github.com/ashishkumarblog6783-code/python_folder',
      live: '#',
      category: 'dev',
    },
    {
      id: 19,
      title: 'Responsive Login Page',
      description: 'Designed and developed a modern, responsive login page with clean UI aesthetics using HTML and CSS. Features smooth transitions, form validation styling, and a mobile-friendly layout with attention to detail in typography and spacing.',
      tags: ['HTML', 'CSS', 'Responsive Design', 'UI/UX'],
      github: 'https://github.com/ashishkumarblog6783-code/login_page',
      live: '#',
      category: 'dev',
    },
    {
      id: 20,
      title: 'Text-to-QR Code Generator',
      description: 'Built a Flask web application that converts any text input into a scannable QR code. Features a clean HTML interface where users enter text and instantly receive a generated QR code image — useful for sharing links, contact info, and messages.',
      tags: ['Python', 'Flask', 'HTML', 'QR Code', 'Web App'],
      github: 'https://github.com/ashishkumarblog6783-code/NAME_TO_QRCODE',
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
