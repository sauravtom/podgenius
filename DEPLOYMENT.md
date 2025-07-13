# Podgenius Docker Deployment Guide

## 🐳 Docker Deployment

This guide explains how to deploy the Podgenius Next.js application using Docker.

## Prerequisites

- Docker and Docker Compose installed
- All required environment variables configured

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd podgenius
   ```

2. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:

   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   CLERK_SECRET_KEY=sk_test_your_secret_key_here
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

   # OpenAI API
   OPENAI_API_KEY=sk-your_openai_api_key_here

   # Exa API (for research)
   EXA_API_KEY=your_exa_api_key_here

   # Google APIs (for YouTube upload and Gmail/Calendar integration)
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback

   # Node Environment
   NODE_ENV=production
   ```

3. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   Open http://localhost:3000 in your browser

## Manual Docker Build

If you prefer to build manually:

```bash
# Build the Docker image
docker build -t podgenius .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key \
  -e CLERK_SECRET_KEY=your_secret \
  -e OPENAI_API_KEY=your_openai_key \
  -e EXA_API_KEY=your_exa_key \
  podgenius
```

## Production Deployment

### Environment Variables

Ensure all environment variables are properly set in your production environment:

- **Clerk**: Authentication service keys
- **OpenAI**: For TTS and script generation
- **Exa**: For research and content gathering
- **Google**: For YouTube uploads and integrations

### Health Checks

The application includes health checks at `/api/health`. The Docker container is configured with automatic health monitoring.

### Resource Requirements

- **Memory**: Minimum 1GB RAM (2GB recommended)
- **CPU**: 1 core minimum (2 cores recommended)
- **Storage**: 10GB for temporary video files and caching

### Security Considerations

1. **Environment Variables**: Never commit real API keys to version control
2. **Network**: Use HTTPS in production
3. **Updates**: Regularly update dependencies for security patches

## Troubleshooting

### Common Issues

1. **FFmpeg not found**
   - The Dockerfile includes FFmpeg installation
   - Ensure the Alpine packages are properly installed

2. **Permission errors**
   - The container runs as a non-root user (nextjs)
   - Temporary files are handled in /tmp with proper permissions

3. **API key errors**
   - Verify all environment variables are set correctly
   - Check API key validity and permissions

### Logs

View application logs:
```bash
docker-compose logs -f podgenius
```

### Container Shell Access

Access the running container:
```bash
docker-compose exec podgenius sh
```

## Performance Optimization

- The Dockerfile uses multi-stage builds for smaller images
- Alpine Linux base for minimal footprint
- Standalone Next.js output for optimal production performance
- Health checks ensure container reliability

## Scaling

For high-traffic deployments:
- Use a load balancer (nginx, HAProxy)
- Consider horizontal scaling with multiple containers
- Implement Redis for session management if needed
- Use external storage for temporary files in multi-instance setups 