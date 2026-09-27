const http = require('http');
const https = require('https');

const ML_URL = process.env.ML_SERVICE_URL || 'http://13.239.146.181:8000/api/v1/ml';
console.log(`\n======================================================`);
console.log(`Testing ML Service at: ${ML_URL}`);
console.log(`======================================================\n`);

async function makeRequest(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    const urlObj = new URL(url);

    const reqOpts = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      timeout: 10000,
    };

    const req = client.request(reqOpts, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, raw: data });
        } catch {
          resolve({ status: res.statusCode, data, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout after 10000ms connecting to ${url}`));
    });

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runSuite() {
  const results = [];

  // TEST 1: Health Check
  try {
    console.log('--- TEST 1: GET /health ---');
    const res = await makeRequest(`${ML_URL}/health`);
    console.log(`Status: ${res.status}`);
    console.log('Response:', JSON.stringify(res.data, null, 2));
    const passed = res.status === 200 && res.data.status === 'ok' && res.data.models_loaded === true;
    results.push({ name: 'GET /health', passed, detail: res.data });
  } catch (err) {
    console.error('TEST 1 FAILED:', err.message);
    results.push({ name: 'GET /health', passed: false, error: err.message });
  }

  // TEST 2: Data Summary / Model Metadata
  try {
    console.log('\n--- TEST 2: GET /data/summary ---');
    const res = await makeRequest(`${ML_URL}/data/summary`);
    console.log(`Status: ${res.status}`);
    console.log('Response:', JSON.stringify(res.data, null, 2));
    const passed = res.status === 200;
    results.push({ name: 'GET /data/summary', passed, detail: res.data });
  } catch (err) {
    console.error('TEST 2 FAILED:', err.message);
    results.push({ name: 'GET /data/summary', passed: false, error: err.message });
  }

  // TEST 3: Occupancy Forecast (7 days)
  try {
    console.log('\n--- TEST 3: GET /predict/occupancy?days=7 ---');
    const res = await makeRequest(`${ML_URL}/predict/occupancy?days=7`);
    console.log(`Status: ${res.status}`);
    console.log('Response (first 3 predictions):', JSON.stringify({
      forecast_days: res.data.forecast_days,
      sample_predictions: (res.data.predictions || []).slice(0, 3)
    }, null, 2));
    const passed = res.status === 200 && Array.isArray(res.data.predictions) && res.data.predictions.length === 7;
    results.push({ name: 'GET /predict/occupancy (7 days)', passed, count: res.data.predictions?.length });
  } catch (err) {
    console.error('TEST 3 FAILED:', err.message);
    results.push({ name: 'GET /predict/occupancy (7 days)', passed: false, error: err.message });
  }

  // TEST 4: Occupancy Forecast (14 days)
  try {
    console.log('\n--- TEST 4: GET /predict/occupancy?days=14 ---');
    const res = await makeRequest(`${ML_URL}/predict/occupancy?days=14`);
    console.log(`Status: ${res.status}`);
    const passed = res.status === 200 && Array.isArray(res.data.predictions) && res.data.predictions.length === 14;
    results.push({ name: 'GET /predict/occupancy (14 days)', passed, count: res.data.predictions?.length });
  } catch (err) {
    console.error('TEST 4 FAILED:', err.message);
    results.push({ name: 'GET /predict/occupancy (14 days)', passed: false, error: err.message });
  }

  // TEST 5: Cancellation Prediction (High Risk Booking)
  try {
    console.log('\n--- TEST 5: POST /predict/cancellation (High Risk Case) ---');
    const highRiskPayload = {
      lead_time: 320,
      adr: 180.0,
      adults: 2,
      children: 0,
      babies: 0,
      stays_in_weekend_nights: 2,
      stays_in_week_nights: 5,
      previous_cancellations: 2,
      previous_bookings_not_canceled: 0,
      booking_changes: 0,
      required_car_parking_spaces: 0,
      total_of_special_requests: 0,
      is_repeated_guest: 0,
      room_type_changed: 0,
      market_segment: 'Online TA',
      distribution_channel: 'TA/TO',
      deposit_type: 'Non Refund',
      customer_type: 'Transient',
      arrival_date_month: 'August'
    };
    console.log('Payload:', JSON.stringify(highRiskPayload, null, 2));
    const res = await makeRequest(`${ML_URL}/predict/cancellation`, { method: 'POST' }, highRiskPayload);
    console.log(`Status: ${res.status}`);
    console.log('Response:', JSON.stringify(res.data, null, 2));
    const passed = res.status === 200 && typeof res.data.cancellation_probability === 'number';
    results.push({
      name: 'POST /predict/cancellation (High Risk)',
      passed,
      prob: res.data.cancellation_probability,
      riskPct: res.data.risk_score_pct,
      topFactors: res.data.top_risk_factors
    });
  } catch (err) {
    console.error('TEST 5 FAILED:', err.message);
    results.push({ name: 'POST /predict/cancellation (High Risk)', passed: false, error: err.message });
  }

  // TEST 6: Cancellation Prediction (Low Risk Booking)
  try {
    console.log('\n--- TEST 6: POST /predict/cancellation (Low Risk Case) ---');
    const lowRiskPayload = {
      lead_time: 12,
      adr: 120.0,
      adults: 2,
      children: 1,
      babies: 0,
      stays_in_weekend_nights: 1,
      stays_in_week_nights: 2,
      previous_cancellations: 0,
      previous_bookings_not_canceled: 4,
      booking_changes: 1,
      required_car_parking_spaces: 1,
      total_of_special_requests: 2,
      is_repeated_guest: 1,
      room_type_changed: 0,
      market_segment: 'Direct',
      distribution_channel: 'Direct',
      deposit_type: 'No Deposit',
      customer_type: 'Transient',
      arrival_date_month: 'December'
    };
    console.log('Payload:', JSON.stringify(lowRiskPayload, null, 2));
    const res = await makeRequest(`${ML_URL}/predict/cancellation`, { method: 'POST' }, lowRiskPayload);
    console.log(`Status: ${res.status}`);
    console.log('Response:', JSON.stringify(res.data, null, 2));
    const passed = res.status === 200 && typeof res.data.cancellation_probability === 'number';
    results.push({
      name: 'POST /predict/cancellation (Low Risk)',
      passed,
      prob: res.data.cancellation_probability,
      riskPct: res.data.risk_score_pct,
      topFactors: res.data.top_risk_factors
    });
  } catch (err) {
    console.error('TEST 6 FAILED:', err.message);
    results.push({ name: 'POST /predict/cancellation (Low Risk)', passed: false, error: err.message });
  }

  // TEST 7: Guest Preferences Prediction (Family / High Budget)
  try {
    console.log('\n--- TEST 7: POST /predict/guest-preferences (Family Case) ---');
    const familyPayload = {
      adults: 2,
      children: 2,
      babies: 0,
      total_stays: 3,
      stays_in_weekend_nights: 2,
      stays_in_week_nights: 4,
      adr: 195.0,
      total_of_special_requests: 2,
      required_car_parking_spaces: 1,
      country: 'IND',
      market_segment: 'Direct',
      customer_type: 'Transient'
    };
    console.log('Payload:', JSON.stringify(familyPayload, null, 2));
    const res = await makeRequest(`${ML_URL}/predict/guest-preferences`, { method: 'POST' }, familyPayload);
    console.log(`Status: ${res.status}`);
    console.log('Response:', JSON.stringify(res.data, null, 2));
    const passed = res.status === 200 && (res.data.predicted_meal_plan != null || res.data.predicted_room_type != null);
    results.push({
      name: 'POST /predict/guest-preferences (Family)',
      passed,
      meal: res.data.predicted_meal_plan,
      mealConf: res.data.meal_confidence,
      room: res.data.predicted_room_type,
      roomConf: res.data.room_confidence
    });
  } catch (err) {
    console.error('TEST 7 FAILED:', err.message);
    results.push({ name: 'POST /predict/guest-preferences (Family)', passed: false, error: err.message });
  }

  // TEST 8: Guest Preferences Prediction (Solo / Business)
  try {
    console.log('\n--- TEST 8: POST /predict/guest-preferences (Solo / Corporate) ---');
    const soloPayload = {
      adults: 1,
      children: 0,
      babies: 0,
      total_stays: 1,
      stays_in_weekend_nights: 0,
      stays_in_week_nights: 3,
      adr: 90.0,
      total_of_special_requests: 0,
      required_car_parking_spaces: 0,
      country: 'PRT',
      market_segment: 'Corporate',
      customer_type: 'Transient'
    };
    console.log('Payload:', JSON.stringify(soloPayload, null, 2));
    const res = await makeRequest(`${ML_URL}/predict/guest-preferences`, { method: 'POST' }, soloPayload);
    console.log(`Status: ${res.status}`);
    console.log('Response:', JSON.stringify(res.data, null, 2));
    const passed = res.status === 200 && (res.data.predicted_meal_plan != null || res.data.predicted_room_type != null);
    results.push({
      name: 'POST /predict/guest-preferences (Solo)',
      passed,
      meal: res.data.predicted_meal_plan,
      mealConf: res.data.meal_confidence,
      room: res.data.predicted_room_type,
      roomConf: res.data.room_confidence
    });
  } catch (err) {
    console.error('TEST 8 FAILED:', err.message);
    results.push({ name: 'POST /predict/guest-preferences (Solo)', passed: false, error: err.message });
  }

  // TEST 9: Backend MlService Adapter End-to-End
  try {
    console.log('\n--- TEST 9: Backend MlService Adapter Class Tests ---');
    const MlService = require('./src/services/mlService');
    const ml = new MlService(ML_URL);

    const healthRes = await ml.health();
    console.log('mlService.health():', healthRes);

    const forecastRes = await ml.forecastOccupancy(7);
    console.log('mlService.forecastOccupancy(7) count:', forecastRes.predictions.length, 'sample:', forecastRes.predictions[0]);

    const cancelRes = await ml.scoreCancellation({
      adr: 15000,
      arrivalDate: '2026-10-15',
      bookingDate: '2026-06-01',
      adults: 2,
      children: 0,
      weekendNights: 2,
      weekNights: 3,
      bookingChannel: 'Direct',
    });
    console.log('mlService.scoreCancellation():', cancelRes);

    const prefRes = await ml.predictGuestPreferences({
      adr: 12000,
      adults: 2,
      children: 1,
      totalStays: 2,
    });
    console.log('mlService.predictGuestPreferences():', prefRes);

    const passed = healthRes.ok && forecastRes.predictions.length === 7 && typeof cancelRes.riskScorePct === 'number';
    results.push({ name: 'Backend MlService Adapter E2E', passed });
  } catch (err) {
    console.error('TEST 9 FAILED:', err.message);
    results.push({ name: 'Backend MlService Adapter E2E', passed: false, error: err.message });
  }

  console.log('\n======================================================');
  console.log('SUMMARY OF ALL TEST RESULTS:');
  console.log('======================================================');
  results.forEach((r, idx) => {
    console.log(`${idx + 1}. [${r.passed ? 'PASSED' : 'FAILED'}] ${r.name}`);
  });
  console.log('======================================================\n');
}

runSuite().catch(console.error);
