# Beyond - AR Star Gazing Application

![Beyond AR Star Gazing](https://via.placeholder.com/800x400?text=Beyond+AR+Star+Gazing)

Beyond is a mobile augmented reality application that allows users to explore the night sky by pointing their phone camera upward. The app overlays stars, constellations, and celestial objects in their actual positions based on the user's location, time, and device orientation.

Inspired by the Stellarium open source project, Beyond brings the power of astronomical visualization to mobile devices with augmented reality. Whether you're an amateur astronomer, a student learning about the cosmos, or simply someone who enjoys gazing at the stars, Beyond provides an immersive and educational experience that connects you with the universe.

> "Look up at the stars and not down at your feet. Try to make sense of what you see, and wonder about what makes the universe exist." - Stephen Hawking

## Features

### Current Features

- **Real-time Star Positioning**: Accurately displays stars based on your exact location and device orientation
- **Augmented Reality View**: Overlays celestial objects on the camera feed for an immersive experience
- **Night Mode**: Red-tinted interface to preserve night vision during stargazing sessions
- **Accurate Astronomical Calculations**: Precise positioning of stars using professional-grade astronomical algorithms
- **Day/Night Functionality**: Works in daylight by showing stars that would be visible if it were dark
- **Intuitive User Interface**: Clean, minimal design that doesn't distract from the stargazing experience
- **Sensor Integration**: Utilizes device accelerometer, gyroscope, and magnetometer for accurate orientation tracking
- **GPS Location**: Uses precise location data to calculate the correct star positions for your viewing location

### Upcoming Features

- **Constellation Visualization**: Lines and artwork showing traditional constellation patterns
- **Deep Sky Objects**: Galaxies, nebulae, and star clusters with detailed information
- **Solar System Objects**: Planets, moons, and other solar system bodies with real-time positions
- **Search Functionality**: Find specific celestial objects quickly
- **Time Controls**: View the sky at different times and dates
- **Educational Content**: Learn about astronomy, celestial mechanics, and space exploration
- **Observation Planning**: Tools for planning stargazing sessions based on celestial events
- **Personalized Horoscope**: Daily, weekly, and monthly astrological readings based on celestial positions
- **Offline Mode**: Full functionality without an internet connection

## Technology Stack

### Frontend Framework
- **React Native**: Cross-platform mobile development framework
- **Expo**: Development platform for building React Native applications
- **TypeScript**: Type-safe JavaScript for more reliable code

### Hardware Integration
- **Device Sensors**:
  - Accelerometer: Detects device tilt and movement
  - Gyroscope: Measures rotation and angular velocity
  - Magnetometer: Acts as a digital compass for orientation
- **Expo Camera**: Provides access to the device camera for AR functionality
- **GPS/Location Services**: Determines precise geographical coordinates

### Astronomy Tools
- **Astronomy-engine**: JavaScript library for high-precision astronomical calculations
- **Star Database**: Catalog of stars with coordinates and magnitude information
- **Coordinate Transformation**: Algorithms for converting between celestial coordinate systems

### Development Tools
- **Git**: Version control system for collaborative development
- **npm**: Package manager for JavaScript dependencies
- **Expo CLI**: Command-line interface for Expo development

## Implementation Details

The application is built with a modular architecture designed for maintainability, extensibility, and performance:

### Core Components

- **AR Camera View (`ARCameraView.tsx`)**:
  - Manages camera access and permissions
  - Handles device orientation sensor data
  - Provides the foundation for the AR experience
  - Implements night mode functionality

- **Star Renderer (`StarRenderer.tsx`)**:
  - Calculates star positions in real-time
  - Renders stars with appropriate size based on magnitude
  - Filters visible stars based on current conditions
  - Optimizes rendering for performance

- **Astronomy Utilities (`AstronomyUtils.ts`)**:
  - Converts between different coordinate systems (equatorial, horizontal, screen)
  - Calculates star visibility based on time of day
  - Determines apparent star size based on magnitude
  - Provides core astronomical algorithms

### Architecture Design

The application follows a unidirectional data flow:

1. **Sensor Data Collection**: Device sensors provide orientation and location data
2. **Astronomical Calculations**: Raw sensor data is transformed into celestial coordinates
3. **Rendering**: Calculated positions are used to display stars on the screen
4. **User Interaction**: User input triggers updates to the display

This architecture allows for:
- Clear separation of concerns
- Testable components
- Easy addition of new features
- Optimized performance through targeted updates

## Development Status

This project is currently in early development. We follow an iterative development approach, focusing on delivering core functionality first and then expanding with additional features.

### Current Progress

| Feature | Status | Description |
|---------|--------|-------------|
| Basic AR Camera View | ✅ Completed | Camera feed with permission handling and basic UI |
| Star Positioning | ✅ Completed | Accurate positioning of stars based on device orientation |
| Night Mode | ✅ Completed | Red-tinted interface to preserve night vision |
| Sensor Integration | ✅ Completed | Integration with device accelerometer, gyroscope, and magnetometer |
| Location Services | ✅ Completed | GPS integration for location-based star positioning |
| Star Database | ⚠️ In Progress | Currently includes brightest stars, expanding to more objects |
| Constellation Lines | 📅 Planned | Visual representation of constellation patterns |
| Object Information | 📅 Planned | Detailed information about celestial objects |
| Search Functionality | 📅 Planned | Ability to search for specific celestial objects |
| Time Controls | 📅 Planned | View the sky at different times and dates |
| Educational Content | 📅 Planned | Information about astronomy and celestial objects |
| Personalized Horoscope | 📅 Planned | Daily, weekly, and monthly astrological readings |
| Offline Mode | 📅 Planned | Full functionality without internet connection |

### Roadmap

**Q2 2025**
- Complete star database expansion
- Implement constellation lines and artwork
- Add basic object information display

**Q3 2025**
- Implement search functionality
- Add time controls
- Develop educational content
- Begin personalized horoscope feature development

**Q4 2025**
- Complete personalized horoscope functionality
- Release beta version
- Add offline mode
- Implement user feedback

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) (v9 or later)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- [Expo Go](https://expo.dev/client) app installed on your mobile device

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/danny-dis/beyond.git
   cd beyond
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Run the app
   ```bash
   npx expo start
   ```

4. Scan the QR code with the Expo Go app on your mobile device

### Development Environment

For the best development experience, we recommend:

- [Visual Studio Code](https://code.visualstudio.com/) with the following extensions:
  - React Native Tools
  - ESLint
  - Prettier
  - TypeScript support

### Troubleshooting

If you encounter issues:

1. Make sure all dependencies are installed correctly
   ```bash
   npm install
   ```

2. Clear the npm cache
   ```bash
   npm cache clean --force
   ```

3. Reset Expo cache
   ```bash
   expo r -c
   ```

4. Ensure your mobile device and development machine are on the same network

## Contributing

We welcome contributions from the community! Here's how you can help:

### How to Contribute

1. **Fork the Repository**: Create your own copy of the project
2. **Create a Branch**: `git checkout -b feature/your-feature-name`
3. **Make Changes**: Implement your feature or bug fix
4. **Test Your Changes**: Ensure your changes work as expected
5. **Commit Changes**: `git commit -m "Add feature: your feature description"`
6. **Push to Branch**: `git push origin feature/your-feature-name`
7. **Submit a Pull Request**: Open a PR from your fork to our repository

### Contribution Guidelines

- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Include tests for new features
- Update documentation for any changes
- Ensure all tests pass before submitting a PR

### Areas Where Help is Needed

- Expanding the star database
- Implementing constellation visualization
- Improving sensor fusion algorithms
- Adding educational content
- Developing personalized horoscope algorithms
- Optimizing performance
- Writing tests

## Code of Conduct

We are committed to providing a welcoming and inclusive experience for everyone. Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Stellarium](https://stellarium.org/) project for inspiration and astronomical data
- [Astronomy-engine](https://github.com/cosinekitty/astronomy) for celestial calculations
- [Expo](https://expo.dev/) team for the excellent React Native tools
- [React Native](https://reactnative.dev/) community for the mobile development framework
- All contributors who have helped shape this project

---

<p align="center">
  Made with ❤️ for stargazers everywhere
</p>
