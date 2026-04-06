# API Rate Limiter Service with Dashboard

A high-performance API Rate Limiter service utilizing Node.js, Express, and Redis with a beautiful React and Tailwind CSS real-time dashboard.

## How it Works

1. **Sliding Window Log Algorithm**:
    - The rate limiter uses a highly precise Sliding Window Log algorithm implemented via a custom **Redis Lua Script** for atomicity and high performance.
    - When a request comes in, a unique identifier is added to a Redis Sorted Set (`ZADD`) with its timestamp as the score.
    - We immediately drop requests from the set that fall outside our sliding window using `ZREMRANGEBYSCORE`.
    - We then count the remaining requests (`ZCARD`) and decide to Allow or Block.
    
2. **Backend Architecture**:
    - Built on Node.js and Express.
    - Implements generic reusable rate-limiting middleware that can be attached to any route with granular limits.
    - Uses `Socket.io` to emit real-time traffic events to the frontend dashboard.
    - **Simulated Endpoints**:
        - `GET /api/home` -> 100 req/min (High Tier)
        - `GET /api/search` -> 20 req/min (Medium Tier)
        - `POST /api/login` -> 5 req/min (Strict Tier)

3. **Frontend Dashboard**:
    - Built with React, Vite, and modern Tailwind CSS.
    - Employs a premium "Dark Mode" aesthetic.
    - **Live Traffic Feed:** Receives live updates instantly via WebSockets and logs them in a beautiful incoming request table.
    - **Analytics:** Shows a visual representation of Blocked vs. Allowed traffic.
    - **Tester Tool:** A dedicated section allowing you to simulate and spam endpoints to visualize rate limiting in action.

4. **Headers & Response structure**:
    - Every response embeds critical rate limiter metrics in its headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`).
    - If a user surpasses the threshold, they receive a standard HTTP `429 Too Many Requests` code along with an `X-Retry-After` header telling them exactly how many seconds until they can attempt another request.

## How to Run

Before running, ensure you have [Docker](https://docs.docker.com/get-docker/) installed.

1. Clone or navigate to the repository.
2. Build and start the services using Docker Compose:
   ```bash
   docker compose up --build
   ```
3. Wait a moment for all containers (Redis, Backend, Frontend) to initialize.
4. Open the frontend dashboard in your browser:
   **[http://localhost:8080](http://localhost:8080)**
5. Use the provided **API Tester Tool** on the left side of the dashboard to trigger bursts of requests and watch the Sliding Window Counter and live tables react instantly!
