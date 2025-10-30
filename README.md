# HistoriSnap

A beautiful, Google Material Design-inspired historical events explorer built with React and Vite. Discover fascinating historical events from any date in history with an intuitive, modern interface.

## ✨ Features

- **Material Design 3** - Authentic Google Material Design styling with Material UI
- **Date-Based Discovery** - Explore historical events by selecting specific dates
- **Random Events** - Discover unexpected historical moments with the random event generator
- **Interactive Event Cards** - Beautiful event cards with images, descriptions, and quick facts
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- **Fast & Modern** - Built with React, Vite, and modern web technologies

## 🚀 Live Demo

Visit the live app: [HistoriSnap on GitHub Pages](https://username.github.io/historisnap)

## 🛠️ Tech Stack

- **React 19** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Material UI v6** - Official Material Design components for React
- **Day.js** - Lightweight date library for date handling
- **Material Icons** - Google's Material Design icon system

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/username/historisnap.git
cd historisnap
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🏗️ Building for Production

To build the app for production:

```bash
npm run build
```

The build files will be generated in the `dist` directory.

## 🚀 Deploying to GitHub Pages

This project is configured for easy deployment to GitHub Pages:

1. Update the `homepage` field in `package.json` with your GitHub username:
```json
"homepage": "https://yourusername.github.io/historisnap"
```

2. Update the `base` in `vite.config.js` if your repository name is different:
```javascript
base: '/your-repo-name/'
```

3. Deploy to GitHub Pages:
```bash
npm run deploy
```

This will build the project and push the build files to the `gh-pages` branch.

## 📱 Usage

1. **Explore by Date** - Use the date picker to select a specific date and click "Discover History"
2. **Random Discovery** - Click "Random Event" to explore unexpected historical moments
3. **Interactive Events** - View detailed event information with images, descriptions, and quick facts
4. **Share & Bookmark** - Use the action buttons to share events or bookmark your favorites
5. **Learn More** - Click "Learn more" to search for additional information on Wikipedia

## 🎨 Design Philosophy

HistoriSnap follows Google's Material Design 3 principles:

- **Intuitive Navigation** - Clear, predictable user interface
- **Beautiful Typography** - Google Sans and Roboto font families
- **Consistent Spacing** - Material Design spacing tokens
- **Accessible Colors** - Material Design color system
- **Smooth Animations** - Delightful transitions and loading states

## 🏛️ Historical Events Database

The app includes a curated collection of significant historical events spanning:

- **Ancient History** - Events from antiquity like the Battle of Actium and Caesar's assassination
- **Medieval Period** - Major events like the Battle of Hastings
- **Modern Era** - Landmark moments like the Moon Landing, MTV launch, and Berlin Wall fall
- **Social Movements** - Important civil rights moments and cultural shifts
- **Technological Advances** - First flight, space exploration, and media revolutions

## 🛠️ Development

### Project Structure

```
src/
├── components/           # React components
│   ├── Header.jsx       # App header with logo and tagline
│   ├── Controls.jsx     # Date picker and action buttons
│   └── EventDisplay.jsx # Event card and facts display
├── data/
│   └── historicalEvents.js  # Historical events database
├── App.jsx              # Main app component
└── main.jsx            # React app entry point
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run deploy` - Deploy to GitHub Pages

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. Areas where you can help:

- Adding more historical events
- Improving the UI/UX
- Adding new features like filtering by categories
- Enhancing accessibility
- Bug fixes and performance improvements

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Historical event data curated from various educational sources
- Images provided by Unsplash
- Material Design guidelines by Google
- React and Vite communities for excellent tooling

---

**HistoriSnap** - Discover history, one moment at a time ✨

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
