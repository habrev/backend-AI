// src/middleware/auth.js - FIXED VERSION
import { userStore } from '../models/User.model.js';
import logger from '../utils/logger.js';

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.debug('No Bearer token found in header', { requestId: req.requestId });
    return res.status(401).json({
      success: false,
      error: 'Missing authorization header',
      requestId: req.requestId
    });
  }
  
  const token = authHeader.substring(7);
  
  logger.debug(`Auth attempt with token: ${token}`, { requestId: req.requestId });

  // DEBUG: Check token format
  console.log('🔍 DEBUG - Token:', token);
  console.log('🔍 DEBUG - Token starts with mock_token_:', token.startsWith('mock_token_'));
  
  if (token.startsWith('mock_token_')) {
    try {
      const tokenParts = token.split('_');
      console.log('🔍 DEBUG - Token parts:', tokenParts);
      console.log('🔍 DEBUG - Token parts length:', tokenParts.length);
      
      if (tokenParts.length >= 4) {
        const userId = tokenParts[2]; // Should be "admin-user-id-123"
        const userRole = tokenParts[3]; // Should be "admin"
        
        console.log('🔍 DEBUG - Extracted userId:', userId);
        console.log('🔍 DEBUG - Extracted userRole:', userRole);
        
        // FIX: Use await to properly handle the Promise
        const user = await userStore.findById(userId);
        console.log('🔍 DEBUG - Found user:', user);
        
        if (user) {
          // Verify token matches expected format
          const expectedToken = `mock_token_${user.id}_${user.role}`;
          console.log('🔍 DEBUG - Expected token:', expectedToken);
          console.log('🔍 DEBUG - Tokens match:', token === expectedToken);
          
          if (token === expectedToken) {
            req.user = user;
            logger.debug(`Authentication successful for user: ${user.email}`, {
              requestId: req.requestId,
              userId: user.id,
              role: user.role
            });
            return next();
          } else {
            console.log('🔍 DEBUG - Token mismatch');
          }
        } else {
          console.log('🔍 DEBUG - User not found with ID:', userId);
        }
      } else {
        console.log('🔍 DEBUG - Not enough token parts');
      }
    } catch (error) {
      console.log('🔍 DEBUG - Token parsing error:', error.message);
      logger.warn(`Token parsing error: ${error.message}`, { requestId: req.requestId });
    }
  } else {
    console.log('🔍 DEBUG - Token does not start with mock_token_');
  }
  
  logger.warn(`Authentication failed for token: ${token}`, { requestId: req.requestId });
  return res.status(401).json({
    success: false,
    error: 'Invalid token',
    requestId: req.requestId
  });
}

// Update optionalAuth to also be async
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    if (token.startsWith('mock_token_')) {
      try {
        const tokenParts = token.split('_');
        if (tokenParts.length >= 4) {
          const userId = tokenParts[2];
          // FIX: Use await to properly handle the Promise
          const user = await userStore.findById(userId);
          
          if (user) {
            const expectedToken = `mock_token_${user.id}_${user.role}`;
            if (token === expectedToken) {
              req.user = user;
              logger.debug(`Optional auth - User authenticated: ${user.email}`, {
                requestId: req.requestId
              });
            }
          }
        }
      } catch (error) {
        // Silently continue without user for optional auth
      }
    }
  }
  
  next();
}


export function authorize(roles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        requestId: req.requestId
      });
    }
    
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      logger.warn(`Authorization failed - User ${req.user.email} role ${req.user.role} not in required roles: ${roles.join(', ')}`, {
        requestId: req.requestId,
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles
      });
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        requestId: req.requestId
      });
    }
    
    logger.debug(`Authorization successful - User: ${req.user.email}, Role: ${req.user.role}`, {
      requestId: req.requestId,
      requiredRoles: roles
    });
    
    next();
  };
}
