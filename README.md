# Puppeteer as a Service

## Getting Started

```bash
# Step 1: start browserless chrome
docker run -d -p 3000:3000 --name browserless whatwewant/browserless-chrome:v1-0

# Step 2: start puppeteer service
docker run -d -p 8080:8080 --name puppeteer-as-a-service \
  -e BROWSER_WS_ENDPOINT=ws://browserless:3000 \
  whatwewant/puppeteer:latest
```

## Usage

### 1. Generate PDF
* Params
  * url: The URL to site url
    * required: true
  * format: The format of the outputted PDF
    * required: false
    * default: A4
  
```bash
curl -X POST \
  http://localhost:8887/pdf \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://www.baidu.com",
    "options": {
      "format": "A4",
      "landscape": true
    }
  }'
```

### 2. Generate Screenshot (Image)
* Params
  * url: The URL to site url
    * required: true
  * fullPage: When true, takes a screenshot of the full scrollable page
    * required: false
    * default: true
  * encoding: The encoding of the image, can be either base64 or undefined
    * required: false
    * default: none
    * available: base64 | undefined
  * width: The width of the image
    * required: false
  * height: The height of the image
    * required: false

```bash
curl -X POST \
  http://localhost:8080/image \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://www.baidu.com"
  }'
```

## License
* MIT
