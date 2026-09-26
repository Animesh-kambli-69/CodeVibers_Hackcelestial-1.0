const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const appConfig = require('./config/app');
const { getPool } = require('./config/database');

// Middlewares
const requestId = require('./middleware/requestId');
const requestLogger = require('./middleware/requestLogger');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

// Repositories
const UserRepository = require('./repositories/userRepository');
const GuestRepository = require('./repositories/guestRepository');
const RoomRepository = require('./repositories/roomRepository');
const BookingRepository = require('./repositories/bookingRepository');
const PreferenceRepository = require('./repositories/preferenceRepository');
const ActivityRepository = require('./repositories/activityRepository');
const ResortInfoRepository = require('./repositories/resortInfoRepository');
const RecommendationRepository = require('./repositories/recommendationRepository');
const PredictionRepository = require('./repositories/predictionRepository');
const ChatRepository = require('./repositories/chatRepository');

// Services
const MlService = require('./services/mlService');
const AiService = require('./services/aiService');
const AuthService = require('./services/authService');
const PredictionService = require('./services/predictionService');
const ForecastService = require('./services/forecastService');
const CancellationService = require('./services/cancellationService');
const RoomDemandService = require('./services/roomDemandService');
const KpiService = require('./services/kpiService');
const RecommendationService = require('./services/recommendationService');
const InsightService = require('./services/insightService');
const GuestIntelligenceService = require('./services/guestIntelligenceService');
const GuestSelfService = require('./services/guestSelfService');
const ResortInfoService = require('./services/resortInfoService');
const ConciergeService = require('./services/conciergeService');

// Controllers & Routes
const createAuthController = require('./controllers/auth.controller');
const createManagerController = require('./controllers/manager.controller');
const createOperationsController = require('./controllers/operations.controller');
const createGuestController = require('./controllers/guest.controller');

const createAuthRoutes = require('./routes/auth.routes');
const createManagerRoutes = require('./routes/manager.routes');
const createOperationsRoutes = require('./routes/operations.routes');
const createGuestRoutes = require('./routes/guest.routes');
const createApiRouter = require('./routes/index');

function createApp(injectedDeps = {}) {
  const app = express();

  // Trust reverse proxy (Render / Railway)
  app.set('trust proxy', 1);

  // 1. Request ID attachment
  app.use(requestId);

  // 2. Request logging
  app.use(requestLogger);

  // 3. Security headers
  app.use(helmet());

  // 4. CORS
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    })
  );

  // 5. JSON body parser with bounded limit
  app.use(express.json({ limit: appConfig.BODY_LIMIT }));

  // Composition: Repositories & Services with DI
  const pool = injectedDeps.pool || getPool();

  const userRepo = injectedDeps.userRepository || new UserRepository(pool);
  const guestRepo = injectedDeps.guestRepository || new GuestRepository(pool);
  const roomRepo = injectedDeps.roomRepository || new RoomRepository(pool);
  const bookingRepo = injectedDeps.bookingRepository || new BookingRepository(pool);
  const preferenceRepo = injectedDeps.preferenceRepository || new PreferenceRepository(pool);
  const activityRepo = injectedDeps.activityRepository || new ActivityRepository(pool);
  const resortInfoRepo = injectedDeps.resortInfoRepository || new ResortInfoRepository(pool);
  const recommendationRepo = injectedDeps.recommendationRepository || new RecommendationRepository(pool);
  const predictionRepo = injectedDeps.predictionRepository || new PredictionRepository(pool);
  const chatRepo = injectedDeps.chatRepository || new ChatRepository(pool);

  const mlService = injectedDeps.mlService || new MlService();
  const aiService = injectedDeps.aiService || new AiService();

  const authService = injectedDeps.authService || new AuthService(userRepo, guestRepo);
  const predictionService = injectedDeps.predictionService || new PredictionService(mlService, predictionRepo);
  const forecastService = injectedDeps.forecastService || new ForecastService(predictionService, bookingRepo, roomRepo);
  const cancellationService = injectedDeps.cancellationService || new CancellationService(predictionService, bookingRepo);
  const roomDemandService = injectedDeps.roomDemandService || new RoomDemandService(roomRepo, bookingRepo);
  const kpiService = injectedDeps.kpiService || new KpiService(bookingRepo, roomRepo, predictionService, cancellationService);
  const recommendationService = injectedDeps.recommendationService || new RecommendationService(recommendationRepo, forecastService, cancellationService, roomDemandService);
  const insightService = injectedDeps.insightService || new InsightService();
  const guestIntelligenceService = injectedDeps.guestIntelligenceService || new GuestIntelligenceService(guestRepo, bookingRepo, preferenceRepo, activityRepo, predictionService, mlService);
  const guestSelfService = injectedDeps.guestSelfService || new GuestSelfService(guestRepo, preferenceRepo, bookingRepo);
  const resortInfoService = injectedDeps.resortInfoService || new ResortInfoService(resortInfoRepo);
  const conciergeService = injectedDeps.conciergeService || new ConciergeService(chatRepo, resortInfoRepo, guestRepo, preferenceRepo, bookingRepo, aiService);

  // Controllers
  const authController = createAuthController(authService);
  const managerController = createManagerController({
    kpiService,
    forecastService,
    cancellationService,
    roomDemandService,
    recommendationService,
    insightService,
  });
  const operationsController = createOperationsController({
    kpiService,
    guestIntelligenceService,
    cancellationService,
  });
  const guestController = createGuestController({
    guestSelfService,
    resortInfoService,
    conciergeService,
  });

  // Wire Routers
  const authRouter = createAuthRoutes(authController);
  const managerRouter = createManagerRoutes(managerController);
  const operationsRouter = createOperationsRoutes(operationsController);
  const guestRouter = createGuestRoutes(guestController);

  const deps = {
    pool,
    mlService,
    aiService,
    authRouter,
    managerRouter,
    operationsRouter,
    guestRouter,
  };

  // 6. Mount main API router under /api
  app.use('/api', createApiRouter(deps));

  // 7. Unmatched route -> 404
  app.use(notFound);

  // 8. Global centralized error handler
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
