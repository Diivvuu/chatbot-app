"use strict";
const __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  let desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = {enumerable: true, get: function() {
      return m[k];
    }};
  }
  Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
}));
const __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
  Object.defineProperty(o, "default", {enumerable: true, value: v});
}) : function(o, v) {
  o["default"] = v;
});
const __importStar = (this && this.__importStar) || (function() {
  let ownKeys = function(o) {
    ownKeys = Object.getOwnPropertyNames || function(o) {
      const ar = [];
      for (const k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
      return ar;
    };
    return ownKeys(o);
  };
  return function(mod) {
    if (mod && mod.__esModule) return mod;
    const result = {};
    if (mod != null) for (let k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
    __setModuleDefault(result, mod);
    return result;
  };
})();
const __importDefault = (this && this.__importDefault) || function(mod) {
  return (mod && mod.__esModule) ? mod : {"default": mod};
};
Object.defineProperty(exports, "__esModule", {value: true});
exports.askBot = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const googleapis_1 = require("googleapis");
const node_fetch_1 = __importDefault(require("node-fetch"));
// import * as serviceAccount from './service-account.json'; // Adjust if needed
const serviceAccount = require("./service-account.json");
admin.initializeApp();
const projectId = "chatbot-demo-5158e";
const dialogflowEndpoint = `https://dialogflow.googleapis.com/v2/projects/${projectId}/agent/sessions/`;
const SCOPES = ["https://www.googleapis.com/auth/cloud-platform"];
async function getAccessToken() {
  const auth = new googleapis_1.google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: SCOPES,
  });
  const token = await auth.getAccessToken();
  return token;
}
exports.askBot = functions.https.onRequest(async (req, res) => {
  let _a;
  try {
    const {text, sessionId} = req.body;
    if (!text || !sessionId) {
      res.status(400).json({error: "Missing text or sessionId"});
      return;
    }
    const accessToken = await getAccessToken();
    const response = await (0, node_fetch_1.default)(`${dialogflowEndpoint}${sessionId}:detectIntent`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        queryInput: {
          text: {
            text,
            languageCode: "en",
          },
        },
      }),
    });
    const data = await response.json();
    const reply = ((_a = data.queryResult) === null || _a === void 0 ? void 0 : _a.fulfillmentText) || "Sorry, I didn't understand that.";
    res.status(200).json({reply});
    return;
  } catch (err) {
    console.error("askBot error", err);
    res.status(500).json({error: "Internal server error"});
    return;
  }
});
