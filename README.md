# ReStack - Construction Material Resale Platform

A modern web application for buying and selling construction materials in India, built with React, Vite, and Tailwind CSS.

## 🚀 Features

- **Browse Materials**: Search and filter through construction materials
- **Post Listings**: Sell your construction materials easily
- **User Profiles**: Manage your listings and orders
- **Authentication**: Secure login with OTP verification
- **Responsive Design**: Mobile-first, works on all devices
- **Local Storage**: All data stored locally (no backend required)

## 🛠️ Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Storage**: localStorage
- **Icons**: SVG Icons (built-in)
- **Font**: Inter (Google Fonts)

## 🎨 Design System

- **Primary Color**: #F97316 (Orange)
- **Secondary Color**: #1E3A5F (Dark Blue)
- **Background**: #F8FAFC (Light Gray)
- **Font**: Inter

## 📁 Project Structure

```
restack/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── Navbar.jsx
│   ├── pages/              # Page components
│   │   ├── Home.jsx
│   │   ├── Listings.jsx
│   │   ├── ListingDetail.jsx
│   │   ├── PostMaterial.jsx
│   │   ├── Profile.jsx
│   │   └── Login.jsx
│   ├── context/            # Global state management
│   │   └── AppContext.jsx
│   ├── data/               # Mock data
│   │   └── mockData.js
│   ├── utils/              # Helper functions
│   │   ├── storage.js
│   │   └── helpers.js
│   ├── App.jsx             # Main App component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd restack
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📱 Routes

- `/` - Home page with hero section and featured listings
- `/listings` - Browse all materials with search and filters
- `/listing/:id` - Detailed view of a specific material
- `/post` - Form to post new construction materials
- `/profile` - User profile with listings, orders, and settings
- `/login` - Login/signup with OTP verification

## 🏗️ Components

### Navbar
- Sticky navigation with logo and menu items
- Mobile-responsive hamburger menu
- Quick access to post materials and profile

### Pages
- **Home**: Hero section, features, and recent listings
- **Listings**: Grid view with search, filters, and pagination
- **Listing Detail**: Product details, seller info, and similar products
- **Post Material**: Comprehensive form for listing materials
- **Profile**: User dashboard with tabs for listings, orders, reviews, and settings
- **Login**: Authentication with OTP verification and social login options

## 💾 Data Storage

All data is stored in localStorage:
- **Users**: User profiles and authentication
- **Listings**: Construction material listings
- **Orders**: Purchase orders and transactions
- **Reviews**: User reviews and ratings

## 🎯 Features Implemented

### ✅ Core Features
- [x] Responsive design with Tailwind CSS
- [x] React Router navigation
- [x] Local storage for data persistence
- [x] Mobile-first responsive design
- [x] Clean card-based UI

### ✅ Pages & Components
- [x] Home page with hero section
- [x] Listings page with search and filters
- [x] Product detail page
- [x] Post material form
- [x] User profile dashboard
- [x] Login/signup with OTP
- [x] Sticky navigation bar

### ✅ Data Management
- [x] Mock data for categories and conditions
- [x] Local storage utilities
- [x] Global state management with Context API
- [x] Helper functions for formatting and validation

## 🔮 Future Enhancements

- Real-time notifications
- Image upload functionality
- Chat/messaging system
- Payment integration
- Advanced search with location-based filtering
- Seller verification system
- Analytics dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

For any queries or support, please reach out to the development team.

---

**ReStack** - Building India's Construction Material Marketplace 🏗️
