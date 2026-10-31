# 🌱 PlantCare — Plant Care Tracker

A Flask-based plant care tracker designed to help users manage their plant collection, monitor plant health, and keep track of watering schedules.

## ✨ Features

- **Plant Management** — Add, edit, view, and delete plants.
- **Custom Plant Types** — Add and manage custom plant types.
- **Watering Schedule** — Track watering intervals and last-watered dates.
- **Plant Health Status** — Identify plants that are healthy, due for watering, or overdue.
- **Watering History** — Review previous watering events for each plant.
- **Plant Photos** — Upload photos to personalize plant profiles.
- **Search, Filter, and Sort** — Find plants and organize your collection.
- **Dashboard** — View a summary of your plant collection and watering status.
- **Rankings and Statistics** — Explore plant rankings and collection statistics.
- **Dark Mode** — Switch between light and dark themes.
- **Responsive Design** — Use the application across different screen sizes.
- **Local Data Persistence** — Store plant information in the browser using local storage.

## 🛠️ Technologies Used

- Python
- Flask
- HTML5
- CSS3
- JavaScript
- Browser Local Storage

## 🚀 Getting Started

### Prerequisites

- Python 3
- pip

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/eironbatac/plant-care-tracker.git
   ```

2. Navigate to the project directory:

   ```bash
   cd plant-care-tracker
   ```

3. Create a virtual environment:

   ```bash
   python3 -m venv venv
   ```

4. Activate the virtual environment.

   **macOS / Linux:**

   ```bash
   source venv/bin/activate
   ```

   **Windows:**

   ```bash
   venv\Scripts\activate
   ```

5. Install Flask:

   ```bash
   pip install Flask
   ```

6. Run the application:

   ```bash
   python3 app.py
   ```

7. Open the local URL displayed in your terminal, it usually look like this::

   `http://127.0.0.1:5000`

## 📁 Project Structure

```text
plant-care-tracker/
├── static/
│   ├── css/
│   │   └── style.css
│   ├── images/
│   │   └── fav_icon.png
│   └── js/
│       └── app.js
├── templates/
│   └── index.html
├── app.py
├── .gitignore
└── README.md
```

## 💾 Data Storage

PlantCare uses browser Local Storage to retain plant information between visits in the same browser. Data is stored locally rather than in a centralized database.

## 👨‍💻 Author

**Eiron Batac**

