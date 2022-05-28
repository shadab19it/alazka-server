const express = require("express");
const router = express.Router();
const { generateApiKey, validateAPIKEY, getAPIKeyByUserId, removeAPICredit } = require("../controlers/apiKey");
const auth = require("../middlewares/auth");

router.get("/generate/:userId", auth, generateApiKey);
router.get("/validate/:apiKey/:totalPages", validateAPIKEY);
router.get("/:userId", auth, getAPIKeyByUserId);
router.get("/remove-credit/:apiKey/:totalPages", removeAPICredit);

module.exports = router;
