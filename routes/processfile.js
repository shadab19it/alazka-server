const express = require("express");
const router = express.Router();
const { processFileUpload, getAllProcessFile, deleteProcessFile, getProcessFileByFileId } = require("../controlers/processfile");
const auth = require("../middlewares/auth");

router.post("/upload", auth, processFileUpload);
router.get("/get-all/:userId", auth, getAllProcessFile);
router.get("/:fileId", auth, getProcessFileByFileId);
router.delete("/delete/:userId/:fileId", auth, deleteProcessFile);

module.exports = router;
