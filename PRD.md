# AR Menu - Product Requirements Document

## Overview

AR Menu is a SaaS application that transforms traditional restaurant menus into interactive augmented reality experiences. Restaurant owners can upload menu images for automatic text extraction and enhance them with 3D models of their dishes, while customers can view these dishes in AR through their mobile devices.

## Core Features

### 1. Menu Digitization

- Upload and scan physical menu images
- Extract menu items including:
  - Item names
  - Prices
  - Descriptions
- Manual validation and editing of extracted data
- Support for multiple image formats (PNG, JPEG, PDF)

### 2. 3D Model Management

- Upload 3D models for menu items
- Supported formats: GLB/GLTF
- Local storage system for models
- Model size and format validation
- Preview functionality before publishing

### 3. QR Code Generation

- Automatic QR code generation for each menu
- QR codes stored locally
- Downloadable QR codes in various sizes
- QR code leads to AR menu view

### 4. AR Menu View

- Full-screen camera interface
- Location-based AR implementation
- Menu items displayed in a scrollable list
- Interactive 3D model display
- Model manipulation features:
  - Resize
  - Rotate
  - Place on table surface
- Table surface detection and tracking

## Technical Architecture

### Frontend (Next.js)

- Modern UI components with Tailwind CSS
- Light theme design
- Responsive layout for all devices
- Client-side caching for better performance
- AR.js integration for location-based AR

### Backend (Python)

- RESTful API architecture
- Image processing and text extraction
- File management system
- Database operations
- Authentication and authorization

### Database (PostgreSQL)

- Menu items storage
- Restaurant information
- User management
- 3D model metadata
- File references

### Storage

- Local file system for:
  - 3D models
  - QR codes
  - Uploaded menu images

## Security Requirements

- HTTPS implementation with self-signed certificates
- Secure file upload handling
- Input validation and sanitization
- Camera permission handling
- Data encryption at rest

## User Interface Requirements

### Admin Dashboard

1. Menu Management

   - Upload menu image
   - View extracted items
   - Edit item details
   - Upload 3D models
   - Generate QR codes
2. Preview Section

   - 3D model preview
   - AR view testing
   - QR code testing

### Customer AR View

1. Camera Interface

   - Full-screen camera view
   - Permission request handling
   - Surface detection indicators
2. Menu Interface

   - Floating menu list
   - Item details view
   - 3D model interaction controls
   - Loading indicators

## Performance Requirements

- Menu scanning response: < 5 seconds
- AR loading time: < 3 seconds
- 3D model size limit: 10MB
- Supported browsers: Chrome, Safari, Firefox
- Minimum iOS version: 13
- Minimum Android version: 8.0

## Future Considerations

- Multi-language support
- Analytics dashboard
- Multiple menu support
- Social sharing features
- Custom branding options
- Integration with POS systems

## Development Phases

### Phase 1: Core Infrastructure

- Backend setup with Python
- Database schema implementation
- Basic frontend structure
- File storage system

### Phase 2: Menu Processing

- Image upload functionality
- Text extraction implementation
- Menu item management
- QR code generation

### Phase 3: AR Implementation

- AR.js integration
- Camera interface
- Location-based tracking
- 3D model rendering

### Phase 4: UI/UX Refinement

- Component styling
- Responsive design
- Performance optimization
- User testing

### Phase 5: Security & Deployment

- HTTPS implementation
- Security testing
- Deployment configuration
- Final testing and launch
