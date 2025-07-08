// Test JWT token parsing functionality
import { parseJwtToken } from '../services/authService.js';

// Example token from the API response
const exampleToken = "eyJhbGciOiJIUzUxMiJ9.eyJyb2xlIjoiQURNSU4iLCJ1c2VySWQiOjE0LCJzdWIiOiJhZG1pbkB0ZXN0LmNvbSIsImlhdCI6MTc1MTYzOTU5NCwiZXhwIjoxNzUyMjQ0Mzk0fQ.OQgMaiEjFDQ-QJVmHfLZ3u2sVKqzd1khxVyi094vVofGQ24ZITkmLBRV2ruAvs1J8tNIuaLOIYRCNnH64s2IxA";

// Test the parsing
console.log('Testing JWT token parsing...');
const parsed = parseJwtToken(exampleToken);
console.log('Parsed token payload:', parsed);

// Expected output should contain:
// {
//   "role": "ADMIN",
//   "userId": 14,
//   "sub": "admin@test.com",
//   "iat": 1751639594,
//   "exp": 1752244394
// }
