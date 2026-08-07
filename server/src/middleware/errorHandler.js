const errorHandler = (err, req, res, next) => {
  let errorMessage = err.message || 'Internal Server Error';
  
  // Handle database connection errors gracefully
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.code === 'PROTOCOL_CONNECTION_LOST') {
    errorMessage = 'Hệ thống đang bảo trì hoặc mất kết nối cơ sở dữ liệu. Vui lòng thử lại sau ít phút.';
    console.error(`[DB Error] ${err.code} on ${req.method} ${req.url} - Waiting for database...`);
  } else {
    console.error(err.stack);
  }

  res.status(500).json({
    success: false,
    error: errorMessage
  });
};

module.exports = errorHandler;
