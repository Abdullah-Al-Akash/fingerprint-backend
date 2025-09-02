// src/utils/logger.js
const isDebug = process.env.DEBUG === "true";

function info(message) {
  console.log(`ℹ️  ${message}`);
}

function success(message) {
  console.log(`✅ ${message}`);
}

function warn(message) {
  console.warn(`⚠️ ${message}`);
}

function error(message, err = null) {
  console.error(`❌ ${message}`);
  if (isDebug && err) {
    console.error("   ↳ Debug:", err);
  }
}

module.exports = { info, success, warn, error };
