const router = require("express").Router();
const { ProcessFile } = require("../modals/ProcessedFiles");
const { User } = require("../modals/User");

exports.processFileUpload = async (req, res) => {
  const data = req.body;
  let newFile = new ProcessFile(data);
  // if (data.type !== "pdf") saveBase64file(newFile, req.body.b64Img);
  // console.log(data, "commig data");

  User.findOneAndUpdate(
    { _id: data.user_id, role: "user", leftCredit: { $gt: 0 } },
    { $inc: { leftCredit: -newFile.noOf_pages } },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        return res.status(404).json({ error: "Server Error" });
      }
    }
  );

  newFile.save((err, saveFile) => {
    if (err) return res.status(404).json({ saved: false, error: "file not save!" });
    else return res.status(200).json({ saved: true, msg: "file saved!" });
  });
};

exports.getAllProcessFile = async (req, res) => {
  const id = req.loggedUser._id;

  const pageNo = +req.query.pageno;
  const pageSize = +req.query.pageSize;
  try {
    const filesQuery = ProcessFile.find({ user_id: id }).sort({ inserted_by_date: -1 });
    const totalFiles = await ProcessFile.find({ user_id: id }).sort({ created_at: -1 });
    if (pageNo && pageSize) {
      filesQuery.skip(pageSize * (pageNo - 1)).limit(pageSize);
    }

    filesQuery
      .then((files) => {
        return res.status(200).json({
          files: files,
          success: true,
          totalFiles: totalFiles.length,
          totalPages: totalFiles.reduce((total, x) => total + x.noOf_pages, 0),
        });
      })
      .catch((err) => {
        return res.status(404).json({ error: "You haven't proccesed any file yet!", success: false });
      });
  } catch (err) {
    return res.status(404).json({ error: "Server Error", success: false });
  }
};

exports.getProcessFileByFileId = async (req, res) => {
  const userId = req.loggedUser._id;
  const fileId = req.params["fileId"];

  const filesQuery = ProcessFile.find({ user_id: userId }).sort({ inserted_by_date: -1 });
  const totalFiles = await ProcessFile.find({ user_id: id }).sort({ created_at: -1 });
  if (pageNo && pageSize) {
    filesQuery.skip(pageSize * (pageNo - 1)).limit(pageSize);
  }

  filesQuery
    .then((files) => {
      return res.status(200).json({
        files: files,
        success: true,
        totalFiles: totalFiles.length,
        totalPages: totalFiles.reduce((total, x) => total + x.noOf_pages, 0),
      });
    })
    .catch((err) => {
      return res.status(500).json({ error: "You haven't proccesed any file yet!", success: false });
    });
};

exports.deleteProcessFile = async (req, res) => {
  const userId = req.loggedUser._id;
  const fileId = req.params["fileId"];

  ProcessFile.deleteOne({ serial_id: fileId }, (err, obj) => {
    return res.status(200).json({ msg: "File deleted Successfully" });
  });
};

const saveBase64file = (newFile, b64Img) => {
  if (b64Img === null) return;
  newFile.detected_img = new Buffer.from(b64Img, "base64");
};
