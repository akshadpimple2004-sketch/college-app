const client = require('prom-client');

// Create a Registry to register the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics, e.g. system name
register.setDefaultLabels({
  app: 'college-management-backend'
});

// Enable the collection of default metrics (CPU, Memory, Event Loop Lag, etc.)
client.collectDefaultMetrics({ register });

// Define custom HTTP request duration histogram
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 10] // Buckets in seconds
});

// Register the custom metric
register.registerMetric(httpRequestDurationMicroseconds);

// Middleware to track HTTP request metrics
const metricsMiddleware = (req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const timeInSecs = diff[0] + diff[1] / 1e9;
    
    // Skip logging for metrics/health checks to prevent spamming metrics
    if (req.route && req.route.path !== '/metrics' && req.route.path !== '/health') {
      httpRequestDurationMicroseconds
        .labels(req.method, req.route.path, res.statusCode)
        .observe(timeInSecs);
    }
  });
  
  next();
};

// Route handler for scraping metrics
const metricsHandler = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
};

module.exports = {
  metricsMiddleware,
  metricsHandler
};
