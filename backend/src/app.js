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
const WeatherRepository = require('./repositories/weatherRepository');
const SocialSignalRepository = require('./repositories/socialSignalRepository');
const DigitalTwinRepository = require('./repositories/digitalTwinRepository');
const StaffRepository = require('./repositories/staffRepository');
const FeedbackRepository = require('./repositories/feedbackRepository');

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
const WeatherService = require('./services/weatherService');
const SocialSignalService = require('./services/socialSignalService');
const DigitalTwinService = require('./services/digitalTwinService');
const StaffingService = require('./services/staffingService');
const BookingLifecycleService = require('./services/bookingLifecycleService');
const UserManagementService = require('./services/userManagementService');
const GuestAccountService = require('./services/guestAccountService');
const FeedbackService = require('./services/feedbackService');

// Controllers & Routes
const createAuthController = require('./controllers/auth.controller');
const createManagerController = require('./controllers/manager.controller');
const createOperationsController = require('./controllers/operations.controller');
const createGuestController = require('./controllers/guest.controller');
const createDigitalTwinController = require('./controllers/digitalTwin.controller');
const createUserManagementController = require('./controllers/userManagement.controller');

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
  const weatherRepo = injectedDeps.weatherRepository || new WeatherRepository(pool);
  const socialSignalRepo = injectedDeps.socialSignalRepository || new SocialSignalRepository(pool);
  const digitalTwinRepo = injectedDeps.digitalTwinRepository || new DigitalTwinRepository(pool);
  const staffRepo = injectedDeps.staffRepository || new StaffRepository(pool);
  const feedbackRepo = injectedDeps.feedbackRepository || new FeedbackRepository(pool);

  const mlService = injectedDeps.mlService || new MlService();
  const aiService = injectedDeps.aiService || new AiService();

  const guestAccountService = injectedDeps.guestAccountService || new GuestAccountService(userRepo, guestRepo);
  const feedbackService = injectedDeps.feedbackService || new FeedbackService(feedbackRepo, guestAccountService);
  const authService =
    injectedDeps.authService || new AuthService(userRepo, guestRepo, feedbackRepo, guestAccountService);
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
  const weatherService = injectedDeps.weatherService || new WeatherService();
  const socialSignalService = injectedDeps.socialSignalService || new SocialSignalService();
  const staffingService = injectedDeps.staffingService || new StaffingService(staffRepo, bookingRepo);
  const bookingLifecycleService =
    injectedDeps.bookingLifecycleService ||
    new BookingLifecycleService(bookingRepo, roomRepo, guestAccountService, feedbackService);
  const userManagementService = injectedDeps.userManagementService || new UserManagementService(userRepo);
  const digitalTwinService =
    injectedDeps.digitalTwinService ||
    new DigitalTwinService({
      weatherService,
      socialSignalService,
      weatherRepository: weatherRepo,
      socialSignalRepository: socialSignalRepo,
      digitalTwinRepository: digitalTwinRepo,
      forecastService,
      cancellationService,
      roomDemandService,
      kpiService,
      staffingService,
      aiService,
    });

  // Controllers
  const authController = createAuthController(authService);
  const managerController = createManagerController({
    kpiService,
    forecastService,
    cancellationService,
    roomDemandService,
    recommendationService,
    insightService,
    feedbackService,
  });
  const digitalTwinController = createDigitalTwinController(digitalTwinService);
  const userManagementController = createUserManagementController(userManagementService);
  const operationsController = createOperationsController({
    kpiService,
    guestIntelligenceService,
    cancellationService,
    staffingService,
    bookingLifecycleService,
  });
  const guestController = createGuestController({
    guestSelfService,
    resortInfoService,
    conciergeService,
    feedbackService,
  });

  // Wire Routers
  const authRouter = createAuthRoutes(authController);
  const managerRouter = createManagerRoutes(managerController, digitalTwinController, userManagementController);
  const operationsRouter = createOperationsRoutes(operationsController);
  const guestRouter = createGuestRoutes(guestController);

  const deps = {
    pool,
    mlService,
    aiService,
    feedbackService,
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
