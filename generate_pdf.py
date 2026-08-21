from fpdf import FPDF
import os

class ReportPDF(FPDF):
    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(128)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")

    def section_title(self, title):
        self.set_font("Helvetica", "B", 12)
        self.set_text_color(20, 60, 120)
        self.cell(0, 8, title, new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(20, 60, 120)
        self.set_line_width(0.5)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(3)
        self.set_text_color(30)

    def sub_heading(self, text):
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(40, 40, 40)
        self.cell(0, 7, text, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def body_text(self, text):
        self.set_font("Helvetica", "", 11)
        self.set_text_color(30)
        self.multi_cell(0, 5.5, text)
        self.ln(2)

    def bullet(self, text):
        self.set_font("Helvetica", "", 11)
        self.set_text_color(30)
        x = self.get_x()
        self.cell(6, 5.5, "-")
        self.multi_cell(0, 5.5, text)
        self.ln(0.5)

    def numbered_item(self, number, text):
        self.set_font("Helvetica", "", 11)
        self.set_text_color(30)
        self.cell(8, 5.5, f"{number}.")
        self.multi_cell(0, 5.5, text)
        self.ln(0.5)


pdf = ReportPDF()
pdf.alias_nb_pages()
pdf.set_auto_page_break(auto=True, margin=18)
pdf.add_page()

# ── Title Page with Logo ──
logo_path = os.path.join(os.path.dirname(__file__), "presidency_logo.png")
if os.path.exists(logo_path):
    pdf.image(logo_path, x=60, w=70)
    pdf.ln(5)

pdf.set_font("Helvetica", "B", 14)
pdf.cell(0, 8, "SCHOOL OF COMPUTER SCIENCE AND ENGINEERING", align="C", new_x="LMARGIN", new_y="NEXT")
pdf.ln(8)
pdf.set_font("Helvetica", "", 13)
pdf.cell(0, 7, "University Internship", align="C", new_x="LMARGIN", new_y="NEXT")
pdf.set_font("Helvetica", "B", 15)
pdf.cell(0, 9, "NVIDIA H200 GPU INTERNSHIP", align="C", new_x="LMARGIN", new_y="NEXT")
pdf.cell(0, 9, "PROGRAM", align="C", new_x="LMARGIN", new_y="NEXT")
pdf.ln(10)

pdf.set_font("Helvetica", "", 12)
details = [
    ("Name", "D. Venkata Ravish Reddy"),
    ("Roll Number", "20241CSD0016"),
    ("Department", "CSE (Data Science)"),
    ("HOD", "Pravintha Raja"),
    ("Project Name", "Movie Recommendation"),
]
for label, value in details:
    pdf.cell(45, 7, f"{label} :")
    pdf.cell(0, 7, value, new_x="LMARGIN", new_y="NEXT")
pdf.ln(10)

pdf.add_page()

pdf.set_font("Helvetica", "B", 18)
pdf.ln(20)
pdf.multi_cell(0, 10, "MovieMind AI:\nIntelligent Movie Recommendation Platform\nUsing Generative AI and Machine Learning", align="C")
pdf.ln(15)

pdf.set_font("Helvetica", "", 12)
pdf.cell(0, 7, "D. Venkata Ravish Reddy", align="C", new_x="LMARGIN", new_y="NEXT")
pdf.cell(0, 7, "Roll Number: 20241CSD0016", align="C", new_x="LMARGIN", new_y="NEXT")
pdf.cell(0, 7, "Department: CSE (Data Science)", align="C", new_x="LMARGIN", new_y="NEXT")
pdf.cell(0, 7, "HOD: Pravintha Raja", align="C", new_x="LMARGIN", new_y="NEXT")
pdf.ln(10)

pdf.set_font("Helvetica", "", 13)
pdf.cell(0, 7, "NVIDIA H200 GPU Internship Program", align="C", new_x="LMARGIN", new_y="NEXT")
pdf.cell(0, 7, "School of Computer Science and Engineering", align="C", new_x="LMARGIN", new_y="NEXT")
pdf.cell(0, 7, "Presidency University, Bengaluru", align="C", new_x="LMARGIN", new_y="NEXT")

# ── Abstract ──
pdf.section_title("ABSTRACT")
pdf.body_text(
    "During the AI GPU Summer Internship, I developed MovieMind AI, an intelligent AI-powered "
    "movie recommendation web application that uses machine learning algorithms to provide "
    "personalized movie recommendations based on user preferences, moods, and viewing history."
)
pdf.body_text(
    "The system allows users to browse, search, and discover movies through an interactive quiz-based "
    "recommendation engine. It analyzes user inputs including mood, preferred genres, release period, "
    "IMDb rating preferences, favorite actors and directors, and family-friendly requirements to "
    "generate highly personalized movie suggestions with match percentages and detailed reasoning."
)
pdf.body_text(
    "MovieMind AI features a comprehensive movie database with over 7,900 titles, official TMDB "
    "poster integration for visual discovery, advanced text-based search with word-boundary matching, "
    "trending and top-rated movie sections, genre-based filtering, detailed movie information pages "
    "with cast and crew details, and a responsive modern user interface built with React.js and "
    "Tailwind CSS."
)
pdf.body_text(
    "The application is built using React.js, Python FastAPI, scikit-learn, TF-IDF vectorization, "
    "cosine similarity algorithms, TMDB API integration, and modern web technologies. It provides a "
    "responsive and interactive user interface where users receive AI-powered movie recommendations "
    "within milliseconds. This project demonstrates how Machine Learning and Generative AI can "
    "simplify movie discovery, enhance the entertainment experience, and provide intelligent "
    "personalized recommendations through an interactive web platform."
)

# ── 1. Introduction ──
pdf.section_title("1. INTRODUCTION")
pdf.body_text(
    "Many people often struggle to find movies that match their interests and current mood. With "
    "thousands of movies available across multiple streaming platforms, users frequently spend more "
    "time searching for content than actually watching it. Traditional movie recommendation systems "
    "rely on simple genre-based filtering that fails to capture nuanced user preferences such as mood, "
    "favorite actors, or desired movie length."
)
pdf.body_text(
    "MovieMind AI uses machine learning algorithms including TF-IDF vectorization and cosine "
    "similarity to intelligently recommend movies based on a comprehensive set of user preferences. "
    "Instead of scrolling through endless catalogs, users simply answer a short quiz about their "
    "mood, preferred genres, rating expectations, and other preferences, and the AI generates "
    "detailed, personalized movie recommendations with match percentages and personalized "
    "reasoning for each suggestion."
)
pdf.body_text("The application allows users to:")
for item in [
    "Take an AI-powered movie recommendation quiz",
    "Browse trending and top-rated movies",
    "Search for specific movies with intelligent text matching",
    "Filter movies by genre, rating, and release year",
    "View detailed movie information with official TMDB posters",
    "Discover similar movies based on any selected title",
    "Access a database of over 7,900 movies and TV series",
]:
    pdf.bullet(item)

# ── 2. Problem Statement ──
pdf.section_title("2. PROBLEM STATEMENT")
pdf.body_text("Users face several challenges while discovering and selecting movies:")
for item in [
    "Difficulty finding movies that match their current mood and preferences among thousands of available titles.",
    "Time-consuming manual search for suitable movies across multiple streaming platforms and recommendation websites.",
    "Overwhelming number of choices leading to decision fatigue and poor movie selection.",
    "Limited access to personalized movie recommendations that consider multiple factors such as mood, actors, directors, and family-friendliness simultaneously.",
    "Lack of visual discovery tools that help users quickly identify movies of interest through official posters and detailed information.",
]:
    pdf.bullet(item)

# ── 3. Objectives ──
pdf.section_title("3. OBJECTIVES")
pdf.body_text("The objectives of MovieMind AI are:")
for item in [
    "Generate personalized movie recommendations using a multi-factor quiz-based system that analyzes mood, genre preferences, rating expectations, and viewing constraints.",
    "Provide detailed movie information including cast, crew, ratings, duration, and official TMDB posters for informed decision-making.",
    "Recommend similar movies based on content-based filtering using TF-IDF and cosine similarity to help users discover related content.",
    "Offer intelligent search functionality with word-boundary matching and relevance-based ranking for quick movie discovery.",
    "Help users make better entertainment choices through an AI-powered recommendation system that considers multiple preference factors simultaneously.",
]:
    pdf.bullet(item)

# ── 4. System Architecture ──
pdf.section_title("4. SYSTEM ARCHITECTURE")
pdf.body_text("The MovieMind AI system follows a three-tier architecture:")

pdf.sub_heading("Frontend Layer")
for item in [
    "React.js single-page application with TypeScript",
    "Tailwind CSS for responsive UI design",
    "Framer Motion for smooth page transitions and animations",
    "React Router for client-side navigation",
    "Component-based architecture (MovieCard, SearchPage, QuizPage, etc.)",
]:
    pdf.bullet(item)

pdf.sub_heading("Backend Layer")
for item in [
    "Python FastAPI server for RESTful API endpoints",
    "TF-IDF vectorization engine for text-based content analysis",
    "Cosine similarity computation for movie matching",
    "TMDB API integration for official poster fetching",
    "JSON-based movie data storage with precomputed caches",
]:
    pdf.bullet(item)

pdf.sub_heading("Data Layer")
for item in [
    "7,900+ movie and TV series records with metadata",
    "Precomputed movie cache for instant API responses (under 100ms)",
    "Poster cache with 7,336 TMDB poster URLs",
    "Genre index for fast genre-based filtering",
]:
    pdf.bullet(item)

pdf.sub_heading("Communication Flow")
for i, item in enumerate([
    "User interacts with React frontend",
    "Frontend sends API requests to FastAPI backend",
    "Backend processes requests using ML algorithms and cached data",
    "Backend returns JSON responses with movie data and recommendations",
    "Frontend renders results with TMDB poster images",
], 1):
    pdf.numbered_item(i, item)

# ── 5. Technologies Used ──
pdf.section_title("5. TECHNOLOGIES USED")

techs = [
    ("React.js", "Frontend Web Application Development"),
    ("TypeScript", "Type-Safe JavaScript Development"),
    ("Python", "Backend Server and ML Processing"),
    ("FastAPI", "High-Performance RESTful API Framework"),
    ("scikit-learn", "Machine Learning Library for TF-IDF and Cosine Similarity"),
    ("TF-IDF Vectorization", "Text Feature Extraction for Movie Matching"),
    ("Cosine Similarity", "Content-Based Recommendation Algorithm"),
    ("Pandas", "Data Processing and Manipulation"),
    ("TMDB API", "Official Movie Poster and Metadata Integration"),
    ("Tailwind CSS", "Responsive UI Design and Styling"),
    ("Framer Motion", "Page Transition Animations"),
    ("React Router", "Client-Side Navigation"),
    ("Vite", "Frontend Build Tool and Development Server"),
    ("Docker", "Containerized Deployment"),
    ("Railway", "Cloud Platform Hosting"),
    ("Git & GitHub", "Version Control and Project Management"),
    ("Visual Studio Code", "Development Environment"),
]

pdf.set_font("Helvetica", "B", 10)
pdf.set_fill_color(20, 60, 120)
pdf.set_text_color(255)
pdf.cell(55, 7, "Technology", border=1, fill=True, align="C")
pdf.cell(0, 7, "Purpose", border=1, fill=True, align="C", new_x="LMARGIN", new_y="NEXT")
pdf.set_text_color(30)

for i, (tech, purpose) in enumerate(techs):
    if i % 2 == 0:
        pdf.set_fill_color(235, 240, 250)
    else:
        pdf.set_fill_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(55, 6, tech, border=1, fill=True)
    pdf.set_font("Helvetica", "", 9)
    pdf.cell(0, 6, purpose, border=1, fill=True, new_x="LMARGIN", new_y="NEXT")

# ── 6. Methodology ──
pdf.ln(3)
pdf.section_title("6. METHODOLOGY")

steps = [
    ("Step 1: Data Collection and Preparation", [
        "Collected movie and TV series data including titles, genres, ratings, cast, crew, descriptions, and metadata from available datasets.",
        "Preprocessed and cleaned the data to handle missing values, normalize formats, and ensure consistency across all 7,900+ records.",
        "Generated string-based slug IDs from movie titles for clean URL routing.",
    ]),
    ("Step 2: Machine Learning Model Development", [
        "Implemented TF-IDF vectorization to convert movie descriptions and metadata into numerical feature vectors.",
        "Built a MovieRecommender class using cosine similarity to compute similarity scores between movies based on their content features.",
        "Trained and serialized the recommendation model using Python pickle for fast loading.",
    ]),
    ("Step 3: Backend API Development", [
        "Developed a FastAPI server with RESTful endpoints for movie search, recommendations, trending movies, genre filtering, and quiz-based recommendations.",
        "Implemented precomputed movie caching at startup to eliminate per-request data processing, achieving response times under 100ms for all endpoints.",
        "Integrated TMDB API for fetching official movie posters with background caching.",
    ]),
    ("Step 4: Frontend Application Development", [
        "Built a responsive React.js application with TypeScript for type safety.",
        "Implemented multiple pages including Home, Search, Quiz, Recommendations, Movie Details, Watchlist, and User Profile.",
        "Designed an interactive quiz system with 10 steps covering mood, genres, movie length, release period, rating, family-friendliness, language, and favorite actors.",
    ]),
    ("Step 5: Search Optimization", [
        "Implemented word-boundary regex matching to prevent false positive search results.",
        "Added stop-word filtering to improve search relevance for multi-word queries.",
        "Applied relevance-based scoring with priority given to title matches over description matches.",
    ]),
    ("Step 6: Deployment and Integration", [
        "Containerized the application using Docker with Python 3.11 and Node.js 20.",
        "Deployed to Railway cloud platform with automatic builds from GitHub.",
        "Configured environment variables for API keys and dynamic port allocation.",
    ]),
]

for title, items in steps:
    pdf.sub_heading(title)
    for item in items:
        pdf.bullet(item)
    pdf.ln(1)

# ── 7. Results ──
pdf.section_title("7. RESULTS")
pdf.body_text("The developed system successfully performs:")
for item in [
    "AI-powered movie recommendation generation based on user mood, genre preferences, rating expectations, viewing constraints, and favorite actors and directors.",
    "Accurate movie matching using TF-IDF vectorization and cosine similarity algorithms that analyze movie content features for intelligent recommendation generation.",
    "Generation of personalized recommendations with match percentages and detailed reasoning explaining why each movie was recommended to the user.",
    "Fast and efficient search functionality with word-boundary matching that returns relevant results within milliseconds, filtering out false positive substring matches.",
    "Display of official TMDB movie posters for 7,336 out of 7,912 movies (93% coverage) providing visual discovery and enhanced user experience.",
    "Real-time API response times under 100ms for all endpoints including search, trending, movie details, similar movies, and recommendations.",
    "Responsive and interactive web interface with smooth page transitions, horizontal scrolling movie rows, and mobile-friendly design that works across all devices.",
]:
    pdf.bullet(item)

# ── 8. Learning Outcomes ──
pdf.section_title("8. LEARNING OUTCOMES")
pdf.body_text("Through this internship, I gained practical knowledge in:")
for item in [
    "Machine Learning techniques including TF-IDF vectorization, cosine similarity, and content-based recommendation systems for building intelligent recommendation engines.",
    "Backend API development using Python FastAPI for building high-performance RESTful services with automatic request validation and documentation.",
    "Frontend development using React.js, TypeScript, and Tailwind CSS for building responsive and interactive single-page applications.",
    "API integration for fetching external data from TMDB API including movie posters, metadata, and search results with background caching strategies.",
    "Text processing and search optimization including regex-based word-boundary matching, stop-word filtering, and relevance-based result ranking.",
    "Containerized application deployment using Docker and cloud platform hosting using Railway for production-ready application deployment.",
    "Data processing and manipulation using Pandas for handling large movie datasets with preprocessing, cleaning, and transformation pipelines.",
    "Version control and project management using Git and GitHub for collaborative development and deployment workflow management.",
]:
    pdf.bullet(item)

# ── 9. Conclusion ──
pdf.section_title("9. CONCLUSION")
pdf.body_text(
    "MovieMind AI demonstrates how Machine Learning and AI can simplify movie discovery by "
    "intelligently analyzing user preferences and generating personalized recommendations. The "
    "system helps users discover movies that match their mood, preferences, and viewing constraints "
    "through an interactive quiz-based recommendation engine powered by TF-IDF vectorization and "
    "cosine similarity algorithms."
)
pdf.body_text(
    "The application provides a fast, user-friendly, and efficient solution for everyday movie "
    "selection with real-time API responses under 100ms, 93% TMDB poster coverage, and a "
    "comprehensive database of over 7,900 movies and TV series. It successfully demonstrates how "
    "content-based filtering and machine learning techniques can enhance the entertainment "
    "discovery experience through an intelligent, AI-powered web platform."
)

# ── 10. Future Scope ──
pdf.section_title("10. FUTURE SCOPE")
pdf.body_text(
    "MovieMind AI can be enhanced by incorporating collaborative filtering algorithms that analyze "
    "user behavior patterns and viewing history to improve recommendation accuracy. The "
    "application can also support integration with streaming platforms such as Netflix, Amazon Prime, "
    "and Disney+ to provide direct watch links and availability information."
)
pdf.body_text(
    "Additional enhancements include implementing user accounts with persistent watchlists and "
    "viewing history, adding a social feature for sharing movie recommendations with friends, "
    "supporting multilingual search and recommendations, and developing a mobile application for "
    "Android and iOS platforms. Integration with voice assistants and natural language processing "
    "can further improve the user experience, making the system more intelligent, accessible, and "
    "user-friendly for movie enthusiasts worldwide."
)

output = "MovieMind_AI_Report.pdf"
pdf.output(output)
print(f"PDF saved: {output}")
