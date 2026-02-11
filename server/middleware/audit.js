const { AuditLog } = require('../models');

const logAction = async (req, action, resource, resourceId = null, details = {}, status = 'success') => {
  try {
    if (!req.user) return; // Only log authenticated actions

    await AuditLog.create({
      user: req.user._id,
      action,
      resource,
      resourceId,
      details,
      status,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

const auditMiddleware = (action, resource) => {
  return async (req, res, next) => {
    // Intercept response to log success/failure
    const originalSend = res.json;
    
    res.json = function(data) {
      res.json = originalSend;
      
      const status = res.statusCode >= 400 ? 'failure' : 'success';
      const resourceId = req.params.id || (data && data.data && (data.data.product?._id || data.data.order?._id || data.data.user?._id));
      
      logAction(req, action, resource, resourceId, {
        method: req.method,
        url: req.originalUrl,
        body: req.method !== 'GET' ? req.body : undefined,
        params: req.params,
        query: req.query,
        responseStatus: res.statusCode,
        error: status === 'failure' ? data.message : undefined
      }, status);
      
      return res.json(data);
    };
    
    next();
  };
};

module.exports = { logAction, auditMiddleware };