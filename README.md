# Personalised Podcast Generator

A web application built with Mesop that generates personalized podcast recommendations based on user-provided keywords.

## Features

- Interactive web interface with a modern design
- Keyword-based podcast recommendation system
- Real-time streaming output
- Pre-defined example topics for quick access
- Responsive design that works on both desktop and mobile devices

## Prerequisites

- Python 3.x
- Mesop framework

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd podgenius
```

2. Install the required dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.sample .env
```
Edit the `.env` file and update the values with your actual configuration.

## Usage

1. Start the application:
```bash
mesop main.py
```

2. Open your web browser and navigate to the provided local URL

3. Enter keywords related to your podcast interests or click on the example topics

4. The application will generate personalized podcast recommendations based on your input

## Project Structure

```
.
├── main.py          # Main application file containing the UI and logic
├── .env.sample      # Template for environment variables
├── .env            # Local environment variables (not tracked in git)
├── .gitignore      # Git ignore configuration
├── README.md       # Project documentation
└── requirements.txt # Python dependencies
```

## Environment Variables

The following environment variables can be configured in your `.env` file:

- `API_KEY`: Your API key for external services
- `API_ENDPOINT`: The endpoint URL for the API
- `PORT`: The port number for the local server
- `HOST`: The host address for the local server
- `DEBUG`: Enable/disable debug mode
- `ENVIRONMENT`: The current environment (development/production)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.