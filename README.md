# Global Happiness: Visualizing Trends and Contributing Factors

## Team

- Lauryn Davis — email
- Michael Minzey — minzey.michael@gmail.com

Created for the final project in _CIS 671: Data Visualization_  
Grand Valley State University, Winter 2025

This project presents an interactive data visualization dashboard exploring the statistical drivers of happiness around the world. Using data from the 2024 World Happiness Report and several external global datasets, this site enables users to explore how social, economic, health, and security factors relate to national well-being.

Developed as a final project for a Data Visualization course, this site leverages modern JavaScript and D3.js to deliver meaningful visual insights through engaging, interactive visualizations.

## Acknowledgments

Parts of this project were supported by the use of OpenAI's ChatGPT for exploring advanced D3.js functionality, resolving bugs, and refining visualization techniques. All final implementation decisions and design choices were made by the project team.

## Project Purpose

The purpose of this project is to:

- Visualize the key contributing factors to global happiness.
- Explore relationships between happiness and additional structural or societal dimensions not included in the original report.
- Provide an interactive, user-friendly dashboard that encourages exploration and critical thinking.

## Visualizations Included

- **Choropleth Map:** A world map colored by Happiness Ladder Scores, showing global distribution.
- **Stacked Bar Chart:** Comparison of the six official happiness factors in the top and bottom 10 countries.
- **Scatterplot:** Users can select any two happiness factors and visually identify patterns based on color-coded Ladder Scores.
- **Radar Plot:** Displays five additional well-being dimensions not included in the Happiness Report for six countries (top and bottom performers), with additional dynamic selection via dropdown menu.
- **SDG Area Chart:** Tracks changes in development metrics over time.
- **Dual-Axis Boxplot:** Compares the distribution of happiness scores and other structural variables across regions.

## Data Sources

The following publicly available datasets were used to support the analysis and visualizations:

- [World Happiness Report 2024](https://worldhappiness.report/)
- [ICT Development Index (ITU 2024)](https://www.itu.int/hub/publication/D-IND-ICT_MDD-2024-3/)
- [Global Health Security Index (GHS 2021)](https://www.ghsindex.org/)
- [Learning-Adjusted Years of Schooling (World Bank 2024)](https://ourworldindata.org/grapher/learning-adjusted-years-of-school-lays?time=latest)
- [Crime Rates (UNODC 2024)](https://dataunodc.un.org/)
- [Gini Coefficient for Income Inequality (World Bank 2024)](https://data.worldbank.org/indicator/SI.POV.GINI)
- [GeoJSON Country Polygons](https://geojson-maps.ash.ms/)

## Tools and Technologies

- **D3.js** – for creating interactive SVG-based visualizations.
- **JavaScript** – for modular chart code and UI logic.
- **HTML/CSS** – for layout and responsive design.
- **Python + Pandas** – for data preprocessing, merging, filtering, and normalization.

## Preprocessing Details

All datasets were cleaned and merged prior to visualization. Key preprocessing steps included:

- Mapping country names to ISO3 codes for consistency.
- Consolidating subnational entries (e.g., Scotland, Wales) into national values.
- Selecting the most recent year available for each metric when time series data was incomplete.
- Normalizing all indicators to a common scale (1–5 or percentage) to support cross-variable comparison.
- Binning happiness scores for visual encoding in radar and scatterplot charts.

## Project Structure

GLOBAL-HAPPINESS/
├── data/ # Cleaned and merged datasets for visualizations
├── js/ # D3 chart modules (chart1 through chart6)
├── pre_processing/ # Notebooks and files used for preprocessing raw data
├── happy-people.png # Image used on the homepage
├── index.html # Main page with tab navigation and layout
├── README.md # Project overview and setup instructions
├── script.js # Handles tab switching and chart module loading
└── styles.css # Styles for layout, fonts, and visual elements.

## How to Use

1. Clone or download this repository.
2. Open `index.html` in a modern web browser (Chrome, Firefox, or Edge recommended).
3. Use the tabbed interface to explore different visualizations.
4. Hover, click, and select options where available to interact with the data.

## License

This project is for educational use only. All referenced data sources are publicly available. Please cite the original sources when reusing data or code.
